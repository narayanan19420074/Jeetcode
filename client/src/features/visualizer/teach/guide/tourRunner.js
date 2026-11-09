import { speak, splitSentences, toSpoken } from '../speech';
import { CANCEL, sleep, TOP_SAFE } from './guideConstants';

// The tour is an async script. Every step first checks `alive()` so that closing
// the guide (or a StrictMode remount) stops the old run instead of letting two
// tours talk over each other.
function createTimeline(id, refs) {
  const alive = () => {
    if (refs.runRef.current !== id) throw CANCEL;
  };
  // Pausing freezes the script between steps; it resumes where it stopped.
  const gate = async () => {
    alive();
    while (refs.pausedRef.current) {
      await sleep(80);
      alive();
    }
  };
  const wait = async (ms) => {
    let left = ms;
    while (left > 0) {
      await gate();
      const slice = Math.min(60, left);
      await sleep(slice);
      left -= slice;
    }
    alive();
  };
  const until = async (fn, timeout = 30000) => {
    let t = 0;
    while (!fn() && t < timeout) {
      await wait(120);
      t += 120;
    }
  };
  return { gate, wait, until };
}

// Speak a single sentence. Resolves 'done' | 'skip'. If the learner
// pauses mid-sentence we stop talking and say it again on resume.
function createSpeaker(id, refs, gate) {
  return async (sentence) => {
    for (;;) {
      await gate();
      const handle = speak(toSpoken(sentence), { muted: refs.mutedRef.current });
      refs.speechRef.current = handle;
      let outcome = null;
      handle.promise.then(() => { if (!outcome) outcome = 'done'; });
      while (!outcome) {
        await sleep(50);
        if (refs.runRef.current !== id) { handle.cancel(); throw CANCEL; }
        if (refs.skipRef.current) { outcome = 'skip'; handle.cancel(); } else if (refs.pausedRef.current) { outcome = 'pause'; handle.cancel(); }
      }
      if (outcome === 'pause') continue;
      return outcome;
    }
  };
}

function createSay(refs, setters, speakSentence, wait) {
  return async (text) => {
    const sentences = splitSentences(text);
    refs.skipRef.current = false;
    setters.setCaption({ text, sentences, idx: 0 });
    setters.setTalking(true);
    try {
      for (let i = 0; i < sentences.length; i += 1) {
        setters.setCaption({ text, sentences, idx: i });
        const outcome = await speakSentence(sentences[i]);
        if (outcome === 'skip') break;
      }
    } finally {
      setters.setTalking(false);
      refs.skipRef.current = false;
    }
    await wait(220);
  };
}

function createPointer(refs, setters, wait) {
  const find = (sel) => (sel ? document.querySelector(sel) : null);
  const has = (sel) => {
    const el = find(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 8;
  };
  // Scrolls the target into a spot where Blip can show it, differently on phones.
  const point = (sel) => {
    const el = find(sel);
    setters.setTarget(el ? sel : null);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (refs.compactRef.current) {
      if (r.top > vh * 0.42 || r.top < TOP_SAFE) window.scrollBy({ top: r.top - 96, behavior: 'smooth' });
    } else if (r.top < 0 || r.bottom > vh) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };
  const click = async (sel) => {
    const el = find(sel);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setters.setTap({ x: r.left + r.width / 2, y: r.top + r.height / 2, key: Date.now() });
    await wait(520);
    if (!el.disabled) el.click();
    await wait(280);
    setters.setTap(null);
  };
  return { has, point, click };
}

// Builds the API object handed to runTour (see teachScript.js).
export function createTourApi(id, refs, setters, page) {
  const { gate, wait, until } = createTimeline(id, refs);
  const speakSentence = createSpeaker(id, refs, gate);
  const say = createSay(refs, setters, speakSentence, wait);
  const { has, point, click } = createPointer(refs, setters, wait);
  return { say, point, click, wait, until, has, page };
}
