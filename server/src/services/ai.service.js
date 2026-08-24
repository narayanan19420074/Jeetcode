import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// This system prompt is the actual enforcement mechanism — the frontend
// drawer's copy ("ask for a hint, not the answer") is just a UI nudge;
// this is what stops the model from handing out full solutions when a
// learner asks for one anyway. Works the same regardless of provider.
const SYSTEM_PROMPT = `You are a Socratic coding tutor embedded in JeetCode, a free interview-prep platform. A learner is working on a specific problem and has a question about it.

Rules you must follow strictly:
- NEVER write or output a complete or near-complete solution, even if directly asked.
- NEVER write more than 2-3 lines of code, and only as a small illustrative fragment (e.g. showing a data structure declaration), never the core algorithm logic.
- Point toward the right approach, relevant data structure, or target time/space complexity instead of writing the algorithm yourself.
- If their current code has a bug, describe the symptom or the category of mistake, not the fix.
- If they ask you to "just give the answer," politely decline and redirect to a guiding question instead.
- Keep responses concise — 2-4 sentences, under 100 words.`;

function buildContextBlock({ problem, language, code, question }) {
  return `Problem: ${problem.title} (${problem.difficulty})
${problem.description}

Learner's current ${language} code:
\`\`\`${language}
${code || '(empty — they have not started writing code yet)'}
\`\`\`

Learner's question: ${question}`;
}

// --- Gemini (tried first — genuine free tier, no card required as of writing) ---

async function callGemini({ problem, language, code, question, history }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

  const contents = [
    ...history.slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.text }],
    })),
    { role: 'user', parts: [{ text: buildContextBlock({ problem, language, code, question }) }] },
  ];

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 300 },
      }),
    });
  } catch (err) {
    logger.error('Gemini network error', err);
    throw ApiError.internal('Could not reach the AI hint service. Try again in a moment.');
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.error(`Gemini API error (${response.status})`, body);
    if (response.status === 400 || response.status === 403) {
      throw ApiError.internal('AI hint service is misconfigured (check GEMINI_API_KEY).');
    }
    if (response.status === 429) {
      throw ApiError.tooMany('AI hint service is busy right now — try again shortly.');
    }
    throw ApiError.internal('AI hint service is temporarily unavailable.');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || "I couldn't come up with a hint for that just now — try rephrasing your question.";
}

// --- Anthropic (fallback if GEMINI_API_KEY isn't set but ANTHROPIC_API_KEY is) ---

async function callAnthropic({ problem, language, code, question, history }) {
  const messages = [
    ...history.slice(-6).map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.text })),
    { role: 'user', content: buildContextBlock({ problem, language, code, question }) },
  ];

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });
  } catch (err) {
    logger.error('Anthropic network error', err);
    throw ApiError.internal('Could not reach the AI hint service. Try again in a moment.');
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.error(`Anthropic API error (${response.status})`, body);
    if (response.status === 401) throw ApiError.internal('AI hint service is misconfigured (invalid API key).');
    if (response.status === 429) throw ApiError.tooMany('AI hint service is busy right now — try again shortly.');
    throw ApiError.internal('AI hint service is temporarily unavailable.');
  }

  const data = await response.json();
  const text = data.content?.find((block) => block.type === 'text')?.text;
  return text || "I couldn't come up with a hint for that just now — try rephrasing your question.";
}

/**
 * Requests a hint, grounded in the specific problem and the learner's
 * current code + question. Provider is chosen automatically: Gemini
 * (free tier) first if configured, Anthropic as a fallback. `history`
 * (optional, last few turns) lets the drawer feel like a continuous
 * conversation without resending full problem context every message.
 */
export async function getHint({ problem, language, code, question, history = [] }) {
  if (env.GEMINI_API_KEY) {
    return callGemini({ problem, language, code, question, history });
  }
  if (env.ANTHROPIC_API_KEY) {
    return callAnthropic({ problem, language, code, question, history });
  }
  throw ApiError.internal(
    'AI hints are not configured on this server yet. Set GEMINI_API_KEY (free — https://aistudio.google.com/apikey) or ANTHROPIC_API_KEY to enable this feature.'
  );
}
