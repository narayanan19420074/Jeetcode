# Adding Problems at Scale — Authoring Guide

You do NOT hand-write driver code per problem anymore. For ~90% of problems (anything taking numbers/strings/arrays in, returning one back), you write a ~20-line JSON file declaring the function signature, and the system generates working, tested JavaScript + Python + C++ judging code for you.

## The format

One JSON file per problem in `server/content/problems/`. See the two working examples already there:

- **`maximum-subarray.json`** — the pattern for ~90% of your problems (spec-based, auto-generated harness)
- **`reverse-linked-list.json`** — the pattern for problems needing custom structures (manual harness)

### Path A: Spec-based (use this by default)

```json
{
  "title": "Maximum Subarray",
  "difficulty": "Medium",
  "tags": ["Array", "Dynamic Programming"],
  "companies": ["Amazon", "Microsoft"],
  "description": "Given an integer array `nums`, find the subarray with the largest sum...",
  "examples": [
    { "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "..." }
  ],
  "constraints": ["1 <= nums.length <= 10^5"],

  "functionName": "maxSubArray",
  "params": [{ "name": "nums", "type": "int[]" }],
  "returnType": "int",

  "testCases": [
    { "args": [[-2,1,-3,4,-1,2,1,-5,4]], "expected": 6, "isSample": true },
    { "args": [[1]], "expected": 1, "isSample": true },
    { "args": [[5,4,-1,7,8]], "expected": 23, "isSample": false }
  ],

  "isPublished": true
}
```

That's the whole file. `functionName` + `params` + `returnType` is enough — starter code and full driver programs for all 3 languages generate automatically and are verified to work (see "How this was tested" below).

**Supported types** for `params[].type` and `returnType`:
`int`, `float`, `string`, `bool`, `int[]`, `float[]`, `string[]`, `bool[]`, `int[][]`

This covers the large majority of Easy/Medium array, string, and math problems — probably 80-90% of a typical 300-problem set.

**`testCases[].args`** is the exact argument list, in order, matching `params`. `expected` is the return value. Both are plain JSON — write them the way you'd write them in any language, no escaping needed.

**Always include at least 2 `isSample: true`** cases (shown to the learner before they submit) and a handful of hidden ones (`isSample: false`) covering edge cases — empty input, single element, negative numbers, duplicates, max size.

### Path B: Manual override (structures the generator can't express)

For linked lists, trees, graphs, or anything not in the supported types list, write `starterCode` and `driverCode` by hand instead of `functionName`/`params`/`returnType`. Copy `reverse-linked-list.json` as your starting point — the pattern is: parse the same JSON-array stdin format yourself, convert to your structure, call the user's function, convert the result back, print it the same way (`JSON.stringify`-style, no spaces).

You'll need this for maybe 10-20% of a real interview-prep problem set (anything tagged Linked List, Tree, Graph, Trie).

## Importing

```bash
cd server
npm run import:problems                    # imports everything in content/problems/
npm run import:problems -- path/to/other/folder   # or point at a different folder
```

Safe to re-run — matches by title (slug), updates existing problems instead of duplicating. Output tells you exactly what was created/updated/failed and why.

## Workflow for producing 300 problems

1. **Batch by type.** Do all your straightforward array/string/number problems first (Path A) — that's the fast 80%. Save linked-list/tree/graph problems (Path B) for a separate pass since they take longer per problem.
2. **Write one problem, import it, solve it yourself in the actual Workspace UI** before mass-producing more — catches format mistakes early instead of discovering them across 50 files at once.
3. **Organize files however you like** — `content/problems/easy/`, `content/problems/arrays/`, one giant `content/problems/all.json` array — the importer reads any `.json` file, whether it's one object or an array of objects, from the folder you point it at.
4. **Original content only.** Don't copy problem statements verbatim from LeetCode or other platforms — write your own problem descriptions and examples, even for well-known classic problems (Two Sum, Maximum Subarray, etc. are generic algorithmic concepts; the specific wording of a problem statement is what's copyrightable). Rephrasing in your own words is the safe, correct approach here — not a workaround.

## How this was tested

Every code path in the generator was actually compiled and run (not just eyeballed) before being shipped:
- Two Sum (`int[], int -> int[]`) — all 3 languages, 4 test cases
- Valid Parentheses (`string -> bool`) — all 3 languages, 3 test cases including the empty-stack edge case
- A stress-test signature (`int[][], float, string[] -> float`) — caught and fixed a real bug where Python's `json.dumps(28.0)` prints `"28.0"` but JS/C++ print `"28"`; the Python driver now normalizes to match
- Maximum Subarray — all 3 languages, including the all-negative-numbers edge case
- Reverse Linked List (manual path) — all 3 languages, including the empty-list edge case

If you add a problem and something's off, the most likely causes: a test case's `expected` value doesn't actually match what a correct solution produces (double-check by hand), or a param type doesn't match what your `starterCode`/driver actually expects.

## What's NOT supported (needs Path B or isn't possible yet)

- Multiple return values / tuples beyond a single array
- Custom class parameters (only linked-list/tree-style single-structure returns via manual driverCode)
- Floating-point output requiring more than ~6 significant digits of precision (C++'s default formatter limits this — round test case `expected` values to 1-2 decimal places for float-returning problems)
