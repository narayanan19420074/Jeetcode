import { ApiError } from '../utils/ApiError.js';

const PLACEHOLDER = '/*__USER_CODE__*/';

/**
 * Builds the final compilable source sent to Judge0: the problem's driver
 * template (stdin parsing, function invocation, stdout formatting) with
 * the user's function body spliced in at a fixed placeholder.
 *
 * Why this matters: we NEVER execute the user's raw file as-is. If we did,
 * a learner could print the expected output directly instead of solving
 * the problem, or read files, hit the network, etc. from within their
 * "solution". By only trusting the driver template (authored by an admin)
 * and treating the user's submission as a substring injected into one
 * fixed slot, the user only ever controls the function body — the
 * surrounding harness (stdin read, comparison, timing) stays untouchable.
 */
export function buildSourceCode(driverTemplate, userCode, language) {
  if (!driverTemplate.includes(PLACEHOLDER)) {
    throw ApiError.internal(`Driver template for ${language} is missing the injection placeholder`);
  }
  // Defense in depth: reject obviously dangerous patterns even though the
  // Judge0 sandbox (network-isolated, resource-capped container) is the
  // real security boundary — this just fails fast with a clear message.
  const banned = [/require\(['"]child_process['"]\)/, /os\.system\(/, /subprocess\./, /import\s+os\b.*system/];
  if (banned.some((re) => re.test(userCode))) {
    throw ApiError.badRequest('Your code contains a disallowed pattern (process/system access).');
  }
  return driverTemplate.replace(PLACEHOLDER, userCode);
}
