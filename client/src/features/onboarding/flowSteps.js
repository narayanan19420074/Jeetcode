import { EXAMS } from '../exams/examsData';
import { LANGUAGES } from '../workspace/languages';
import { buildRoadmap } from './buildRoadmap';
import { QUESTIONS_PER_ASSESSMENT, getAssessmentQuestion } from './assessmentQuestions';

// The onboarding journey, described as data. Each step is one full card.
// `kind`: 'text' (typed answer), 'choice' (pick one option) or 'roadmap' (final result).
// `next` decides the following step from the answers collected so far, which is what makes the
// flow branch between "prepare for an exam" and "learn to code".

export const PLAN_STEP_ID = 'roadmap';
// Both branches ask seven questions (name, persona, goal, then four branch-specific ones), so the
// progress bar can be a fixed fraction without knowing the branch in advance.
export const TOTAL_QUESTION_STEPS = 7;

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 40;
const EXAM_CHOICE_COUNT = 6;
const QUIZ_STEP_PATTERN = /^quiz-(\d+)$/;

const option = (id, label, hint, icon) => ({ id, label, hint, icon });
const withIcon = (options, icon) => options.map((item) => ({ ...item, icon: item.icon ?? icon }));

export const isValidName = (value) => {
  const length = value.trim().length;
  return length >= MIN_NAME_LENGTH && length <= MAX_NAME_LENGTH;
};

const STATIC_STEPS = {
  name: {
    kind: 'text',
    prompt: 'Hi, I am your JeetCode assistant. A few quick questions and I will build a plan for you.',
    title: 'What should we call you?',
    placeholder: 'Enter your name',
    maxLength: MAX_NAME_LENGTH,
    footnote: 'Your name is only used to personalise your plan.',
    next: () => 'persona',
  },
  persona: {
    kind: 'choice',
    prompt: 'This helps me pace your plan around your day.',
    title: 'Which best describes you?',
    options: [option('student', 'Student', 'In school or college', 'student'), option('professional', 'Working professional', 'Employed or changing careers', 'professional')],
    next: () => 'goal',
  },
  goal: {
    kind: 'choice',
    prompt: 'Pick what matters most right now.',
    title: 'What is your goal?',
    options: [option('exam', 'Prepare for an exam', 'Hiring tests and entrance exams', 'exam'), option('learn', 'Learn to code', 'Pick a language and level up', 'code')],
    next: (answers) => (answers.goal === 'exam' ? 'exam' : 'language'),
  },
  exam: {
    kind: 'choice',
    prompt: 'I will tailor the plan to its pattern.',
    title: 'Which exam are you preparing for?',
    options: withIcon(EXAMS.slice(0, EXAM_CHOICE_COUNT).map((exam) => option(exam.id, exam.short, exam.org)), 'trophy'),
    next: () => 'timeline',
  },
  timeline: {
    kind: 'choice',
    prompt: 'This sets how long each stage of your plan runs.',
    title: 'How much time do you have?',
    options: withIcon([option('under-1-month', 'Under 1 month'), option('one-to-three-months', '1 to 3 months'), option('over-3-months', 'More than 3 months')], 'schedule'),
    next: () => 'dailyTime',
  },
  dailyTime: {
    kind: 'choice',
    prompt: 'A realistic daily target beats an ambitious one.',
    title: 'How much can you study each day?',
    options: withIcon([option('thirty-minutes', '30 minutes'), option('one-hour', '1 hour'), option('two-hours-plus', '2 hours or more')], 'time'),
    next: () => 'weakArea',
  },
  weakArea: {
    kind: 'choice',
    prompt: 'Last question. I will start your plan there.',
    title: 'Where do you need the most help?',
    options: [option('quantitative', 'Quantitative aptitude', 'Numbers, percentages, time and work', 'math'), option('verbal', 'Verbal and reasoning', 'Reading, logic and puzzles', 'verbal'), option('coding', 'Coding problems', 'Writing and debugging code', 'code')],
    next: () => PLAN_STEP_ID,
  },
  language: {
    kind: 'choice',
    prompt: 'You can add more languages later.',
    title: 'Which language do you want to learn?',
    options: withIcon(LANGUAGES.map((language) => option(language.id, language.label)), 'code'),
    next: () => 'quiz-0',
  },
};

const buildQuizStep = (index, answers) => {
  const item = getAssessmentQuestion(answers.language, index);
  const isLastQuestion = index === QUESTIONS_PER_ASSESSMENT - 1;
  return {
    kind: 'choice',
    prompt: index === 0 ? 'Three short questions will show me your level.' : 'Keep going, you are doing well.',
    title: `Question ${index + 1} of ${QUESTIONS_PER_ASSESSMENT}`,
    question: item.prompt,
    footnote: 'There is no penalty for a wrong answer.',
    options: item.options.map((text, optionIndex) => option(String(optionIndex), text)),
    next: () => (isLastQuestion ? PLAN_STEP_ID : `quiz-${index + 1}`),
  };
};

const buildPlanStep = (answers) => ({
  kind: 'roadmap',
  prompt: 'Your personalised plan is ready.',
  roadmap: buildRoadmap(answers),
});

export function getStep(stepId, answers) {
  const quizMatch = QUIZ_STEP_PATTERN.exec(stepId);
  if (quizMatch) return { id: stepId, ...buildQuizStep(Number(quizMatch[1]), answers) };
  if (stepId === PLAN_STEP_ID) return { id: stepId, ...buildPlanStep(answers) };
  return { id: stepId, ...STATIC_STEPS[stepId] };
}

export const nextStepId = (stepId, answers) => getStep(stepId, answers).next(answers);
