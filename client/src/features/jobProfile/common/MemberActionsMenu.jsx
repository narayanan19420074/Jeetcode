import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { sendFriendRequest } from '../../friends/friendsSlice';
import { AboutMemberDialog } from './MemberInfoDialogs';
import { profileUrlOf } from './jobProfilePaths';

const FRIEND_LABELS = { friend: 'Friends', sent: 'Friend request sent', received: 'Friend request received', none: 'Add friend' };

function friendStateOf(friendsState, memberId) {
  const { friends, incoming, outgoing } = friendsState;
  if (friends.some((friend) => friend.userId === memberId)) return 'friend';
  if (outgoing.some((request) => request.user.userId === memberId)) return 'sent';
  return incoming.some((request) => request.user.userId === memberId) ? 'received' : 'none';
}

// "Add friend" sends the same friend request as the Friends page, so the member sees it under Requests.
function useAddFriend(owner) {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const state = useSelector((root) => friendStateOf(root.friends, String(owner._id)));
  const send = async () => {
    try {
      await dispatch(sendFriendRequest(owner.handle)).unwrap();
      enqueueSnackbar('Friend request sent', { variant: 'success' });
    } catch (message) {
      enqueueSnackbar(typeof message === 'string' ? message : 'Could not send the friend request.', { variant: 'error' });
    }
  };
  return { label: FRIEND_LABELS[state], disabled: state !== 'none', send };
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
