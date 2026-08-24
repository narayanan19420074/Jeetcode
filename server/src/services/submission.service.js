import { Submission } from '../models/Submission.js';
import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { LANGUAGE_IDS, submitBatch, pollBatchResults } from './judge0.service.js';
import { buildSourceCode } from './codeHarness.service.js';
import { applyStreakUpdate } from './streak.service.js';

// Priority order when several test cases fail in different ways — the
// most "diagnostic" failure wins so the learner sees the real blocker
// first (a compile error hides every other symptom, so it always wins).
const STATUS_PRIORITY = [
  'Compilation Error',
  'Runtime Error',
  'Time Limit Exceeded',
  'Internal Error',
  'Wrong Answer',
];

function aggregateStatus(results) {
  for (const status of STATUS_PRIORITY) {
    if (results.some((r) => r.status === status)) return status;
  }
  return 'Accepted';
}

/**
 * Runs one submission end-to-end: builds the harness source, sends the
 * relevant test cases to Judge0, aggregates the verdict, persists it, and
 * — for 'submit' mode — updates the problem's acceptance stats and the
 * user's solved counters + streak.
 *
 * Idempotent-ish: safe to call once per submission id; re-running would
 * re-judge and re-save, but the queue only enqueues each submission once.
 */
export async function processSubmission(submissionId) {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw ApiError.notFound('Submission not found');

  const problem = await Problem.findById(submission.problem);
  if (!problem) throw ApiError.notFound('Problem not found');

  try {
    submission.status = 'Judging';
    await submission.save();

    const testCases =
      submission.mode === 'run' ? problem.testCases.filter((tc) => tc.isSample) : problem.testCases;

    if (testCases.length === 0) {
      throw ApiError.badRequest('No sample test cases are configured for this problem yet.');
    }

    const driverTemplate = problem.driverCode[submission.language];
    const sourceCode = buildSourceCode(driverTemplate, submission.code, submission.language);
    const languageId = LANGUAGE_IDS[submission.language];

    const batchItems = testCases.map((tc) => ({
      sourceCode,
      languageId,
      stdin: tc.stdin,
      expectedOutput: tc.expectedOutput,
    }));

    const tokens = await submitBatch(batchItems);
    submission.judge0Tokens = tokens;
    await submission.save();

    const results = await pollBatchResults(tokens);

    submission.testResults = results.map((r, i) => ({
      passed: r.status === 'Accepted',
      stdin: testCases[i].stdin,
      expectedOutput: testCases[i].expectedOutput,
      actualOutput: r.stdout,
      stderr: r.stderr,
      time: r.time,
      memory: r.memory,
    }));
    submission.passedCount = results.filter((r) => r.status === 'Accepted').length;
    submission.totalCount = results.length;
    submission.status = aggregateStatus(results);
    submission.runtimeMs = Math.round(Math.max(0, ...results.map((r) => parseFloat(r.time) || 0)) * 1000);
    submission.memoryKb = Math.max(0, ...results.map((r) => r.memory || 0));

    await submission.save();

    if (submission.mode === 'submit') {
      await settleSubmitSideEffects(submission, problem);
    }

    return submission;
  } catch (err) {
    submission.status = submission.status === 'Judging' ? 'Internal Error' : submission.status;
    await submission.save().catch(() => {});
    logger.error(`processSubmission failed for ${submissionId}`, err);
    throw err;
  }
}

async function settleSubmitSideEffects(submission, problem) {
  await Problem.updateOne(
    { _id: problem._id },
    {
      $inc: {
        totalSubmissions: 1,
        acceptedSubmissions: submission.status === 'Accepted' ? 1 : 0,
      },
    }
  );

  const user = await User.findById(submission.user);
  if (!user) return;

  // Every genuine submit attempt counts toward the daily streak, not just
  // accepted ones — this matches how most practice platforms measure
  // "showed up and worked on something today."
  applyStreakUpdate(user);

  if (submission.status === 'Accepted') {
    const alreadySolved = user.solvedProblems.some((id) => id.equals(problem._id));
    if (!alreadySolved) {
      user.solvedProblems.push(problem._id);
      if (problem.difficulty === 'Easy') user.easySolved += 1;
      else if (problem.difficulty === 'Medium') user.mediumSolved += 1;
      else user.hardSolved += 1;
    }
  }

  await user.save();
}
