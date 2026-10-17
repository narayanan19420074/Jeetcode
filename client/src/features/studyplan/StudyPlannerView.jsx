import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Avatar, AvatarGroup, Badge, Box, Button, ButtonBase, Collapse, IconButton, LinearProgress, Popover, Skeleton, Snackbar,
  TextField, Tooltip, Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import PlanBuilder from './PlanBuilder';
import PlanWorkspace from './PlanWorkspace';
import FriendPicker from './FriendPicker';
import { fmtRange, parseInvite, relTime } from './planUtils';

const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };

// ---------- friends strip (opens from the friends icon) ----------

function FriendsPanel({ friends, onFindFriends, onJoinCode, codeInput, setCodeInput, codeError }) {
  return (
    <Box sx={[surface, { p: 1.25 }]}>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center', maxHeight: 112, overflowY: 'auto', scrollbarWidth: 'thin' }}>
        {friends === null && <Skeleton width={160} height={28} />}
        {friends?.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
            No friends yet. <ButtonBase onClick={onFindFriends} sx={{ color: 'primary.main', fontWeight: 700, fontSize: 14, verticalAlign: 'baseline' }}>Find friends</ButtonBase>
          </Typography>
        )}
        {friends?.map((f) => (
          <Box key={f.userId} sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 0.75, pl: 0.4, pr: 1.1, py: 0.3, borderRadius: 999, border: `1px solid ${t.palette.divider}` })}>
            <Avatar src={f.avatarUrl || undefined} sx={{ width: 22, height: 22, fontSize: 11, fontWeight: 700 }}>{f.name?.[0]?.toUpperCase()}</Avatar>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600, maxWidth: 120 }}>{f.name}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.5, mt: 1, alignItems: 'center' }}>
        <TextField
          size="small" placeholder="Have an invite link? Paste it" value={codeInput} onChange={(e) => setCodeInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onJoinCode()} error={Boolean(codeError)} helperText={codeError || undefined}
          slotProps={{ htmlInput: { 'aria-label': 'Invite link or code', style: { padding: '6px 10px', fontSize: 13 } } }} fullWidth
        />
        <Tooltip title="Find plan"><IconButton onClick={onJoinCode} aria-label="Find plan" size="small"><GroupAddRoundedIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
    </Box>
  );
}

// ---------- notifications (bell) ----------

function NotificationsPopover({ anchorEl, onClose, items, onOpenPlan }) {
  return (
    <Popover
      open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{ paper: { sx: { width: 300, maxHeight: 340, mt: 0.5, borderRadius: '12px' } } }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, pt: 1.25, pb: 0.5, fontWeight: 800, letterSpacing: 0.4 }}>NOTIFICATIONS</Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, pb: 1.5 }}>Nothing new.</Typography>
      ) : items.map((n) => (
        <ButtonBase
          key={n.id} onClick={() => onOpenPlan(n.plan.id)}
          sx={(t) => ({ width: '100%', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 1, px: 1.5, py: 0.9, textAlign: 'left', fontFamily: 'inherit', bgcolor: n.read ? 'transparent' : `${t.palette.primary.main}12`, '&:hover': { bgcolor: t.palette.action.hover } })}
        >
          <Avatar src={n.actor.avatarUrl || undefined} sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 700, mt: 0.2 }}>{n.actor.name?.[0]?.toUpperCase()}</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.3 }}><b>{n.actor.name}</b> added you to <b>{n.plan.title}</b></Typography>
            <Typography variant="caption" color="text.secondary">{relTime(n.createdAt)}</Typography>
          </Box>
        </ButtonBase>
      ))}
    </Popover>
  );
}

// ---------- plan card ----------

function PlanCard({ plan, onOpen, onAddFriend }) {
  const s = plan.summary;
  const behind = s.status === 'behind';
  const complete = s.status === 'completed';
  return (
    <Box
      role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      sx={[surface, { p: 1.5, cursor: 'pointer', transition: 'border-color .15s', '&:hover, &:focus-visible': { borderColor: 'primary.main', outline: 'none' } }]}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography noWrap sx={{ fontWeight: 700, flex: 1, fontSize: 15 }}>{plan.title}</Typography>
        {complete && <Tooltip title="Completed"><CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} /></Tooltip>}
        {behind && <Tooltip title={`${s.overdue} overdue`}><ErrorOutlineRoundedIcon sx={{ fontSize: 18, color: 'error.main' }} /></Tooltip>}
        <Tooltip title="Add friends">
          <IconButton size="small" aria-label="Add friends to plan" onClick={(e) => { e.stopPropagation(); onAddFriend(e.currentTarget); }} sx={{ mr: -0.5 }}>
            <PersonAddRoundedIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <LinearProgress
          variant="determinate" value={s.percent} aria-label="Plan progress"
          color={complete ? 'success' : behind ? 'error' : 'primary'} sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
        <Typography variant="caption" sx={[{ fontWeight: 700 }, mono]}>{s.done}/{s.total}</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: 10, fontWeight: 700, border: '2px solid', borderColor: 'background.paper' } }}>
          {plan.members.map((m) => <Avatar key={m.id} src={m.avatarUrl || undefined} alt={m.name}>{m.name?.[0]?.toUpperCase()}</Avatar>)}
        </AvatarGroup>
        <Box sx={{ flex: 1 }} />
        <EventRoundedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
        <Typography variant="caption" color="text.secondary" noWrap>{fmtRange(s.startDate, s.endDate)}</Typography>
      </Box>
    </Box>
  );
}

// ---------- main ----------

export default function StudyPlannerView({ isAuthenticated }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const planId = params.get('plan');
  const joinCode = params.get('join');

  const [plans, setPlans] = useState(null);
  const [friends, setFriends] = useState(null);
  const [notes, setNotes] = useState({ items: [], unread: 0 });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [builder, setBuilder] = useState(null); // null | { plan?: planDetail }
  const [invite, setInvite] = useState(null);
  const [joining, setJoining] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showFriends, setShowFriends] = useState(false);
  const [bellEl, setBellEl] = useState(null);
  const [picker, setPicker] = useState(null); // { el, plan }

  const go = useCallback((next = {}) => setParams({ view: 'plans', ...next }), [setParams]);

  const loadPlans = useCallback(async () => {
    try {
      const { data } = await studyPlanApi.list();
      setPlans(data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
      setPlans([]);
    }
  }, []);

  const loadFriends = useCallback(async () => {
    try {
      const { data } = await friendsApi.list();
      setFriends(data.data.friends || []);
    } catch {
      setFriends([]);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      const { data } = await studyPlanApi.notifications();
      setNotes(data.data);
    } catch { /* the bell just stays quiet */ }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    loadPlans();
    loadFriends();
    loadNotes();
    const timer = setInterval(() => document.visibilityState === 'visible' && loadNotes(), 60000);
    return () => clearInterval(timer);
  }, [isAuthenticated, loadPlans, loadFriends, loadNotes]);

  // An invite link (…?view=plans&join=CODE) shows an inline join card — no popup.
  useEffect(() => {
    if (!isAuthenticated || !joinCode) { setInvite(null); return undefined; }
    let cancelled = false;
    studyPlanApi
      .previewJoin(joinCode)
      .then(({ data }) => {
        if (cancelled) return;
        if (data.data.alreadyMember) go({ plan: data.data.id });
        else setInvite({ ...data.data, code: joinCode });
      })
      .catch((err) => !cancelled && setInvite({ error: extractErrorMessage(err) }));
    return () => { cancelled = true; };
  }, [isAuthenticated, joinCode, go]);

  const accept = async () => {
    setJoining(true);
    try {
      const { data } = await studyPlanApi.join(invite.code);
      await loadPlans();
      setInvite(null);
      go({ plan: data.data.id });
    } catch (err) {
      setInvite({ error: extractErrorMessage(err) });
    } finally {
      setJoining(false);
    }
  };

  const joinFromInput = () => {
    const code = parseInvite(codeInput);
    if (!code) return setCodeError('Paste the invite link');
    setCodeError('');
    setCodeInput('');
    go({ join: code });
  };

  const addFriend = async (planToJoin, friend) => {
    try {
      await studyPlanApi.addMember(planToJoin.id, friend.userId);
      setToast(`${friend.name} added to ${planToJoin.title}`);
      await loadPlans();
      return true;
    } catch (err) {
      setToast(extractErrorMessage(err));
      return false;
    }
  };

  const openBell = async (e) => {
    setBellEl(e.currentTarget);
    try {
      const { data } = await studyPlanApi.notifications();
      setNotes(data.data); // items keep their "new" highlight while the popover is open
      if (data.data.unread > 0) {
        await studyPlanApi.markNotificationsRead();
        setNotes((n) => ({ ...n, unread: 0 }));
      }
    } catch { /* keep whatever we had */ }
  };

  const pickerMemberIds = useMemo(() => new Set((picker?.plan?.members || []).map((m) => m.id)), [picker]);
  const findFriends = () => setParams({ view: 'friends' });

  if (!isAuthenticated) {
    return (
      <Box sx={[surface, { p: 4, textAlign: 'center' }]}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Log in to plan your study days</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Create a schedule, add friends and track progress together.</Typography>
        <Button variant="contained" disableElevation onClick={() => navigate('/login')} sx={{ fontWeight: 700 }}>Log in</Button>
      </Box>
    );
  }

  if (builder) {
    return (
      <PlanBuilder
        plan={builder.plan}
        onCancel={() => setBuilder(null)}
        onSaved={(id) => { setBuilder(null); loadPlans(); go({ plan: id }); }}
      />
    );
  }

  // Open plan: just its questions and everyone's progress.
  if (planId) {
    return (
      <>
        <PlanWorkspace
          key={planId} id={planId} friends={friends}
          onBack={() => go()}
          onEdit={(plan) => setBuilder({ plan })}
          onChanged={loadPlans}
          onGone={() => { loadPlans(); go(); }}
          onFindFriends={findFriends}
          notify={setToast}
        />
        <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast('')} message={toast} />
      </>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Study Plan</Typography>
        <Tooltip title="Friends">
          <IconButton onClick={() => setShowFriends((v) => !v)} aria-label="Friends" aria-expanded={showFriends} color={showFriends ? 'primary' : 'default'}>
            <GroupsRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Notifications">
          <IconButton onClick={openBell} aria-label="Notifications">
            <Badge color="error" badgeContent={notes.unread} max={9}><NotificationsRoundedIcon /></Badge>
          </IconButton>
        </Tooltip>
        <Button variant="contained" disableElevation size="small" startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})} sx={{ fontWeight: 700, ml: 0.5 }}>New plan</Button>
      </Box>

      <Collapse in={showFriends} unmountOnExit>
        <FriendsPanel
          friends={friends} onFindFriends={findFriends} onJoinCode={joinFromInput}
          codeInput={codeInput} setCodeInput={(v) => { setCodeInput(v); setCodeError(''); }} codeError={codeError}
        />
      </Collapse>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {invite && (
        <Box sx={[surface, (t) => ({ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', borderColor: invite.error ? t.palette.error.main : t.palette.primary.main })]}>
          {invite.error ? (
            <>
              <Typography sx={{ flex: 1 }} color="error">{invite.error}</Typography>
              <Button size="small" onClick={() => go()}>Dismiss</Button>
            </>
          ) : (
            <>
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Typography variant="caption" color="text.secondary">{invite.owner ? `@${invite.owner.handle} invited you to` : 'You are invited to'}</Typography>
                <Typography sx={{ fontWeight: 700 }}>{invite.title}</Typography>
                <Typography variant="caption" color="text.secondary">{invite.taskCount} questions · {fmtRange(invite.startDate, invite.endDate)} · {invite.memberCount} member{invite.memberCount === 1 ? '' : 's'}</Typography>
              </Box>
              {invite.isFull ? <Typography color="warning.main" sx={{ fontWeight: 700 }}>This plan is full</Typography> : (
                <Button size="small" variant="contained" disableElevation disabled={joining} onClick={accept} sx={{ fontWeight: 700 }}>{joining ? 'Joining…' : 'Join'}</Button>
              )}
              <Button size="small" onClick={() => go()} disabled={joining}>Not now</Button>
            </>
          )}
        </Box>
      )}

      {plans === null ? (
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: '14px' }} />)}
        </Box>
      ) : plans.length === 0 ? (
        <Box sx={[surface, { p: 3, textAlign: 'center' }]}>
          <Typography sx={{ fontWeight: 700 }}>No plans yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>Pick questions, set a finish date and add friends.</Typography>
          <Button variant="contained" disableElevation size="small" startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})} sx={{ fontWeight: 700 }}>Create a plan</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} onOpen={() => go({ plan: p.id })} onAddFriend={(el) => setPicker({ el, plan: p })} />
          ))}
        </Box>
      )}

      <NotificationsPopover
        anchorEl={bellEl} onClose={() => setBellEl(null)} items={notes.items}
        onOpenPlan={(id) => { setBellEl(null); go({ plan: id }); }}
      />
      <FriendPicker
        anchorEl={picker?.el} onClose={() => setPicker(null)} friends={friends} memberIds={pickerMemberIds} onFindFriends={findFriends}
        onAdd={async (f) => { if (await addFriend(picker.plan, f)) setPicker((p) => p && ({ ...p, plan: { ...p.plan, members: [...p.plan.members, { id: f.userId }] } })); }}
      />
      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast('')} message={toast} />
    </Box>
  );
}
