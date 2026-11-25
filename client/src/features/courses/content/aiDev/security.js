import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const threatThinking = lesson('l1', 'Think like an attacker, simply', 25, [
  text('Security starts from one first principle: assume anything that comes from outside your code can be hostile or simply wrong. Outside means user input, URLs, files, API responses, other services, and, with AI, any text the model reads.'),
  heading('Three questions for every feature'),
  bullets('What do I trust here, and why?', 'What is the worst thing someone could send or do?', 'What is the damage, and how do I limit it?'),
  heading('The basics that stop most attacks'),
  bullets('Validate input on the server', 'Check permissions on the server for every record', 'Keep secrets out of code and out of the browser', 'Use HTTPS everywhere', 'Keep dependencies updated', 'Give each part the least access it needs'),
  note('Pattern: outside input is hostile until validated. Ask the three questions before shipping each feature.'),
], [
  predict('e1', 'Which source of data should you trust without checking?', '', ['A form field', 'A URL parameter', 'A third-party API response', 'None of these; validate all of them'], 3, 'Everything crossing your boundary gets validated.'),
  task('e2', 'Apply the three questions to a "upload profile picture" feature.', 'Think file type, size and storage.', 'Trust: nothing about the file. Worst case: a huge or malicious file. Limit: allow only image types, cap the size, store outside the app code, and serve it with safe headers.'),
]);

const webAttacks = lesson('l2', 'Common web attacks and their cures', 40, [
  text('A handful of attacks cause most real incidents. Knowing their names lets you ask the AI to defend against them specifically.'),
  bullets('Injection (SQL and similar): attacker input becomes part of a command. Cure: parameterised queries or an ORM, never string concatenation.', 'Cross-site scripting (XSS): attacker script runs in other users\' browsers. Cure: let the framework escape output, avoid raw HTML insertion, set a content security policy.', 'Cross-site request forgery (CSRF): another site makes the browser send actions while you are signed in. Cure: same-site cookies and CSRF tokens.', 'Broken access control: user A reads user B\'s data. Cure: authorize every record on the server.', 'Weak authentication: guessable passwords, no rate limit. Cure: a proven auth service, rate limiting and multi-factor sign-in.', 'Exposed secrets: keys in Git or the browser. Cure: environment variables, secret scanners, rotate leaked keys.'),
  code('// Unsafe: attacker controls the query\ndb.query("SELECT * FROM users WHERE email = \'" + email + "\'");\n\n// Safe: parameters are never treated as code\ndb.query("SELECT * FROM users WHERE email = $1", [email]);'),
  note('Pattern: never mix data into commands, never trust the client, always authorize records. Ask the AI to review each feature against this list.'),
], [
  predict('e1', 'Which code is safe from SQL injection?', '', ['Building the query by joining strings with user input', 'Passing user input as query parameters', 'Hiding the form field', 'Using longer variable names'], 1, 'Parameters are treated as data, not as part of the command.'),
  task('e2', 'Write the prompt asking AI to security-review an API route.', 'Name the attack classes.', 'Review this API route for injection, broken access control, missing input validation, exposed secrets and unsafe error messages. List issues by severity with a fix for each. Do not rewrite unrelated code.'),
]);

const secrets = lesson('l3', 'Secrets, keys and configuration', 25, [
  text('A secret is anything that grants access: API keys, database URLs, tokens, signing keys. The biggest beginner leak is committing one to Git. Bots scan public repositories within minutes.'),
  heading('Rules'),
  bullets('Store secrets in environment variables (.env locally, the hosting dashboard in production)', 'Add .env to .gitignore before the first commit', 'Commit a .env.example with names and fake values so others know what to set', 'Only variables meant for the browser may be public (in Next.js they are the ones with the NEXT_PUBLIC_ prefix); everything else stays server-only', 'Different keys for development and production', 'If a key ever leaks: revoke and replace it first, clean the history second', 'Never paste real secrets into an AI chat'),
  code('# .env.example\nDATABASE_URL=postgres://user:password@localhost:5432/app\nAUTH_SECRET=change-me\nPAYMENT_KEY=change-me'),
  note('Pattern: secrets live in the environment, never in code or chat. A leaked key is rotated, not hidden.'),
], [
  predict('e1', 'You accidentally pushed an API key to GitHub. First action?', '', ['Delete the commit and hope', 'Revoke the key and create a new one', 'Rename the repository', 'Ignore it, the repo is small'], 1, 'Assume it was copied. Revoke first; cleaning history alone does not help.'),
  task('e2', 'Explain which of these may be public: a database URL, a map embed key restricted to your domain, a payment secret key.', 'Public means safe if everyone sees it.', 'Only the domain-restricted map key may be public. The database URL and payment secret key are server-only.'),
]);

const llmRisks = lesson('l4', 'Security of AI-built and AI-powered apps', 40, [
  text('AI adds its own risks. The OWASP Top 10 for LLM Applications is a respected list. Its main items give you a checklist for both using AI to build and putting AI inside your product.'),
  bullets('Prompt injection (top risk): hostile text in the input or in retrieved content changes the model\'s behaviour. Cure: treat model input as untrusted, separate instructions from data, limit what the model can do.', 'Sensitive information disclosure: the model reveals private data. Cure: do not give it data the user should not see; filter and minimise.', 'Supply chain: malicious or fake packages and models. AI sometimes suggests package names that do not exist, and attackers register them. Cure: check every new dependency yourself.', 'Improper output handling: trusting model output as code or HTML. Cure: validate and escape it like any user input; never run it blindly.', 'Excessive agency: too many permissions for tools. Cure: least privilege and human approval.', 'System prompt leakage: secrets in prompts are not secret. Cure: keep keys out of prompts.', 'Overreliance: believing wrong answers. Cure: verification and tests.', 'Unbounded consumption: abuse that runs up your bill. Cure: rate limits and caps.'),
  heading('A final gate for AI-written code'),
  bullets('Run the tests and a linter', 'Run a dependency audit (npm audit) and a secret scanner', 'Ask a fresh AI session for a security review, then read the findings yourself', 'For payments, auth and personal data, have an experienced human review'),
  note('Pattern: model output is untrusted input, permissions are minimal, dependencies are verified. Fast code still needs slow checking where the stakes are high.'),
], [
  predict('e1', 'The AI suggests installing a package you never heard of. What do you do?', '', ['Install it immediately', 'Check that it exists, is popular, maintained and the right name before installing', 'Ask the AI again until it agrees', 'Copy it into the repo'], 1, 'Invented or look-alike package names are a known attack route.'),
  task('e2', 'Your chatbot passes the model\'s reply straight into the page as HTML. What can go wrong and what is the fix?', 'Think of output as untrusted input.', 'The reply may contain script or harmful markup (cross-site scripting). Escape or sanitise the output, or render it as plain text.'),
]);

export const securityModule = courseModule('a2', 'advanced', 'Security', [threatThinking, webAttacks, secrets, llmRisks]);
