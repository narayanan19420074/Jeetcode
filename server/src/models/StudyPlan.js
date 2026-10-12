import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

// Short, unambiguous invite code used in the share link.
const makeShareCode = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 10);

// One scheduled question. `date` is a calendar day stored at UTC midnight (the
// day the learner picked on the calendar, independent of timezone).
// Completion is NEVER stored: it is derived from the user's real solve data
// (User.solvedProblems / AptitudeQuestionProgress), so it can't be faked and
// editing a plan never loses anyone's progress.
const itemSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  order: { type: Number, default: 0 },
  type: { type: String, enum: ['problem', 'aptitude'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },

  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', default: null },
  problemSlug: { type: String, default: null },

  aptitudeQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'AptitudeQuestion', default: null },
  patternSlug: { type: String, default: null },
});

const studyPlanSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    items: { type: [itemSchema], default: [] },

    shareCode: { type: String, unique: true, index: true, default: () => makeShareCode() },

    // Owner is always a member. Everyone shares the schedule but has their own progress.
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
export const MAX_PLAN_ITEMS = 200;
