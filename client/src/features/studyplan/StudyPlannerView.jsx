import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert, Avatar, AvatarGroup, Badge, Box, Button, ButtonBase, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, Popover, Skeleton, Snackbar, TextField, Tooltip, Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import PlanBuilder from './PlanBuilder';
import PlanWorkspace from './PlanWorkspace';
import FriendPicker from './FriendPicker';
import { PLAN_AMBER, PlanTaskRow, ProgressRing, daysTile, fmtDay, fmtRange, localKey, parseInvite, planTheme, relDay, relTime } from './planUtils';

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

// Full question list of one plan, loaded the first time the card is expanded.
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

  if (state.loading) return <Box sx={{ p: 1.5 }}><Skeleton variant="rounded" height={52} sx={{ mb: 0.75, borderRadius: '12px' }} /><Skeleton variant="rounded" height={52} sx={{ borderRadius: '12px' }} /></Box>;
  if (state.error) return <Typography variant="body2" color="error" sx={{ p: 1.5 }}>{state.error}</Typography>;
  if (days.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>No questions in this plan.</Typography>;

  return (
    <Box sx={{ maxHeight: 380, overflowY: 'auto', scrollbarWidth: 'thin', px: 1.25, py: 1 }}>
      {days.map((d) => {
        const doneCount = d.items.filter((i) => i.done).length;
        return (
          <Box key={d.date}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, pt: 0.5, pb: 0.6 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.4, color: d.date === today ? 'primary.main' : 'text.secondary' }}>{relDay(d.date, today).toUpperCase()}</Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="caption" sx={[{ fontWeight: 700, color: doneCount === d.items.length ? 'success.main' : 'text.secondary' }, mono]}>{doneCount}/{d.items.length}</Typography>
            </Box>
            {d.items.map((it) => <PlanTaskRow key={it.id} item={it} doers={it.doneBy.map((u) => membersById.get(u)).filter((m) => m && !m.isMe)} />)}
          </Box>
        );
      })}
    </Box>
  );
}

function PlanCard({ plan, today, expanded, onToggle, onOpen, onAddFriend, onDelete }) {
  const s = plan.summary;
  const theme = planTheme(plan.id);
  const tile = daysTile(s, today);
  const complete = s.status === 'completed';
  const behind = s.status === 'behind';
  const todayItems = plan.today || [];
  const todayLeft = Math.max(0, s.todayTotal - s.todayDone);

  let message;
  if (complete) message = 'Plan complete! Every question is solved.';
  else if (s.status === 'upcoming') message = `Starts ${fmtDay(s.startDate)}. Get ready!`;
  else if (s.todayTotal === 0) message = behind ? `${s.overdue} overdue. Catch up today!` : 'Nothing scheduled today. Get ahead!';
  else if (todayLeft === 0) message = "Today's goal done. Great work!";
  else message = `${todayLeft} to solve today${s.overdue ? ` · ${s.overdue} overdue` : ''}`;

  const cta = complete ? 'Review plan' : s.done > 0 ? 'Continue plan' : 'Start plan';
  const glassBtn = { width: 44, height: 44, flexShrink: 0, color: '#fff', bgcolor: 'rgba(255,255,255,0.16)', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } };

  return (
    <Box sx={(t) => ({ borderRadius: '16px', overflow: 'hidden', bgcolor: t.palette.background.paper, boxShadow: '0 14px 28px -16px rgba(2,6,23,0.85)' })}>
      <Box sx={{ position: 'relative', color: '#fff', background: theme.gradient, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)', overflow: 'hidden' }}>
        <Box aria-hidden sx={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.26), transparent 70%)', pointerEvents: 'none' }} />
        <Box aria-hidden sx={{ position: 'absolute', left: -40, bottom: 20, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', p: { xs: 2, sm: 2.25 } }}>
          {/* title + countdown tile (tap to open) */}
          <ButtonBase
            onClick={onOpen} aria-label={`Open ${plan.title}`}
            sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', borderRadius: '8px' }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2, overflowWrap: 'anywhere' }}>{plan.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, color: 'rgba(255,255,255,0.88)' }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{fmtRange(s.startDate, s.endDate)}</Typography>
              </Box>
              {behind && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.75, px: 1, py: 0.25, borderRadius: 99, bgcolor: 'rgba(251,191,36,0.18)', color: '#FDE68A' }}>
                  <ErrorOutlineRoundedIcon sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>{s.overdue} overdue</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ flexShrink: 0, minWidth: 84, px: 1.5, py: 0.9, borderRadius: '14px', textAlign: 'center', bgcolor: tile.urgent ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.14)', border: tile.urgent ? '1px solid rgba(251,191,36,0.6)' : '1px solid transparent' }}>
              <Typography sx={{ fontWeight: 900, fontSize: tile.big.length > 3 ? '1.25rem' : '1.9rem', lineHeight: tile.big.length > 3 ? 1.5 : 1, fontVariantNumeric: 'tabular-nums', color: tile.urgent ? '#FDE68A' : '#fff' }}>{tile.big}</Typography>
              {tile.label && <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, mt: 0.4, color: 'rgba(255,255,255,0.85)' }}>{tile.label}</Typography>}
            </Box>
          </ButtonBase>

          {/* what are we studying today: ring + speech bubble */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 1.5 }}>
            <ProgressRing value={s.percent} size={64} onDark />
            <Box sx={{ minWidth: 0, flex: 1, px: 1.5, py: 1.1, borderRadius: '16px 16px 16px 4px', bgcolor: 'rgba(255,255,255,0.14)' }}>
              <Typography sx={{ fontSize: '0.84rem', lineHeight: 1.4, fontWeight: 700 }}>{message}</Typography>
              {!complete && todayItems.slice(0, 3).map((it) => (
                <Typography key={it.id} noWrap sx={{ fontSize: '0.78rem', mt: 0.3, fontWeight: 600, opacity: it.done ? 0.6 : 0.95, textDecoration: it.done ? 'line-through' : 'none' }}>
                  {it.done ? '✓ ' : it.overdue ? '! ' : '• '}{it.title}
                </Typography>
              ))}
              {!complete && todayItems.length > 3 && <Typography sx={{ fontSize: '0.72rem', opacity: 0.8 }}>+{todayItems.length - 3} more</Typography>}
            </Box>
          </Box>

          {/* solved bar */}
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#FDE68A', fontVariantNumeric: 'tabular-nums' }}>{s.done}/{s.total} solved</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {s.streak > 0 && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: PLAN_AMBER }} />
                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 800 }}>{s.streak}d</Typography>
                  </Box>
                )}
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: 10, fontWeight: 700, border: '2px solid rgba(255,255,255,0.9)' } }}>
                  {plan.members.map((m) => <Avatar key={m.id} src={m.avatarUrl || undefined} alt={m.name}>{m.name?.[0]?.toUpperCase()}</Avatar>)}
                </AvatarGroup>
              </Box>
            </Box>
            <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.percent} aria-label="Plan progress" sx={{ height: 10, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.max(s.percent, 4)}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${PLAN_AMBER}, #F59E0B)`, transition: 'width .6s ease' }} />
            </Box>
          </Box>

          {/* open + quick actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.75 }}>
            <Button
              onClick={onOpen} startIcon={<BoltRoundedIcon />} endIcon={<ArrowForwardRoundedIcon />} disableElevation
              sx={{ flex: 1, height: 44, borderRadius: '14px', bgcolor: PLAN_AMBER, color: '#1B1200', fontWeight: 800, fontSize: '0.92rem', '&:hover': { bgcolor: '#F5B50F' } }}
            >
              {cta}
            </Button>
            <Tooltip title="Add friends">
              <IconButton aria-label="Add friends to plan" onClick={(e) => onAddFriend(e.currentTarget)} sx={glassBtn}><PersonAddRoundedIcon sx={{ fontSize: 20 }} /></IconButton>
            </Tooltip>
            <Tooltip title={plan.isOwner ? 'Delete plan' : 'Leave plan'}>
              <IconButton aria-label={plan.isOwner ? 'Delete plan' : 'Leave plan'} onClick={() => onDelete(plan)} sx={[glassBtn, { color: '#FECACA' }]}>
                {plan.isOwner ? <DeleteOutlineRoundedIcon sx={{ fontSize: 21 }} /> : <ExitToAppRoundedIcon sx={{ fontSize: 21 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* arrow: show / hide the questions right here */}
        <ButtonBase
          onClick={onToggle} aria-expanded={expanded} aria-label={expanded ? 'Hide questions' : 'Show questions'}
          sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, py: 1, bgcolor: 'rgba(0,0,0,0.24)', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.34)' } }}
        >
          {expanded ? 'Hide questions' : `Show ${s.total} question${s.total === 1 ? '' : 's'}`}
          <ExpandMoreRoundedIcon sx={{ fontSize: 20, transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'none' }} />
        </ButtonBase>
      </Box>

      <Collapse in={expanded} unmountOnExit>
        <PlanQuestions planId={plan.id} today={today} />
      </Collapse>
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
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Study Plan</Typography>
          {plans && plans.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {plans.length} plan{plans.length === 1 ? '' : 's'} · {dueToday > 0 ? `${dueToday} question${dueToday === 1 ? '' : 's'} to solve today` : 'nothing due today'}
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
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: '14px' }} />)}
        </Box>
      ) : plans.length === 0 ? (
        <Box sx={[surface, { p: 3, textAlign: 'center' }]}>
          <Typography sx={{ fontWeight: 700 }}>No plans yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>Pick questions, set a finish date and add friends.</Typography>
          <Button variant="contained" disableElevation size="small" startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})} sx={{ fontWeight: 700 }}>Create a plan</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {plans.map((p) => (
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
