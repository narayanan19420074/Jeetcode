import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Avatar, Badge, Box, Button, ButtonBase, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, ListItemIcon, Menu, MenuItem, Popover, Skeleton, Snackbar, TextField, Tooltip, Typography,
} from '@mui/material';
import { keyframes } from '@emotion/react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import PlanBuilder from './PlanBuilder';
import PlanWorkspace from './PlanWorkspace';
import FriendPicker from './FriendPicker';
import { PLAN_RED, ProgressRing, daysLeftInfo, fmtDay, fmtRange, localKey, parseInvite, planTheme, relTime } from './planUtils';

// Soft amber ring that pulses twice around a plan that was just saved, so you can see where it landed.
const landed = keyframes`0% { box-shadow: 0 0 0 0 rgba(229,9,20,0.85); } 70% { box-shadow: 0 0 0 16px rgba(229,9,20,0); } 100% { box-shadow: 0 0 0 0 rgba(229,9,20,0); }`;

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

// A card answers three questions only: how is this plan going, what do I do today, and where do I tap.
// Everything else (dates, friends, full question list, streaks) lives inside the plan itself.
function PlanCard({ plan, today, fresh, onOpen, onAddFriend, onDelete }) {
  const s = plan.summary;
  const theme = planTheme(plan.id);
  const ref = useRef(null);
  const [menuEl, setMenuEl] = useState(null);
  const left = daysLeftInfo(s, today);
  const urgent = left.tone === 'warning' || left.tone === 'error';
  const complete = s.status === 'completed';
  const todayLeft = Math.max(0, s.todayTotal - s.todayDone);
  const next = (plan.today || []).find((i) => !i.done);

  useEffect(() => {
    if (fresh) ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [fresh]);

  let head;
  let sub = '';
  if (complete) { head = 'All done'; sub = 'Every question solved'; }
  else if (s.status === 'upcoming') { head = `Starts ${fmtDay(s.startDate, { weekday: undefined })}`; sub = `${s.total} questions ready`; }
  else if (todayLeft > 0) { head = `${todayLeft} to solve today`; sub = next ? `Next: ${next.title}` : ''; }
  else if (s.overdue > 0) { head = `${s.overdue} overdue`; sub = 'Catch up today'; }
  else if (s.todayTotal > 0) { head = 'Today is done'; sub = 'Great work. See you tomorrow'; }
  else { head = 'Free day'; sub = 'Nothing scheduled today'; }

  const cta = complete ? 'Review plan' : s.done > 0 ? 'Continue' : 'Start plan';
  const chip = { display: 'inline-flex', alignItems: 'center', px: 1.1, py: 0.35, borderRadius: 99, fontSize: '0.75rem', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.42)', whiteSpace: 'nowrap' };

  return (
    <Box
      ref={ref}
      sx={{
        position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', color: '#fff', background: theme.gradient, borderRadius: '20px',
        p: { xs: 2, sm: 2.25 }, boxShadow: '0 18px 32px -18px rgba(2,6,23,0.65), inset 0 1px 0 rgba(255,255,255,0.2)',
        animation: fresh ? `${landed} 1.2s ease-out 2` : 'none', '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
        <ButtonBase onClick={onOpen} aria-label={`Open ${plan.title}`} sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', textAlign: 'left', fontFamily: 'inherit', color: 'inherit', borderRadius: '8px', py: 0.25 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.25, overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{plan.title}</Typography>
        </ButtonBase>
        <IconButton aria-label="Plan options" onClick={(e) => setMenuEl(e.currentTarget)} sx={{ color: '#fff', mr: -0.75, mt: -0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' } }}>
          <MoreVertRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
        <Box component="span" sx={{ ...chip, color: '#fff', bgcolor: urgent ? PLAN_RED : chip.bgcolor }}>{left.text}</Box>
        <Box component="span" sx={{ ...chip, fontVariantNumeric: 'tabular-nums' }}>{s.done}/{s.total} solved</Box>
      </Box>

      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5, mt: 2, mb: 2, flex: 1 }}>
        <ProgressRing value={s.percent} size={66} onDark />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.25 }}>{head}</Typography>
          {sub && <Typography noWrap sx={{ fontSize: '0.84rem', mt: 0.4, opacity: 0.92, fontWeight: 600, color: s.overdue > 0 && !complete && todayLeft === 0 ? '#FFB3B8' : 'inherit' }}>{sub}</Typography>}
          {!complete && todayLeft > 0 && s.overdue > 0 && <Typography sx={{ fontSize: '0.8rem', mt: 0.25, fontWeight: 800, color: '#FFB3B8' }}>{s.overdue} overdue</Typography>}
        </Box>
      </Box>

      <Button
        onClick={onOpen} startIcon={<BoltRoundedIcon />} endIcon={<ArrowForwardRoundedIcon />} disableElevation fullWidth
        sx={{ position: 'relative', height: 48, borderRadius: '10px', bgcolor: '#FFFFFF', color: '#0F0F0F', fontWeight: 800, fontSize: '0.95rem', '&:hover': { bgcolor: 'rgba(255,255,255,0.82)' } }}
      >
        {cta}
      </Button>

      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem sx={{ minHeight: 44 }} onClick={() => { const el = menuEl; setMenuEl(null); onAddFriend(el); }}>
          <ListItemIcon><PersonAddRoundedIcon fontSize="small" /></ListItemIcon>Add friends
        </MenuItem>
        <MenuItem sx={{ minHeight: 44, color: 'error.main' }} onClick={() => { setMenuEl(null); onDelete(plan); }}>
          <ListItemIcon sx={{ color: 'inherit' }}>{plan.isOwner ? <DeleteOutlineRoundedIcon fontSize="small" /> : <ExitToAppRoundedIcon fontSize="small" />}</ListItemIcon>
          {plan.isOwner ? 'Delete plan' : 'Leave plan'}
        </MenuItem>
      </Menu>
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
  const [freshId, setFreshId] = useState(null); // plan that was just saved: its card scrolls into view and glows
  const [toDelete, setToDelete] = useState(null); // plan waiting for delete / leave confirmation
  const [deleting, setDeleting] = useState(false);
  const today = localKey();

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

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      if (toDelete.isOwner) await studyPlanApi.remove(toDelete.id);
      else await studyPlanApi.leave(toDelete.id);
      setToast(toDelete.isOwner ? 'Plan deleted' : 'You left the plan');
      setToDelete(null);
      await loadPlans();
    } catch (err) {
      setToast(extractErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const dueToday = (plans || []).reduce((n, p) => n + Math.max(0, p.summary.todayTotal - p.summary.todayDone), 0);

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
        onSaved={(id) => {
          setBuilder(null);
          setFreshId(id);
          setToast('Plan saved');
          loadPlans();
          go();
          setTimeout(() => setFreshId(null), 4500);
        }}
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography component="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.6rem' }, lineHeight: 1.2, letterSpacing: -0.4 }}>Study Plans</Typography>
          {plans && plans.length > 0 && (
            <Typography sx={{ fontSize: 13.5, mt: 0.25, fontWeight: 600, color: (t) => (dueToday > 0 ? (t.palette.mode === 'dark' ? '#FF6B72' : '#C40812') : t.palette.text.secondary) }}>
              {dueToday > 0 ? `${dueToday} question${dueToday === 1 ? '' : 's'} to solve today` : 'Nothing due today'}
            </Typography>
          )}
        </Box>
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
        <Button
          variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})}
          sx={{ ml: 0.5, height: 42, px: 2, borderRadius: '12px', fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #E50914, #B20710)', boxShadow: '0 10px 20px -10px rgba(229,9,20,0.8)', '&:hover': { background: '#B20710' } }}
        >
          New plan
        </Button>
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
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: '20px' }} />)}
        </Box>
      ) : plans.length === 0 ? (
        <Box sx={[surface, { p: { xs: 3, sm: 5 }, textAlign: 'center' }]}>
          <Box sx={{ width: 72, height: 72, mx: 'auto', mb: 2, borderRadius: '22px', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg,#E50914,#7A0610)', boxShadow: '0 16px 28px -14px rgba(229,9,20,0.8)' }}>
            <EventNoteRoundedIcon sx={{ fontSize: 38 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.3rem' }}>Make your first study plan</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2.5, maxWidth: 360, mx: 'auto' }}>Name it, pick questions and choose a finish date. We schedule the rest.</Typography>
          <Button
            variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})}
            sx={{ height: 48, px: 3, borderRadius: '14px', fontWeight: 800, fontSize: 15, color: '#fff', background: 'linear-gradient(135deg, #E50914, #B20710)', '&:hover': { background: '#B20710' } }}
          >
            Create a plan
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {plans.map((p) => (
            <PlanCard
              key={p.id} plan={p} today={today} fresh={freshId === p.id}
              onOpen={() => go({ plan: p.id })} onAddFriend={(el) => setPicker({ el, plan: p })} onDelete={setToDelete}
            />
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
      <Dialog open={Boolean(toDelete)} onClose={() => !deleting && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{toDelete?.isOwner ? 'Delete plan?' : 'Leave plan?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {toDelete?.isOwner
              ? `“${toDelete?.title}” will be removed for everyone. Questions you solved stay solved.`
              : `You will be removed from “${toDelete?.title}”. You can rejoin with the invite link.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" disableElevation onClick={confirmDelete} disabled={deleting} sx={{ fontWeight: 700 }}>
            {deleting ? 'Please wait…' : toDelete?.isOwner ? 'Delete' : 'Leave'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast('')} message={toast} />
    </Box>
  );
}
