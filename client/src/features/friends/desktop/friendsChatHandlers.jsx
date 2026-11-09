import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import { FLAME, practisedToday } from '../friendsUi';
import { FriendProfilePanel } from '../FriendProfileDialog';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import { WsIconButton } from '../../workspace/wsUi';

export function buildChatHandlers(c) {
  const { acting, error, nudge, panelMode, phone, setConfirm, setPanelMode, title } = c;
  // ---- chat header icons (desktop panel and phone drawer share them)
  const chatActions = (f) => (
    <>
      {!practisedToday(f) && (
        <WsIconButton title="Nudge: remind about streak" disabled={acting === `nudge:${f.userId}`} onClick={() => { setPanelMode('chat'); nudge(f); }} sx={{ color: FLAME }}>
          <LocalFireDepartmentRoundedIcon />
        </WsIconButton>
      )}
      <WsIconButton title="Profile & compare" active={panelMode === 'profile'} onClick={() => setPanelMode((m) => (m === 'profile' ? 'chat' : 'profile'))}><BadgeRoundedIcon /></WsIconButton>
      <WsIconButton title="Remove friend" onClick={() => setConfirm(f)} sx={{ '&:hover': { color: 'error.main' } }}><PersonRemoveRoundedIcon /></WsIconButton>
    </>
  );
  const chatOverlay = (f) => (panelMode === 'profile' ? <FriendProfilePanel f={f} onRemove={() => setConfirm(f)} lib={phone} /> : null);
  return { chatActions, chatOverlay };
}
