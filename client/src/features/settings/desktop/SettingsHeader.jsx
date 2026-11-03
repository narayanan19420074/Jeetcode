import { Avatar, Box, Stack, Typography } from '@mui/material';
import BackToDashboard from '../../../components/BackToDashboard';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { initialsFromName } from '../components/SettingsUi';
import { FONT_WEIGHTS, FONT_SIZES } from '../../../app/design/designTokens';

// Who these settings belong to.
export default function SettingsHeader({ user }) {
  const palette = useLibraryPalette();
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.75, mb: 3, flexShrink: 0 }}>
      <BackToDashboard />
      <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: FONT_WEIGHTS.bold }}>
        {initialsFromName(user.name)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold }}>
          {user.name}{' '}
          <Typography component="span" sx={{ fontSize: FONT_SIZES.title, color: palette.muted }}>@{user.handle}</Typography>
        </Typography>
        <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: palette.muted }}>Your personal account</Typography>
      </Box>
    </Stack>
  );
}
