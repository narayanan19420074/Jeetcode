import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const problemFirst = lesson('l1', 'Start with the problem, not the app', 25, [
  text('Every app that lasts solves one real problem for one kind of person. First principle: if you cannot say the problem in one sentence, no tool, AI included, can save the build. AI makes building cheap, so the scarce skill is now deciding what is worth building.'),
  heading('The one-sentence test'),
  code('FOR      [who has the problem]\nWHO      [what they struggle with]\nOUR APP  [what it does]\nSO THAT  [the result they get]\n\nExample:\nFOR small shop owners WHO lose track of credit given to customers,\nOUR APP records each customer\'s dues SO THAT they get paid on time.'),
  heading('Ask AI to challenge you'),
  text('Before building, ask the AI to act as a sceptical user and list the reasons they would not use it. Cheap to ask, expensive to skip.'),
  bullets('Who else solves this today, even with paper or a spreadsheet?', 'What is the smallest version that someone would still use?', 'How will I know it works (one number or one behaviour)?'),
  note('Pattern: Problem, person, promise. Write the one-sentence version first and keep it at the top of your project files.'),
], [
  predict('e1', 'What should come first when starting a new app?', '', ['Choose the framework', 'Pick a colour theme', 'State the problem and who has it in one sentence', 'Buy a domain'], 2, 'Tools and looks follow the problem. Without it, you may build the wrong thing very fast.'),
  task('e2', 'Write the FOR / WHO / OUR APP / SO THAT sentence for an app idea of your own.', 'Keep it to one person and one problem.', 'FOR students WHO forget assignment deadlines, OUR APP sends a reminder the day before SO THAT they submit on time.'),
]);

const scopeMvp = lesson('l2', 'Scope: the smallest useful version (MVP)', 25, [
  text('The biggest risk in AI-assisted building is not that it is slow. It is that it is too easy to keep adding features, and the app never ships. A Minimum Viable Product (MVP) is the smallest version that delivers the promise to one real user.'),
  heading('MoSCoW sort'),
  bullets('Must: without it the promise is broken (sign in, add a due, see the list)', 'Should: important but the app works without it (reminders)', 'Could: nice to have (charts, dark mode)', 'Will not (now): written down so it stops tempting you'),
  heading('Vertical slices'),
  text('Build one thin feature from screen to database before the next, instead of building all screens, then all APIs, then the database. Every slice works end to end, so you can show it, test it and keep it if you stop.'),
  code('Slice 1: add a customer           (screen -> API -> table)\nSlice 2: record a due             (screen -> API -> table)\nSlice 3: mark a due as paid       (screen -> API -> table)'),
  note('Pattern: Must first, thin slices, ship, then the next slice. If a feature is not in the Must list, it waits.'),
], [
  predict('e1', 'Which is a vertical slice?', '', ['Build every screen without data', 'Build add-customer from the screen through the API to the database', 'Design the whole database for a year of features', 'Write all the CSS'], 1, 'A vertical slice cuts through every layer for one small feature.'),
  task('e2', 'Sort these into Must, Should, Could for a todo app: add task, share list with friends, mark done, dark mode, reminders.', 'Which ones keep the promise alive?', 'Must: add task, mark done. Should: reminders. Could: dark mode, share list with friends.'),
]);

const specs = lesson('l3', 'Write a spec the AI can follow', 35, [
  text('A spec (specification) is a short document that says what to build and when it is done. When AI writes the code, the spec is your most valuable file: the AI follows it, you review against it, and a new chat can pick up from it.'),
  heading('A spec template that works'),
  code('# Feature: Record a due\n\n## Why\nShop owners forget who owes them money.\n\n## User stories\n- As a shop owner, I add an amount and a customer so I can track what they owe.\n\n## Acceptance criteria\n- Amount must be a positive number\n- A due is saved with the date and the customer\n- The customer total updates immediately\n- Invalid input shows an error under the field\n\n## Out of scope\n- Payments, reminders\n\n## Data\nDue: id, customerId, amount, createdAt, paid'),
  heading('Acceptance criteria are the secret'),
  text('Write each criterion so a stranger could check it as pass or fail. "Fast" is not checkable. "The list loads in under two seconds with 100 items" is. These same lines later become your tests.'),
  heading('Let AI interview you'),
  code('I want to build [idea]. Interview me, one question at a time, about users,\nfeatures, data and edge cases. When we are done, write the spec.'),
  note('Pattern: Why, stories, acceptance criteria, out of scope. A spec with pass or fail criteria is half of your testing already done.'),
], [
  predict('e1', 'Which acceptance criterion is checkable?', '', ['The page feels quick', 'The form looks modern', 'Submitting an empty amount shows the error "Amount is required"', 'Users will love it'], 2, 'It has a clear input and an exact, observable result.'),
  task('e2', 'Write three acceptance criteria for a login form.', 'Cover success, wrong password and empty fields.', '1) Correct email and password open the dashboard. 2) Wrong password shows "Incorrect email or password" and stays on the page. 3) Empty fields show a required message under each field.'),
]);

const designWithAi = lesson('l4', 'Design with AI: flows, screens, tokens', 35, [
  text('Design is not decoration. It is deciding what the user sees and does, in what order. Work from big to small: flow, then screens, then components, then style.'),
  heading('Step by step'),
  bullets('User flow: the path from opening the app to the goal (sign in, add due, see total)', 'Wireframe: boxes and labels only, no colour; ask the AI to describe or sketch each screen in text first', 'Components: the repeated pieces (button, card, input, list row)', 'Design tokens: named values for colour, spacing, type and radius that every component uses'),
  code('// tokens.css : decide once, reuse everywhere\n:root {\n  --color-primary: royalblue;\n  --space-2: 0.5rem;\n  --space-4: 1rem;\n  --radius-md: 0.5rem;\n  --font-size-body: 1rem;\n}\n\n.button { background: var(--color-primary); padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); }'),
  heading('Rules that look professional'),
  bullets('Consistent spacing from one scale, not random numbers', 'Two fonts at most, a clear size scale', 'One main action per screen, made visually obvious', 'Handle all states: empty, loading, error, success', 'Accessible: readable contrast, keyboard use, labels on inputs, alt text'),
  text('Tell the AI your tokens and rules up front, and ask it to use them only. Share a screenshot or reference site and say what you like about it.'),
  note('Pattern: flow, wireframe, components, tokens. Decide the system once and the AI stays consistent in every screen.'),
], [
  predict('e1', 'Why use design tokens instead of writing colours and sizes everywhere?', '', ['They make the file bigger', 'One change updates the whole app consistently', 'Browsers require them', 'They replace HTML'], 1, 'Named values keep the interface consistent and easy to change.'),
  task('e2', 'List the four states every data screen should handle.', 'Think about what the user sees before, during and after loading.', 'Empty (no data yet), loading, error, and success (data shown).'),
]);

const systemDesign = lesson('l5', 'System design: data first, then API, then screens', 40, [
  text('Before code, sketch the system on paper. For a small app the sketch has only four parts: entities, relations, API list and screens. AI is excellent at proposing it, and you are excellent at checking it against the spec.'),
  heading('The four-part sketch'),
  code('ENTITIES   User, Customer, Due\nRELATIONS  User has many Customers; Customer has many Dues\nAPI        POST /customers  GET /customers  POST /dues  PATCH /dues/:id\nSCREENS    Login, Customers list, Customer detail, Add due'),
  heading('Decisions to make on purpose'),
  bullets('Where is the data stored (database choice) and who owns each record', 'Who may see or change what (every record belongs to a user; check it on the server)', 'What can fail and what the user sees then (offline, timeouts, invalid data)', 'What must stay fast, and what can be slow or run in the background', 'Which parts you build and which you buy (sign-in, payments, email are usually better bought)'),
  heading('Ask AI for options, then you decide'),
  code('Propose two designs for this spec: the simplest one and one that scales.\nList the trade-offs of each. Recommend one for a solo developer\nwho wants to launch in two weeks.'),
  note('Pattern: entities, relations, API, screens. Choose the simplest design that meets today\'s needs. You can grow it later; you cannot easily un-build complexity.'),
], [
  predict('e1', 'For a first launch by a solo developer, which design is usually better?', '', ['Ten microservices', 'A single app with one database and a clear structure', 'No database at all', 'A custom-built sign-in system with new cryptography'], 1, 'Simple, well-known building blocks ship sooner and break less.'),
  task('e2', 'Sketch entities, relations and four API routes for a library app (members, books, loans).', 'A loan connects a member and a book.', 'Entities: Member, Book, Loan. Relations: Member has many Loans; Book has many Loans. API: GET /books, POST /loans, PATCH /loans/:id (return), GET /members/:id/loans.'),
]);

export const planningModule = courseModule('b3', 'beginner', 'Planning and design with AI', [problemFirst, scopeMvp, specs, designWithAi, systemDesign]);
