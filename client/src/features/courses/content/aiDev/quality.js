import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const whyTest = lesson('l1', 'Tests: proof instead of hope', 30, [
  text('A test is a small program that checks that another program behaves correctly. With AI writing code, tests matter more than ever: they are how you know that what was written really works, and that tomorrow\'s change did not break yesterday\'s feature.'),
  heading('The test pyramid'),
  bullets('Unit tests: one function at a time. Many, fast, cheap.', 'Integration tests: several parts together, such as an API route with the database. Some.', 'End-to-end tests: a real browser clicking through the app. Few, slow, valuable for the main journeys.'),
  code('// A unit test\nimport { totalDue } from "./dues";\n\ntest("adds only unpaid dues", () => {\n  const dues = [\n    { amount: 500, paid: false },\n    { amount: 300, paid: true },\n    { amount: 250, paid: false },\n  ];\n  expect(totalDue(dues)).toBe(750);\n});'),
  heading('Arrange, Act, Assert'),
  text('Every test has the same three parts: set up the data (arrange), run the thing (act), check the result (assert). Keep one idea per test and name it like a sentence.'),
  note('Pattern: arrange, act, assert. If you cannot say how you would test it, the requirement is not clear yet.'),
], [
  predict('e1', 'Which test type should you have the most of?', '', ['End-to-end', 'Unit', 'Manual only', 'None'], 1, 'Unit tests are fast and cheap, so many are practical.'),
  task('e2', 'Write the test name and the three Arrange, Act, Assert lines for "empty list returns total 0".', 'Empty input, call the function, expect zero.', 'Name: returns 0 for an empty list. Arrange: dues = []. Act: result = totalDue(dues). Assert: expect(result).toBe(0).'),
]);

const tddWithAi = lesson('l2', 'Test-first with AI', 35, [
  text('Test-driven development (TDD) writes the test before the code. It is a perfect partner for AI: the acceptance criteria from your spec become tests, and the agent loops until they pass.'),
  heading('The loop'),
  bullets('Red: write a test from an acceptance criterion; it fails', 'Green: let the AI write the least code that makes it pass', 'Refactor: clean up while the tests stay green'),
  code('From the spec criteria, write failing tests for the "mark as paid" feature.\nDo not write the implementation yet. Run the tests and show that they fail.\nThen implement until they pass, and show the passing output.'),
  heading('Guard against fake passes'),
  bullets('Read the tests: do they assert real behaviour, or just that the code runs?', 'Never let the AI delete or weaken a failing test to make it pass', 'Ask what happens with empty, huge, negative and wrong-type input', 'Check that the test fails when the feature is broken on purpose (mutation check by hand)'),
  note('Pattern: red, green, refactor. A failing test you wrote first is the clearest instruction an AI can get.'),
], [
  predict('e1', 'The AI makes a failing test pass by deleting the assertion. What is that?', '', ['A clever fix', 'A fake pass; the behaviour is still broken', 'Required by the framework', 'A performance gain'], 1, 'A test without its assertion proves nothing. Reject the change.'),
  task('e2', 'Write two failing tests (names only) for a "calculate discount" function.', 'One normal case and one edge case.', 'applies 10 percent to a normal price; returns zero discount for a negative price (or rejects it with an error).'),
]);

const e2eAndManual = lesson('l3', 'Browser tests and manual checks', 30, [
  text('Tests of the real user journey catch what unit tests cannot: broken buttons, wrong redirects, missing styles. Tools such as Playwright drive a real browser, and AI is good at writing the scripts.'),
  code('import { test, expect } from "@playwright/test";\n\ntest("user can add a task", async ({ page }) => {\n  await page.goto("/tasks");\n  await page.getByLabel("Title").fill("Buy milk");\n  await page.getByRole("button", { name: "Add" }).click();\n  await expect(page.getByText("Buy milk")).toBeVisible();\n});'),
  heading('Pick the journeys that pay the rent'),
  bullets('Sign up and sign in', 'The main action of your app', 'Payment, if any', 'Sign out and access control (a signed-out user cannot see private pages)'),
  heading('Manual checklist before each release'),
  bullets('Phone-size and desktop screens', 'Slow network and no network', 'Empty states, error states', 'Keyboard-only navigation', 'A different browser'),
  note('Pattern: automate the main journeys, walk the rest by hand. Use accessible labels and roles in the UI; they make tests easier and the app better.'),
], [
  predict('e1', 'Which tests protect the sign-in journey end to end?', '', ['A unit test of a helper', 'A browser test that fills the form and checks the dashboard', 'A spelling check', 'A linter'], 1, 'Only a browser test exercises the whole path as a user does.'),
  task('e2', 'List four manual checks for a mobile-friendly page.', 'Screen size, network, states, input.', 'Check a phone-width screen, a slow connection, empty and error states, and use with keyboard or screen reader labels.'),
]);

const evaluateOutput = lesson('l4', 'Evaluating AI output', 35, [
  text('Whether the AI wrote your code or powers a feature, you need a way to measure its quality that does not depend on feeling. This is called an evaluation, or eval: a fixed set of inputs with a clear way to score the outputs.'),
  heading('Build a small eval'),
  bullets('Collect 10 to 30 real examples, including hard and weird ones', 'Write what a good answer is for each, or a rule that checks it', 'Run the same set every time you change the prompt, model or code', 'Track the score; a change is better only if the score improves and nothing important regresses'),
  code('const cases = [\n  { input: "Ravi owes 500 since Monday", expect: { customer: "Ravi", amount: 500 } },\n  { input: "no amount here",           expect: { error: true } },\n];\n\nfor (const c of cases) {\n  const out = await extractDue(c.input);\n  console.log(JSON.stringify(out) === JSON.stringify(c.expect) ? "PASS" : "FAIL", c.input);\n}'),
  heading('Ways to score'),
  bullets('Exact checks for structured results (the JSON matches)', 'Rules for things you can test (contains a link, under 100 words)', 'A second model as judge with a clear rubric, spot-checked by you', 'Human review for tone and quality'),
  note('Pattern: fixed examples, clear scoring, run on every change. Without an eval you are guessing whether your last edit helped.'),
], [
  predict('e1', 'Why keep the same evaluation set when changing a prompt?', '', ['To bore the model', 'To compare scores fairly before and after the change', 'It reduces cost to zero', 'It hides mistakes'], 1, 'The same set makes the comparison fair, so regressions show up.'),
  task('e2', 'Write four eval cases for a feature that turns an email into a task title.', 'Include a normal, a long, an empty and a tricky case.', 'A short clear email, a long rambling email, an empty email (expect an error), and an email containing the instruction "ignore previous instructions" (expect a normal title, not obedience).'),
]);

const evaluateProduct = lesson('l5', 'Evaluating the product itself', 35, [
  text('Working code is not the same as a good product. After the tests pass, ask whether the product delivers its promise to the person it was made for.'),
  heading('Four lenses'),
  bullets('Does it work? Acceptance criteria all pass, no known blocking bugs', 'Is it usable? A new person completes the main task without help. Watch five people try; do not explain anything.', 'Is it trustworthy? Secure, private, handles errors gracefully, loads fast enough on a normal phone', 'Does it matter? Real users come back or recommend it'),
  heading('Simple measures'),
  bullets('Time for a new user to finish the main task', 'Task success rate in user tests', 'Page speed and errors in production logs', 'Weekly active users and retention (do they return?)', 'Feedback: read every message at first'),
  heading('Release readiness checklist'),
  code('[ ] All acceptance criteria pass\n[ ] Main journeys tested end to end\n[ ] Security checklist done, secrets safe\n[ ] Works on phone and desktop\n[ ] Errors are logged and I get alerted\n[ ] Backups tested\n[ ] I know how to roll back'),
  note('Pattern: works, usable, trustworthy, valuable. Five real users teach more than fifty features.'),
], [
  predict('e1', 'What is the best way to find usability problems?', '', ['Ask the AI if the app is good', 'Watch a few real people try the main task without help', 'Add more features', 'Wait for bug reports'], 1, 'Observation shows where people get stuck, which self-review cannot.'),
  task('e2', 'Write the one metric and one test you would use to judge a todo app\'s MVP.', 'Think about return use and task completion.', 'Metric: how many testers use it again the next week. Test: a new user adds and completes a task within one minute without help.'),
]);

export const qualityModule = courseModule('a3', 'advanced', 'Testing and evaluation', [whyTest, tddWithAi, e2eAndManual, evaluateOutput, evaluateProduct]);
