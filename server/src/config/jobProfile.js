// Shared limits and allowed values for the Job profile. The model, the validator and the
// client forms all follow these, so a value accepted by one is never rejected by another.

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship'];
export const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];

// Dates are stored as "YYYY-MM": a month is the precision recruiters read and what <input type="month"> returns.
export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const JOB_PROFILE_LIMITS = {
  headline: 220,
  about: 2000,
  shortText: 100,
  grade: 40,
  description: 1000,
  credentialId: 80,
  credentialUrl: 300,
  skillName: 40,
  maxExperience: 20,
  maxEducation: 10,
  maxCertifications: 30,
  maxSkills: 50,
};
