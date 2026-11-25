import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const contextHygiene = lesson('l1', 'Keeping the context clean', 30, [
  text('Because answer quality drops as the context fills with old and irrelevant text, managing context is a core skill, as important as writing prompts.'),
  heading('Habits'),
  bullets('One task per chat: finish a slice, commit, then start a new chat', 'Clear or reset between unrelated tasks; start fresh after two failed attempts', 'Point to specific files instead of pasting the whole project', 'Ask the AI to investigate in a sub-task or separate chat and bring back only a short summary', 'Compact (summarise) a long chat before it runs out, and check the summary keeps the key decisions'),
  heading('Signs the context is overloaded'),
  bullets('It forgets rules you gave earlier', 'It repeats a fix that already failed', 'Answers become vague or contradict earlier decisions', 'The tool warns that the window is nearly full'),
  note('Pattern: small, focused, fresh. A short chat with the right three files beats a huge chat with everything.'),
], [
  predict('e1', 'You finished the login feature and want to start the payment feature. Best move?', '', ['Continue in the same long chat', 'Commit, then start a fresh chat with the rules file and the payment spec', 'Delete the login code', 'Paste all code again'], 1, 'A fresh chat has room for the new task, and the files carry the knowledge.'),
  task('e2', 'List four signs that tell you to start a new chat.', 'Think about forgetting, repeating and warnings.', 'It forgets earlier rules, repeats a failed fix, gives vague or contradictory answers, or the tool warns that the context is nearly full.'),
]);

const continuity = lesson('l2', 'Continuity after the limit is hit', 35, [
  text('Every tool has limits: the context window, and often a usage limit per few hours or per day. First principle: never keep important knowledge only inside a chat. Keep it in files, so any new session, any day, can continue.'),
  heading('The handoff file'),
  text('Keep a short PROGRESS.md (or the plan file itself) updated as you work. When a limit hits, or before you clear the chat, ask the AI to update it.'),
  code('# Progress\n\n## Goal\nTask tracker with dues per customer (see docs/spec.md)\n\n## Done\n- [x] Auth and sign-in\n- [x] Add customer\n\n## In progress\n- [ ] Record a due  (API done, form missing)\n\n## Next\n- [ ] Mark due as paid\n\n## Decisions\n- Amounts stored as integers in paise to avoid rounding errors\n\n## Known problems\n- Total does not refresh after delete (tests/dues.test.ts fails)'),
  heading('Resume in a new session'),
  code('Read AGENTS.md and PROGRESS.md. Summarise where we are in three lines,\nthen continue with the first unchecked item. Plan first.'),
  heading('Also helps'),
  bullets('Commit often so Git is a second memory', 'Save the spec and plan in the repository, not only in chat', 'Write down why a decision was made, not just what', 'Many tools can resume or rewind sessions, but files stay the safest source of truth'),
  note('Pattern: Document, clear, resume. Files remember; chats forget. Ten minutes of notes saves hours after a limit.'),
], [
  predict('e1', 'Your usage limit is reached mid-feature. What makes continuing tomorrow easy?', '', ['Remembering everything yourself', 'An up-to-date PROGRESS.md and a recent commit', 'Hoping the chat is still there', 'Starting the project over'], 1, 'Written state plus Git lets a new session continue exactly where you stopped.'),
  task('e2', 'Write the prompt you would give a brand-new session to resume work.', 'Read the files, summarise, continue, plan first.', 'Read AGENTS.md and PROGRESS.md. Summarise the current state in three lines, then take the first unchecked item. Show a plan before coding.'),
]);

const tokenBudget = lesson('l3', 'Using tokens wisely', 35, [
  text('Tokens are money and time. Spending them wisely does not mean being stingy; it means not paying for things that add nothing.'),
  heading('Where tokens go'),
  bullets('Your prompt and attached files (input)', 'The whole chat history, re-sent on every message', 'Tool results such as huge logs and file dumps', 'The model reply, and its thinking if enabled (output costs more than input)'),
  heading('Savings that do not cost quality'),
  bullets('Be precise: name the file and the function instead of "look at everything"', 'Filter before pasting: last 50 lines of a log, one failing test, not the whole output', 'Ask for a diff or only the changed function instead of the full file back', 'Use a small model for simple chores and a strong model for hard decisions', 'Keep the rules file short', 'Start fresh chats often instead of dragging history', 'Cache-friendly habit: keep stable instructions at the start of your prompt; many providers discount repeated prefixes'),
  heading('Where not to save'),
  bullets('Planning and architecture: a good plan saves many more tokens later', 'Security review and tests: skimping here costs far more than it saves', 'Giving the context the task truly needs; too little context causes guessing and rework'),
  code('// Before sending a log to the AI\nconst tail = (text, n = 50) => text.split("\\n").slice(-n).join("\\n");\nconsole.log(tail(bigLog));'),
  note('Pattern: precise in, small out, right-sized model, fresh chats. Spend generously on thinking and verifying, thriftily on noise.'),
], [
  predict('e1', 'Which saves tokens without hurting quality?', '', ['Pasting the whole 5,000-line log', 'Pasting the error and the last 50 lines', 'Using the strongest model for every typo', 'Keeping one chat for the whole project'], 1, 'The relevant lines carry the information; the rest is noise that you pay for.'),
  task('e2', 'List four ways to cut token use in a week of building an app.', 'Think prompts, files, models and chats.', 'Name exact files, trim logs before pasting, use a small model for chores, and start a fresh chat per task with a short rules file.'),
]);

const costControl = lesson('l4', 'Costs, limits and safe API use', 30, [
  text('If your app calls an AI model, every user action can cost money. Plan for cost the way you plan for security: from the start.'),
  heading('Controls to build in'),
  bullets('Keep the API key on the server only', 'Require sign-in before expensive calls', 'Rate limit per user and per day', 'Cap the input size and the maximum output length', 'Set a monthly spending limit in the provider dashboard and alerts below it', 'Cache repeated answers when the same question recurs', 'Choose the smallest model that does the job well', 'Handle errors and 429 (too many requests) with a retry that waits longer each time'),
  code('// Simple per-user daily limit\nconst DAILY_LIMIT = 20;\nasync function allowCall(userId) {\n  const used = await countCallsToday(userId);\n  return used < DAILY_LIMIT;\n}'),
  text('This also protects you from "unbounded consumption", where someone abuses your app to run up your bill.'),
  note('Pattern: key on the server, limit per user, cap size, alert on spend. Decide the maximum bill before you launch.'),
], [
  predict('e1', 'Where should an AI provider API key live in your app?', '', ['In the browser code', 'In server-side environment variables', 'In the public GitHub repo', 'In the page title'], 1, 'Browser code is public; keys must stay on the server.'),
  task('e2', 'List three protections that stop one user from running up your AI bill.', 'Identity, limits and alerts.', 'Require sign-in, rate limit per user per day, and set a provider spending cap with alerts.'),
]);

export const contextCostModule = courseModule('i3', 'intermediate', 'Context, continuity and cost', [contextHygiene, continuity, tokenBudget, costControl]);
