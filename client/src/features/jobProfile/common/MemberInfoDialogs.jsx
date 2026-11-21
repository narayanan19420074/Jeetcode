import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Stack, Typography } from '@mui/material';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import { profileUrlOf } from './jobProfilePaths';

function InfoRow({ label, value, href }) {
  return (
    <Stack>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>{label}</Typography>
      {href ? <Link href={href} sx={{ wordBreak: 'break-all' }}>{value}</Link> : <Typography sx={{ wordBreak: 'break-word' }}>{value}</Typography>}
    </Stack>
  );
}

function InfoDialog({ title, open, onClose, rows }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-label={title}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>{rows.filter((row) => row.value).map((row) => <InfoRow key={row.label} {...row} />)}</Stack>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
}

// How to reach a member: only their public JeetCode identity. Email and phone are never sent to other members.
export function ContactInfoDialog({ owner, open, onClose }) {
  const link = profileUrlOf(owner._id);
  const rows = [{ label: 'JeetCode profile', value: link, href: link }, { label: 'Handle', value: owner.handle && `@${owner.handle}` }, { label: 'Location', value: owner.location }];
  return <InfoDialog title="Contact info" open={open} onClose={onClose} rows={rows} />;
}

const memberSinceOf = (createdAt) => (createdAt ? new Date(createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '');

export function AboutMemberDialog({ owner, followerCount, open, onClose }) {
  const rows = [
    { label: 'Name', value: owner.name },
    { label: 'Member since', value: memberSinceOf(owner.createdAt) },
    { label: 'Followers', value: followerCount.toLocaleString() },
  ];
  return <InfoDialog title="About this member" open={open} onClose={onClose} rows={rows} />;
}
