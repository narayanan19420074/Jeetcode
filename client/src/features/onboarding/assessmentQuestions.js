// Short placement questions per language. Three questions are enough to place a learner in a band
// (beginner, intermediate, advanced) without making onboarding feel like an exam.
// `answer` is the index of the correct option. The third question is an output-prediction puzzle.
export const QUESTIONS_PER_ASSESSMENT = 3;

const question = (prompt, options, answer) => ({ prompt, options, answer });

export const ASSESSMENT_QUESTIONS = {
  javascript: [
    question('Which keyword declares a variable that cannot be reassigned?', ['var', 'let', 'const', 'static'], 2),
    question('What does Array.prototype.map return?', ['A new array', 'The original array', 'A single value', 'undefined'], 0),
    question('What is the output of console.log(typeof null)?', ['"null"', '"object"', '"undefined"', '"number"'], 1),
  ],
  python: [
    question('Which data type is immutable in Python?', ['list', 'dict', 'set', 'tuple'], 3),
    question('What does len([1, 2, 3]) return?', ['2', '3', '4', 'An error'], 1),
    question('What is the output of print(2 ** 3 ** 2)?', ['64', '512', '36', '18'], 1),
  ],
  cpp: [
    question('Which operator gives the address of a variable?', ['*', '&', '->', '::'], 1),
    question('Which container keeps its elements sorted by key?', ['vector', 'unordered_map', 'map', 'deque'], 2),
    question('What is the output of: int x = 5; cout << x++ + ++x;', ['10', '11', '12', 'Undefined behaviour'], 3),
  ],
  java: [
    question('Which keyword prevents a method from being overridden?', ['static', 'final', 'private', 'abstract'], 1),
    question('Which collection does not allow duplicate elements?', ['ArrayList', 'LinkedList', 'HashSet', 'Vector'], 2),
    question('What is the output of: System.out.println("a" + 1 + 2);', ['a3', 'a12', '3a', 'Compile error'], 1),
  ],
};

export const getAssessmentQuestion = (languageId, index) => ASSESSMENT_QUESTIONS[languageId]?.[index] ?? null;

export const countCorrectAnswers = (languageId, answers) =>
  ASSESSMENT_QUESTIONS[languageId].filter((item, index) => String(item.answer) === answers[`quiz-${index}`]).length;

// Placement bands: 0-1 correct is beginner, 2 is intermediate, 3 is advanced.
export const levelFromScore = (score) => {
  if (score >= 3) return 'advanced';
  return score === 2 ? 'intermediate' : 'beginner';
};
