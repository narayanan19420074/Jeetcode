// Connection to Gemini Live using the ephemeral token issued by our server.

const CONNECT_TIMEOUT_MS = 15000;
const MAX_SYNCED_CODE_LENGTH = 20000;
const CONNECT_TIMEOUT_MESSAGE = 'The live assistant took too long to connect. Please try again.';

function createTimeout(milliseconds, message) {
  let timer;
  const promise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), milliseconds);
  });
  return { promise, cancel: () => clearTimeout(timer) };
}

// The SDK is loaded only when Go live is used, so it stays out of the main bundle.
// credentials = { token, model, apiVersion, config } from POST /ai/live-session; model and config are locked into the token.
export async function connectGeminiLive({ credentials, callbacks }) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: credentials.token, httpOptions: { apiVersion: credentials.apiVersion } });
  const connecting = ai.live.connect({ model: credentials.model, config: credentials.config, callbacks });
  const timeout = createTimeout(CONNECT_TIMEOUT_MS, CONNECT_TIMEOUT_MESSAGE);
  try {
    return await Promise.race([connecting, timeout.promise]);
  } catch (error) {
    // A connection that finishes after the timeout must not stay open in the background.
    connecting.then((lateSession) => lateSession.close(), () => {});
    throw error;
  } finally {
    timeout.cancel();
  }
}

// The assistant reads the learner's code from these messages. Each one is added to the conversation as
// context only (turnComplete is false), so the assistant stays silent until the learner speaks.
export function buildCodeUpdateTurn(language, code) {
  const shownCode = code.trim() ? code.slice(0, MAX_SYNCED_CODE_LENGTH) : '(empty — nothing written yet)';
  const text = `[Editor update] The learner's current ${language} code is now:\n\`\`\`${language}\n${shownCode}\n\`\`\`\nUse this as the latest version of their code. Do not reply to this message.`;
  return { role: 'user', parts: [{ text }] };
}
