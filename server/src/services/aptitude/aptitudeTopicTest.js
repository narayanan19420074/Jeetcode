import { ApiError } from '../../utils/ApiError.js';
import { getQuestionMeta } from './aptitudeShared.js';

const DEFAULT_TEST_QUESTIONS = 25;

const fullTestCount = (pattern, patternTotal) => Math.min(pattern.testQuestionCount || DEFAULT_TEST_QUESTIONS, patternTotal);

/**
 * Length of a test of one topic: the usual question count capped by the topic's own question bank, with the time limit
 * scaled by the share of the full paper so a short topic test is not given the full pattern's clock.
 */
export function buildTopicTestPlan(pattern, topicTotal, patternTotal) {
  const questionCount = Math.min(pattern.testQuestionCount || DEFAULT_TEST_QUESTIONS, topicTotal);
  const share = questionCount / Math.max(1, fullTestCount(pattern, patternTotal));
  return { questionCount, timeLimitMinutes: Math.max(1, Math.ceil(pattern.timeLimitMinutes * share)) };
}

/** Test plan of every topic that has questions, keyed by topic slug, for the instructions screen. */
export function buildTopicTestPlans(pattern, meta) {
  const totals = new Map();
  for (const question of meta) totals.set(question.subPattern, (totals.get(question.subPattern) ?? 0) + 1);
  return Object.fromEntries([...totals].map(([slug, total]) => [slug, buildTopicTestPlan(pattern, total, meta.length)]));
}

/** Rejects a topic the pattern does not have, so a request cannot start a paper from an arbitrary string. */
export async function assertKnownTopic(pattern, subPattern) {
  const meta = await getQuestionMeta(pattern._id);
  if (typeof subPattern !== 'string' || !meta.some((question) => question.subPattern === subPattern)) {
    throw ApiError.badRequest('Unknown topic for this pattern');
  }
}
