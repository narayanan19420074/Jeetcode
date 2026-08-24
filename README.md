# JeetCode — Full Stack (Frontend + Backend, connected)

Frontend and backend are now wired together for real — no dummy data left in either. `client/src/data/` is gone; every screen fetches from the API.

## What changed in this pass

- **`client/src/api/`** — new: `apiClient.js` (axios + auto access-token refresh on 401) and one module per resource (`authApi`, `problemsApi`, `submissionsApi`, `usersApi`, `adminApi`)
- **`authSlice.js`** — real `registerUser` / `loginUser` / `bootstrapSession` / `logoutUser` thunks. Access token lives in memory only; session survives a refresh via the httpOnly cookie + `/api/auth/refresh` called once on app boot (`main.jsx`)
- **`workspaceSlice.js`** — `runCode` / `submitCode` now POST to `/api/submissions` and poll `GET /api/submissions/:id` until judging finishes (works whether your backend is queued via Redis or processing inline)
- **`DashboardPage.jsx`, `WorkspacePage.jsx`, `AdminPage.jsx`** — all fetch real data; loading/error states added throughout
- **`data/problems.js`, `data/mockData.js`** — deleted
- **Login page** — removed the "admin demo" checkbox; admin access now comes from the actual user's `role` in MongoDB
- **Signup page** — added the `handle` field the backend requires

## Run order (exact)

**1. Backend first — it has to be up before the frontend can do anything real.**

```bash
cd server
cp .env.example .env        # fill in MONGODB_URI (Atlas) at minimum
npm install
npm run seed                 # creates admin@jeetcode.dev / ChangeMe123! + 2 problems
npm run dev                  # http://localhost:5000
```

Confirm it's alive: `curl http://localhost:5000/api/health`

**2. Frontend**

```bash
cd client
cp .env.example .env         # VITE_API_BASE_URL=http://localhost:5000/api (already the default)
npm install                   # picks up the new axios dependency
npm run dev                   # http://localhost:5173
```

**3. (Only if you set `REDIS_URL`) — run the worker in a third terminal**

```bash
cd server
npm run worker
```

Without `REDIS_URL` set, submissions judge inline inside the API request — totally fine for this stage, no worker needed.

## Test the real flow

1. Open `http://localhost:5173` → you'll land on `/dashboard` as a guest, seeing the 2 seeded problems (Two Sum, Valid Parentheses) pulled live from MongoDB
2. Sign up a new account
3. Click into "Two Sum" → the editor loads the real starter code from the DB
4. Write a solution, hit **Run** → this actually calls Judge0's cloud API and judges against the sample test cases
5. Hit **Submit** → judges against all hidden test cases too, and on Accepted, updates your streak + solved counters in MongoDB
6. Go back to `/dashboard` → your streak, progress rings, and submission history now reflect what's actually in the database
7. Log in as `admin@jeetcode.dev` (change that password first via a direct DB update or add a change-password endpoint) → `/admin` shows real user counts, real problem list with publish/unpublish/delete that actually mutates MongoDB

## If something doesn't work

- **CORS error in browser console** → check `CLIENT_ORIGIN` in `server/.env` matches your frontend's actual URL exactly (including port)
- **401 on every request** → check both `.env` files are actually loaded (not just `.env.example`); check `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are set
- **Run/Submit hangs** → Judge0's free public API (`ce.judge0.com`) is rate-limited and can be slow under load; if it's consistently failing, get a RapidAPI Judge0 key and set `JUDGE0_API_KEY` + `JUDGE0_API_HOST`
- **"No problems match"** on dashboard → did `npm run seed` actually run against the same `MONGODB_URI` your `npm run dev` is using?

## Still not wired (documented, not hidden)

- Discussion/Solutions tabs in Workspace — empty placeholders, no backend model yet
- Password reset / email verification — not built

See `server/README.md` for the full API reference, deployment steps (Render + Atlas + Upstash), and — most importantly — **how to add new questions** without touching any code.
