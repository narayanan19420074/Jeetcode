import { useState } from 'react';
import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { acceptFriendRequest, sendFriendRequest } from '../../friends/friendsSlice';
import useFriendStatus from '../../friends/common/useFriendStatus';
import { useFriendAction } from '../../friends/desktop/useFriendAction';
import { AboutMemberDialog } from './MemberInfoDialogs';
import { profileUrlOf } from './jobProfilePaths';

const FRIEND_LABELS = { friend: 'Friends', sent: 'Friend request sent', received: 'Accept friend request', none: 'Add friend' };

// "Add friend" sends the same friend request as the Leaderboard and the member search. When the member asked first, the
// same entry accepts their request instead, so a request can be answered from the profile as well.
function useAddFriend(owner) {
  const memberId = String(owner._id);
  const { status, requestId } = useFriendStatus(memberId);
  const { run } = useFriendAction();
  const send = () => (status === 'received'
    ? run(requestId, acceptFriendRequest(requestId), 'Friend added')
    : run(memberId, sendFriendRequest(owner.handle), 'Friend request sent'));
  return { label: FRIEND_LABELS[status], disabled: status === 'friend' || status === 'sent', send };
}

async function copyProfileLink(owner, enqueueSnackbar) {
  const link = profileUrlOf(owner._id);
  try {
    await navigator.clipboard.writeText(link);
    enqueueSnackbar('Profile link copied', { variant: 'success' });
  } catch {
    enqueueSnackbar(link, { variant: 'info' });
  }
}

function MenuEntry({ icon: Icon, label, onClick, disabled = false }) {
  return (
    <MenuItem disabled={disabled} onClick={onClick}>
      <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
      {label}
    </MenuItem>
  );
}

// The "..." menu under the top card of another member's profile. "Save to PDF" opens the browser's print dialog, which
// offers "Save as PDF"; the page hides its navigation and side column when printing.
export default function MemberActionsMenu({ owner, followerCount }) {
  const { enqueueSnackbar } = useSnackbar();
  const addFriend = useAddFriend(owner);
  const [anchor, setAnchor] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const close = () => setAnchor(null);
  const run = (action) => () => { close(); action(); };
  return (
    <>
      <IconButton aria-label={`More actions for ${owner.name}`} onClick={(event) => setAnchor(event.currentTarget)} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <MoreHorizRoundedIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        <MenuEntry icon={ShareRoundedIcon} label="Share profile" onClick={run(() => copyProfileLink(owner, enqueueSnackbar))} />
        <MenuEntry icon={DownloadRoundedIcon} label="Save to PDF" onClick={run(() => window.print())} />
        <MenuEntry icon={PersonAddAltRoundedIcon} label={addFriend.label} disabled={addFriend.disabled} onClick={run(addFriend.send)} />
        <MenuEntry icon={InfoOutlinedIcon} label="About this member" onClick={run(() => setIsAboutOpen(true))} />
      </Menu>
      <AboutMemberDialog owner={owner} followerCount={followerCount} open={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
}
