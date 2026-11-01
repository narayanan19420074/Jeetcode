import { EXAMS } from '../exams/examsData';
import { LANGUAGES } from '../workspace/languages';
import { countCorrectAnswers, levelFromScore } from './assessmentQuestions';

// Roadmaps are assembled from the learner's answers. Today this is rule based; the same shape
// ({ title, summary, level, stages }) can be returned by an AI service later without UI changes.

const EXAM_WEEKS = { 'under-1-month': 4, 'one-to-three-months': 10, 'over-3-months': 16 };
const DAILY_MINUTES = { 'thirty-minutes': 30, 'one-hour': 60, 'two-hours-plus': 120 };
const WEAK_AREA_LABEL = {
  quantitative: 'Quantitative aptitude',
  verbal: 'Verbal and reasoning',
  coding: 'Coding problems',
};

const LEARNING_STAGES = {
  beginner: [
    ['Language basics', ['Variables and data types', 'Conditions and loops', 'Functions']],
    ['Core data structures', ['Arrays and strings', 'Basic input and output', 'Solve 15 easy problems']],
    ['First patterns', ['Counting and frequency maps', 'Simple sorting', 'Solve 15 more easy problems']],
  ],
  intermediate: [
    ['Essential patterns', ['Two pointers', 'Sliding window', 'Hash maps']],
    ['Linear structures', ['Linked lists', 'Stacks and queues', 'Recursion']],
    ['Medium problems', ['Binary search', 'Sorting strategies', 'Solve 20 medium problems']],
  ],
  advanced: [
    ['Trees and graphs', ['Tree traversals', 'BFS and DFS', 'Shortest paths']],
    ['Dynamic programming', ['1D and 2D states', 'Knapsack variants', 'Memoization to tabulation']],
    ['Contest readiness', ['Timed practice', 'Hard problems', 'Weekly contests']],
  ],
};

const sessionStyle = (persona) =>
  persona === 'professional' ? 'short daily sessions that fit around work' : 'a weekly plan that fits around classes';

const toStage = ([title, items], index) => ({ title, weeks: 2, items, order: index + 1 });

export function buildLearningRoadmap(answers) {
  const level = levelFromScore(countCorrectAnswers(answers.language, answers));
  const language = LANGUAGES.find((item) => item.id === answers.language);
  return {
    title: `${language.label} learning path`,
    level,
    summary: `Placed at ${level} level, with ${sessionStyle(answers.persona)}.`,
    stages: LEARNING_STAGES[level].map(toStage),
  };
}

// Split the available weeks 40 / 40 / 20 between foundation, practice and mock tests.
const splitWeeks = (totalWeeks) => {
  const foundation = Math.max(1, Math.round(totalWeeks * 0.4));
  const mocks = Math.max(1, Math.round(totalWeeks * 0.2));
  return [foundation, totalWeeks - foundation - mocks, mocks];
};

export function buildExamRoadmap(answers) {
  const exam = EXAMS.find((item) => item.id === answers.exam);
  const totalWeeks = EXAM_WEEKS[answers.timeline];
  const weakArea = WEAK_AREA_LABEL[answers.weakArea];
  const [foundationWeeks, practiceWeeks, mockWeeks] = splitWeeks(totalWeeks);
  return {
    title: `${exam.short} preparation plan`,
    level: 'personalised',
    summary: `${totalWeeks} weeks, about ${DAILY_MINUTES[answers.dailyTime]} minutes a day, starting with ${weakArea}.`,
    stages: [
      { order: 1, title: 'Foundation', weeks: foundationWeeks, items: [`${weakArea} basics`, 'Core aptitude topics', 'Learn the exam pattern'] },
      { order: 2, title: 'Targeted practice', weeks: practiceWeeks, items: ['Topic-wise practice sets', ...exam.tags.map((tag) => `${tag} practice`)] },
      { order: 3, title: 'Mocks and revision', weeks: mockWeeks, items: ['Full-length mock tests', 'Review mistakes', 'Final revision'] },
    ],
  };
}

export const buildRoadmap = (answers) => (answers.goal === 'exam' ? buildExamRoadmap(answers) : buildLearningRoadmap(answers));
