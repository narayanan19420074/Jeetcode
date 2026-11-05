import { spawn } from 'node:child_process';
import { RUN_AS } from '../localJudge.service.js';
import { connectCdp } from './cdpClient.js';
import { runStepSession } from './jsStepSession.js';
import { TRACE_TIME_LIMIT_MS } from './traceLimits.js';
import { createTraceWorkspace, removeTraceWorkspace } from './traceWorkspace.js';

const INSPECTOR_URL_PATTERN = /ws:\/\/[^\s]+/;
const INSPECTOR_START_TIMEOUT_MS = 8000;
const EXIT_GRACE_MS = 1000;

// The program starts paused on its first line and waits for the tracer to attach to its inspector.
function startPausedProgram(dir) {
  return spawn(process.execPath, ['--inspect-brk=127.0.0.1:0', 'main.js'], {
    cwd: dir,
    env: { PATH: process.env.PATH || '', HOME: dir, TMPDIR: dir, LANG: 'C.UTF-8' },
    stdio: ['pipe', 'pipe', 'pipe'],
    ...(RUN_AS ? { uid: RUN_AS.uid, gid: RUN_AS.gid } : {}),
  });
}

function collectStream(stream) {
  const chunks = [];
  stream.on('data', (chunk) => chunks.push(chunk));
  return () => Buffer.concat(chunks).toString('utf-8');
}

// Node announces "Debugger listening on ws://127.0.0.1:<port>/<id>" on stderr once the inspector is ready.
function waitForInspectorUrl(child) {
  return new Promise((resolve, reject) => {
    let announced = '';
    const timer = setTimeout(() => reject(new Error('The JavaScript inspector did not start.')), INSPECTOR_START_TIMEOUT_MS);
    child.stderr.on('data', (chunk) => {
      announced += chunk.toString('utf-8');
      const match = INSPECTOR_URL_PATTERN.exec(announced);
      if (!match) return;
      clearTimeout(timer);
      resolve(match[0]);
    });
    child.on('error', (error) => reject(error));
    child.on('exit', () => reject(new Error('The program exited before it could be traced.')));
  });
}

function waitForExit(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null) return resolve();
    const timer = setTimeout(resolve, EXIT_GRACE_MS);
    child.on('exit', () => {
      clearTimeout(timer);
      resolve();
    });
    return undefined;
  });
}

// Node prints "<file>:<line>" above an uncaught error; the error itself is the first "...Error: message" line.
function describeFailure(stderr) {
  const location = /main\.js:(\d+)/.exec(stderr);
  const message = /^(?:\w*Error|Uncaught)[^\n]*/m.exec(stderr);
  return { error: message ? message[0] : null, errorLine: location ? Number(location[1]) : null };
}

async function traceUntilDone(child, { firstLine, lastLine }) {
  const cdp = await connectCdp(await waitForInspectorUrl(child));
  try {
    return await runStepSession({ cdp, firstLine, lastLine });
  } finally {
    cdp.close();
  }
}

// A program that dies before the debugger can follow it (for example a syntax error) is a result to show, not a failure.
async function collectTrace(child, lines) {
  try {
    return await traceUntilDone(child, lines);
  } catch (error) {
    await waitForExit(child);
    if (child.exitCode) return { steps: [], truncated: false };
    throw error;
  }
}

export async function traceJavaScript({ sourceCode, stdin, firstLine, lastLine }) {
  const dir = createTraceWorkspace({ 'main.js': sourceCode });
  const child = startPausedProgram(dir);
  const readStdout = collectStream(child.stdout);
  const readStderr = collectStream(child.stderr);
  let timedOut = false;
  child.stdin.on('error', () => {});
  child.stdin.end(stdin);
  const timeout = setTimeout(() => {
    timedOut = true;
    child.kill('SIGKILL');
  }, TRACE_TIME_LIMIT_MS);
  try {
    const { steps, truncated } = await collectTrace(child, { firstLine, lastLine });
    await waitForExit(child);
    const failure = child.exitCode ? describeFailure(readStderr()) : { error: null, errorLine: null };
    if (timedOut) failure.error = 'Time limit exceeded while tracing.';
    return { steps, stdout: readStdout(), truncated: truncated || timedOut, ...failure };
  } finally {
    clearTimeout(timeout);
    child.kill('SIGKILL');
    removeTraceWorkspace(dir);
  }
}
