import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { FONT_WEIGHTS, FONT_SIZES, hueTint } from '../../../../app/design/designTokens';
import { timeAgo } from './bitsUtils';

// ---------------------------------------------------------------- identity

const HUES = [210, 160, 35, 280, 340, 190, 12, 250];
function hueFor(name = '') {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return HUES[h % HUES.length];
}

// Photo when the user has one, otherwise a tinted initial (hue derived from the name).
export function UserAvatar({ user, size = 40 }) {
  const hue = hueFor(user?.name);
  return (
    <Avatar
      src={user?.avatarUrl || undefined}
      alt={user?.name || ''}
      sx={(t) => ({
        width: size,
        height: size,
        fontSize: size * 0.42,
        fontWeight: FONT_WEIGHTS.bold,
        ...hueTint(hue, t.palette.mode === 'dark'),
        border: '1px solid',
        borderColor: 'divider',
      })}
    >
      {user?.name?.[0]?.toUpperCase()}
    </Avatar>
  );
}

// Instagram-style post header: avatar, bold name, muted time line, slot on the right.
export function AuthorHeader({ author, createdAt, editedAt, isMine, size = 40, right }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
      <UserAvatar user={author} size={size} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, lineHeight: 1.3 }}>
            {author?.name || 'Unknown'}
          </Typography>
          {isMine && <Chip size="small" label="You" color="primary" variant="outlined" sx={{ height: 20, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.semibold }} />}
        </Stack>
        <Typography noWrap color="text.secondary" sx={{ fontSize: FONT_SIZES.caption }}>
          {timeAgo(createdAt)}
          {editedAt ? ' · edited' : ''}
        </Typography>
      </Box>
      {right}
    </Stack>
  );
}
