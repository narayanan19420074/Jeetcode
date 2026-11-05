import fs from 'node:fs';
import { exec, findTool, SANDBOX_LIMITS_SCRIPT } from '../localJudge.service.js';
import { TRACE_MEMORY_LIMIT_KB, TRACE_TIME_LIMIT_MS } from './traceLimits.js';
import { createTraceWorkspace, removeTraceWorkspace } from './traceWorkspace.js';

const TRACER_SOURCE = fs.readFileSync(new URL('./pythonTracer.py', import.meta.url), 'utf-8');

const emptyTrace = (error) => ({ steps: [], stdout: '', truncated: false, error, errorLine: null });

// The tracer writes one JSON document to stdout. Anything else means the interpreter itself failed.
function readTracerResult(run) {
  if (run.spawnError) throw new Error(run.spawnError);
  if (run.timedOut) return { ...emptyTrace('Time limit exceeded while tracing.'), truncated: true };
  if (run.memExceeded) return emptyTrace('Memory limit exceeded while tracing.');
  try {
    return JSON.parse(run.stdout);
  } catch {
    return emptyTrace(run.stderr.trim().split('\n').pop() || 'The program stopped before it could be traced.');
  }
}

export async function tracePython({ sourceCode, stdin, firstLine, lastLine }) {
  const python = findTool('python', ['python3', 'python']);
  if (!python) throw new Error('Python is not installed on the judge server.');
  const dir = createTraceWorkspace({ 'main.py': sourceCode, 'pythonTracer.py': TRACER_SOURCE });
  try {
    const args = ['-c', SANDBOX_LIMITS_SCRIPT, python, '-I', 'pythonTracer.py', 'main.py', String(firstLine), String(lastLine)];
    const run = await exec('sh', args, { cwd: dir, input: stdin, timeoutMs: TRACE_TIME_LIMIT_MS, memLimitKb: TRACE_MEMORY_LIMIT_KB });
    return readTracerResult(run);
  } finally {
    removeTraceWorkspace(dir);
  }
}
