import { ApiError } from '../utils/ApiError.js';
import { generateText } from './aiProvider.service.js';
import { HINT_SYSTEM_PROMPT, FIX_SYSTEM_PROMPT, buildContextBlock, buildFixRequest } from './aiPrompts.js';

const HINT_MAX_TOKENS = 300;
// A fix returns the whole program, so it needs far more room than a hint.
const FIX_MAX_TOKENS = 8192;
const EMPTY_HINT_REPLY = "I couldn't come up with a hint for that just now — try rephrasing your question.";
const FIX_FAILED_MESSAGE = 'Could not fix your code just now. Please try again.';

// First complete fenced block. A reply cut off before the closing fence is treated as no code,
// so a truncated (half-written) program is never put into the editor.
const CODE_BLOCK_PATTERN = /```[\w+#.-]*\r?\n([\s\S]*?)```/;

export function extractCodeBlock(text) {
  const match = CODE_BLOCK_PATTERN.exec(text);
  const code = match ? match[1].trimEnd() : '';
  return code.trim() ? code : null;
}

/**
 * Requests a hint, grounded in the specific problem and the learner's current code + question.
 * `history` (optional, last few turns) lets the drawer feel like a continuous conversation
 * without resending full problem context every message.
 */
export async function getHint({ problem, language, code, question, history = [] }) {
  const reply = await generateText({
    systemPrompt: HINT_SYSTEM_PROMPT,
    history,
    userMessage: buildContextBlock({ problem, language, code, question }),
    maxOutputTokens: HINT_MAX_TOKENS,
  });
  return reply || EMPTY_HINT_REPLY;
}

// Fix: returns the learner's complete, corrected code (not a hint). Triggered only by the explicit Fix action.
export async function getFixedCode({ problem, language, code }) {
  const reply = await generateText({
    systemPrompt: FIX_SYSTEM_PROMPT,
    history: [],
    userMessage: buildFixRequest({ problem, language, code }),
    maxOutputTokens: FIX_MAX_TOKENS,
  });
  const fixedCode = extractCodeBlock(reply);
  if (!fixedCode) throw ApiError.internal(FIX_FAILED_MESSAGE);
  return fixedCode;
}
