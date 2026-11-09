import { Avatar, Box, Button, IconButton, Skeleton, Stack, TextField, Typography } from '@mui/material';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import { LIB_TRACKING, libIconBtnSx, libSectionTitleSx, libTintBtnSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { DIVIDER, MUTED } from './mobileStyle';
import { Sheet } from './MobileUi';

// Friends list plus the "paste an invite link" field, in a bottom sheet.
export default function MobileFriendsSheet({ open, onClose, friends, codeInput, setCodeInput, codeError, onJoinCode, onFindFriends }) {
  return (
    <Sheet open={open} onClose={onClose} title="Friends">
      {friends === null && <Skeleton variant="rounded" height={56} sx={{ borderRadius: RADII_PX.card }} />}
      {friends?.length === 0 && (
        <Box sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: FONT_SIZES.title, color: MUTED }}>No friends yet.</Typography>
          <Button
            onClick={() => {
              onClose();
              onFindFriends();
            }}
            disableElevation
            variant="contained"
            sx={{ ...libTintBtnSx, mt: 1.5 }}
          >
            Find friends
          </Button>
        </Box>
      )}
      {friends?.map((f) => (
        <Stack key={f.userId} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1, borderBottom: `1px solid ${DIVIDER}`, '&:last-of-type': { borderBottom: 'none' } }}>
          <Avatar src={f.avatarUrl || undefined} alt={f.name} sx={{ width: 40, height: 40, fontWeight: FONT_WEIGHTS.bold }}>
            {f.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: '22px', letterSpacing: LIB_TRACKING }}>
              {f.name}
            </Typography>
            {f.handle && (
              <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '18px', color: MUTED }}>
                @{f.handle}
              </Typography>
            )}
          </Box>
        </Stack>
      ))}

      <Typography component="h3" sx={{ ...libSectionTitleSx, mt: 3, mb: 1 }}>
        Join a plan
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Paste an invite link"
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onJoinCode()}
          error={Boolean(codeError)}
          helperText={codeError || undefined}
          slotProps={{ htmlInput: { 'aria-label': 'Invite link or code' } }}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: RADII_PX.pill, height: 48, bgcolor: 'var(--lib-player)', fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          }}
        />
        <IconButton
          onClick={() => {
            onJoinCode();
            onClose();
          }}
          aria-label="Find plan"
          sx={{ ...libIconBtnSx, width: 48, height: 48 }}
        >
          <GroupAddRoundedIcon />
        </IconButton>
      </Stack>
    </Sheet>
  );
}
