import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema(
  {
    passed: Boolean,
    stdin: String,
    expectedOutput: String,
    actualOutput: String,
    stderr: String,
    time: String, // seconds, as returned by Judge0
    memory: Number, // KB, as returned by Judge0
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    language: { type: String, enum: ['javascript', 'python', 'cpp'], required: true },
    code: { type: String, required: true },

    // 'run' = sample test cases only, not persisted to solve stats.
    // 'submit' = full hidden test-case suite, counts toward acceptance.
    mode: { type: String, enum: ['run', 'submit'], required: true, index: true },

    status: {
      type: String,
      enum: [
        'Pending',
        'Judging',
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Runtime Error',
        'Compilation Error',
        'Internal Error',
      ],
      default: 'Pending',
      index: true,
    },

    runtimeMs: { type: Number, default: null },
    memoryKb: { type: Number, default: null },
    testResults: [testResultSchema],
    passedCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },

    // Judge0 batch tokens, kept until judging completes — lets the worker
    // resume polling after a restart instead of losing in-flight jobs.
    judge0Tokens: [{ type: String }],
  },
  { timestamps: true }
);

// Submission history for a user, most recent first — the Dashboard's
// primary query.
submissionSchema.index({ user: 1, createdAt: -1 });
// "Has this user solved this problem?" lookups.
submissionSchema.index({ user: 1, problem: 1, status: 1 });

export const Submission = mongoose.model('Submission', submissionSchema);
