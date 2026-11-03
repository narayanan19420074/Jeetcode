// Each settings group has its own accent colour, like the sections on the phone home screen.
const GROUP_ACCENT = { Access: '#6366F1', Preferences: '#F97316', Security: '#14B8A6' };

export const accentFor = (groupLabel) => GROUP_ACCENT[groupLabel] || GROUP_ACCENT.Access;
