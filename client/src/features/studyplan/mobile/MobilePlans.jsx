import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Badge, Box, Button, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { PageHeader, libBackBtnSx, libIconBtnSx, libSolidBtnSx, libTintBtnSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { MUTED } from './mobileStyle';
import { SectionTitle } from './MobileUi';
import MobilePlanCard from './MobilePlanCard';
import MobileInviteCard from './MobileInviteCard';
import MobileFriendsSheet from './MobileFriendsSheet';
import MobileNotesSheet from './MobileNotesSheet';

// Back arrow plus the friends and notifications buttons.
function PlansTopBar({ unread, onOpenFriends, onOpenNotes }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" sx={libBackBtnSx}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <Stack direction="row" sx={{ gap: 1 }}>
        <IconButton onClick={() => onOpenFriends()} aria-label="Friends" aria-haspopup="dialog" sx={libIconBtnSx}>
          <GroupsRoundedIcon />
        </IconButton>
        <IconButton
          onClick={onOpenNotes}
          aria-label={unread > 0 ? `Notifications, ${unread} new` : 'Notifications'}
          aria-haspopup="dialog"
          sx={libIconBtnSx}
        >
          <Badge color="error" badgeContent={unread} max={9}>
            <NotificationsRoundedIcon />
          </Badge>
        </IconButton>
      </Stack>
    </Stack>
  );
}

// Empty state, skeletons or the list of plan cards.
function PlansList({ plans, today, onNew, onOpenPlan, onAddFriend, onDelete }) {
  if (plans === null) {
    return (
      <Stack spacing={1.5}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={214} sx={{ borderRadius: RADII_PX.card }} />
        ))}
      </Stack>
    );
  }
  if (plans.length === 0) {
    return (
      <Box sx={{ py: 5, px: 2, textAlign: 'center' }}>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading }}>No plans yet</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.title, color: MUTED, mt: 0.5, mb: 2 }}>Pick questions, set a finish date and add friends.</Typography>
        <Button onClick={onNew} disableElevation variant="contained" sx={libTintBtnSx}>
          Create a plan
        </Button>
      </Box>
    );
  }
  return (
    <Stack spacing={1.5}>
      {plans.map((p) => (
        <MobilePlanCard key={p.id} plan={p} today={today} onOpen={() => onOpenPlan(p.id)} onAddFriend={onAddFriend} onDelete={onDelete} />
      ))}
    </Stack>
  );
}

export function MobilePlans({
  plans, friends, notes, error, onDismissError, invite, joining, onAccept, onDismissInvite, dueToday, today, onNew,
  onOpenPlan, onAddFriend, onDelete, onFindFriends, codeInput, setCodeInput, codeError, onJoinCode, onOpenNotes,
}) {
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const sub =
    plans && plans.length > 0
      ? `${plans.length} plan${plans.length === 1 ? '' : 's'}, ${dueToday > 0 ? `${dueToday} question${dueToday === 1 ? '' : 's'} to solve today` : 'nothing due today'}`
      : 'Schedule questions and study with friends';

  const openNotesSheet = () => {
    setNotesOpen(true);
    onOpenNotes();
  };
  const openPlanFromNotes = (planId) => {
    setNotesOpen(false);
    onOpenPlan(planId);
  };
  // The invite field lives in the friends sheet, so submitting also closes it.
  const submitInviteCode = () => {
    onJoinCode();
    setFriendsOpen(false);
  };

  return (
    <>
      <PlansTopBar unread={notes.unread} onOpenFriends={() => setFriendsOpen(true)} onOpenNotes={openNotesSheet} />

      {/* Header */}
      <PageHeader icon={SchoolRoundedIcon} title="Study Plan" subtitle={sub} />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button onClick={onNew} disableElevation variant="contained" startIcon={<AddRoundedIcon />} sx={libSolidBtnSx}>
          New plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={onDismissError} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {invite && <MobileInviteCard invite={invite} joining={joining} onAccept={onAccept} onDismiss={onDismissInvite} />}

      <Box component="section" aria-label="Your plans" sx={{ mt: 4 }}>
        {plans && plans.length > 0 && <SectionTitle>Your plans</SectionTitle>}
        <PlansList plans={plans} today={today} onNew={onNew} onOpenPlan={onOpenPlan} onAddFriend={onAddFriend} onDelete={onDelete} />
      </Box>

      <MobileFriendsSheet
        open={friendsOpen} onClose={() => setFriendsOpen(false)} friends={friends} onFindFriends={onFindFriends}
        codeInput={codeInput} setCodeInput={setCodeInput} codeError={codeError} onJoinCode={submitInviteCode}
      />
      <MobileNotesSheet open={notesOpen} onClose={() => setNotesOpen(false)} items={notes.items} onOpenPlan={openPlanFromNotes} />
    </>
  );
}
