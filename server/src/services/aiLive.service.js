import { GoogleGenAI } from '@google/genai';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { buildLiveSystemInstruction } from './aiPrompts.js';

// Gemini Live (voice) runs browser <-> Google directly. The browser never sees GEMINI_API_KEY:
// we mint a short-lived, single-use "ephemeral token" locked to one model and one configuration
// (including the tutor rules), and the browser connects with that token instead.

const TOKEN_LIFETIME_MS = 30 * 60 * 1000;
// The browser must open its session within this window or the token is useless.
const NEW_SESSION_WINDOW_MS = 60 * 1000;

const NOT_CONFIGURED_MESSAGE = 'Live voice is not configured on this server yet. Set GEMINI_API_KEY (free — https://aistudio.google.com/apikey) to enable it.';
const START_FAILED_MESSAGE = 'Could not start the live assistant. Try again in a moment.';

// Answers are spoken, so only audio is requested; transcripts are enabled so the screen can show captions.
const buildLiveConfig = (problem) => ({
  responseModalities: ['AUDIO'],
  systemInstruction: { parts: [{ text: buildLiveSystemInstruction(problem) }] },
  inputAudioTranscription: {},
  outputAudioTranscription: {},
});

async function createEphemeralToken(config) {
  const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY, httpOptions: { apiVersion: env.GEMINI_LIVE_API_VERSION } });
  const now = Date.now();
  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime: new Date(now + TOKEN_LIFETIME_MS).toISOString(),
      newSessionExpireTime: new Date(now + NEW_SESSION_WINDOW_MS).toISOString(),
      liveConnectConstraints: { model: env.GEMINI_LIVE_MODEL, config },
    },
  });
  return token.name;
}

// Returns everything the browser needs to open the session. The browser must connect with exactly this
// model and config: they are locked into the token.
export async function createLiveSession({ problem }) {
  if (!env.GEMINI_API_KEY) throw ApiError.internal(NOT_CONFIGURED_MESSAGE);
  const config = buildLiveConfig(problem);
  try {
    const token = await createEphemeralToken(config);
    return { token, model: env.GEMINI_LIVE_MODEL, apiVersion: env.GEMINI_LIVE_API_VERSION, config };
  } catch (err) {
    logger.error('Gemini Live token error', err);
    throw ApiError.internal(START_FAILED_MESSAGE);
  }
}
