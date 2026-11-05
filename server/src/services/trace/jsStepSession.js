import { captureStack, remoteToValue } from './jsFrameCapture.js';
import { createPauseQueue } from './jsPauseQueue.js';
import { MAX_TRACE_BYTES, MAX_TRACE_STEPS } from './traceLimits.js';

// Safety net for a debugger that keeps pausing outside the learner's code (it should rarely pause there at all).
const MAX_PAUSES = 300000;

// Counts what the program prints, so every step can show the output produced so far.
const OUTPUT_COUNTER_SCRIPT = `(() => {
  globalThis.__jcOutputLength = 0;
  const write = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk, ...rest) => { globalThis.__jcOutputLength += String(chunk).length; return write(chunk, ...rest); };
})()`;

async function attachDebugger(cdp, queue) {
  cdp.on('Debugger.paused', (pause) => queue.push(pause));
  cdp.onClose(() => queue.end());
  await cdp.send('Runtime.enable');
  await cdp.send('Debugger.enable');
  await cdp.send('Debugger.setBlackboxPatterns', { patterns: ['^node:'] });
  await cdp.send('Runtime.runIfWaitingForDebugger');
}

// Stepping skips blackboxed code on its own, so the problem driver (input parsing, printing) runs at full speed
// and the debugger only stops inside the learner's lines.
async function blackboxProblemDriver(cdp, scriptId, firstLine, lastLine) {
  const positions = [];
  if (firstLine > 1) positions.push({ lineNumber: 0, columnNumber: 0 }, { lineNumber: firstLine - 1, columnNumber: 0 });
  positions.push({ lineNumber: lastLine, columnNumber: 0 });
  try {
    await cdp.send('Debugger.setBlackboxedRanges', { scriptId, positions });
  } catch {
    // Without it the session still works, only slower, because it then steps through the driver too.
  }
}

// The first pause is the program's own entry point ("break on start"); it identifies the script to trace.
async function prepareScript(session, firstPause) {
  const top = firstPause.callFrames[0];
  session.scriptId = top.location.scriptId;
  await session.cdp.send('Debugger.evaluateOnCallFrame', { callFrameId: top.callFrameId, expression: OUTPUT_COUNTER_SCRIPT });
  await blackboxProblemDriver(session.cdp, session.scriptId, session.firstLine, session.lastLine);
}

// Frames of the learner's own code. The outermost frame of the script is the module body, not a learner function.
function findLearnerFrames(session, callFrames) {
  const inScript = callFrames.filter((frame) => frame.location.scriptId === session.scriptId);
  const moduleBody = inScript[inScript.length - 1];
  return inScript.filter((frame) => {
    const line = frame.location.lineNumber + 1;
    return frame !== moduleBody && line >= session.firstLine && line <= session.lastLine;
  });
}

async function readOutputLength(cdp, callFrameId) {
  const { result } = await cdp.send('Debugger.evaluateOnCallFrame', {
    callFrameId,
    expression: 'globalThis.__jcOutputLength || 0',
    returnByValue: true,
  });
  return typeof result.value === 'number' ? result.value : 0;
}

async function buildStep(cdp, pause, learnerFrames) {
  const top = pause.callFrames[0];
  const [stack, out, returned] = await Promise.all([
    captureStack(cdp, learnerFrames),
    readOutputLength(cdp, top.callFrameId),
    top.returnValue ? remoteToValue(cdp, top.returnValue) : null,
  ]);
  const step = { line: top.location.lineNumber + 1, event: top.returnValue ? 'return' : 'line', depth: learnerFrames.length, stack, out };
  if (top.returnValue) step.ret = returned;
  return step;
}

// Records the pause when it is a line of the learner's code. Returns false once the trace is full.
async function recordPause(session, pause) {
  const learnerFrames = findLearnerFrames(session, pause.callFrames);
  if (learnerFrames[0] !== pause.callFrames[0]) return true;
  const step = await buildStep(session.cdp, pause, learnerFrames);
  session.bytes += JSON.stringify(step).length;
  if (session.steps.length >= MAX_TRACE_STEPS || session.bytes > MAX_TRACE_BYTES) return false;
  session.steps.push(step);
  return true;
}

// A closed connection just means the program finished, which the pause queue reports on its own.
const sendStep = (session, method) => session.cdp.send(method).catch(() => {});

async function handlePause(session, pause) {
  if (session.scriptId === null) await prepareScript(session, pause);
  if (!(await recordPause(session, pause))) return false;
  const stillInScript = pause.callFrames[0].location.scriptId === session.scriptId;
  await sendStep(session, stillInScript ? 'Debugger.stepInto' : 'Debugger.stepOut');
  return true;
}

// Drives the paused program one step at a time and returns what the learner's code did.
export async function runStepSession({ cdp, firstLine, lastLine }) {
  const queue = createPauseQueue();
  const session = { cdp, firstLine, lastLine, scriptId: null, steps: [], bytes: 0 };
  await attachDebugger(cdp, queue);
  for (let pauses = 0; pauses < MAX_PAUSES; pauses += 1) {
    const pause = await queue.next();
    if (!pause) return { steps: session.steps, truncated: false };
    if (!(await handlePause(session, pause))) break;
  }
  return { steps: session.steps, truncated: true };
}
