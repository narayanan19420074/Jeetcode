import { User } from '../../models/User.js';

/** Turns "jane.doe+test@gmail.com" into a candidate handle "janedoetest" —
 * matches the User model's handle regex (^[a-z0-9_]+$, 3-30 chars). */
function slugifyHandleBase(email) {
  const stripped = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
  const base = stripped.length >= 3 ? stripped : `user${stripped}`;
  return base.slice(0, 24);
}

/** Appends a numeric suffix until the handle is free. Bounded loop — a
 * true infinite collision run is effectively impossible at this scale,
 * the cap just guards against an unexpected bug looping forever. */
async function generateUniqueHandle(email) {
  const base = slugifyHandleBase(email);
  let candidate = base;
  let suffix = 0;

  while (await User.findOne({ handle: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`.slice(0, 30);
    if (suffix > 50) throw new Error('Could not generate a unique handle after 50 attempts');
  }
  return candidate;
}

/**
 * Finds a user by this OAuth provider's id. If none exists, falls back to
 * linking by verified email (so someone who signed up with a password can
 * later sign in with Google/GitHub using the same email address). If
 * neither exists, creates a brand-new user.
 *
 * `providerField` is generic ('googleId' | 'githubId' | 'linkedinId') so
 * every provider's controller calls this exact same function — adding
 * GitHub or LinkedIn later means writing a verify function, not a second
 * copy of this find-or-create logic.
 */
export async function findOrCreateOAuthUser({ providerField, providerId, email, name, avatarUrl }) {
  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({ [providerField]: providerId });
  if (user) return user;

  user = await User.findOne({ email: normalizedEmail });
  if (user) {
    user[providerField] = providerId;
    if (!user.avatarUrl && avatarUrl) user.avatarUrl = avatarUrl;
    await user.save();
    return user;
  }

  const handle = await generateUniqueHandle(normalizedEmail);
  user = await User.create({
    name: name || handle,
    handle,
    email: normalizedEmail,
    avatarUrl: avatarUrl || null,
    [providerField]: providerId,
    // passwordHash intentionally omitted — User schema only requires it
    // when the user has no OAuth provider id at all (see User.js).
  });
  return user;
}
