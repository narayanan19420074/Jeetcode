// Turns stored profile entries ("YYYY-MM" dates, plain strings) into the lines shown on the cards.

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const joinParts = (parts, separator) => parts.filter(Boolean).join(separator);
const monthIndex = (value) => {
  const [year, month] = value.split('-').map(Number);
  return year * 12 + (month - 1);
};
const currentMonth = () => new Date().toISOString().slice(0, 7);

export function formatMonth(value) {
  if (!value) return '';
  const [year, month] = value.split('-');
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

export const formatRange = (start, end, isCurrent = false) => joinParts([formatMonth(start), isCurrent ? 'Present' : formatMonth(end)], ' – ');

// Both months count, so a role that starts and ends in the same month reads "1 mo".
export function formatDuration(start, end, isCurrent = false) {
  const last = isCurrent ? currentMonth() : end;
  if (!start || !last || last < start) return '';
  const total = monthIndex(last) - monthIndex(start) + 1;
  const years = Math.floor(total / 12);
  const months = total % 12;
  return joinParts([years && `${years} yr`, months && `${months} mo`], ' ');
}

const describeExperience = (entry) => ({
  title: entry.title,
  subtitle: joinParts([entry.company, entry.employmentType], ' · '),
  meta: [
    joinParts([formatRange(entry.startDate, entry.endDate, entry.isCurrent), formatDuration(entry.startDate, entry.endDate, entry.isCurrent)], ' · '),
    joinParts([entry.location, entry.workMode], ' · '),
  ],
  body: entry.description,
});

const describeEducation = (entry) => ({
  title: entry.school,
  subtitle: joinParts([entry.degree, entry.fieldOfStudy], ', '),
  meta: [formatRange(entry.startDate, entry.endDate), entry.grade && `Grade: ${entry.grade}`],
});

const describeCertification = (entry) => ({
  title: entry.name,
  subtitle: entry.issuer,
  meta: [
    joinParts([entry.issueDate && `Issued ${formatMonth(entry.issueDate)}`, entry.expiryDate && `Expires ${formatMonth(entry.expiryDate)}`], ' · '),
    entry.credentialId && `Credential ID ${entry.credentialId}`,
  ],
  link: entry.credentialUrl,
});

const DESCRIBERS = { experience: describeExperience, education: describeEducation, certifications: describeCertification };

export const describeEntry = (sectionKey, entry) => DESCRIBERS[sectionKey](entry);
