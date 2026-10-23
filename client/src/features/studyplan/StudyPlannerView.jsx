import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Avatar, Badge, Box, Button, ButtonBase, Chip, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Popover, Skeleton, Snackbar, TextField, Tooltip, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
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
import { PLAN_AMBER, PlanTaskRow, ProgressRing, daysLeftInfo, fmtDay, fmtRange, localKey, parseInvite, planTheme, planTone, relDay, relTime } from './planUtils';

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

// Full question list of one plan, loaded the first time the card is previewed.
function PlanQuestions({ planId, today }) {
  const [state, setState] = useState({ loading: true, items: [], members: [], error: '' });

  useEffect(() => {
    let cancelled = false;
    setState((p) => ({ ...p, loading: true, error: '' }));
    studyPlanApi
      .get(planId)
      .then(({ data }) => !cancelled && setState({ loading: false, items: data.data.items || [], members: data.data.members || [], error: '' }))
      .catch((err) => !cancelled && setState({ loading: false, items: [], members: [], error: extractErrorMessage(err) }));
    return () => { cancelled = true; };
  }, [planId]);

  const membersById = useMemo(() => new Map(state.members.map((m) => [m.userId, m])), [state.members]);
  const days = useMemo(() => {
    const out = [];
    state.items.forEach((it) => {
      const last = out[out.length - 1];
      if (last && last.date === it.date) last.items.push(it);
      else out.push({ date: it.date, items: [it] });
    });
    return out;
  }, [state.items]);

  if (state.loading) return <Box sx={{ p: 1.25 }}><Skeleton variant="rounded" height={44} sx={{ mb: 0.75, borderRadius: '10px' }} /><Skeleton variant="rounded" height={44} sx={{ borderRadius: '10px' }} /></Box>;
  if (state.error) return <Typography variant="body2" color="error" sx={{ p: 1.5 }}>{state.error}</Typography>;
  if (days.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>No questions in this plan.</Typography>;

  return (
    <Box sx={(t) => ({ maxHeight: 340, overflowY: 'auto', scrollbarWidth: 'thin', borderTop: `1px solid ${t.palette.divider}` })}>
      {days.map((d) => {
        const doneCount = d.items.filter((i) => i.done).length;
        return (
          <Box key={d.date}>
            <Box sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, bgcolor: alpha(t.palette.text.primary, 0.04) })}>
              <Typography sx={{ flex: 1, fontSize: 11.5, fontWeight: 800, letterSpacing: 0.4, color: d.date === today ? 'primary.main' : 'text.secondary' }}>{relDay(d.date, today).toUpperCase()}</Typography>
              <Typography sx={[{ fontSize: 11.5, fontWeight: 700, color: doneCount === d.items.length ? 'success.main' : 'text.secondary' }, mono]}>{doneCount}/{d.items.length}</Typography>
            </Box>
            {d.items.map((it, i) => <PlanTaskRow key={it.id} item={it} last={i === d.items.length - 1} doers={it.doneBy.map((u) => membersById.get(u)).filter((m) => m && !m.isMe)} />)}
          </Box>
        );
      })}
    </Box>
  );
}

// One plan = one compact row (~76px): ring, title, "3/20 · 12 days left", what is due today. Tap = open.
// Secondary actions live in the ⋮ menu so the card stays calm (same pattern as Google Tasks / Todoist).
function PlanCard({ plan, today, expanded, onToggle, onOpen, onAddFriend, onDelete }) {
  const [menuEl, setMenuEl] = useState(null);
  const s = plan.summary;
  const theme = planTheme(plan.id);
  const info = daysLeftInfo(s, today);
  const complete = s.status === 'completed';
  const todayLeft = Math.max(0, s.todayTotal - s.todayDone);

  let status;
  if (complete) status = { text: 'All questions solved', tone: 'success.main' };
  else if (s.status === 'upcoming') status = { text: `Starts ${fmtDay(s.startDate)}`, tone: 'text.secondary' };
  else if (todayLeft > 0) status = { text: `${todayLeft} to solve today${s.overdue ? ` · ${s.overdue} overdue` : ''}`, tone: s.overdue ? 'error.main' : 'primary.main' };
  else if (s.overdue > 0) status = { text: `${s.overdue} overdue · catch up`, tone: 'error.main' };
  else status = { text: s.todayTotal > 0 ? "Today's goal done" : 'Nothing due today', tone: 'success.main' };

  const closeMenu = () => setMenuEl(null);

  return (
    <Box sx={[surface, { position: 'relative', overflow: 'hidden' }]}>
      <Box aria-hidden sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: theme.gradient }} />
      <Box sx={{ display: 'flex', alignItems: 'center', pl: 0.5 }}>
        <ButtonBase
          onClick={onOpen} aria-label={`Open ${plan.title}`}
          sx={(t) => ({ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.25, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', pl: 1.25, pr: 0.5, py: 1.1, '&:active': { bgcolor: t.palette.action.selected } })}
        >
          <ProgressRing value={s.percent} size={44} tone={planTone(s)} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{plan.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, color: 'text.secondary' }}>
              <Typography noWrap sx={[{ fontSize: 12, fontWeight: 600 }, mono]}>{s.done}/{s.total}</Typography>
              <Typography noWrap sx={{ fontSize: 12, fontWeight: 600, color: info.tone === 'primary' || info.tone === 'info' ? 'text.secondary' : `${info.tone}.main` }}>· {info.text}</Typography>
              {s.streak > 0 && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                  <LocalFireDepartmentRoundedIcon sx={{ fontSize: 14, color: '#F97316' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 800 }}>{s.streak}</Typography>
                </Box>
              )}
              {plan.members.length > 1 && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.2, flexShrink: 0 }}>
                  <GroupsRoundedIcon sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{plan.members.length}</Typography>
                </Box>
              )}
            </Box>
            <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700, color: status.tone }}>{status.text}</Typography>
          </Box>
        </ButtonBase>
        <IconButton onClick={(e) => setMenuEl(e.currentTarget)} aria-label={`More actions for ${plan.title}`} aria-haspopup="menu" sx={{ width: 44, height: 44, mr: 0.25 }}>
          <MoreVertRoundedIcon />
        </IconButton>
      </Box>

      <Collapse in={expanded} unmountOnExit>
        <PlanQuestions planId={plan.id} today={today} />
      </Collapse>

      <Menu
        anchorEl={menuEl} open={Boolean(menuEl)} onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200, borderRadius: '12px' } } }}
      >
        <MenuItem onClick={() => { closeMenu(); onOpen(); }}><ListItemIcon><ChevronRightRoundedIcon fontSize="small" /></ListItemIcon><ListItemText>Open plan</ListItemText></MenuItem>
        <MenuItem onClick={() => { closeMenu(); onToggle(); }}>
          <ListItemIcon><FormatListBulletedRoundedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>{expanded ? 'Hide questions' : `Preview ${s.total} question${s.total === 1 ? '' : 's'}`}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { onAddFriend(menuEl); setMenuEl(null); }}><ListItemIcon><PersonAddRoundedIcon fontSize="small" /></ListItemIcon><ListItemText>Add friends</ListItemText></MenuItem>
        <MenuItem onClick={() => { closeMenu(); onDelete(plan); }} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}>{plan.isOwner ? <DeleteOutlineRoundedIcon fontSize="small" /> : <ExitToAppRoundedIcon fontSize="small" />}</ListItemIcon>
          <ListItemText>{plan.isOwner ? 'Delete plan' : 'Leave plan'}</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}

// "Today": the next few unsolved questions across every plan, solvable in one tap (Todoist "Today" idea).
function TodayCard({ plans, onOpenPlan }) {
  const items = useMemo(
    () => plans.flatMap((p) => (p.today || []).filter((it) => !it.done).map((it) => ({ ...it, planId: p.id, planTitle: p.title }))),
    [plans]
  );
  if (items.length === 0) return null;
  const shown = items.slice(0, 3);
  return (
    <Box sx={[surface, { overflow: 'hidden' }]}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.25, pt: 1, pb: 0.5 }}>
        <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 800, letterSpacing: 0.5, color: 'text.secondary' }}>DO TODAY</Typography>
        <Chip size="small" label={`${items.length} left`} sx={{ height: 22, fontWeight: 800, fontSize: 11.5, color: '#1B1200', bgcolor: PLAN_AMBER }} />
      </Box>
      {shown.map((it, i) => <PlanTaskRow key={`${it.planId}-${it.id}`} item={it} note={it.planTitle} last={i === shown.length - 1 && items.length <= 3} />)}
      {items.length > 3 && (
        <ButtonBase onClick={() => onOpenPlan(items[3].planId)} sx={{ width: '100%', py: 0.9, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: 'primary.main' }}>
          +{items.length - 3} more · open plan
        </ButtonBase>
      )}
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
  const [expandedId, setExpandedId] = useState(null); // plan whose questions are showing
  const [toDelete, setToDelete] = useState(null); // plan waiting for delete / leave confirmation
  const [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active' | 'done'
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
      if (expandedId === toDelete.id) setExpandedId(null);
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

  // Plans that need you (overdue, then due today) float to the top; finished plans get their own tab.
  const doneCount = (plans || []).filter((p) => p.summary.status === 'completed').length;
  const visiblePlans = useMemo(() => {
    const list = (plans || []).filter((p) => (p.summary.status === 'completed') === (filter === 'done' && doneCount > 0));
    const rank = (p) => (p.summary.overdue > 0 ? 0 : p.summary.todayTotal - p.summary.todayDone > 0 ? 1 : 2);
    return [...list].sort((a, b) => rank(a) - rank(b));
  }, [plans, filter, doneCount]);

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
    <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: 19 }}>Study Plan</Typography>
          {plans && plans.length > 0 && (
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: dueToday > 0 ? 'text.secondary' : 'success.main' }}>
              {dueToday > 0 ? `${dueToday} question${dueToday === 1 ? '' : 's'} left today` : 'All caught up for today'}
            </Typography>
          )}
        </Box>
        <Tooltip title="Friends">
          <IconButton onClick={() => setShowFriends((v) => !v)} aria-label="Friends" aria-expanded={showFriends} color={showFriends ? 'primary' : 'default'} sx={{ width: 44, height: 44 }}>
            <GroupsRoundedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Notifications">
          <IconButton onClick={openBell} aria-label="Notifications" sx={{ width: 44, height: 44 }}>
            <Badge color="error" badgeContent={notes.unread} max={9}><NotificationsRoundedIcon /></Badge>
          </IconButton>
        </Tooltip>
        <Button variant="contained" disableElevation size="small" startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})} sx={{ fontWeight: 800, ml: 0.5, height: 36, borderRadius: 99, px: 1.75 }}>New</Button>
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

      {plans && plans.length > 0 && filter === 'active' && <TodayCard plans={plans} onOpenPlan={(id) => go({ plan: id })} />}

      {doneCount > 0 && (
        <Box role="tablist" aria-label="Plan filter" sx={{ display: 'flex', gap: 0.75 }}>
          {[['active', `Active · ${(plans?.length || 0) - doneCount}`], ['done', `Completed · ${doneCount}`]].map(([v, label]) => (
            <Chip key={v} role="tab" aria-selected={filter === v} clickable label={label} onClick={() => setFilter(v)} color={filter === v ? 'primary' : 'default'} variant={filter === v ? 'filled' : 'outlined'} sx={{ fontWeight: 700, height: 32 }} />
          ))}
        </Box>
      )}

      {plans === null ? (
        <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={76} sx={{ borderRadius: '14px' }} />)}
        </Box>
      ) : plans.length === 0 ? (
        <Box sx={[surface, { p: 3, textAlign: 'center' }]}>
          <Typography sx={{ fontWeight: 700 }}>No plans yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>Pick questions, set a finish date and add friends.</Typography>
          <Button variant="contained" disableElevation size="small" startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})} sx={{ fontWeight: 700 }}>Create a plan</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 1, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {visiblePlans.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center', gridColumn: '1 / -1' }}>No active plans. Tap New to start one.</Typography>
          )}
          {visiblePlans.map((p) => (
            <PlanCard
              key={p.id} plan={p} today={today} expanded={expandedId === p.id}
              onToggle={() => setExpandedId((cur) => (cur === p.id ? null : p.id))}
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
