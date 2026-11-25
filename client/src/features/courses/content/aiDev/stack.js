import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const chooseStack = lesson('l1', 'Choosing your stack and frameworks', 30, [
  text('A stack is the set of tools you build with. First principle: choose boring, popular tools. AI has seen far more examples of them, so it writes better code for them, and you will find help easily.'),
  heading('The pieces'),
  bullets('Frontend: what runs in the browser (React, Vue, Svelte)', 'Backend: what runs on the server (Node with Express, Python with FastAPI or Django)', 'Full-stack framework: both in one project (Next.js, Nuxt, SvelteKit, Remix)', 'Database: Postgres by default; Mongo for flexible documents', 'Auth and payments: buy them (Auth.js, Clerk, Supabase Auth, Stripe, Razorpay)', 'Hosting: where it runs (Vercel, Render, Railway, Fly.io, cloud providers)'),
  heading('A sensible default for a first app'),
  code('Next.js (React + server in one project)\nPostgres via a managed provider\nPrisma or Drizzle for database access\nAuth.js or a hosted auth service\nTailwind or CSS variables for style\nVercel or Render for hosting'),
  heading('How to decide'),
  bullets('Pick what you can run locally in minutes', 'Pick what has clear, current documentation', 'Avoid brand-new tools for your first project', 'Keep the stack small: every extra tool is another thing to learn and secure'),
  note('Pattern: popular, documented, small. Write the chosen stack in your rules file so the AI never swaps it mid-project.'),
], [
  predict('e1', 'Why is a popular framework a good choice when building with AI?', '', ['It is always faster', 'AI has seen many examples, so its code is better and help is easy to find', 'It needs no learning', 'It is free of bugs'], 1, 'More examples in training and in docs mean better suggestions and easier fixes.'),
  task('e2', 'Choose and justify a stack for a booking website for a salon, in three lines.', 'Think full-stack framework, database, and what you buy.', 'Next.js for pages and API in one project, Postgres for bookings, a hosted auth service and Razorpay or Stripe for payments, deployed on Vercel or Render. Popular tools, few moving parts.'),
]);

const nextArchitecture = lesson('l2', 'Next.js architecture, step by step', 40, [
  text('Next.js is a React framework that gives you pages, server code and an API in one project. Learn its shape once and you can read almost any modern full-stack app.'),
  heading('The folder is the map'),
  code('app/\n  layout.tsx          shared frame for every page\n  page.tsx            the home page  ( / )\n  courses/\n    page.tsx          /courses\n    [slug]/page.tsx   /courses/anything  (dynamic route)\n  api/\n    tasks/route.ts    server API: GET and POST /api/tasks\ncomponents/           reusable UI pieces\nlib/                  helpers: database, auth, validation\nprisma/               database schema'),
  heading('Server components and client components'),
  bullets('Server components (the default) run only on the server; they can read the database directly and send finished HTML. No secrets reach the browser.', 'Client components start with "use client"; they run in the browser and handle clicks, typing and state.', 'Rule: keep components on the server unless they need interactivity, and push the interactive part down into small client components.'),
  code('// app/tasks/page.tsx : server component\nimport { db } from "@/lib/db";\nimport AddTask from "./AddTask";\n\nexport default async function TasksPage() {\n  const tasks = await db.task.findMany();\n  return (\n    <main>\n      <ul>{tasks.map((t) => <li key={t.id}>{t.title}</li>)}</ul>\n      <AddTask />\n    </main>\n  );\n}'),
  code('// app/tasks/AddTask.tsx : client component\n"use client";\nimport { useState } from "react";\n\nexport default function AddTask() {\n  const [title, setTitle] = useState("");\n  return (\n    <form onSubmit={async (e) => {\n      e.preventDefault();\n      await fetch("/api/tasks", { method: "POST", body: JSON.stringify({ title }) });\n      setTitle("");\n    }}>\n      <input value={title} onChange={(e) => setTitle(e.target.value)} />\n      <button>Add</button>\n    </form>\n  );\n}'),
  note('Pattern: folders are routes, server by default, client only when needed. Ask the AI to explain any file it creates in these terms.'),
], [
  predict('e1', 'Which file serves the page at /courses/python?', '', ['app/courses/page.tsx', 'app/courses/[slug]/page.tsx', 'app/api/courses/route.ts', 'components/courses.tsx'], 1, 'A folder in square brackets is a dynamic segment, so [slug] matches python.'),
  task('e2', 'Say whether each is better as a server or client component: a list read from the database, a like button with a counter, a page footer.', 'Does it need clicks or state?', 'List from the database: server. Like button with counter: client. Page footer: server.'),
]);

const authentication = lesson('l3', 'Sign-in and permissions', 30, [
  text('Authentication answers "who are you?". Authorization answers "what may you do?". Mixing them up is the most common source of serious bugs.'),
  heading('Rules from first principles'),
  bullets('Never write your own password storage or cryptography; use a proven library or a hosted service', 'Never store passwords in plain text; hashing is done by the library', 'Session or token proves identity on every request; the server checks it every time', 'Authorize on the server for every action: "does this record belong to this user?"', 'Put secrets in environment variables, never in code or in the browser'),
  code('// Server route: authenticate, then authorize\nexport async function DELETE(req, { params }) {\n  const user = await getUser(req);            // who are you?\n  if (!user) return new Response("Sign in", { status: 401 });\n\n  const task = await db.task.findUnique({ where: { id: params.id } });\n  if (!task || task.userId !== user.id) {      // may you?\n    return new Response("Not allowed", { status: 403 });\n  }\n  await db.task.delete({ where: { id: params.id } });\n  return new Response(null, { status: 204 });\n}'),
  note('Pattern: authenticate, then authorize, on the server, every time. Hiding a button in the UI is not security.'),
], [
  predict('e1', 'A user edits the URL from /orders/5 to /orders/6 and sees someone else\'s order. What is missing?', '', ['A prettier URL', 'An authorization check on the server', 'A bigger server', 'A newer browser'], 1, 'The server must confirm the order belongs to the signed-in user.'),
  task('e2', 'Write the two questions every protected route must answer, in order.', 'One is about identity, one about permission.', '1) Who is calling (is there a valid session)? 2) Is this user allowed to do this to this specific record?'),
]);

const stateStyleData = lesson('l4', 'Data flow, validation and errors', 30, [
  text('Most bugs live where data crosses a boundary: form to server, server to database, API to screen. Guard every boundary.'),
  heading('Validate at the door'),
  text('Describe the shape you accept with a schema library (Zod, Valibot) and reject anything else with a clear message. One schema can serve both the form and the server.'),
  code('import { z } from "zod";\n\nconst TaskInput = z.object({\n  title: z.string().min(1, "Title is required").max(120),\n});\n\nexport async function POST(req) {\n  const parsed = TaskInput.safeParse(await req.json());\n  if (!parsed.success) {\n    return Response.json({ error: parsed.error.flatten() }, { status: 400 });\n  }\n  // parsed.data is safe to use\n}'),
  heading('Plan for failure'),
  bullets('Every network call can fail: show a message and a retry, not a blank screen', 'Log errors on the server with enough detail to debug, without secrets', 'Return clear status codes: 400 bad input, 401 not signed in, 403 not allowed, 404 not found, 500 our fault', 'Never show raw error stacks to users'),
  note('Pattern: validate at every boundary, fail loudly in logs and gently on screen.'),
], [
  predict('e1', 'Where should input be validated?', '', ['Only in the browser form', 'Only in the database', 'In the browser for friendliness and on the server for safety', 'Nowhere, the AI will handle it'], 2, 'Browser checks help the user, but only server checks protect the system.'),
  task('e2', 'Which status codes fit: missing title, not signed in, deleting someone else\'s task, database crashed?', 'Match 4xx for caller mistakes and 5xx for ours.', '400, 401, 403, 500.'),
]);

const versionControl = lesson('l5', 'Git: the undo button for everything', 30, [
  text('Git records the history of your project as checkpoints called commits. With AI changing many files quickly, Git is your safety net: you can always return to the last good state.'),
  heading('The daily loop'),
  code('git status                  # what changed?\ngit diff                    # see the exact changes\ngit add -A                  # stage them\ngit commit -m "Add due form" # save a checkpoint\ngit switch -c feature/dues  # work on a branch\ngit push                    # upload to GitHub'),
  heading('Habits that save projects'),
  bullets('Commit before asking the AI for a big change, so you can discard it with one command', 'Small commits with clear messages ("what and why")', 'Use a branch per feature and merge when it works', 'Always read the diff before accepting AI changes', 'Never commit secrets: .env goes in .gitignore; if a key leaks, rotate it immediately'),
  code('git restore .             # throw away uncommitted changes\ngit log --oneline           # history, one line each'),
  note('Pattern: commit, change, review the diff, commit again. If it goes wrong, go back; if it goes right, keep it.'),
], [
  predict('e1', 'You are about to let the AI refactor ten files. What first?', '', ['Nothing', 'Commit the current working state', 'Delete the tests', 'Close the editor'], 1, 'A fresh commit gives you a clean point to return to.'),
  task('e2', 'Write the Git commands to start a branch called feature/search, save your work, and view what changed before committing.', 'Switch, diff, add, commit.', 'git switch -c feature/search\ngit diff\ngit add -A\ngit commit -m "Add search box"'),
]);

export const stackModule = courseModule('i1', 'intermediate', 'Stack, frameworks and architecture', [chooseStack, nextArchitecture, authentication, stateStyleData, versionControl]);
