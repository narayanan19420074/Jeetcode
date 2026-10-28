import { Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { WsButton } from './wsUi';

// Strip under the editor toolbar for signed-out visitors.
export default function GuestBanner({ children, onSignIn }) {
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
