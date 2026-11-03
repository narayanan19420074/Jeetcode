import { Avatar, Box, Stack, Typography } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { initialsFromName } from '../components/SettingsUi';

// Who these settings belong to.
export default function SettingsHeader({ user }) {
  const palette = useLibraryPalette();
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.75, mb: 3, flexShrink: 0 }}>
      <BackToDashboard />
      <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 700 }}>
        {initialsFromName(user.name)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: 18, lineHeight: '24px', fontWeight: 700 }}>
          {user.name}{' '}
          <Typography component="span" sx={{ fontSize: 16, color: palette.muted }}>@{user.handle}</Typography>
        </Typography>
        <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: palette.muted }}>Your personal account</Typography>
      </Box>
    </Stack>
  );
}
