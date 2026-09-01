import mongoose from 'mongoose';

const externalResourceSchema = new mongoose.Schema(
  { label: { type: String, required: true }, url: { type: String, required: true } },
  { _id: false }
);

// A PrepSection is company-agnostic content — "Quantitative Aptitude",
// "Advanced Coding", "Verbal Ability". Multiple PrepCompany docs can
// reference the SAME section (e.g. TCS NQT and a future Infosys track
// both pointing at the same "Verbal Ability" section) — this is the
// decentralization Santos asked for: build a section once, reuse it
// across every company track that needs it, instead of duplicating
// content per company.
const prepSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    description: { type: String, default: '' },

    // Single discriminant deciding what Learn/Practice/Test resolve to —
    // avoids a section ending up half-configured with contradictory
    // optional fields set.
    contentType: {
      type: String,
      enum: ['aptitude-pattern', 'learn-topic', 'problem-filter', 'external-only'],
      required: true,
    },

    // contentType: 'aptitude-pattern' — deep-links into the existing
    // Aptitude feature (its own unlock chain, patterns, tests stay
    // authoritative there; this is a pointer, not a duplicate). Null =
    // link to the whole /aptitude section rather than one specific
    // pattern.
    aptitudePatternSlug: { type: String, default: null },

    // contentType: 'learn-topic' — deep-links into the existing (static,
    // non-DB) /learn content for the "Learn" step. That feature has no
    // backend progress API yet, so sections of this type never
    // contribute to the readiness score — they're a resource link, not a
    // tracked metric, until /learn grows one.
    learnTopicSlug: { type: String, default: null },

    // contentType: 'problem-filter' — Practice/Test both draw from the
    // Problem collection via this filter. Progress = how many matching
    // problems are in the user's solvedProblems (see prep.controller.js).
    problemFilter: {
      tags: [{ type: String }],
      companies: [{ type: String }],
      difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', null], default: null },
    },

    // Practice-target for trackable section types (aptitude-pattern isn't
    // trackable yet either, but the field stays here so it's ready once
    // that integration lands).
    recommendedTarget: { type: Number, default: 0 },

    // Shown regardless of contentType — e.g. a GFG verbal-ability guide
    // sitting alongside an internal problem-filter for practice.
    externalResources: [externalResourceSchema],

    isPublished: { type: Boolean, default: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const PrepSection = mongoose.model('PrepSection', prepSectionSchema);
