import mongoose from 'mongoose';

// One row per admin action worth auditing (delete, bulk-delete, update,
// role change, license generation, etc). Deliberately NOT trying to store
// a full before/after diff of every field — `metadata` holds a small,
// action-specific summary, enough to answer "who did what, when" without
// becoming a full versioning system.
const adminActionLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: [
        'problem_create',
        'problem_update',
        'problem_delete',
        'problem_bulk_delete',
        'problem_restore',
        'bulk_import',
        // --- added for the Admin Console expansion (Users + Licenses) ---
        'user_role_update',
        'user_pro_toggle',
        'license_generate',
      ],
      required: true,
      index: true,
    },
    targetType: { type: String, enum: ['Problem', 'User', 'License'], required: true },
    // Single-target actions set targetId; bulk actions (bulk-delete,
    // license generate) leave it null and put affected ids/keys in
    // metadata instead.
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminActionLogSchema.index({ createdAt: -1 });

export const AdminActionLog = mongoose.model('AdminActionLog', adminActionLogSchema);
