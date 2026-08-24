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
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['learner', 'admin'], default: 'learner', index: true },

    // Hash of the currently-valid refresh token. Rotated on every refresh,
    // cleared on logout — lets us revoke a stolen refresh token server-side
    // without maintaining a full session store.
    refreshTokenHash: { type: String, select: false, default: null },

    // --- Pro subscription (Razorpay) ---
    // isPro is the fast-path flag most reads check. proExpiresAt is the
    // safety net: even if a cancel/charge-failure webhook is ever missed,
    // checkProAccess.middleware.js treats an expired date as no access
    // regardless of what isPro says, so access can't get stuck "on".
    isPro: { type: Boolean, default: false, index: true },
    proPlan: { type: String, enum: ['monthly', 'yearly', null], default: null },
    proExpiresAt: { type: Date, default: null },
    // Internal billing IDs — never exposed via toPublicJSON, select: false
    // like the token-hash fields above so a stray `User.find()` elsewhere
    // in the app doesn't accidentally leak them either.
    razorpayCustomerId: { type: String, default: null, select: false },
    razorpaySubscriptionId: { type: String, default: null, select: false },

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
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    handle: this.handle,
    email: this.email,
    role: this.role,
    isPro: this.isPro,
    proPlan: this.proPlan,
    proExpiresAt: this.proExpiresAt,
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
