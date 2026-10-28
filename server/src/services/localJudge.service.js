import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// Local judge — runs submissions on OUR server (no external Judge0 API).
//
// Exposes the same two calls judge0.service.js exposes (submitBatch /
// pollBatchResults) and returns the same result shape, so submission.service,
// the socket "code:run" and everything else keep working unchanged.
//
// How it works:
//   JS     -> node (Node permission model: no child_process, no writes,
//             reads only its own temp dir, when the Node version supports it)
//   Python -> python3 -I
//   C++    -> g++ (compiled ONCE per batch, reused for every test case)
//   Java   -> javac + java (needs a JDK on the server; compiled ONCE per batch).
//             judge0.service.js sends Java to the Judge0 API instead when no JDK is installed.
//
// Each run: fresh temp dir, minimal env (no secrets), wall-clock timeout,
// output cap, memory watch (/proc VmHWM), global concurrency limit.
//
// SECURITY: this is process-level isolation only. In production it must run inside the
// dedicated judge service (judgeServer.js, own container, no database or auth secrets), and
// that service starts as root and runs every submission as an unprivileged user (JUDGE_RUN_AS_UID),
// so submitted code cannot read the service's environment or files. judge0.service.js refuses to use
// this module inside the main API in production.
// ============================================================================

const TIME_LIMIT_MS = env.JUDGE_TIME_LIMIT_MS;
const MEMORY_LIMIT_KB = env.JUDGE_MEMORY_MB * 1024;
const COMPILE_TIMEOUT_MS = 90000;
const MAX_STDOUT_BYTES = 1024 * 1024;
const MAX_STORED_OUTPUT = 64 * 1024;
const MAX_STORED_STDERR = 8 * 1024;
const RESULT_TTL_MS = 10 * 60 * 1000;

// Drop privileges for submitted code. Only possible when this process is root (the judge container).
const RUN_AS = (() => {
  const uid = Number(env.JUDGE_RUN_AS_UID);
  const gid = env.JUDGE_RUN_AS_GID !== undefined ? Number(env.JUDGE_RUN_AS_GID) : uid;
  if (!Number.isInteger(uid) || uid <= 0 || typeof process.getuid !== 'function' || process.getuid() !== 0) return null;
  return { uid, gid: Number.isInteger(gid) && gid > 0 ? gid : uid };
})();
logger.info(RUN_AS ? `Local judge: submissions run as uid ${RUN_AS.uid}` : 'Local judge: submissions run as the server user (no privilege drop)');

// Judge0-compatible language ids -> our language keys.
const ID_TO_LANG = { 63: 'javascript', 71: 'python', 54: 'cpp', 62: 'java' };
const EXT = { javascript: 'js', python: 'py', cpp: 'cpp', java: 'java' };
const FILE_NAME = { java: 'Main.java' }; // Java insists the file is named after the public class

// Judge0-compatible status ids.
const ST = {
  ACCEPTED: 3,
  WRONG: 4,
  TLE: 5,
  COMPILE: 6,
  RUNTIME_NZEC: 11,
  RUNTIME_OTHER: 12,
  INTERNAL: 13,
};
const ST_NAME = {
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  11: 'Runtime Error',
  12: 'Runtime Error',
  13: 'Internal Error',
};

class Semaphore {
  constructor(n) {
    this.n = n;
    this.q = [];
  }
  async acquire() {
    if (this.n > 0) {
      this.n -= 1;
      return;
    }
    await new Promise((resolve) => this.q.push(resolve));
  }
  release() {
    const next = this.q.shift();
    if (next) next();
    else this.n += 1;
  }
}

const runSem = new Semaphore(Math.max(1, env.JUDGE_CONCURRENCY));
const compileSem = new Semaphore(1); // g++ / javac are memory hungry — one at a time

const jobs = new Map(); // token -> Promise<result>

// --- tool discovery (cached) -------------------------------------------------

const toolCache = {};
function findTool(key, candidates) {
  if (key in toolCache) return toolCache[key];
  toolCache[key] = null;
  for (const c of candidates) {
    try {
      const r = spawnSync(c, ['--version'], { timeout: 5000, stdio: 'ignore' });
      if (!r.error && r.status === 0) {
        toolCache[key] = c;
        break;
      }
    } catch {
      // try next
    }
  }
  if (!toolCache[key]) logger.warn(`Local judge: none of [${candidates.join(', ')}] found on this server`);
  return toolCache[key];
}

// Node's permission model flag name differs between versions. Probe once with
// a real script and only use it if it works AND actually denies reads outside
// the allowed dir. If not, JS still runs, just without the extra lock.
let permFlag; // undefined = not probed yet, null = unavailable
function probePermissionFlag() {
  for (const flag of ['--permission', '--experimental-permission']) {
    let dir;
    try {
      dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jc-probe-'));
      fs.writeFileSync(
        path.join(dir, 'p.js'),
        `const n = JSON.parse(require('fs').readFileSync(0, 'utf-8')).length;
let d = 'open';
try { require('fs').readFileSync('/etc/passwd'); } catch { d = 'denied'; }
process.stdout.write(n + ':' + d);`
      );
      const r = spawnSync(process.execPath, [flag, `--allow-fs-read=${dir}`, 'p.js'], {
        cwd: dir,
        input: '[1,2]',
        timeout: 8000,
        env: { PATH: process.env.PATH || '' },
        encoding: 'utf-8',
      });
      if (r.status === 0 && r.stdout === '2:denied') return flag;
    } catch {
      // try next flag
    } finally {
      if (dir) fs.rmSync(dir, { recursive: true, force: true });
    }
  }
  logger.warn('Local judge: Node permission model unavailable — JS runs without fs lock');
  return null;
}

function nodePermArgs(dir) {
  if (permFlag === undefined) permFlag = probePermissionFlag();
  return permFlag ? [permFlag, `--allow-fs-read=${dir}`] : [];
}

// --- process runner ----------------------------------------------------------

function exec(cmd, args, { cwd, input = '', timeoutMs, memLimitKb = 0 }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const outChunks = [];
    const errChunks = [];
    let outBytes = 0;
    let errBytes = 0;
    let timedOut = false;
    let outputExceeded = false;
    let memExceeded = false;
    let peakKb = 0;
    let done = false;
    let timer = null;
    let sampler = null;

    const finish = (payload) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearInterval(sampler);
      resolve({
        ms: Date.now() - started,
        peakKb,
        timedOut,
        outputExceeded,
        memExceeded,
        stdout: Buffer.concat(outChunks).toString('utf-8'),
        stderr: Buffer.concat(errChunks).toString('utf-8'),
        ...payload,
      });
    };

    let child;
    try {
      child = spawn(cmd, args, {
        cwd,
        env: { PATH: process.env.PATH || '', HOME: cwd, TMPDIR: cwd, LANG: 'C.UTF-8', PYTHONIOENCODING: 'utf-8' },
        stdio: ['pipe', 'pipe', 'pipe'],
        ...(RUN_AS ? { uid: RUN_AS.uid, gid: RUN_AS.gid } : {}),
      });
    } catch (err) {
      finish({ spawnError: err.message, code: null, signal: null });
      return;
    }

    const kill = () => {
      try {
        child.kill('SIGKILL');
      } catch {
        // already gone
      }
    };

    child.on('error', (err) => finish({ spawnError: err.code === 'ENOENT' ? `${cmd} not found` : err.message, code: null, signal: null }));
    child.on('close', (code, signal) => finish({ code, signal }));

    child.stdout.on('data', (chunk) => {
      outBytes += chunk.length;
      if (outBytes > MAX_STDOUT_BYTES) {
        outputExceeded = true;
        kill();
        return;
      }
      outChunks.push(chunk);
    });
    child.stderr.on('data', (chunk) => {
      errBytes += chunk.length;
      if (errBytes <= MAX_STORED_OUTPUT) errChunks.push(chunk);
    });

    child.stdin.on('error', () => {}); // child may exit before reading stdin
    child.stdin.end(input);

    timer = setTimeout(() => {
      timedOut = true;
      kill();
    }, timeoutMs);

    if (memLimitKb > 0 && child.pid) {
      sampler = setInterval(() => {
        try {
          const m = /VmHWM:\s+(\d+)\s+kB/.exec(fs.readFileSync(`/proc/${child.pid}/status`, 'utf-8'));
          if (m) {
            peakKb = Math.max(peakKb, parseInt(m[1], 10));
            if (peakKb > memLimitKb) {
              memExceeded = true;
              kill();
            }
          }
        } catch {
          // process exited or /proc unavailable — ignore
        }
      }, 20);
    }
  });
}

// --- workspaces (one per unique source in a batch) ---------------------------

// Cheap fail-fast screen for obvious attempts to read server files. Not a
// security boundary on its own — just defense in depth.
const FORBIDDEN = /\/(proc|sys|etc|home|opt|mnt|root|var|srv|app)\/|\.\.\/\.\./;

function makeWorkspace(lang, source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jc-judge-'));
  const ws = { lang, dir, pending: 0, ready: Promise.resolve(), compileError: null, fatal: null, rejected: null };
  const file = path.join(dir, FILE_NAME[lang] || `main.${EXT[lang]}`);
  fs.writeFileSync(file, source);
  if (RUN_AS) {
    // Only the unprivileged run-as user can read or write this workspace.
    fs.chmodSync(dir, 0o700);
    fs.chownSync(dir, RUN_AS.uid, RUN_AS.gid);
    fs.chownSync(file, RUN_AS.uid, RUN_AS.gid);
  }
  if (FORBIDDEN.test(source)) ws.rejected = 'Your code contains a disallowed pattern (file system access).';
  if (!ws.rejected && lang === 'cpp') ws.ready = compileCpp(ws);
  if (!ws.rejected && lang === 'java') ws.ready = compileJava(ws);
  return ws;
}

function removeWorkspace(ws) {
  fs.rm(ws.dir, { recursive: true, force: true }, () => {});
}

async function compileCpp(ws) {
  const cxx = findTool('cxx', ['g++', 'c++']);
  if (!cxx) {
    ws.fatal = 'C++ compiler (g++) is not installed on the judge server.';
    return;
  }
  await compileSem.acquire();
  try {
    const r = await exec(cxx, ['-O2', '-std=c++17', '-pipe', '-o', 'main', 'main.cpp'], {
      cwd: ws.dir,
      timeoutMs: COMPILE_TIMEOUT_MS,
    });
    if (r.spawnError) ws.fatal = `C++ compile failed to start: ${r.spawnError}`;
    else if (r.timedOut) ws.compileError = 'Compilation timed out.';
    else if (r.code !== 0) ws.compileError = (r.stderr || r.stdout || 'Compilation failed.').trim();
  } finally {
    compileSem.release();
  }
}

async function compileJava(ws) {
  const javac = findTool('javac', ['javac']);
  if (!javac) {
    ws.fatal = 'Java (JDK) is not installed on the judge server.';
    return;
  }
  await compileSem.acquire();
  try {
    const r = await exec(javac, ['-encoding', 'UTF-8', '-J-Xmx256m', '-J-XX:+UseSerialGC', '-J-XX:TieredStopAtLevel=1', 'Main.java'], {
      cwd: ws.dir,
      timeoutMs: COMPILE_TIMEOUT_MS,
    });
    if (r.spawnError) ws.fatal = `Java compile failed to start: ${r.spawnError}`;
    else if (r.timedOut) ws.compileError = 'Compilation timed out.';
    else if (r.code !== 0) ws.compileError = (r.stderr || r.stdout || 'Compilation failed.').trim();
  } finally {
    compileSem.release();
  }
}

// True when this server can run the language itself (Java needs a JDK; the rest are always bundled).
export function canRun(languageId) {
  if (ID_TO_LANG[languageId] !== 'java') return Boolean(ID_TO_LANG[languageId]);
  return Boolean(findTool('javac', ['javac']) && findTool('java', ['java']));
}

// --- output comparison (same leniency as Judge0: trailing whitespace) --------

function normalize(s) {
  return String(s ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

// --- single test-case run ----------------------------------------------------

function result(token, statusId, { stdout = '', stderr = '', ms = 0, memory = 0 } = {}) {
  return {
    token,
    statusId,
    status: ST_NAME[statusId] || 'Internal Error',
    stdout: stdout.slice(0, MAX_STORED_OUTPUT),
    stderr: stderr.slice(0, MAX_STORED_STDERR),
    time: (ms / 1000).toFixed(3),
    memory,
  };
}

function buildCommand(ws) {
  // Memory, process-count (fork bombs) and file-size (disk filling) limits. Failures are ignored on shells without a flag.
  const memScript = 'ulimit -v 1048576 2>/dev/null; ulimit -u 512 2>/dev/null; ulimit -f 32768 2>/dev/null; exec "$0" "$@"';
  if (ws.lang === 'javascript') {
    return {
      cmd: process.execPath,
      args: [`--max-old-space-size=${Math.max(64, Math.floor(env.JUDGE_MEMORY_MB * 0.75))}`, ...nodePermArgs(ws.dir), 'main.js'],
    };
  }
  if (ws.lang === 'python') {
    const py = findTool('python', ['python3', 'python']);
    if (!py) return { error: 'Python is not installed on the judge server.' };
    return { cmd: 'sh', args: ['-c', memScript, py, '-I', 'main.py'] };
  }
  if (ws.lang === 'java') {
    const java = findTool('java', ['java']);
    if (!java) return { error: 'Java (JDK) is not installed on the judge server.' };
    // No `ulimit -v`: the JVM reserves far more address space than it uses. The heap is capped instead.
    const heap = Math.max(64, Math.floor(env.JUDGE_MEMORY_MB * 0.75));
    return { cmd: java, args: ['-Xmx' + heap + 'm', '-Xss64m', '-XX:+UseSerialGC', '-XX:TieredStopAtLevel=1', '-Xshare:auto', '-cp', '.', 'Main'] };
  }
  return { cmd: 'sh', args: ['-c', memScript, './main'] };
}

async function runCase(token, ws, item) {
  try {
    await ws.ready;
    if (ws.rejected) return result(token, ST.RUNTIME_OTHER, { stderr: ws.rejected });
    if (ws.fatal) return result(token, ST.INTERNAL, { stderr: ws.fatal });
    if (ws.compileError) return result(token, ST.COMPILE, { stderr: ws.compileError });

    const built = buildCommand(ws);
    if (built.error) return result(token, ST.INTERNAL, { stderr: built.error });

    await runSem.acquire();
    let r;
    try {
      r = await exec(built.cmd, built.args, {
        cwd: ws.dir,
        input: item.stdin ?? '',
        timeoutMs: TIME_LIMIT_MS,
        // The JVM itself takes ~60MB of resident memory on top of the heap, so give it headroom.
        memLimitKb: ws.lang === 'java' ? MEMORY_LIMIT_KB + 128 * 1024 : MEMORY_LIMIT_KB,
      });
    } finally {
      runSem.release();
    }

    const base = { stdout: r.stdout, stderr: r.stderr, ms: r.ms, memory: r.peakKb };
    if (r.spawnError) return result(token, ST.INTERNAL, { ...base, stderr: r.spawnError });
    if (r.timedOut) return result(token, ST.TLE, { ...base, stderr: 'Time Limit Exceeded' });
    if (r.memExceeded) return result(token, ST.RUNTIME_OTHER, { ...base, stderr: 'Memory Limit Exceeded' });
    if (r.outputExceeded) return result(token, ST.RUNTIME_OTHER, { ...base, stderr: 'Output limit exceeded' });
    if (r.signal) return result(token, ST.RUNTIME_OTHER, { ...base, stderr: r.stderr || `Killed by signal ${r.signal}` });
    if (r.code !== 0) return result(token, ST.RUNTIME_NZEC, { ...base, stderr: r.stderr || `Exited with code ${r.code}` });

    // No expected output (e.g. free-form "Run" in a collab room) -> just ran OK.
    const expected = item.expectedOutput ?? '';
    if (expected === '') return result(token, ST.ACCEPTED, base);
    const ok = normalize(r.stdout) === normalize(expected);
    return result(token, ok ? ST.ACCEPTED : ST.WRONG, base);
  } catch (err) {
    logger.error('Local judge runCase failed', err);
    return result(token, ST.INTERNAL, { stderr: 'Judge internal error' });
  }
}

// --- public API (same contract as judge0.service.js) -------------------------

export async function submitBatch(items) {
  const workspaces = new Map(); // lang+source -> workspace (compile once)
  const tokens = [];

  for (const item of items) {
    const token = `local-${crypto.randomUUID()}`;
    tokens.push(token);

    const lang = ID_TO_LANG[item.languageId];
    let job;
    if (!lang) {
      job = Promise.resolve(result(token, ST.INTERNAL, { stderr: 'Unsupported language' }));
    } else {
      const key = `${lang}\u0000${item.sourceCode}`;
      let ws = workspaces.get(key);
      if (!ws) {
        try {
          ws = makeWorkspace(lang, item.sourceCode ?? '');
          workspaces.set(key, ws);
        } catch (err) {
          logger.error('Local judge workspace failed', err);
        }
      }
      if (!ws) {
        job = Promise.resolve(result(token, ST.INTERNAL, { stderr: 'Judge could not prepare a workspace' }));
      } else {
        ws.pending += 1;
        const w = ws;
        job = runCase(token, w, item).finally(() => {
          w.pending -= 1;
          if (w.pending === 0) removeWorkspace(w);
        });
      }
    }

    jobs.set(token, job);
    setTimeout(() => jobs.delete(token), RESULT_TTL_MS).unref();
  }

  return tokens;
}

export async function pollBatchResults(tokens) {
  return Promise.all(
    tokens.map(async (token) => {
      const job = jobs.get(token);
      if (!job) return result(token, ST.INTERNAL, { stderr: 'Judge result expired (server restarted?). Submit again.' });
      const r = await job;
      jobs.delete(token);
      return r;
    })
  );
}
