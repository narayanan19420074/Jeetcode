// Field definitions for every Job profile form. The forms, the validation and the blank entries are all
// built from these lists, so adding a field means adding one line here (and the same field on the server).

export const JOB_PROFILE_LIMITS = {
  headline: 220,
  about: 2000,
  shortText: 100,
  grade: 40,
  description: 1000,
  credentialId: 80,
  credentialUrl: 300,
  skillName: 40,
  maxSkills: 50,
};

const L = JOB_PROFILE_LIMITS;
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship'];
const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];

const text = (name, label, maxLength, extra = {}) => ({ name, label, type: 'text', maxLength, ...extra });
const longText = (name, label, maxLength) => ({ name, label, type: 'multiline', maxLength });
const month = (name, label, extra = {}) => ({ name, label, type: 'month', ...extra });
const select = (name, label, options) => ({ name, label, type: 'select', options });
const checkbox = (name, label) => ({ name, label, type: 'checkbox' });

export const INTRO_FIELDS = [
  text('headline', 'Headline', L.headline, { helper: 'For example: Full Stack Developer (MERN)' }),
  longText('about', 'About', L.about),
  checkbox('openToWork', 'Open to work'),
  checkbox('hiring', 'Hiring'),
];

const EXPERIENCE_FIELDS = [
  text('title', 'Title', L.shortText, { required: true }),
  text('company', 'Company', L.shortText, { required: true }),
  select('employmentType', 'Employment type', EMPLOYMENT_TYPES),
  text('location', 'Location', L.shortText),
  select('workMode', 'Location type', WORK_MODES),
  month('startDate', 'Start date', { required: true }),
  checkbox('isCurrent', 'I currently work here'),
  month('endDate', 'End date', { endsAfter: 'startDate', disabledWhen: 'isCurrent' }),
  longText('description', 'Description', L.description),
];

const EDUCATION_FIELDS = [
  text('school', 'School', L.shortText, { required: true }),
  text('degree', 'Degree', L.shortText),
  text('fieldOfStudy', 'Field of study', L.shortText),
  month('startDate', 'Start date'),
  month('endDate', 'End date', { endsAfter: 'startDate' }),
  text('grade', 'Grade', L.grade),
];

const CERTIFICATION_FIELDS = [
  text('name', 'Name', L.shortText, { required: true }),
  text('issuer', 'Issuing organization', L.shortText, { required: true }),
  month('issueDate', 'Issue date'),
  month('expiryDate', 'Expiration date', { endsAfter: 'issueDate' }),
  text('credentialId', 'Credential ID', L.credentialId),
  { name: 'credentialUrl', label: 'Credential URL', type: 'url', maxLength: L.credentialUrl },
];

export const blankFromFields = (fields) => Object.fromEntries(fields.map((field) => [field.name, field.type === 'checkbox' ? false : '']));

const section = (key, title, itemLabel, emptyText, fields) => ({ key, title, itemLabel, emptyText, fields, blank: blankFromFields(fields) });

export const ENTRY_SECTIONS = {
  experience: section('experience', 'Experience', 'experience', 'Add your work history, including internships.', EXPERIENCE_FIELDS),
  education: section('education', 'Education', 'education', 'Add your schools, degrees and diplomas.', EDUCATION_FIELDS),
  certifications: section('certifications', 'Licenses & certifications', 'certification', 'Add certifications that support your skills.', CERTIFICATION_FIELDS),
};

export const SECTION_ORDER = ['experience', 'education', 'certifications'];
