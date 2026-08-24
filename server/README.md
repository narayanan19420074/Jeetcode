# JeetCode — Phase 2 Backend

Node + Express + MongoDB + Judge0 + BullMQ/Redis. Follows the same request-judging architecture LeetCode itself uses: your code never runs raw — it's spliced into an admin-authored driver harness before it ever reaches the sandbox.

## Architecture

```
Client (React)
   │  Authorization: Bearer <accessToken>
   ▼
Express API  ──requireAuth/requireRole──▶  Controller ──▶  Service ──▶  Mongoose Model ──▶  MongoDB Atlas
   │
   │  POST /api/submissions  (mode: run | submit)
   ▼
enqueueSubmission()
   │
   ├─ REDIS_URL set  → BullMQ job → separate `npm run worker` process → Judge0 → writes result to MongoDB
   └─ REDIS_URL unset → processes inline in the API request (fine for local dev only)
```

**Why a queue at all?** Judge0 calls are slow (network + compile + execute — can be seconds). If the API thread waited on that synchronously for every submission, a burst of submits would exhaust Node's event loop and every other user's requests would stall behind them. The queue means the API responds immediately (or the client polls `GET /api/submissions/:id`), and a separately-scalable worker pool drains the queue.

## Folder structure

```
server/src/
├── config/         env.js (zod-validated env), db.js (Mongoose connection)
├── models/         User, Problem, Submission — indexes chosen for the actual query patterns
├── controllers/     one per resource — thin, delegate to services
├── services/
│   ├── judge0.service.js       Judge0 HTTP client, language map, status mapping
│   ├── codeHarness.service.js   splices user code into the driver template (the anti-cheat core)
│   ├── submission.service.js    orchestrates: harness → Judge0 → aggregate verdict → update stats
│   ├── streak.service.js        O(1) streak calculation, no history scan
│   └── redisClient.js           shared Redis singleton, null when not configured
├── queue/           submissionQueue.js (producer), submissionWorker.js (standalone consumer process)
├── middlewares/     auth (JWT), rateLimiter, validate (zod), errorHandler, sanitize
├── validators/       zod schemas per resource
├── routes/           REST endpoints, grouped by resource
└── scripts/          seedProblems.js — 2 fully-worked example problems
```

## How judging actually works (the part that matters)

A `Problem` stores **three** code-related fields per language:

1. `starterCode` — what the learner sees in the editor (empty function body)
2. `driverCode` — a full compilable program with a `/*__USER_CODE__*/` placeholder, written by an admin, that reads stdin, calls the learner's function, and prints stdout in a comparable format
3. `testCases[]` — `{ stdin, expectedOutput, isSample }` pairs

At submit time: `driverCode.replace('/*__USER_CODE__*/', learnerCode)` produces the final source. **The learner's code is never executed on its own** — only ever as a substring inside a template an admin controls. This is what makes hidden test cases meaningful (a learner can't `console.log` the expected answer and skip the logic) and what stops a malicious submission from doing anything other than implementing the function.

Judge0 itself does the stdout-vs-expectedOutput comparison and returns a status per test case; `submission.service.js` aggregates those into one overall verdict (Compilation Error > Runtime Error > TLE > Wrong Answer > Accepted, in that priority — a compile error should never be masked by "3 of 5 passed").

## Adding questions at scale ("namma pudhu questions add pannuradhu")

For one-off problems, `POST /api/admin/problems` works directly. **For adding many problems (e.g. building out a 300-problem bank), use the bulk import pipeline instead** — see `content/problem-authoring-guide.md` for the full guide. Short version:

1. Write a JSON file per problem in `content/problems/` declaring just the function signature (`functionName`, `params`, `returnType`) and test cases as plain values — no driver code needed for ~90% of problems, it's auto-generated
2. `npm run import:problems`

This is what makes 300 problems tractable: you're writing signatures and test data, not hand-writing 900 driver programs (300 problems × 3 languages). The generator (`src/services/harnessGenerator.service.js`) was verified by actually compiling and running its output — see the guide for details.

For the ~10-20% of problems needing custom structures (linked lists, trees, graphs) that the generator doesn't support, the same JSON format accepts hand-written `starterCode`/`driverCode` instead — see `content/problems/reverse-linked-list.json` for a fully-worked example.

## Setup

### 1. MongoDB Atlas
Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) → Database Access (create a user) → Network Access (allow `0.0.0.0/0` for Render, or Render's specific IPs) → Connect → Drivers → copy the connection string into `MONGODB_URI`.

### 2. Redis (optional in dev, needed in production)
[Upstash](https://upstash.com) has a free Redis tier that works well with Render/Railway. Copy the connection URL into `REDIS_URL`. Leave it blank locally — submissions just process inline instead.

### 3. Environment
```bash
cp .env.example .env
# fill in MONGODB_URI at minimum; generate JWT secrets with:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. Install, seed, run
```bash
npm install
npm run seed   # creates admin@jeetcode.dev / ChangeMe123! + 2 example problems — CHANGE THIS PASSWORD
npm run dev    # API on http://localhost:5000
npm run worker # only needed if REDIS_URL is set — separate terminal
```

## Deploying (Render free tier)

1. Push this `server/` folder to its own GitHub repo (or a subdirectory — Render supports "Root Directory")
2. Render → New → Web Service → connect the repo → Root Directory: `server` (if monorepo) → Build: `npm install` → Start: `npm start`
3. Add all `.env.example` variables in Render's Environment tab (use your real Atlas URI, Upstash URL, generated secrets, and your deployed frontend's URL for `CLIENT_ORIGIN`)
4. If using Redis: add a **second** Render service (Background Worker type) running `npm run worker`, pointed at the same repo/env vars
5. Update the frontend's API base URL to point at the Render service URL

## API reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, sets refresh cookie |
| POST | `/api/auth/refresh` | cookie | Rotate access token |
| POST | `/api/auth/logout` | — | Revoke refresh token |
| GET | `/api/auth/me` | ✓ | Current user profile |
| GET | `/api/problems` | optional | Problem Explorer (paginated, filterable, searchable) |
| GET | `/api/problems/:slug` | optional | Problem detail (Workspace left pane) |
| POST | `/api/submissions` | ✓ | Run or Submit code |
| GET | `/api/submissions/:id` | ✓ | Poll a submission's judging status |
| GET | `/api/submissions/me` | ✓ | Submission history |
| GET | `/api/users/me/activity` | ✓ | 49-day heatmap data |
| POST | `/api/users/me/bookmarks/:problemId` | ✓ | Toggle bookmark |
| GET/POST/PATCH/DELETE | `/api/admin/problems*` | admin | Problem CRUD |
| GET | `/api/admin/stats` | admin | Admin Console stat cards |
| GET | `/api/admin/signups` | admin | Recent signups list |
| POST | `/api/ai/hint` | ✓ | AI hint for the Workspace drawer (Claude API, rate-limited per user) |

## What's intentionally NOT built yet

- Discussion/solutions board (frontend still shows placeholder tabs)
- Email verification / password reset
- Self-hosted Judge0 (current setup uses the public Judge0 CE API — swap `JUDGE0_API_URL` to your own instance later, no other code changes needed)

## AI hints (`/api/ai/hint`)

Set `ANTHROPIC_API_KEY` in `.env` to enable — get one at [console.anthropic.com](https://console.anthropic.com). Without it, the endpoint returns a clear "not configured" error instead of failing mysteriously; the frontend drawer shows that message in the chat.

The Socratic-hints-not-solutions rule is enforced server-side in the system prompt (`src/services/ai.service.js`), not just as frontend copy — a learner directly asking for the full answer gets redirected, not obeyed. Rate-limited per user (not per IP) at 15 requests/5min via `aiHintLimiter`, since this is the one endpoint with a real per-request dollar cost — tune that limit based on your actual budget once you see usage.

## Connecting the Phase 1 frontend

In `authSlice.js` and `workspaceSlice.js`, replace the `setTimeout`-based dummy thunks with real `fetch`/`axios` calls to these endpoints. Store the access token in memory (Redux state, not localStorage — the refresh token in the httpOnly cookie is what should persist across reloads) and call `/api/auth/refresh` on app load to silently restore a session.
