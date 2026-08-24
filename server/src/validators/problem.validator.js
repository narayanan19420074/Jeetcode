import { z } from 'zod';

const testCaseSchema = z.object({
  stdin: z.string(),
  expectedOutput: z.string(),
  isSample: z.boolean().default(false),
});

const exampleSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string().optional(),
});

const codeMapSchema = z.object({
  javascript: z.string().min(1),
  python: z.string().min(1),
  cpp: z.string().min(1),
});

const TYPE_ENUM = z.enum(['int', 'float', 'string', 'bool', 'int[]', 'float[]', 'string[]', 'bool[]', 'int[][]']);

const paramSchema = z.object({
  name: z.string().min(1),
  type: TYPE_ENUM,
});

const baseProblemSchema = z.object({
  title: z.string().trim().min(3).max(150),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  tags: z.array(z.string()).default([]),
  companies: z.array(z.string()).default([]),
  description: z.string().min(10),
  examples: z.array(exampleSchema).min(1),
  constraints: z.array(z.string()).default([]),
  testCases: z.array(testCaseSchema).min(1),
  isPublished: z.boolean().default(false),

  // Path A — spec-based (preferred, scales to hundreds of problems):
  // supply the function signature, driver/starter code auto-generates.
  functionName: z.string().min(1).optional(),
  params: z.array(paramSchema).optional(),
  returnType: TYPE_ENUM.optional(),

  // Path B — manual override, required for custom structures
  // (linked lists, trees) the auto-generator doesn't support.
  starterCode: codeMapSchema.optional(),
  driverCode: codeMapSchema.optional(),
});

function refineAuthoringPath(schema) {
  return schema.superRefine((data, ctx) => {
    const hasSpec = data.functionName && data.params?.length && data.returnType;
    const hasManual = data.starterCode && data.driverCode;
    if (!hasSpec && !hasManual) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Provide either { functionName, params, returnType } for auto-generated code, or both { starterCode, driverCode } manually.',
        path: ['functionName'],
      });
    }
  });
}

export const createProblemSchema = refineAuthoringPath(baseProblemSchema);

// Partial updates skip the authoring-path refinement — a PATCH may only
// touch e.g. `tags`, and shouldn't be forced to re-supply the full spec.
export const updateProblemSchema = baseProblemSchema.partial();

export const listProblemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
});
