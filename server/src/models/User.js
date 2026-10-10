import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ACCENTS, THEMES, DENSITIES, FONT_SCALES, CONTRASTS, MOTION, EDITOR_THEMES, LANGUAGES, DEFAULT_PREFERENCES as D } from '../config/preferences.js';

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

    // Multi-device / multi-tab refresh sessions. Each login or refresh pushes
    // a new entry; a rotated entry is kept for a short grace window
    // (graceUntil) so two concurrent refreshes carrying the same cookie
    // (React StrictMode double-boot, two tabs reloading together, a flaky
    // network retry) don't invalidate each other and log the user out.
    // `refreshTokenHash` above is kept only so sessions issued before this
    // change keep working until their next refresh.
    refreshSessions: {
      type: [
        {
          _id: false,
          hash: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          graceUntil: { type: Date, default: null },
          // Device info shown on Settings -> Sessions. loginAt survives
          // rotation (createdAt does not — it is the last refresh).
          userAgent: { type: String, default: '' },
          ip: { type: String, default: null },
          loginAt: { type: Date, default: null },
          lastUsedAt: { type: Date, default: null },
        },
      ],
      select: false,
      default: [],
    },

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

    // --- Public profile (Settings -> Public profile) ---
    bio: { type: String, trim: true, maxlength: 160, default: '' },
    location: { type: String, trim: true, maxlength: 60, default: '' },
    company: { type: String, trim: true, maxlength: 60, default: '' }, // college or company
    website: { type: String, trim: true, maxlength: 200, default: '' },
    socials: {
      github: { type: String, trim: true, maxlength: 39, default: '' },
      linkedin: { type: String, trim: true, maxlength: 100, default: '' },
      x: { type: String, trim: true, maxlength: 15, default: '' },
      leetcode: { type: String, trim: true, maxlength: 40, default: '' },
    },

    // --- Preferences (Settings -> Appearance / Accessibility / Editor / Notifications) ---
    // Validated by config/preferences.js; the enums here are a second line of defence.
    preferences: {
      appearance: {
        theme: { type: String, enum: THEMES, default: D.appearance.theme },
        accent: { type: String, enum: ACCENTS, default: D.appearance.accent },
        density: { type: String, enum: DENSITIES, default: D.appearance.density },
        fontScale: { type: String, enum: FONT_SCALES, default: D.appearance.fontScale },
        contrast: { type: String, enum: CONTRASTS, default: D.appearance.contrast },
        // null until the user saves appearance once — lets the client tell
        // "never chose" from "chose the default" and not clobber a visitor's
        // local theme with the server default after login.
        syncedAt: { type: Date, default: null },
      },
      accessibility: {
        reduceMotion: { type: String, enum: MOTION, default: D.accessibility.reduceMotion },
        underlineLinks: { type: Boolean, default: D.accessibility.underlineLinks },
      },
      editor: {
        fontSize: { type: Number, min: 10, max: 28, default: D.editor.fontSize },
        tabSize: { type: Number, enum: [2, 4, 8], default: D.editor.tabSize },
        wordWrap: { type: Boolean, default: D.editor.wordWrap },
        minimap: { type: Boolean, default: D.editor.minimap },
        lineNumbers: { type: Boolean, default: D.editor.lineNumbers },
        ligatures: { type: Boolean, default: D.editor.ligatures },
        autoClose: { type: Boolean, default: D.editor.autoClose },
        theme: { type: String, enum: EDITOR_THEMES, default: D.editor.theme },
        defaultLanguage: { type: String, enum: LANGUAGES, default: D.editor.defaultLanguage },
      },
      notifications: {
        streakReminder: { type: Boolean, default: D.notifications.streakReminder },
        weeklyDigest: { type: Boolean, default: D.notifications.weeklyDigest },
        achievements: { type: Boolean, default: D.notifications.achievements },
        productUpdates: { type: Boolean, default: D.notifications.productUpdates },
        reminderTime: { type: String, default: D.notifications.reminderTime },
        timezone: { type: String, default: D.notifications.timezone },
      },
    },

    // --- Security log (Settings -> Security log). Newest last, capped at 50 by securityLog.service ---
    securityLog: {
      type: [
        {
          _id: false,
          type: { type: String, required: true },
          detail: { type: String, default: '' },
          at: { type: Date, default: Date.now },
          ip: { type: String, default: null },
          userAgent: { type: String, default: '' },
        },
      ],
      select: false,
      default: [],
    },
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
    bio: this.bio || '',
    location: this.location || '',
    company: this.company || '',
    website: this.website || '',
    socials: {
      github: this.socials?.github || '',
      linkedin: this.socials?.linkedin || '',
      x: this.socials?.x || '',
      leetcode: this.socials?.leetcode || '',
    },
    providers: { google: !!this.googleId, github: !!this.githubId, linkedin: !!this.linkedinId },
    preferences: this.toObject().preferences,
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
