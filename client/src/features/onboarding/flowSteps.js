import { EXAMS } from '../exams/examsData';
import { LANGUAGES } from '../workspace/languages';
import { buildRoadmap } from './buildRoadmap';
import { QUESTIONS_PER_ASSESSMENT, getAssessmentQuestion } from './assessmentQuestions';

// The onboarding conversation, described as data. Each step is one popup card.
// `kind`: 'choice' (pick one option) or 'roadmap' (final result).
// `next` decides the following step from the answers collected so far, which is what makes the
// flow branch between "prepare for an exam" and "learn to code".

const option = (id, label, hint) => ({ id, label, hint });
const QUIZ_STEP_PATTERN = /^quiz-(\d+)$/;
const EXAM_CHOICE_COUNT = 6;

const STATIC_STEPS = {
  persona: {
    kind: 'choice',
    prompt: 'Welcome to JeetCode. I will ask a few quick questions to build a plan for you.',
    title: 'Which best describes you?',
    options: [option('student', 'Student', 'In school or college'), option('professional', 'Working professional', 'Employed or changing careers')],
    next: () => 'goal',
  },
  goal: {
    kind: 'choice',
    prompt: 'Thanks. What would you like to do first?',
    title: 'What is your goal?',
    options: [option('exam', 'Prepare for an exam', 'Hiring tests and entrance exams'), option('learn', 'Learn to code', 'Pick a language and level up')],
    next: (answers) => (answers.goal === 'exam' ? 'exam' : 'language'),
  },
  exam: {
    kind: 'choice',
    prompt: 'Which exam are you preparing for?',
    title: 'Choose your exam',
    options: EXAMS.slice(0, EXAM_CHOICE_COUNT).map((exam) => option(exam.id, exam.short, exam.org)),
    next: () => 'timeline',
  },
  timeline: {
    kind: 'choice',
    prompt: 'How much time do you have before the exam?',
    title: 'Time available',
    options: [option('under-1-month', 'Under 1 month'), option('one-to-three-months', '1 to 3 months'), option('over-3-months', 'More than 3 months')],
    next: () => 'dailyTime',
  },
  dailyTime: {
    kind: 'choice',
    prompt: 'How much can you study each day?',
    title: 'Daily study time',
    options: [option('thirty-minutes', '30 minutes'), option('one-hour', '1 hour'), option('two-hours-plus', '2 hours or more')],
    next: () => 'weakArea',
  },
  weakArea: {
    kind: 'choice',
    prompt: 'Last question. Which area feels hardest right now?',
    title: 'Where do you need the most help?',
    options: [option('quantitative', 'Quantitative aptitude'), option('verbal', 'Verbal and reasoning'), option('coding', 'Coding problems')],
    next: () => 'roadmap',
  },
  language: {
    kind: 'choice',
    prompt: 'Great. Which language do you want to learn?',
    title: 'Choose a language',
    options: LANGUAGES.map((language) => option(language.id, language.label)),
    next: () => 'quiz-0',
  },
};

const buildQuizStep = (index, answers) => {
  const item = getAssessmentQuestion(answers.language, index);
  const isLastQuestion = index === QUESTIONS_PER_ASSESSMENT - 1;
  return {
    kind: 'choice',
    prompt: index === 0 ? 'Let me check your level with three short questions.' : 'Nice. Next one.',
    title: `Question ${index + 1} of ${QUESTIONS_PER_ASSESSMENT}`,
    question: item.prompt,
    options: item.options.map((text, optionIndex) => option(String(optionIndex), text)),
    next: () => (isLastQuestion ? 'roadmap' : `quiz-${index + 1}`),
  };
};

const buildRoadmapStep = (answers) => ({
  kind: 'roadmap',
  prompt: 'Your personalised plan is ready.',
  roadmap: buildRoadmap(answers),
});

export function getStep(stepId, answers) {
  const quizMatch = QUIZ_STEP_PATTERN.exec(stepId);
  if (quizMatch) return { id: stepId, ...buildQuizStep(Number(quizMatch[1]), answers) };
  if (stepId === 'roadmap') return { id: stepId, ...buildRoadmapStep(answers) };
  return { id: stepId, ...STATIC_STEPS[stepId] };
}

export const nextStepId = (stepId, answers) => getStep(stepId, answers).next(answers);
