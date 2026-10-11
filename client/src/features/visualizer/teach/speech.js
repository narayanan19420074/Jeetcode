// Thin wrapper over the browser's Web Speech API (speechSynthesis).
// Everything here degrades gracefully: when speech is unavailable or muted,
// `speak()` still resolves after a reading-speed delay so the guided tour keeps
// its pacing and the on-screen captions do the talking.

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';

const PREFERRED = [
  /natural/i, /aria/i, /jenny/i, /google us english/i, /google uk english female/i,
  /samantha/i, /zira/i, /karen/i, /moira/i, /serena/i,
];

let cachedVoice = null;

export function pickVoice() {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  if (cachedVoice && voices.includes(cachedVoice)) return cachedVoice;
  const en = voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  const pool = en.length ? en : voices;
  for (const re of PREFERRED) {
    const hit = pool.find((v) => re.test(v.name));
    if (hit) { cachedVoice = hit; return hit; }
  }
  cachedVoice = pool.find((v) => /^en[-_](US|GB|IN)/i.test(v.lang)) || pool[0];
  return cachedVoice;
}

// Voices load asynchronously in Chrome; call once so the first line already
// has the right voice.
export function warmUpVoices() {
  if (!speechSupported()) return;
  window.speechSynthesis.getVoices();
}

export function estimateMs(text) {
  // ~ 15 characters per second at normal speaking speed + a small breath.
  return Math.max(900, Math.round((text.length / 15) * 1000) + 350);
}

// Break a paragraph into sentences so each one is spoken (and highlighted)
// separately. Chrome also cuts very long utterances short, so this is
// a reliability measure as well.
export function splitSentences(text) {
  const parts = text.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [text];
  return parts.map((p) => p.trim()).filter(Boolean);
}

export function cancelSpeech() {
  if (speechSupported()) window.speechSynthesis.cancel();
}

/**
 * Speak one sentence. Returns { promise, cancel }. The promise always resolves
 * (never rejects): on end, on error, on cancel, or after a safety timeout.
 */
export function speak(text, { muted = false, rate = 1, pitch = 1.12 } = {}) {
  let done = false;
  let finish = () => {};
  let timer = null;
  const promise = new Promise((resolve) => {
    finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve();
    };
  });

  const est = estimateMs(text) / rate;

  if (muted || !speechSupported()) {
    timer = setTimeout(finish, est);
    return { promise, cancel: finish };
  }

  try {
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-US';
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    u.onend = finish;
    u.onerror = finish;
    window.speechSynthesis.speak(u);
    // Some browsers never fire onend (tab in background, voice failure).
    timer = setTimeout(finish, est * 2 + 2500);
  } catch {
    timer = setTimeout(finish, est);
  }

  return {
    promise,
    cancel: () => {
      cancelSpeech();
      finish();
    },
  };
}

/* ------------------------------------------------------------------ */
/* Spoken forms of notation Blip needs to read aloud                     */
/* ------------------------------------------------------------------ */

// "O(n²)" -> "O of n squared", "O(n log n)" -> "O of n log n", ...
export function spokenComplexity(raw) {
  if (!raw) return '';
  return raw
    .replace(/O\(1\)/g, 'O of one')
    .replace(/O\(/g, 'O of ')
    .replace(/²/g, ' squared')
    .replace(/ⁿ/g, ' to the n')
    .replace(/\s*×\s*/g, ' times ')
    .replace(/\s*\+\s*/g, ' plus ')
    .replace(/\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Caption text -> text that a speech engine pronounces sensibly.
export function toSpoken(text) {
  return text
    .replace(/O\([^)]*\)/g, (m) => spokenComplexity(m))
    .replace(/\bBFS\b/g, 'B F S')
    .replace(/\bDFS\b/g, 'D F S')
    .replace(/\bBST\b/g, 'B S T')
    .replace(/\bDP\b/g, 'D P')
    .replace(/0\/1/g, 'zero one')
    .replace(/\bfib\b/gi, 'Fibonacci')
    .replace(/[()]/g, ',')
    .replace(/\s+/g, ' ')
    .trim();
}
