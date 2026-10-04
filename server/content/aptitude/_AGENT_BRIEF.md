# AGENT BRIEF — build the complete Indian aptitude question bank

> **How to run (paste into Claude Code at the project root):**
>
> `Read server/content/aptitude/_AGENT_BRIEF.md fully and execute it exactly as the orchestrator.`

You are the **ORCHESTRATOR**. Your job is to get a complete, verified aptitude question bank written to disk by running many worker subagents **in parallel**. Do not write questions yourself except to fix validator errors.

## 0. Context

JeetCode is an Indian placement-prep platform (TCS NQT, Infosys, Wipro, Cognizant, Accenture, Capgemini, HCL, IBPS/SBI banking, SSC, CAT-style). The aptitude module must cover **all** patterns that Indian aptitude exams test: Quantitative Aptitude, Logical Reasoning, Verbal Ability, Data Interpretation.

- Topic list, sub-patterns and quotas: `server/content/aptitude/_taxonomy.json` (62 topics, ≥ 12,350 questions). **This file is the source of truth. Never edit it.**
- Workers write raw chunks to `server/content/aptitude/_chunks/<topic-slug>/<NN>-<sub-pattern-slug>.json`.
- `node server/scripts/buildAptitude.mjs <slug>` merges chunks, validates, shuffles answer positions and writes `server/content/aptitude/<slug>.json`. Run it from the `server/` directory (or with the path as shown from the repo root).
- Do **not** run any seed script and do **not** touch the database.

## 1. Orchestration steps

1. Read `_taxonomy.json`. Make a task list with one task per topic.
2. Spawn **one worker subagent per topic**, in parallel, in waves of as many as your tool allows (aim for 10–15 at once; start the next topic as soon as one finishes). Give each worker the full text of **Section 2** below with `{{SLUG}}` replaced by the topic slug. Order of priority: tier `core` first, then `standard`, then `minor`.
3. When a worker reports done, run `node server/scripts/buildAptitude.mjs <slug>` yourself.
   - **Errors** → send the exact error output back to the same worker (SendMessage) and ask it to fix the chunk files. Repeat up to 3 rounds.
   - **Warnings about quota / sub-pattern counts / difficulty mix** → send back too; the quota is a minimum, not a suggestion.
4. When every topic is built, run `node server/scripts/buildAptitude.mjs --all` and `node server/scripts/buildAptitude.mjs --report`, then print the final table and list any topic below quota.
5. Finish. Tell the user: "Content ready in server/content/aptitude/. Next: update seed script + models + pages (see docs/APTITUDE_PLAN.md)."

## 2. WORKER PROMPT (send this to each subagent; replace {{SLUG}})

---
You are writing the question bank for the aptitude topic **`{{SLUG}}`** for an Indian placement-preparation platform. Work only in `server/content/aptitude/_chunks/{{SLUG}}/`.

### Step 1 — read the spec
Open `server/content/aptitude/_taxonomy.json` and find the topic whose `slug` is `{{SLUG}}`. Note its `title`, `category`, `minQuestions`, `minPerSubPattern`, `usesSets`, `setsRequired` and every `subPatterns[].slug`. Use those sub-pattern slugs **exactly**.

### Step 2 — write the chunks
Create **one file per sub-pattern**: `server/content/aptitude/_chunks/{{SLUG}}/NN-<sub-pattern-slug>.json` (NN = 01, 02, … in taxonomy order). Write a sub-pattern's file in 2–3 batches if it is large, but each file must be valid JSON. Cover **every** sub-pattern with at least `minPerSubPattern` questions, and the topic with at least `minQuestions` in total (more is welcome).

File format (exactly this; no comments, no trailing commas):

```json
{
  "sets": [
    { "id": "{{SLUG}}-s001", "type": "table",
      "title": "Sales of 4 products (in units)",
      "table": { "columns": ["Year", "A", "B"], "rows": [["2021", 120, 90], ["2022", 150, 110]] } }
  ],
  "questions": [
    {
      "questionText": "A number is increased by 25% and then decreased by 25%. What is the net percentage change?",
      "options": ["No change", "6.25% decrease", "6.25% increase", "12.5% decrease"],
      "correctOptionIndex": 1,
      "explanation": "Net change = a + b + ab/100 = 25 − 25 − 6.25 = −6.25%, i.e. a 6.25% decrease.",
      "shortcut": "Up x% then down x% always gives a net decrease of x²/100 %.",
      "subPattern": "successive-percentage-change",
      "difficulty": "medium",
      "examStyles": ["campus-it", "banking"],
      "setId": null
    }
  ]
}
```

Field rules:
- `options`: exactly 4 plain strings, all different, none empty. **Put the correct answer anywhere** — the build script shuffles positions. Never refer to options by letter/number ("option B", "(a)") in the question or explanation.
- `correctOptionIndex`: 0–3, index of the correct string in the array you wrote.
- `explanation`: a **worked solution** (2–5 short lines) a student can learn from — the method, not just the answer. Never "because it is correct".
- `shortcut`: optional but strongly encouraged — the fast exam-time trick (≤ 2 lines). Omit the key if there is no genuine shortcut.
- `difficulty`: `easy` (one step, ≤ 30 s) / `medium` (2–3 steps, 60–90 s) / `hard` (multi-concept, 2+ min, CAT/bank-PO level). Mix per topic ≈ **30% easy, 50% medium, 20% hard**, and roughly the same mix inside each sub-pattern.
- `examStyles`: one or more of `campus-it` (TCS/Infosys/Wipro/Cognizant/Accenture/Capgemini/HCL style), `banking` (IBPS/SBI), `ssc`, `cat-style`, `general`. This describes the *style* of the question. **Do not write that a question "appeared in" any exam or company.**
- `setId`: only for questions that depend on shared material (see below); otherwise `null` or omit.
- `subPattern`: a slug from the taxonomy.

### Sets (shared stimulus)
Any question that says "the table / the graph / the chart / the passage / the following arrangement / the information given" **must** have a `setId` pointing to a set defined in the *same file*. A learner will see the set above the question. Set `id`s must be unique across the whole topic (use `{{SLUG}}-s001`, `-s002`, …). Aim for **3–5 questions per set**. Types:
- `text` → `{ "type":"text", "title":"…", "text":"…" }` (passages, caselets, seating/puzzle conditions)
- `table` → `{ "type":"table", "table":{ "columns":[…], "rows":[[…],…] } }` (every row same length as columns)
- `bar` / `line` → `{ "type":"bar", "chart":{ "xLabel":"Year", "yLabel":"₹ crore", "series":[ { "name":"Company A", "data":[ {"label":"2021","value":40}, … ] } ] } }`
- `pie` → one series; values sum to exactly 100 (percent) or 360 (degrees).
If `setsRequired` is true for your topic, **every** question needs a set. If `usesSets` is true, the majority should.
No images: describe geometry, cubes and arrangements in words/tables so they work as text.

### Quality rules (non-negotiable)
1. **Original questions.** Write fresh questions in the *style and patterns* of Indian aptitude exams. Do **not** copy or paraphrase questions from IndiaBix, Testbook, Adda247, GeeksforGeeks, RS Aggarwal or any other book/site, and do not browse for them.
2. **Every answer must be verified by computation, not by feel.** For each numeric question, write a throw-away Python script (in your scratch/temp directory, **not** in the repo) that recomputes the answer from the numbers in the question and asserts it equals the keyed option. Run it and fix every mismatch before you finish a file. For verbal/reasoning questions, re-solve each one a second time from scratch before keeping it.
3. **Exactly one correct option.** Distractors must be plausible (common mistakes: forgetting a step, wrong formula, percentage-of-wrong-base) — never absurd, never two defensible answers.
4. **Unique questions.** No two questions with the same wording; vary the numbers, contexts and structures. Cover the *different shapes* a pattern can take in exams (direct, reverse, word problem, trap question, comparison).
5. **Indian context.** Use ₹, Indian names, cities, railways, cricket, festivals, rupee/paise, km/h, litres, kg — not dollars/miles.
6. **Clean text.** Plain text or simple Unicode (×, ÷, √, ², π, ≤, ₹). No LaTeX, no HTML, no markdown. Fractions as 3/4. Numbers with Indian grouping are fine (1,00,000).
7. **Verbal topics:** use standard Indian-English/British spelling conventions consistently; every grammar item must have an unambiguous rule behind it, and the explanation must state the rule.
8. Do not modify any file outside `server/content/aptitude/_chunks/{{SLUG}}/`.

### Step 3 — self-check and report
Run (from `server/`): `node scripts/buildAptitude.mjs {{SLUG}} --check`. Fix every ERROR. Fix quota/sub-pattern/difficulty warnings by adding questions. Do not finish until it prints no errors and no quota warnings.
Reply with ONE line: `{{SLUG}}: <total> questions, <n> sets, 0 errors`.
---

## 3. Notes for the orchestrator
- If a worker produces fewer than the quota, keep pushing it (SendMessage) rather than accepting short output.
- Do not "fix" content by lowering the quota or editing `_taxonomy.json`.
- Existing legacy files (`averages.json`, `percentage.json`, `gemoetry.json`, …) are replaced by the new `<slug>.json` outputs. Do not delete them yourself — the user will do it after reviewing.
