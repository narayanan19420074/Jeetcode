import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // Not required for OAuth-only accounts (Google/GitHub/LinkedIn sign-in
    // never sets a password). Required only when the user has no provider
    // id at all — i.e. classic email+password signup.
    passwordHash: {
      type: String,
      select: false,
      required: function () {
        return !this.googleId && !this.githubId && !this.linkedinId;
      },
    },

    // --- OAuth provider ids ---
    // unique + sparse: many users will have none of these, and `sparse`
    // means Mongo only enforces uniqueness among documents where the field
    // actually exists — so multiple password-only users (no googleId at
    // all) don't collide on a shared "null".
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    linkedinId: { type: String, unique: true, sparse: true },
    avatarUrl: { type: String, default: null },

    // 'learner' = default signup role. 'contributor' = can propose problems
    // (draft/submitted, cannot publish). 'moderator' = can review/approve
    // contributor submissions. 'admin' = full access, including
    // destructive actions (delete/bulk-delete) — see requireFreshRole in
    // auth.middleware.js.
    role: { type: String, enum: ['learner', 'contributor', 'moderator', 'admin'], default: 'learner', index: true },

    // Hash of the currently-valid refresh token. Rotated on every refresh,
    // cleared on logout — lets us revoke a stolen refresh token server-side
    // without maintaining a full session store.
    refreshTokenHash: { type: String, select: false, default: null },

    // --- Pro / license status ---
    // Denormalized here (rather than always joining License/CompanyProgress
    // collections) because "is this user Pro" is checked on nearly every
    // gated request (checkProAccess middleware) — one flag read beats a
    // lookup on every problem list/detail fetch. The License collection
    // (see License.js) remains the source of truth / audit trail for HOW
    // a user became Pro (Razorpay subscription vs. a redeemed license key);
    // this field is just the fast-path cache of that state.
    isPro: { type: Boolean, default: false },
    proExpiresAt: { type: Date, default: null }, // null = no expiry (e.g. a lifetime license key)
    proPlan: { type: String, enum: ['monthly', 'yearly', 'license-key', null], default: null },

    // --- Progress / streak counters ---
    // Denormalized on the user doc (rather than aggregated from Submissions
    // on every dashboard load) because dashboard reads vastly outnumber
    // submission writes at this platform's expected scale. Updated
    // transactionally by submissionService whenever a submission is judged.
    streakDays: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: null }, // date-only granularity (UTC midnight)

    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },

    // Problem ids the user has an Accepted submission for — a Set-like
    // array kept unique via $addToSet, used to make "solved" idempotent
    // (re-solving a problem must not double-increment the counters above).
    solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],

    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function (plain) {
  // OAuth-only accounts have no passwordHash — treat as "never matches"
  // instead of letting bcrypt.compare throw on an undefined hash.
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    handle: this.handle,
    email: this.email,
    role: this.role,
    avatarUrl: this.avatarUrl,
    isPro: this.isPro,
    proExpiresAt: this.proExpiresAt,
    proPlan: this.proPlan,
    streakDays: this.streakDays,
    longestStreak: this.longestStreak,
    easySolved: this.easySolved,
    mediumSolved: this.mediumSolved,
    hardSolved: this.hardSolved,
    totalSolved: this.easySolved + this.mediumSolved + this.hardSolved,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
