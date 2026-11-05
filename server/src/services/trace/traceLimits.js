import { env } from '../../config/env.js';

// Tracing is several times slower than a normal run (every line is recorded), so it gets a longer wall clock.
export const TRACE_TIME_LIMIT_MS = Math.max(10000, env.JUDGE_TIME_LIMIT_MS * 3);
export const TRACE_MEMORY_LIMIT_KB = env.JUDGE_MEMORY_MB * 1024;

// A trace is a teaching aid, not a full recording: past these limits it stops and is marked as truncated.
export const MAX_TRACE_STEPS = 1500;
export const MAX_TRACE_FRAMES = 8;
export const MAX_TRACE_BYTES = 700000;
export const MAX_TRACE_VARIABLES = 20;
export const MAX_TRACE_OUTPUT_CHARS = 20000;

// Each trace holds a process for up to TRACE_TIME_LIMIT_MS, so only a few run at once on the judge.
export const MAX_CONCURRENT_TRACES = 2;
