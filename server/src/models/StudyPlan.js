import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

// Short, unambiguous invite code used in the share link: /plans/join/<code>
const makeShareCode = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 10);

// One task inside a plan. `day` is 1-based (Day 1 = plan.startDate).
// problem / aptitude items are completed AUTOMATICALLY from the user's real
// solve data (User.solvedProblems / AptitudeQuestionProgress) — nothing is
// stored per user for them. Only 'custom' items (e.g. "Revise DP notes") are
// ticked manually and live in StudyPlanProgress.
const itemSchema = new mongoose.Schema({
  day: { type: Number, required: true, min: 1, max: 90 },
  order: { type: Number, default: 0 },
  type: { type: String, enum: ['problem', 'aptitude', 'custom'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', null], default: null },

  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', default: null },
  problemSlug: { type: String, default: null },

  aptitudeQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion', default: null },
  patternSlug: { type: String, default: null },
});

const studyPlanSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300, default: '' },

    // Date-only (UTC midnight) — represents the calendar day the user picked,
    // independent of timezone. "Today" is resolved with the client's tz offset.
    startDate: { type: Date, required: true },
    durationDays: { type: Number, required: true, min: 1, max: 90 },

    items: { type: [itemSchema], default: [] },

    shareCode: { type: String, unique: true, index: true, default: () => makeShareCode() },

    // Owner is always members[0]. Every member shares the same items but has
    // their own progress.
    members: {
      type: [
        new mongoose.Schema(
          {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            joinedAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

studyPlanSchema.index({ 'members.user': 1, createdAt: -1 });

export const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);
export const MAX_PLAN_MEMBERS = 20;
