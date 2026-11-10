import { z } from 'zod';
import { EMPLOYMENT_TYPES, JOB_PROFILE_LIMITS as LIMITS, MONTH_PATTERN, WORK_MODES } from '../config/jobProfile.js';
import { optionalUrl } from './user.validator.js';

const text = (max) => z.string().trim().max(max);
const requiredText = (max) => z.string().trim().min(1, 'This field is required').max(max);
const optionalMonth = z.union([z.literal(''), z.string().regex(MONTH_PATTERN, 'Use the format YYYY-MM')]);
const requiredMonth = z.string().regex(MONTH_PATTERN, 'Choose a date');
const optionalChoice = (values) => z.union([z.literal(''), z.enum(values)]);

// An end date is only meaningful once the start date is known, and it can never come before it.
const endsAfterStart = (startKey, endKey) => (entry) => !entry[startKey] || !entry[endKey] || entry[endKey] >= entry[startKey];
const dateOrderIssue = (endKey) => ({ message: 'End date cannot be before the start date', path: [endKey] });

// A current position has no end date, whatever the form sent.
const clearEndDateWhenCurrent = (entry) => (entry.isCurrent ? { ...entry, endDate: '' } : entry);

const experienceSchema = z
  .object({
    title: requiredText(LIMITS.shortText),
    company: requiredText(LIMITS.shortText),
    employmentType: optionalChoice(EMPLOYMENT_TYPES),
    location: text(LIMITS.shortText),
    workMode: optionalChoice(WORK_MODES),
    startDate: requiredMonth,
    endDate: optionalMonth,
    isCurrent: z.boolean(),
    description: text(LIMITS.description),
  })
  .strict()
  .transform(clearEndDateWhenCurrent)
  .refine(endsAfterStart('startDate', 'endDate'), dateOrderIssue('endDate'));

const educationSchema = z
  .object({
    school: requiredText(LIMITS.shortText),
    degree: text(LIMITS.shortText),
    fieldOfStudy: text(LIMITS.shortText),
    startDate: optionalMonth,
    endDate: optionalMonth,
    grade: text(LIMITS.grade),
  })
  .strict()
  .refine(endsAfterStart('startDate', 'endDate'), dateOrderIssue('endDate'));

const certificationSchema = z
  .object({
    name: requiredText(LIMITS.shortText),
    issuer: requiredText(LIMITS.shortText),
    issueDate: optionalMonth,
    expiryDate: optionalMonth,
    credentialId: text(LIMITS.credentialId),
    credentialUrl: optionalUrl(LIMITS.credentialUrl),
  })
  .strict()
  .refine(endsAfterStart('issueDate', 'expiryDate'), { message: 'Expiry date cannot be before the issue date', path: ['expiryDate'] });

// Skills are compared case-insensitively so "React" and "react" are not listed twice.
const withoutDuplicateSkills = (skills) => {
  const seen = new Set();
  return skills.filter((skill) => !seen.has(skill.toLowerCase()) && seen.add(skill.toLowerCase()));
};

// The whole profile is replaced on every save, so every section must be present.
export const saveJobProfileSchema = z
  .object({
    headline: text(LIMITS.headline),
    about: text(LIMITS.about),
    openToWork: z.boolean(),
    experience: z.array(experienceSchema).max(LIMITS.maxExperience),
    education: z.array(educationSchema).max(LIMITS.maxEducation),
    certifications: z.array(certificationSchema).max(LIMITS.maxCertifications),
    skills: z.array(requiredText(LIMITS.skillName)).max(LIMITS.maxSkills).transform(withoutDuplicateSkills),
  })
  .strict();
