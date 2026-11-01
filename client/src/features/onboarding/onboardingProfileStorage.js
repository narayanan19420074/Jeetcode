const STORAGE_KEY = 'jeetcode.onboarding.profile';

// Prototype storage. A real version would save the profile to the learner's account.
// Reads and writes are wrapped because storage can be blocked (private windows, site data settings).
export function saveOnboardingProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // The learner can still continue; they will simply see onboarding again next time.
  }
}

export function hasCompletedOnboarding() {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return true;
  }
}
