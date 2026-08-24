import { z } from 'zod';

// This is the schema for the human-authored JSON files (server/content/problems/*.json)
// — deliberately simpler than the API's createProblemSchema: test cases
// use native JS values (args/expected) instead of pre-stringified
// stdin/expectedOutput, which importProblems.js converts automatically.

const TYPE_ENUM = z.enum(['int', 'float', 'string', 'bool', 'int[]', 'float[]', 'string[]', 'bool[]', 'int[][]']);

const paramSchema = z.object({
  name: z.string().min(1),
  type: TYPE_ENUM,
});

const exampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

// args: the exact argument list the function will be called with, e.g.
// [[2,7,11,15], 9] for twoSum(nums, target). expected: the return value.
const authoredTestCaseSchema = z.object({
  args: z.array(z.any()).min(1),
  expected: z.any(),
  isSample: z.boolean().default(false),
});

const codeMapSchema = z.object({
  javascript: z.string().min(1),
  python: z.string().min(1),
  cpp: z.string().min(1),
});

export const authoredProblemSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']),
    tags: z.array(z.string()).default([]),
    companies: z.array(z.string()).default([]),
    description: z.string().min(10),
    examples: z.array(exampleSchema).min(1),
    constraints: z.array(z.string()).default([]),
    testCases: z.array(authoredTestCaseSchema).min(1),
    isPublished: z.boolean().default(true),

    // Path A — spec-based (use this for ~90% of problems)
    functionName: z.string().min(1).optional(),
    params: z.array(paramSchema).optional(),
    returnType: TYPE_ENUM.optional(),

    // Path B — manual override for custom structures the generator can't
    // express (linked lists, trees, graphs)
    starterCode: codeMapSchema.optional(),
    driverCode: codeMapSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const hasSpec = data.functionName && data.params?.length && data.returnType;
    const hasManual = data.starterCode && data.driverCode;
    if (!hasSpec && !hasManual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide either {functionName, params, returnType} or both {starterCode, driverCode}.',
        path: ['functionName'],
      });
    }
    if (!data.testCases.some((tc) => tc.isSample)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one test case must have isSample: true (shown to the learner before they submit).',
        path: ['testCases'],
      });
    }
  });
