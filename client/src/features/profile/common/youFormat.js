export const initialsFromName = (name) =>
  (name || 'U').trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

export const timeAgo = (iso) => {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Socials are stored as usernames; a pasted full link also works.
export const socialUrl = (base, value) => (/^https?:\/\//i.test(value) ? value : `${base}${value.replace(/^@/, '')}`);
