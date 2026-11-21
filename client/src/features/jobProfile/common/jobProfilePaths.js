// The signed-in member's own (editable) Job profile, and another member's read-only profile.
export const OWN_JOB_PROFILE_PATH = '/job-profile';
export const jobProfilePathOf = (userId) => `${OWN_JOB_PROFILE_PATH}/${userId}`;

// The full address of a member's profile, for sharing and for the contact info.
export const profileUrlOf = (userId) => `${window.location.origin}${jobProfilePathOf(userId)}`;
