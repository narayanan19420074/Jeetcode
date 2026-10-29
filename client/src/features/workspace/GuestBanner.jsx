import { Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LIB_TRACKING, libSolidBtnSx } from '../dashboard/components/libraryStyle';
import { WsButton } from './wsUi';

// Strip under the editor toolbar for signed-out visitors.
// lib: the phone workspace look (Library style: rounded cream panel, no icon).
export default function GuestBanner({ children, onSignIn, lib = false }) {
  if (lib) {
    return (
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 1.5, mx: 2, mb: 1, pl: 2, pr: 1, py: 1, flexShrink: 0, borderRadius: '20px', bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
      >
        <Typography sx={{ flex: 1, fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>{children}</Typography>
        <Button disableElevation onClick={onSignIn} sx={{ ...libSolidBtnSx, height: 36, px: 2, fontSize: 15 }}>
          Sign in
        </Button>
      </Stack>
    );
  }
  return (
    <Stack
      direction="row"
      sx={(t) => ({ alignItems: 'center', gap: 1, px: 1.5, py: 0.75, flexShrink: 0, bgcolor: alpha(t.palette.primary.main, 0.1), color: 'text.primary' })}
    >
      <LockOutlinedIcon sx={{ fontSize: 17, color: 'primary.main', flexShrink: 0 }} />
      <Typography variant="caption" sx={{ flex: 1, lineHeight: 1.4 }}>
        {children}
      </Typography>
      <WsButton variant="ghost" onClick={onSignIn} sx={{ color: 'primary.main', height: 28 }}>
        Sign in
      </WsButton>
    </Stack>
  );
}
