import mongoose from 'mongoose';

// One row per admin action worth auditing (delete, bulk-delete, update,
// role change, etc). Deliberately NOT trying to store a full before/after
// diff of every field — that turns into a second copy of every model.
// `metadata` holds a small, action-specific summary (e.g. { slug, title }
// for a problem delete, or { count, slugs } for a bulk-delete) — enough to
// answer "who deleted what, when" without becoming a versioning system.
const adminActionLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: ['problem_create', 'problem_update', 'problem_delete', 'problem_bulk_delete', 'problem_restore', 'bulk_import'],
      required: true,
      index: true,
    },
    targetType: { type: String, enum: ['Problem'], required: true },
    // Single-target actions set targetId; bulk actions leave it null and
    // put the affected ids in metadata instead (avoids an unbounded array
    // on every log row for a 500-problem bulk delete).
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminActionLogSchema.index({ createdAt: -1 });

export const AdminActionLog = mongoose.model('AdminActionLog', adminActionLogSchema);
