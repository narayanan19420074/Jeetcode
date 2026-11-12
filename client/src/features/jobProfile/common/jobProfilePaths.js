// The signed-in member's own (editable) Job profile, and another member's read-only profile.
export const OWN_JOB_PROFILE_PATH = '/job-profile';
export const jobProfilePathOf = (userId) => `${OWN_JOB_PROFILE_PATH}/${userId}`;
