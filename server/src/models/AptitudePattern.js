import mongoose from 'mongoose';

// A "pattern" is a category card on the Aptitude home page (e.g. "Percentages",
// "Time & Work"). `order` defines the unlock chain: pattern with order:1 is
// always open; pattern N unlocks only once AptitudeProgress for pattern N-1
// shows bestScore >= that pattern's passPercentage. See aptitude.service.js.
const aptitudePatternSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    description: { type: String, default: '' },
    order: { type: Number, required: true, index: true },

    // Denormalized — kept in sync by the admin controller whenever a
    // question under this pattern is created/deleted/published, same
    // reasoning as Problem.totalSubmissions (avoid a COUNT(*) on every
    // patterns-list render).
    totalQuestions: { type: Number, default: 0 },

    // Editable per pattern (default 70%) — NOT a hardcoded global constant,
    // so an admin can make a pattern stricter/looser later.
    passPercentage: { type: Number, default: 70, min: 0, max: 100 },

    // Test mode duration. Server sets AptitudeAttempt.expiresAt from this
    // at start-attempt time — never trust a client-supplied duration.
    timeLimitMinutes: { type: Number, default: 20, min: 1 },

    isPublished: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Home page's default query: published patterns in sequence order.
aptitudePatternSchema.index({ isPublished: 1, order: 1 });

export const AptitudePattern = mongoose.model('AptitudePattern', aptitudePatternSchema);
