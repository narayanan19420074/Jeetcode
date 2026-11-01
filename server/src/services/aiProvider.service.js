import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Text generation for the AI assistant. Provider is chosen automatically: Gemini (free tier) first
// if configured, Anthropic as a fallback. Both providers take the same request shape:
//   { systemPrompt, history, userMessage, maxOutputTokens }
// and return the reply text ('' when the model returned nothing).

const HISTORY_LIMIT = 6;
const BUSY_MESSAGE = 'AI service is busy right now — try again shortly.';
const UNAVAILABLE_MESSAGE = 'AI service is temporarily unavailable.';
const NOT_CONFIGURED_MESSAGE =
  'AI is not configured on this server yet. Set GEMINI_API_KEY (free — https://aistudio.google.com/apikey) or ANTHROPIC_API_KEY to enable this feature.';

// Statuses that mean "our API key or request setup is wrong" rather than "the provider is down".
const MISCONFIGURED = {
  Gemini: { statuses: [400, 403], keyName: 'GEMINI_API_KEY' },
  Anthropic: { statuses: [401], keyName: 'ANTHROPIC_API_KEY' },
};

async function buildHttpError(provider, response) {
  const body = await response.text().catch(() => '');
  logger.error(`${provider} API error (${response.status})`, body);
  if (response.status === 429) return ApiError.tooMany(BUSY_MESSAGE);
  const { statuses, keyName } = MISCONFIGURED[provider];
  if (statuses.includes(response.status)) return ApiError.internal(`AI service is misconfigured (check ${keyName}).`);
  return ApiError.internal(UNAVAILABLE_MESSAGE);
}

async function postJson({ provider, url, headers, payload }) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    logger.error(`${provider} network error`, err);
    throw ApiError.internal('Could not reach the AI service. Try again in a moment.');
  }
  if (!response.ok) throw await buildHttpError(provider, response);
  return response.json();
}

async function callGemini({ systemPrompt, history, userMessage, maxOutputTokens }) {
  const contents = [
    ...history.slice(-HISTORY_LIMIT).map((turn) => ({ role: turn.role === 'assistant' ? 'model' : 'user', parts: [{ text: turn.text }] })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];
  const data = await postJson({
    provider: 'Gemini',
    url: `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`,
    headers: { 'x-goog-api-key': env.GEMINI_API_KEY },
    payload: { contents, systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { maxOutputTokens } },
  });
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((part) => part.text && !part.thought).map((part) => part.text).join('');
}

async function callAnthropic({ systemPrompt, history, userMessage, maxOutputTokens }) {
  const messages = [
    ...history.slice(-HISTORY_LIMIT).map((turn) => ({ role: turn.role === 'assistant' ? 'assistant' : 'user', content: turn.text })),
    { role: 'user', content: userMessage },
  ];
  const data = await postJson({
    provider: 'Anthropic',
    url: 'https://api.anthropic.com/v1/messages',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    payload: { model: env.ANTHROPIC_MODEL, max_tokens: maxOutputTokens, system: systemPrompt, messages },
  });
  return data.content?.find((block) => block.type === 'text')?.text ?? '';
}

export function generateText(request) {
  if (env.GEMINI_API_KEY) return callGemini(request);
  if (env.ANTHROPIC_API_KEY) return callAnthropic(request);
  throw ApiError.internal(NOT_CONFIGURED_MESSAGE);
}
