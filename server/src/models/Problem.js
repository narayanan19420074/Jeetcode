import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema(
  { input: String, output: String, explanation: String },
  { _id: false }
);

// A test case is judged by stdin/stdout comparison, exactly like Judge0
// expects: `stdin` is fed to the compiled program, its stdout is diffed
// against `expectedOutput` (after trim/whitespace normalization).
const testCaseSchema = new mongoose.Schema(
  {
    stdin: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isSample: { type: Boolean, default: false }, // shown to the user before submit
  },
  { _id: true }
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true, index: true },
    tags: [{ type: String, index: true }],
    companies: [{ type: String }],
    description: { type: String, required: true },
    examples: [exampleSchema],
    constraints: [{ type: String }],

    // --- Auto-generation spec (preferred authoring path for the ~300-problem
    // content pipeline) ---
    // Declare the function signature once; starterCode + driverCode for all
    // 3 languages are generated from this at creation time by
    // harnessGenerator.service.js. Only problems needing custom structures
    // (linked lists, trees, graphs) need to skip this and supply
    // starterCode/driverCode manually below instead.
    functionName: { type: String, trim: true },
    params: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ['int', 'float', 'string', 'bool', 'int[]', 'float[]', 'string[]', 'bool[]', 'int[][]'],
          required: true,
        },
        _id: false,
      },
    ],
    returnType: {
      type: String,
      enum: ['int', 'float', 'string', 'bool', 'int[]', 'float[]', 'string[]', 'bool[]', 'int[][]'],
    },

    // Editable starter code shown in the editor per language. Auto-filled
    // from functionName/params if not supplied explicitly.
    starterCode: {
      javascript: { type: String },
      python: { type: String },
      cpp: { type: String },
    },

    // The harness: full compilable program per language with a
    // `/*__USER_CODE__*/` placeholder. Auto-generated from
    // functionName/params/returnType for standard signatures; supply this
    // explicitly (and skip functionName/params) for problems needing
    // custom data structures the generator doesn't support.
    // This is what makes hidden test cases meaningful instead of
    // trivially bypassable — the user's code only ever fills one slot
    // inside an admin-controlled program, never runs standalone.
    driverCode: {
      javascript: { type: String },
      python: { type: String },
      cpp: { type: String },
    },

    testCases: {
      type: [testCaseSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'A problem must have at least one test case',
      },
    },

    // Denormalized acceptance-rate counters, updated by submissionService
    // via $inc — avoids a COUNT(*) aggregation over Submissions on every
    // problem list render.
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },

    isPublished: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Converted to async hook syntax: throwing errors directly instead of relying on callback next()
problemSchema.pre('validate', async function () {
  const hasSpec = this.functionName && this.params?.length && this.returnType;
  const hasManualDriver = this.driverCode?.javascript && this.driverCode?.python && this.driverCode?.cpp;
  const hasManualStarter = this.starterCode?.javascript && this.starterCode?.python && this.starterCode?.cpp;

  if (!hasSpec && !(hasManualDriver && hasManualStarter)) {
    throw new Error(
      'A problem needs either { functionName, params, returnType } for auto-generated code, or full manual { starterCode, driverCode } for all 3 languages.'
    );
  }
});

// Compound index: the Problem Explorer's default query is
// "published problems, filtered by difficulty, sorted by recency."
problemSchema.index({ isPublished: 1, difficulty: 1, createdAt: -1 });
// Text index powers the search box without a separate search service.
problemSchema.index({ title: 'text', tags: 'text' });

problemSchema.virtual('acceptanceRate').get(function () {
  if (!this.totalSubmissions) return 0;
  return Math.round((this.acceptedSubmissions / this.totalSubmissions) * 1000) / 10;
});

// Company-tagged problems are the Pro-gated set (LeetCode Premium style).
// Deliberately derived from existing `companies` data rather than a new
// `isPremium` boolean field — the ~300 already-imported problems get
// correct gating for free, no migration script needed.
problemSchema.virtual('isPremium').get(function () {
  return Boolean(this.companies && this.companies.length > 0);
});

problemSchema.set('toJSON', { virtuals: true });

// Public list/detail views should never leak hidden test cases or the
// driver harness (that would let anyone read the anti-cheat wrapper and
// the full hidden-input answer key). Controllers use this instead of
// raw `.find()`.
problemSchema.statics.publicProjection = function () {
  return '-testCases.expectedOutput -driverCode -__v';
};

export const Problem = mongoose.model('Problem', problemSchema);
