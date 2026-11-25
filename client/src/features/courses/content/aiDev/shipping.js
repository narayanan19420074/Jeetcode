import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const hostingBasics = lesson('l1', 'Hosting: putting your app on the internet', 30, [
  text('Your app runs on your laptop at localhost. Hosting means running it on a computer that stays on and is reachable by everyone. Choose the type of host by what your app is.'),
  bullets('Static hosting: only HTML, CSS and JavaScript files, no server code (cheap, very fast)', 'Platform hosting (Vercel, Netlify, Render, Railway, Fly.io): connect your Git repository and the platform builds and runs it for you. The best choice for beginners.', 'Virtual servers and cloud providers: full control, but you manage updates, security and scaling yourself', 'Managed database: a hosted Postgres or Mongo with backups, separate from your app'),
  heading('What happens on deploy'),
  code('git push\n  -> platform pulls the code\n  -> installs dependencies\n  -> runs the build\n  -> starts the new version\n  -> switches traffic when it is healthy'),
  heading('A domain name'),
  text('Buy a name at a registrar, then add DNS records that point it to your host. HTTPS certificates are usually automatic on modern platforms.'),
  note('Pattern: connect Git, set environment variables, deploy, attach a domain. Start on a platform and move to custom servers only when you have a real reason.'),
], [
  predict('e1', 'What is the easiest hosting route for a first Next.js app?', '', ['Build a data centre', 'A platform that deploys directly from your Git repository', 'Email the files to users', 'A USB stick'], 1, 'Platforms handle building, running, HTTPS and rollbacks for you.'),
  task('e2', 'List the steps from "code works locally" to "live on a domain".', 'Repo, host, variables, database, domain.', 'Push to GitHub, connect the repo to the host, set environment variables, connect a hosted database and run migrations, deploy, then attach the domain and check HTTPS.'),
]);

const environments = lesson('l2', 'Environments: local, staging, production', 30, [
  text('The same code runs in different places called environments. Keeping them separate lets you break things safely.'),
  bullets('Local: your machine, fake or test data', 'Preview or staging: a private copy online for testing a change; many platforms create one per branch automatically', 'Production: the real thing, real users, real data'),
  heading('Rules'),
  bullets('Separate databases and keys per environment; never test against production data', 'Configuration comes from environment variables, so the code stays identical everywhere', 'Test on a preview first, then promote the same build to production', 'Database changes ship as migrations, applied in a controlled step, ideally backwards compatible'),
  code('# Different values, same code\nDATABASE_URL = local database      (on your laptop)\nDATABASE_URL = staging database    (on the preview)\nDATABASE_URL = production database (live)'),
  note('Pattern: same code, different configuration. Break things on local and preview; keep production boring.'),
], [
  predict('e1', 'Where should you try a risky database change first?', '', ['Production, quickly', 'A local or staging database copy', 'The user\'s phone', 'Nowhere'], 1, 'Test destructive changes where the data is disposable.'),
  task('e2', 'Why should the code read the database address from an environment variable?', 'Think of three environments.', 'The same code can run locally, on staging and in production, each connecting to its own database, and secrets stay out of the repository.'),
]);

const cicd = lesson('l3', 'CI/CD: automatic checks and releases', 30, [
  text('Continuous Integration (CI) runs your tests and checks automatically on every push. Continuous Delivery or Deployment (CD) ships the code when the checks pass. It is the safety net that lets you move fast with AI-written changes.'),
  code('# .github/workflows/ci.yml\nname: CI\non: [push, pull_request]\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22 }\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test\n      - run: npm run build'),
  heading('A healthy flow'),
  bullets('Work on a branch, open a pull request', 'CI runs lint, tests and build; a failing check blocks the merge', 'Review the diff (you, plus an AI reviewer)', 'Merge to main, the platform deploys', 'If something is wrong, roll back to the previous version in one click'),
  note('Pattern: push, check, review, merge, deploy, roll back if needed. Automated checks catch what tired humans and fast AI both miss.'),
], [
  predict('e1', 'What does CI do on each push?', '', ['Deletes old code', 'Runs the lint, tests and build automatically', 'Designs the logo', 'Buys a domain'], 1, 'It verifies every change the same way, every time.'),
  task('e2', 'List the four commands your CI should run for a Node app.', 'Install, lint, test, build.', 'npm ci, npm run lint, npm test, npm run build.'),
]);

const monitoring = lesson('l4', 'After launch: monitoring and maintenance', 30, [
  text('Launch is the start of the product, not the end. Real users find problems that no test imagined, so you need to see them quickly.'),
  heading('What to watch'),
  bullets('Errors: an error tracker (Sentry or similar) emails you when something crashes', 'Logs: server messages searchable by time and request', 'Uptime: a free monitor pings your site and alerts you if it is down', 'Performance: slow pages lose users; check the main pages on a normal phone', 'Cost: hosting, database and AI usage dashboards with alerts'),
  heading('Maintenance rhythm'),
  bullets('Weekly: read errors and feedback, fix the top issue', 'Monthly: update dependencies, run the security audit, test restoring a backup', 'Always: keep a changelog and the rules and progress files up to date, so AI sessions continue smoothly'),
  note('Pattern: see problems before users complain. Alerts on errors, uptime and cost, and a weekly review habit.'),
], [
  predict('e1', 'Why add error tracking?', '', ['To make the site prettier', 'To learn about crashes in real use before users report them', 'To slow down the app', 'To avoid backups'], 1, 'You cannot fix problems you cannot see.'),
  task('e2', 'Write a five-item weekly maintenance checklist.', 'Errors, uptime, cost, feedback, updates.', 'Read new errors, check uptime history, check spending, read user feedback, and note the next fix in PROGRESS.md.'),
]);

const capstone = lesson('l5', 'Capstone: your own app, start to finish', 45, [
  text('Now put everything together as one repeatable recipe. Follow it in order and keep each step small. This is how a professional team works, scaled down to one person and an AI.'),
  heading('The recipe'),
  bullets('1. Problem: write the one-sentence FOR / WHO / OUR APP / SO THAT', '2. Scope: Must, Should, Could; pick the first vertical slice', '3. Spec: user stories, acceptance criteria, out of scope', '4. Design: flow, wireframe, tokens; system sketch of entities, API and screens', '5. Setup: repository, stack, rules file (AGENTS.md), PROGRESS.md, CI', '6. Build slice by slice: Explore, Plan, Code, Commit, with tests first', '7. Review: read each diff, ask a fresh reviewer, run security checks', '8. Evaluate: eval cases for AI features, five real users for the product', '9. Ship: preview, production, domain, alerts, rollback plan', '10. Learn: weekly review, next slice'),
  heading('Your first prompt, ready to copy'),
  code('Read AGENTS.md and docs/spec.md. We are building slice 1: [feature].\nExplore the project first and do not change anything.\nThen write a plan with the files to change and the tests to add.\nWait for my approval before coding.'),
  heading('Confidence comes from the loop'),
  text('You do not need to know everything. You need a process that catches mistakes early: small steps, written specs, tests, reviews and commits. With that loop, the AI supplies speed and you supply direction and judgement. Anyone who follows it can build and ship their own app.'),
  note('Pattern: problem, scope, spec, design, setup, build in slices, review, evaluate, ship, learn. Small steps, written down, checked.'),
], [
  predict('e1', 'What should you do right after finishing the first working slice?', '', ['Add ten more features at once', 'Test it, commit, update PROGRESS.md, then plan the next slice', 'Delete the spec', 'Stop using Git'], 1, 'Each slice ends with proof, a checkpoint and notes, so the next one starts clean.'),
  task('e2', 'Pick an app idea and write its steps 1 to 3 of the recipe (problem sentence, three Must features, two acceptance criteria).', 'Keep everything small.', 'Problem: FOR students WHO forget deadlines, OUR APP sends reminders SO THAT they submit on time. Must: add deadline, list deadlines, mark done. Criteria: an added deadline appears in the list at once; a past deadline shows as overdue.'),
]);

export const shippingModule = courseModule('a4', 'advanced', 'Hosting, shipping and your first app', [hostingBasics, environments, cicd, monitoring, capstone]);
