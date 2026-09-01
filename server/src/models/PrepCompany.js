import mongoose from 'mongoose';

// A company references sections by id, with its OWN order/timing/weight —
// the same PrepSection ("Verbal Ability") can carry a 15% weight in one
// company's exam and a 5% weight in another's, without touching the
// shared section content itself.
const sectionRefSchema = new mongoose.Schema(
  {
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'PrepSection', required: true },
    order: { type: Number, required: true },
    minutes: { type: Number, default: null }, // exam-day time allotted — display only
    questionCount: { type: Number, default: null }, // exam-day question count — display only
    weight: { type: Number, required: true, min: 0, max: 100 }, // this section's share of the readiness score
  },
  { _id: false }
);

const prepCompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    logoUrl: { type: String, default: null },
    examDurationMinutes: { type: Number, default: null },
    description: { type: String, default: '' },
    sections: {
      type: [sectionRefSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'A company prep track needs at least one section',
      },
    },
    isPublished: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

prepCompanySchema.index({ isPublished: 1 });

// NOTE for whoever authors company tracks (admin UI or seed script):
// section weights are expected to sum to 100, but this isn't enforced at
// the schema level — a track can be deliberately left partially weighted
// while under construction, same authoring convention as Problem's
// harness-generation contract (valid-but-incomplete is allowed pre-publish).

export const PrepCompany = mongoose.model('PrepCompany', prepCompanySchema);
