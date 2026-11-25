import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const agentLoop = lesson('l1', 'The agent loop', 30, [
  text('An agent is a model in a loop: look at the goal, choose an action, use a tool, read the result, repeat until done. The model supplies judgement; the loop supplies persistence.'),
  code('goal = "Add mark-as-paid"\nloop:\n  think   -> what is the next step?\n  act     -> read file / edit file / run tests\n  observe -> read the output\n  stop when tests pass and the spec is met'),
  heading('What makes loops work'),
  bullets('A clear goal and a clear definition of done', 'Feedback from the real world: test results, linter output, screenshots. Without feedback the agent only guesses.', 'Limits: a step budget and a stop condition so it cannot loop forever', 'Checkpoints: commits, so any bad turn can be undone'),
  note('Pattern: goal, act, observe, repeat. The best agent instruction includes how to check its own work.'),
], [
  predict('e1', 'What most improves an agent\'s reliability on a coding task?', '', ['A longer greeting', 'A runnable test or check it can use to verify its work', 'Using capital letters', 'Fewer files'], 1, 'Verification gives it real feedback instead of confidence.'),
  task('e2', 'Add a "how to verify" line to this goal: "Fix the date format in invoices".', 'Name a command or an observable result.', 'Verify by running npm test, and the invoice test must show dates as DD-MM-YYYY.'),
]);

const subagents = lesson('l2', 'Subagents and specialised roles', 35, [
  text('A big project is too large for one context. The solution is the one real companies use: split the work among specialists, each with its own clean context, and let a coordinator combine results.'),
  heading('Typical roles'),
  bullets('Planner: turns the spec into small tasks', 'Builder: implements one task', 'Tester: writes and runs tests', 'Reviewer: checks the diff for bugs and security', 'Researcher: reads documentation or code and returns a short summary'),
  heading('Why it works'),
  bullets('Each subagent starts clean, so context does not overflow', 'Noisy work (searching many files, reading logs) stays in the subagent; only the summary returns', 'A reviewer that did not write the code is less biased', 'Roles can use different models: strong for planning and review, small for repetitive chores'),
  code('Use a researcher subagent to find every place that calculates totals.\nReturn only a list of file paths and one line about each.'),
  note('Pattern: delegate noisy or independent work, receive short summaries. The coordinator keeps the goal; specialists keep the detail.'),
], [
  predict('e1', 'Why use a separate subagent to read thirty files?', '', ['It is more fun', 'The reading stays out of your main context and only a summary comes back', 'Files cannot be read otherwise', 'It makes the code faster'], 1, 'Isolation protects the main context from clutter.'),
  task('e2', 'Define three subagents for building a feature and what each returns.', 'Think plan, build, check.', 'Planner returns a numbered task list. Builder returns a diff for one task. Reviewer returns a ranked list of issues in the diff.'),
]);

const patterns = lesson('l3', 'Orchestration patterns', 40, [
  text('Orchestration means arranging several AI steps into a dependable process. Start with the simplest pattern that works. Complexity is a cost, not a goal.'),
  heading('Five patterns, simplest first'),
  bullets('Single call: one prompt, one answer', 'Chain: the output of step 1 feeds step 2 (spec, then plan, then code)', 'Router: classify the request, then send it to the right specialist', 'Parallel: independent tasks run at the same time and results are merged', 'Evaluator loop: one step produces, another checks, and it repeats until the check passes'),
  code('// A chain with a checking step\nconst plan  = await ask("Write a plan for: " + spec);\nconst code  = await ask("Implement step 1 of this plan: " + plan);\nconst notes = await ask("Review this code against the spec: " + code);\nif (notes.includes("PASS")) commit(code);'),
  heading('Rules of thumb'),
  bullets('Use a workflow (fixed steps you control) when the path is known; use an agent when the path is open-ended', 'Put a human approval before irreversible steps', 'Pass summaries between steps, not full histories', 'Log every step so failures can be traced'),
  note('Pattern: single call, chain, router, parallel, evaluator loop. Move one step up only when the simpler one fails.'),
], [
  predict('e1', 'You have a fixed process: write spec, write code, run tests. Which pattern fits?', '', ['A free-roaming agent with no steps', 'A chain, with an evaluator loop on the tests', 'A single prompt', 'A router with a hundred branches'], 1, 'Known steps suit a chain; a loop on test failure adds a safety check.'),
  task('e2', 'Design a router for a support bot with three branches.', 'Classify, then send.', 'Classify each message as billing, bug or how-to. Billing goes to the billing specialist with account tools, bug goes to the triage agent that opens a ticket, how-to goes to a docs-search answerer.'),
]);

const parallelWork = lesson('l4', 'Parallel work without collisions', 30, [
  text('Running several agents at once can multiply speed, but two agents editing the same file create conflicts. The fix is the same one human teams use: separate work areas and merge through Git.'),
  heading('Safe parallel setup'),
  bullets('One branch per task; with Git worktrees each branch gets its own folder, so agents never overwrite each other', 'Split by independent areas (frontend page, API route, docs), not by lines in the same file', 'Define the contract first (the API shape) so both sides can proceed', 'Merge one at a time and run the tests after each merge', 'You stay the integrator: review every diff'),
  code('git worktree add ../app-search feature/search\ngit worktree add ../app-billing feature/billing\n# each folder gets its own agent session'),
  note('Pattern: separate branches, agreed contract, merge one by one. Parallel agents multiply output and also multiply review work, so run only as many as you can review.'),
], [
  predict('e1', 'Two agents must change the same file at the same time. What is the safest approach?', '', ['Let both edit it live', 'Give them separate branches or sequence the work, then merge and test', 'Delete the file', 'Turn off Git'], 1, 'Isolation first, then merge with tests, prevents silent overwrites.'),
  task('e2', 'Name two tasks of a todo app that can safely run in parallel and the contract they share.', 'Think UI and API with an agreed JSON shape.', 'Task list screen and the tasks API can run in parallel, sharing the contract: GET /api/tasks returns [{ id, title, done }].'),
]);

const humanInLoop = lesson('l5', 'You stay in control', 30, [
  text('Automation does not remove responsibility. The person who ships is accountable for the result, so design the process around human checkpoints placed where mistakes are expensive.'),
  heading('Where to put the human'),
  bullets('Approving the plan', 'Reviewing the diff before merge', 'Before anything irreversible: deleting data, sending messages, spending money, deploying to production', 'After deploy: look at it yourself'),
  heading('Permission levels'),
  bullets('Read-only: safest, for exploring', 'Ask before each edit or command: the right default while learning', 'Allow a short list of safe commands (tests, lint) so you are not clicking all day', 'Fully automatic: only in a sandbox with no valuable data'),
  note('Pattern: automate the routine, gate the irreversible. Trust the agent in proportion to how cheap its mistakes are to undo.'),
], [
  predict('e1', 'Which action must always have a human approval?', '', ['Running the unit tests', 'Deleting the production database', 'Reading a file', 'Formatting code'], 1, 'Irreversible and high-impact actions need a human gate.'),
  task('e2', 'List three commands you would pre-approve and three you would never auto-approve.', 'Safe and repeatable versus destructive.', 'Pre-approve: npm test, npm run lint, git status. Never auto-approve: deleting data or files in bulk, pushing to production, commands that send emails or payments.'),
]);

export const orchestrationModule = courseModule('a1', 'advanced', 'Agents and orchestration', [agentLoop, subagents, patterns, parallelWork, humanInLoop]);
