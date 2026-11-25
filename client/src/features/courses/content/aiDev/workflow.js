import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const toolLandscape = lesson('l1', 'The AI tool landscape', 25, [
  text('AI helpers come in a few shapes. Knowing the shape matters more than knowing the brand, because brands change every few months and the shapes stay.'),
  bullets('Chat assistant: you paste context in and copy answers out. Best for learning, planning, design thinking and small snippets.', 'Editor assistant: lives inside your code editor, suggests and edits code with your files in view.', 'Coding agent: reads your project, runs commands, edits many files and runs tests in a loop until the task is done (for example Claude Code and similar tools).', 'App builders: generate a whole small app from a description. Fast for prototypes, harder to control for real products.'),
  heading('When to use which'),
  bullets('Idea, spec, design choices: chat assistant', 'Everyday coding inside a project: coding agent or editor assistant', 'Throwaway prototype to test an idea: app builder', 'Learning a concept: chat, and ask for an explanation at your level'),
  note('Pattern: chat to think, agent to build, you to decide. Tools change, the loop in the next lessons does not.'),
], [
  predict('e1', 'Which tool shape can read your project files, run tests and edit many files itself?', '', ['A plain chat assistant', 'A coding agent', 'A spell checker', 'A code formatter'], 1, 'Agents work in a loop with tools: read, edit, run, check.'),
  task('e2', 'Pick a tool shape for each: learning what a webhook is, adding a feature to your repo, a quick prototype to show a friend.', 'Think of where context lives.', 'Learning: chat. Feature in your repo: coding agent. Quick prototype: app builder.'),
]);

const epccLoop = lesson('l2', 'The loop: Explore, Plan, Code, Commit', 40, [
  text('The single most reliable way to work with an AI coding agent is to stop it from jumping straight to code. Professionals follow four steps, and so can you.'),
  heading('1. Explore'),
  text('Ask the AI to read and explain before changing anything. You learn the project and the AI loads the right context.'),
  code('Read the auth code and the dues API. Do not change anything.\nExplain how a due is created and where validation happens.'),
  heading('2. Plan'),
  text('Ask for a step-by-step plan and read it. Fix the plan, not the code. Many tools have a plan mode that blocks edits until you approve.'),
  code('Write a plan to add "mark as paid" to dues. List the files to change,\nthe steps in order, and how we will test it. Do not write code yet.'),
  heading('3. Code'),
  text('Approve the plan, then build one step at a time. Ask the AI to run the tests and show the output, because evidence beats claims.'),
  heading('4. Commit'),
  text('Review the diff, run the checks, commit with a clear message. Then start the next slice with a clean mind (and often a clean chat).'),
  note('Pattern: Explore, Plan, Code, Commit. A bad plan caught in step 2 costs a minute; the same mistake found after coding costs an hour.'),
], [
  predict('e1', 'Why ask for a plan before code?', '', ['Plans are mandatory by law', 'Mistakes are cheapest to fix before any code exists', 'It makes the AI slower on purpose', 'Code cannot be written without it'], 1, 'Correcting a plan costs a few lines; correcting wrong code costs a rewrite.'),
  task('e2', 'Write the Explore prompt you would use before adding a search feature to an existing blog project.', 'Ask to read and explain, and forbid changes.', 'Read how blog posts are loaded and displayed. Do not change any files. Explain the data flow and where a search box and filter would fit.'),
]);

const rulesFile = lesson('l3', 'Rules files: teach the AI your project once', 30, [
  text('A new chat knows nothing about your project. Instead of repeating the same instructions every time, write them once in a rules file that the tool reads at the start of every session. Common names are AGENTS.md or CLAUDE.md.'),
  heading('What belongs inside'),
  code('# Project rules\n\n## What this is\nTask tracker for shop owners. Next.js, Postgres, Prisma.\n\n## Commands\n- Run: npm run dev\n- Test: npm test\n- Lint: npm run lint\n\n## Conventions\n- TypeScript, no any\n- Components in components/, helpers in lib/\n- Use design tokens from styles/tokens.css, never raw colours\n- Validate all API input with Zod\n\n## Do not\n- Do not add libraries without asking\n- Do not edit the database schema without a migration\n- Never commit .env files'),
  heading('Keep it sharp'),
  bullets('Short and specific beats long and vague; the file takes space in every session', 'Include things the AI cannot guess from the code: commands, decisions, forbidden actions', 'Do not include things obvious from the code or generic advice', 'When the AI repeats a mistake, add one line to the file so it never happens again'),
  note('Pattern: the same correction twice means it belongs in the rules file. Treat the file as the project\'s memory.'),
], [
  predict('e1', 'The AI keeps using a library you banned. What is the best fix?', '', ['Shout at it in every chat', 'Add a clear "Do not use X, use Y" line to the rules file', 'Switch computers', 'Delete the project'], 1, 'Persistent rules are read at every session start, so the correction sticks.'),
  task('e2', 'Write five lines for the rules file of your own project: stack, how to run, how to test, one convention, one forbidden action.', 'Be concrete and short.', 'Stack: Next.js + Postgres. Run: npm run dev. Test: npm test. Convention: validate input with Zod. Forbidden: never commit .env files.'),
]);

const debugging = lesson('l4', 'Debugging with AI', 35, [
  text('Bugs are information. The way to debug with AI is the same as debugging alone: reproduce, observe, hypothesise, test, fix. AI speeds up each step if you give it the evidence.'),
  heading('Give the AI the evidence'),
  bullets('What you did, what you expected, what happened', 'The exact error message and stack trace, copied as text', 'The relevant code, not the whole project', 'What you already tried'),
  code('Expected: clicking "Pay" saves the due and shows the new total.\nActual: the page reloads and the total is unchanged.\nConsole: TypeError: Cannot read properties of undefined (reading "id")\n  at addDue (lib/dues.ts:23)\nI already checked that the form sends customerId.\nFind the cause first. Explain it. Do not change code until I agree.'),
  heading('Debug habits'),
  bullets('Ask for the root cause, not only a patch that hides the symptom', 'Make the AI write a failing test that reproduces the bug, then fix it, so it stays fixed', 'If two attempts fail, stop: start a fresh chat with a clean summary rather than piling on more failed tries', 'Add logging, run again, and paste the new output; guessing blind wastes tokens'),
  note('Pattern: evidence in, cause first, test the fix. When stuck twice, reset the conversation, not just the code.'),
], [
  predict('e1', 'After two failed fixes in the same chat, what is usually best?', '', ['Keep going with the same chat forever', 'Start fresh with a short summary of the problem and what has been ruled out', 'Delete the whole project', 'Switch to another language'], 1, 'A long trail of failed attempts clutters the context and misleads the model.'),
  task('e2', 'Write a bug report prompt for: a login form accepts a wrong password.', 'Expected, actual, evidence, ask for the cause first.', 'Expected: wrong password shows an error. Actual: the dashboard opens. Code: lib/auth.ts compare function pasted below. Find the root cause and explain it before changing code, then write a failing test.'),
]);

const reviewing = lesson('l5', 'Reviewing AI code: you are the editor', 35, [
  text('AI writes fast and sometimes wrong. Your job moves from typing to reviewing, the same job a senior engineer does with a junior. You do not need to write every line, but you must be able to read the changes.'),
  heading('A short review checklist'),
  bullets('Does it do what the spec says, including edge cases (empty, huge, wrong type)?', 'Did it change only what was asked? Unrelated edits are a warning.', 'Does it follow the rules file and the existing style?', 'Are secrets, keys or private data anywhere they should not be?', 'Are inputs validated and permissions checked on the server?', 'Are there tests, and do they really test the behaviour (not just pass)?', 'Does it add a dependency? Is that package real, popular and maintained?'),
  heading('Use a second opinion'),
  text('Ask a fresh chat, with no memory of writing the code, to review the diff as a strict reviewer. A reviewer without attachment to the code finds more problems.'),
  code('Review this diff as a strict senior engineer. List bugs, security issues,\nmissing tests and unclear code. Rank them by severity. Do not rewrite it.'),
  note('Pattern: read the diff, check the spec, ask a fresh reviewer. Accepting code you do not understand means owning bugs you cannot fix.'),
], [
  predict('e1', 'You asked for a button colour change and the diff edits the database layer too. What do you do?', '', ['Accept it, the AI knows best', 'Reject the unrelated change and ask why it was made', 'Merge and hope', 'Ignore the diff'], 1, 'Unrequested changes are a risk; keep each change focused on the request.'),
  task('e2', 'Write a three-point checklist you will use on every AI change.', 'Make each point checkable.', '1) Diff only touches the requested files. 2) Tests pass and a new test covers the change. 3) No secrets and no new dependency without approval.'),
]);

export const workflowModule = courseModule('i2', 'intermediate', 'Working with AI tools', [toolLandscape, epccLoop, rulesFile, debugging, reviewing]);
