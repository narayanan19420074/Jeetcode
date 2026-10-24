import mongoose from 'mongoose';

// A community solution = an Accepted submission the author chose to share,
// plus a title and optional markdown write-up. Code/language/runtime are
// copied from the submission server-side, never trusted from the client.
const solutionSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true, unique: true },

    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    content: { type: String, default: '', maxlength: 10000 }, // markdown
    excerpt: { type: String, default: '', maxlength: 200 }, // plain-text preview for list cards

    language: { type: String, enum: ['javascript', 'python', 'cpp', 'java'], required: true },
    code: { type: String, required: true, maxlength: 20000 },
    codePreview: { type: String, default: '', maxlength: 600 }, // first lines, for feed cards
    runtimeMs: { type: Number, default: null },
    memoryKb: { type: Number, default: null },

    score: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

solutionSchema.index({ problem: 1, score: -1, createdAt: -1 });
solutionSchema.index({ problem: 1, createdAt: -1 });

export const Solution = mongoose.model('Solution', solutionSchema);
