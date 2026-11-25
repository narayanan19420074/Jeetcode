import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const howTheWebWorks = lesson('l1', 'How the web works', 25, [
  text('Strip the web down to its first principle: one computer asks, another answers. The asking computer is the client (your browser or phone app). The answering computer is the server. The question is a request and the answer is a response.'),
  heading('What happens when you open a page'),
  bullets('You type a URL such as https://example.com/courses', 'DNS (the internet phone book) turns the name example.com into an IP address', 'The browser opens a connection and sends an HTTP request', 'The server builds a response (HTML, JSON, an image) and sends it back', 'The browser reads the response and shows the page'),
  code('GET /courses HTTP/1.1\nHost: example.com\n\nHTTP/1.1 200 OK\nContent-Type: text/html\n\n<html>...</html>'),
  heading('Vocabulary you will use daily'),
  bullets('Methods: GET reads, POST creates, PUT or PATCH updates, DELETE removes', 'Status codes: 2xx success, 3xx redirect, 4xx you made a mistake (404 not found, 401 not signed in, 403 not allowed), 5xx the server failed', 'HTTPS: HTTP over encryption, so nobody in the middle can read or change the traffic'),
  note('Pattern: every web action is one request and one response. When something breaks, ask: what was sent, what came back?'),
], [
  predict('e1', 'A page shows "404". Whose mistake does the code point to?', '', ['The server crashed', 'The client asked for something that does not exist', 'DNS is broken', 'The database is full'], 1, '4xx codes mean the request was wrong. 404 means that address is not found. A crash would be a 5xx code.'),
  task('e2', 'Write the four steps between typing a URL and seeing a page.', 'Name, address, request, response.', 'DNS finds the server IP address, the browser connects and sends an HTTP request, the server returns a response, and the browser renders it.'),
]);

const browser = lesson('l2', 'The browser: HTML, CSS and JavaScript', 30, [
  text('The browser is a program that turns responses into pages. It understands three languages, and each has one job.'),
  bullets('HTML: the structure and content (headings, text, buttons, images). The skeleton.', 'CSS: the looks (colour, spacing, layout, fonts). The skin.', 'JavaScript: the behaviour (react to clicks, fetch data, update the page). The muscles.'),
  code('<button id="add">Add</button>\n<p id="count">0</p>\n\n<script>\n  let count = 0;\n  document.getElementById("add").addEventListener("click", () => {\n    count += 1;\n    document.getElementById("count").textContent = count;\n  });\n</script>'),
  heading('The DOM'),
  text('The browser turns HTML into a tree of objects called the DOM (Document Object Model). JavaScript changes the tree and the screen updates. React, Vue and other UI libraries are tools to manage that tree for you.'),
  heading('Developer tools: your X-ray'),
  bullets('Elements: see and edit the HTML and CSS of any element', 'Console: error messages and logs', 'Network: every request and response, with status and timing', 'Application: cookies, local storage and saved data'),
  note('Pattern: HTML is the skeleton, CSS is the skin, JavaScript is the muscles. When a bug appears, open DevTools first: Console for errors, Network for failed requests.'),
], [
  predict('e1', 'A button does nothing when clicked. Which DevTools panel do you check first?', '', ['Elements to change the colour', 'Console for a JavaScript error', 'Application to clear fonts', 'None, reinstall the browser'], 1, 'JavaScript errors are shown in the Console, and an error can stop the click handler from running.'),
  task('e2', 'Say which language fixes each problem: text too small, button does not respond, missing heading.', 'Look, behaviour, structure.', 'Text too small: CSS. Button does not respond: JavaScript. Missing heading: HTML.'),
]);

const clientAndServer = lesson('l3', 'Client and server: where does code run?', 30, [
  text('A beginner mistake is to put everything in one place. First principle: code runs in one of two places, and the place decides what it may do.'),
  bullets('Client (browser or app): runs on the user device. Shows the interface and reacts instantly. The user can see and change anything here.', 'Server: runs on a machine you control. Keeps secrets (API keys, database passwords), talks to the database and enforces the rules.'),
  heading('The golden rule'),
  text('Never trust the client. Any check done only in the browser (for example "price must be positive") can be bypassed by sending a request by hand. Validate on the client for a friendly experience, and validate again on the server for safety.'),
  heading('How pages are produced'),
  bullets('Static (SSG): pages built ahead of time; fastest and cheapest, for content that rarely changes', 'Server-side rendering (SSR): the server builds the HTML for each request; good for personalised or fresh data and for search engines', 'Client-side rendering (CSR): the browser downloads JavaScript and builds the page; good for app-like screens behind a login'),
  note('Pattern: the client shows, the server decides. Secrets and rules live on the server, always.'),
], [
  predict('e1', 'Where must an API secret key for a payment provider be used?', '', ['In the browser JavaScript', 'In the HTML as a comment', 'On the server only', 'In the CSS file'], 2, 'Anything sent to the browser can be read by users. Keep secrets on the server.'),
  task('e2', 'A form checks in the browser that quantity is between 1 and 10. Explain why the server must check it too.', 'Think about someone sending a request without your page.', 'A user can bypass the page and send a request directly with any value, so only the server check protects the data and the rules.'),
]);

const apis = lesson('l4', 'APIs: how programs talk', 35, [
  text('An API (Application Programming Interface) is a menu a program offers to other programs. You order by sending a request in the agreed format, and you get a response. You never see how the kitchen works.'),
  heading('REST and JSON'),
  text('Most web APIs use REST: addresses are nouns (resources) and methods are verbs. Data travels as JSON, a text format of keys and values.'),
  code('GET    /api/tasks          -> list tasks\nPOST   /api/tasks          -> create a task\nPATCH  /api/tasks/42       -> update task 42\nDELETE /api/tasks/42       -> delete task 42\n\n{ "id": 42, "title": "Write spec", "done": false }'),
  heading('Calling and building an API'),
  code('// Client: ask the server for data\nconst response = await fetch("/api/tasks");\nif (!response.ok) throw new Error("Request failed: " + response.status);\nconst tasks = await response.json();\n\n// Server (Express): answer the request\napp.get("/api/tasks", async (req, res) => {\n  const tasks = await db.task.findMany();\n  res.json(tasks);\n});'),
  heading('Keys, auth and limits'),
  bullets('API key: a secret string that identifies your app; keep it on the server', 'Session or token: proves which user is calling', 'OAuth: lets users sign in with another service without sharing their password', 'Rate limit: the provider caps how many calls you can make; handle the 429 status', 'Webhook: the reverse call, where a service sends your server a request when something happens (a payment succeeded)'),
  note('Pattern: an API is a menu. Know the dish (endpoint), the order format (request), and what arrives (response). Read the provider docs first, then let the AI write the code.'),
], [
  predict('e1', 'Which request should create a new task?', '', ['GET /api/tasks', 'POST /api/tasks', 'DELETE /api/tasks', 'PATCH /api/tasks/42'], 1, 'POST creates a new resource in the collection.'),
  task('e2', 'Write the fetch call that sends a new task with the title "Buy milk" as JSON to /api/tasks.', 'Use method, headers and a stringified body.', 'await fetch("/api/tasks", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ title: "Buy milk" }),\n});'),
]);

const databases = lesson('l5', 'Databases: where data lives', 30, [
  text('Memory in a running program disappears when it stops. A database stores data permanently, safely and in a way you can search. Almost every real app is a thin layer of screens on top of a database.'),
  heading('Tables, rows and keys (relational databases)'),
  bullets('A table is a list of one kind of thing (users, orders)', 'A row is one record; a column is one field', 'A primary key uniquely identifies a row', 'A foreign key links to a row in another table, which is how you say "this order belongs to that user"'),
  code('CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email TEXT UNIQUE NOT NULL\n);\n\nCREATE TABLE tasks (\n  id SERIAL PRIMARY KEY,\n  user_id INT REFERENCES users(id),\n  title TEXT NOT NULL,\n  done BOOLEAN DEFAULT false\n);\n\nSELECT title FROM tasks WHERE user_id = 1 AND done = false;'),
  heading('Choosing and managing'),
  bullets('PostgreSQL or MySQL (SQL): the safe default for structured data with relations', 'MongoDB (documents): flexible JSON-like records, good for varied shapes', 'Redis (key-value): very fast cache and sessions', 'Migrations: versioned changes to the schema, kept in Git', 'ORMs such as Prisma or Drizzle: write database code in your language instead of raw SQL', 'Backups: automatic and tested; a backup you never restored is a hope, not a backup'),
  note('Pattern: data first. Draw the tables and their links before you draw the screens, and most of the app falls into place.'),
], [
  predict('e1', 'How do you record that a task belongs to a user?', '', ['Copy the user email into every task by hand', 'A user_id foreign key column in tasks', 'Put the tasks in the browser', 'Rename the tasks table'], 1, 'A foreign key links each task row to exactly one user row.'),
  task('e2', 'Design the tables for a notes app with users and notes. List the columns for each.', 'Each note needs to know its owner.', 'users: id, email, created_at.\nnotes: id, user_id (links to users.id), title, body, created_at, updated_at.'),
]);

export const webFundamentalsModule = courseModule('b2', 'beginner', 'Web fundamentals', [howTheWebWorks, browser, clientAndServer, apis, databases]);
