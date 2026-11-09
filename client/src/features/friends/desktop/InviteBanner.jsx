import { Alert, Box, Skeleton, Typography, alpha } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { PersonAvatar } from '../friendsUi';
import { Reveal } from '../friendsKit';
import { WsIconButton } from '../../workspace/wsUi';
import { acceptFriendInvite } from '../friendsSlice';
import { extractErrorMessage } from '../../../api/apiClient';
import { friendsApi } from '../../../api/friendsApi';
import { surface } from '../../dashboard/dashboardUtils';
import { useEffect, useState } from 'react';
import { tint } from './friendsStyle';
import { useFriendAction } from './useFriendAction';

// ?invite=handle: someone shared their link with me. One slim row: accept or dismiss.
export function InviteBanner({ handle, onDone }) {
  const [state, setState] = useState({ loading: true });
  const { busy, run } = useFriendAction();

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });
    friendsApi
      .previewInvite(handle)
      .then(({ data }) => !cancelled && setState({ loading: false, ...data.data }))
      .catch((err) => !cancelled && setState({ loading: false, error: extractErrorMessage(err) }));
    return () => { cancelled = true; };
  }, [handle]);

  if (state.loading) return <Skeleton variant="rounded" height={60} sx={{ borderRadius: RADII_PX.card }} />;
  if (state.error) return <Alert severity="warning" onClose={onDone}>{state.error}</Alert>;
  if (state.isSelf) return <Alert severity="info" onClose={onDone}>This is your own invite link.</Alert>;
  if (state.relation === 'friends') return <Alert severity="success" onClose={onDone}>You and @{state.user.handle} are already friends.</Alert>;

  const accept = async () => {
    if (await run('invite', acceptFriendInvite(handle), `You and @${handle} are now friends`)) onDone();
  };

  return (
    <Reveal>
      <Box sx={[surface, (t) => ({ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderColor: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.06) })]}>
        <PersonAvatar person={state.user} size={38} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, lineHeight: 1.35 }}>{state.user.name}</Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, color: 'text.secondary' }}>invited you to be friends</Typography>
        </Box>
        <WsIconButton title="Accept" disabled={busy === 'invite'} onClick={accept} sx={tint('success')}><CheckRoundedIcon /></WsIconButton>
        <WsIconButton title="Not now" onClick={onDone} sx={tint()}><CloseRoundedIcon /></WsIconButton>
      </Box>
    </Reveal>
  );
}
