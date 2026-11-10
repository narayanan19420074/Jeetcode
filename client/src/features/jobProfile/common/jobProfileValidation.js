// Quick checks before a form is sent. The server repeats them and stays the authority.

const isMissing = (value) => typeof value !== 'string' || value.trim() === '';

export function validateEntry(fields, values) {
  const errors = {};
  fields.forEach((field) => {
    if (field.required && isMissing(values[field.name])) errors[field.name] = 'This field is required';
    const start = field.endsAfter && values[field.endsAfter];
    const end = values[field.name];
    if (start && end && end < start) errors[field.name] = 'This date cannot be before the start date';
  });
  return errors;
}

// A field that is switched off by a checkbox (the end date of a current job) is saved empty.
export function normalizeValues(fields, values) {
  return Object.fromEntries(
    fields.map(({ name, type, disabledWhen }) => {
      if (disabledWhen && values[disabledWhen]) return [name, ''];
      return [name, type === 'checkbox' ? Boolean(values[name]) : String(values[name] ?? '').trim()];
    })
  );
}
