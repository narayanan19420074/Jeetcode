import { Problem } from '../models/Problem.js';
import { ApiError } from '../utils/ApiError.js';
import { buildSourceCode, locateUserCode } from './codeHarness.service.js';
import { runTrace } from './judge0.service.js';
import { TRACEABLE_LANGUAGES } from './trace/traceRunner.service.js';

// The tracer reports lines of the whole built program; the learner only knows lines of their own code.
function toLearnerLines(trace, firstLine, lastLine) {
  const shift = firstLine - 1;
  const frame = (item) => ({ ...item, line: item.line - shift });
  const errorInLearnerCode = trace.errorLine >= firstLine && trace.errorLine <= lastLine;
  return {
    ...trace,
    steps: trace.steps.map((step) => ({ ...step, line: step.line - shift, stack: step.stack.map(frame) })),
    errorLine: errorInLearnerCode ? trace.errorLine - shift : null,
  };
}

function pickSampleCase(problem, caseIndex) {
  const samples = problem.testCases.filter((testCase) => testCase.isSample);
  if (samples.length === 0) throw ApiError.badRequest('No sample test cases are configured for this problem yet.');
  if (caseIndex >= samples.length) throw ApiError.badRequest('That sample case does not exist.');
  return { sample: samples[caseIndex], caseCount: samples.length };
}

/**
 * Runs the learner's code on one SAMPLE case and returns every executed line of it with the variables at that point.
 * Hidden test cases are never traced, so a trace cannot be used to read them.
 */
export async function traceLearnerCode({ problemSlug, language, code, caseIndex }) {
  if (!TRACEABLE_LANGUAGES.includes(language)) {
    throw ApiError.badRequest('Step-by-step visualization is available for Python and JavaScript. Switch the editor language to use it.');
  }
  const problem = await Problem.findOne({ slug: problemSlug, isPublished: true });
  if (!problem) throw ApiError.notFound('Problem not found');
  const driverTemplate = problem.driverCode?.[language];
  if (!driverTemplate) throw ApiError.badRequest('This language is not available for this problem yet.');

  const { sample, caseCount } = pickSampleCase(problem, caseIndex);
  const lines = locateUserCode(driverTemplate, code);
  const trace = await runTrace({ language, sourceCode: buildSourceCode(driverTemplate, code, language), stdin: sample.stdin, ...lines });
  return { ...toLearnerLines(trace, lines.firstLine, lines.lastLine), input: sample.stdin, caseIndex, caseCount };
}
