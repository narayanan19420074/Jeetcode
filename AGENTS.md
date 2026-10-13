# AGENTS.md — AI Workflow for JeetCode (Mobile Coding)

Read this file fully before making any change. It tells you how to deliver code
to a developer who works **only from an Android phone**.

## 1. Context

- Developer: Naru. Writes Tamil-English (Tanglish). Reply in the same style:
  short, direct, actionable. No long explanations unless asked.
- Environment: Android phone, **Termux**, GitHub CLI (`gh`). No PC, no IDE.
- Repo location on phone: `~/Jeetcode`
- Stack: React (Vite) + MUI + Redux Toolkit (`client/`), Node + Express + MongoDB (`server/`).
- Deploy: Render, auto-deploys on every push to the branch set in `render.yaml`
  (`branch:` field; currently `feature/aptitude`). Pushing to any other branch
  does NOT deploy. Work on the branch Render deploys.
- Render build: `npm --prefix client ci --include=dev && npm --prefix client run build && npm --prefix server ci`.
  A broken build = failed deploy (Render keeps the old version live).

## 2. The developer cannot do manual editing

Copy-pasting snippets into files, merging diffs, or editing many files by hand
on a phone is painful. Therefore:

1. **Never** tell him to "add this snippet somewhere" or "find the line and change it".
2. **Always deliver complete files** (full content of every changed/new file),
   as separate downloadable files. Not a zip, not the whole project.
3. **Only deliver files that changed or are new.** Never re-send unchanged files.
4. Give **one command block** that puts every file in its exact place.

## 3. Delivery format (every response that changes code)

### 3.1 Short summary (3–5 lines max)
What changed and why. Mention anything he must do outside the repo
(Render env vars, new npm package, DB migration).

### 3.2 Files
Download file names must be unique in the phone's `Downloads` folder.
- Use the real file name by default (`Navbar.jsx`).
- If two delivered files share a name (e.g. two `index.js`), prefix with the
  area: `server-index.js`, `client-index.js`.

### 3.3 Apply block (Termux)
Use `mv` (not `cp`) so Downloads stays clean and old copies don't pile up as `file (1).jsx`.
Create folders for new files with `mkdir -p`. Use absolute `~/Jeetcode/...` paths so
it works from any directory.

```bash
mkdir -p ~/Jeetcode/client/src/features/example
mv ~/storage/downloads/Navbar.jsx ~/Jeetcode/client/src/components/Navbar.jsx
mv ~/storage/downloads/user.controller.js ~/Jeetcode/server/src/controllers/user.controller.js
rm -f ~/Jeetcode/client/src/components/OldThing.jsx   # only if a file must be deleted
cd ~/Jeetcode && git status -s
```

The `git status -s` at the end lets him confirm that exactly the expected files changed.

### 3.4 Ship line (separate block)
```bash
ship "short commit message"
```
`ship` is a shell function: `git add -A && git commit -m "$1" && git push`.
Because it stages everything, the status check in 3.3 matters.

### 3.5 Rollback (mention only for risky changes)
- Before commit: `git restore .` (and `git clean -fd` for new files)
- After push: `git revert HEAD && git push`

## 4. Rules before you deliver

1. **Work from the latest code.** He runs `getzip` (does `git pull`, then
   `git archive` to `Downloads/jeetcode.zip`) and uploads it at the start of a
   session. If no fresh zip was uploaded, ask him to run `getzip` first. Never
   rely on an old copy from earlier in the chat.
2. **Check wiring.** Every import must resolve, every export must match its
   import (named vs default), route paths must match between `client/src/api/*`
   and `server/src/routes/*`, and Redux slices must be registered in
   `client/src/app/store.js`.
3. **Build-check if you can run code.** In your sandbox, run
   `npm --prefix client ci --include=dev && npm --prefix client run build` and
   `node --check` on changed server files. Fix errors before delivering. If you
   cannot run code, say so in one line.
4. **Keep changes minimal.** Match existing code style, folder structure and
   naming. No unrelated refactors.
5. **Secrets.** Never read, print, request or commit `.env` values. If a new env
   var is needed, add its name to `.env.example` and tell him to set it in the
   Render dashboard (Environment). If an uploaded zip contains a `.env`, do not
   open it and warn him once.
6. **New npm dependency.** Do not hand-edit `package.json` / `package-lock.json`.
   Render uses `npm ci`, so the lockfile must stay in sync. Give the install
   command to run in Termux, then ship:
   ```bash
   cd ~/Jeetcode && npm --prefix client install <pkg>    # or --prefix server
   ```
   Prefer pure-JS packages (native modules may fail to build on Android).
7. **Database changes.** If a model/schema change needs a seed or migration,
   say exactly which script to run and where (Render shell or local).
8. **Don't commit** `node_modules`, `dist`, `build`, `.env`, or zip files.

## 5. Project-specific gotchas

- MUI (v6–v7): `Grid` uses the new `size` prop (e.g. `size={{ xs: 12, md: 6 }}`),
  not `item xs=...`. `Stack` alignment props (`alignItems`, `justifyContent`)
  must go inside `sx`.
- For UI/design work, follow `.agents/skills/design-taste-frontend/SKILL.md`
  if present.
- For aptitude/problem content work, read `server/content/aptitude/_AGENT_BRIEF.md`
  and `server/content/problem-authoring-guide.md` first.
- Client talks to the API via `client/src/api/apiClient.js`; add new endpoints in
  the matching `*Api.js` file.
- Server layering: `routes → controllers → services → models`, with validators
  in `validators/` and errors via `ApiError` / `asyncHandler`.

## 6. Response checklist (use every time)

- [ ] Used the latest zip (or asked for it)
- [ ] Only changed/new files delivered, each complete
- [ ] One apply block with `mkdir -p`, `mv`, optional `rm`, and `git status -s`
- [ ] A separate `ship "message"` line
- [ ] Render env vars / npm installs / seeds called out if needed
- [ ] No secrets touched
- [ ] Reply is short and in Tanglish

## 7. Shortcuts defined in the developer's `~/.bashrc`

```bash
ship() { git add -A && git commit -m "${1:-update}" && git push; }
getzip() {
  cd ~/Jeetcode || return
  git pull || return
  rm -f ~/storage/downloads/jeetcode.zip
  git archive -o ~/storage/downloads/jeetcode.zip HEAD
  echo "Done: Downloads/jeetcode.zip"
}
```
