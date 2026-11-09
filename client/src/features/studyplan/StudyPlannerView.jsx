import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Alert, Badge, Box, Button, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Skeleton, Snackbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import BackToDashboard from '../../components/BackToDashboard';
import { FONT_WEIGHTS, RADII_PX } from '../../app/design/designTokens';
import FriendPicker from './FriendPicker';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import { MobilePlanWorkspace, MobilePlans, MobileShell } from './MobileStudyPlan';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PlanBuilder from './PlanBuilder';
import PlanWorkspace from './PlanWorkspace';
import { extractErrorMessage } from '../../api/apiClient';
import { fmtRange, localKey, parseInvite } from './planUtils';
import { friendsApi } from '../../api/friendsApi';
import { studyPlanApi } from '../../api/studyPlanApi';
import { surface } from '../dashboard/dashboardUtils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FriendsPanel, NotificationsPopover } from './planner/PlannerSidePanels';
import { PlanCard } from './planner/PlanCardParts';

export default function StudyPlannerView({ isAuthenticated }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const planId = params.get('plan');
  const joinCode = params.get('join');
  // Phones get their own full-screen layouts (MobileStudyPlan); wide screens are unchanged.
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'), { noSsr: true });

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

  // Phone: the notifications sheet. Same refresh and mark-as-read as the bell popover.
  const openNotes = async () => {
    try {
      const { data } = await studyPlanApi.notifications();
      setNotes(data.data);
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
    const loginPrompt = (
      <Box sx={[surface, { p: 4, textAlign: 'center' }]}>
        <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold }}>Log in to plan your study days</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Create a schedule, add friends and track progress together.</Typography>
        <Button variant="contained" disableElevation onClick={() => navigate('/login')} sx={{ fontWeight: FONT_WEIGHTS.bold }}>Log in</Button>
      </Box>
    );
    return isPhone ? (
      <MobileShell>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent', mb: 1 }} />
        {loginPrompt}
      </MobileShell>
    ) : loginPrompt;
  }

  if (builder) {
    const builderView = (
      <PlanBuilder
        plan={builder.plan}
        onCancel={() => setBuilder(null)}
        onSaved={(id) => { setBuilder(null); loadPlans(); go({ plan: id }); }}
      />
    );
    return isPhone ? <MobileShell>{builderView}</MobileShell> : builderView;
  }

  // Open plan: just its questions and everyone's progress.
  if (planId) {
    if (isPhone) {
      return (
        <MobileShell>
          <MobilePlanWorkspace
            key={planId} id={planId} friends={friends}
            onBack={() => go()}
            onEdit={(plan) => setBuilder({ plan })}
            onChanged={loadPlans}
            onGone={() => { loadPlans(); go(); }}
            onFindFriends={findFriends}
            notify={setToast}
          />
          <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast('')} message={toast} />
        </MobileShell>
      );
    }
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

  if (isPhone) {
    return (
      <MobileShell>
        <MobilePlans
          plans={plans} friends={friends} notes={notes} error={error} onDismissError={() => setError('')}
          invite={invite} joining={joining} onAccept={accept} onDismissInvite={() => go()}
          dueToday={dueToday} today={today} onNew={() => setBuilder({})} onOpenPlan={(id) => go({ plan: id })}
          onAddFriend={(el, p) => setPicker({ el, plan: p })} onDelete={setToDelete} onFindFriends={findFriends}
          codeInput={codeInput} setCodeInput={(v) => { setCodeInput(v); setCodeError(''); }} codeError={codeError}
          onJoinCode={joinFromInput} onOpenNotes={openNotes}
        />
        <FriendPicker
          anchorEl={picker?.el} onClose={() => setPicker(null)} friends={friends} memberIds={pickerMemberIds} onFindFriends={findFriends}
          onAdd={async (f) => { if (await addFriend(picker.plan, f)) setPicker((p) => p && ({ ...p, plan: { ...p.plan, members: [...p.plan.members, { id: f.userId }] } })); }}
        />
        <Dialog open={Boolean(toDelete)} onClose={() => !deleting && setToDelete(null)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>{toDelete?.isOwner ? 'Delete plan?' : 'Leave plan?'}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {toDelete?.isOwner
                ? `“${toDelete?.title}” will be removed for everyone. Questions you solved stay solved.`
                : `You will be removed from “${toDelete?.title}”. You can rejoin with the invite link.`}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
            <Button color="error" variant="contained" disableElevation onClick={confirmDelete} disabled={deleting} sx={{ fontWeight: FONT_WEIGHTS.bold }}>
              {deleting ? 'Please wait…' : toDelete?.isOwner ? 'Delete' : 'Leave'}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast('')} message={toast} />
      </MobileShell>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2 }}>Study Plan</Typography>
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
        <Button variant="contained" disableElevation size="small" startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})} sx={{ fontWeight: FONT_WEIGHTS.bold, ml: 0.5 }}>New plan</Button>
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
                <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>{invite.title}</Typography>
                <Typography variant="caption" color="text.secondary">{invite.taskCount} questions · {fmtRange(invite.startDate, invite.endDate)} · {invite.memberCount} member{invite.memberCount === 1 ? '' : 's'}</Typography>
              </Box>
              {invite.isFull ? <Typography color="warning.main" sx={{ fontWeight: FONT_WEIGHTS.bold }}>This plan is full</Typography> : (
                <Button size="small" variant="contained" disableElevation disabled={joining} onClick={accept} sx={{ fontWeight: FONT_WEIGHTS.bold }}>{joining ? 'Joining…' : 'Join'}</Button>
              )}
              <Button size="small" onClick={() => go()} disabled={joining}>Not now</Button>
            </>
          )}
        </Box>
      )}

      {plans === null ? (
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(3, minmax(0,1fr))' } }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: RADII_PX.card }} />)}
        </Box>
      ) : plans.length === 0 ? (
        <Box sx={[surface, { p: 3, textAlign: 'center' }]}>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>No plans yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>Pick questions, set a finish date and add friends.</Typography>
          <Button variant="contained" disableElevation size="small" startIcon={<AddRoundedIcon />} onClick={() => setBuilder({})} sx={{ fontWeight: FONT_WEIGHTS.bold }}>Create a plan</Button>
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
        <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>{toDelete?.isOwner ? 'Delete plan?' : 'Leave plan?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {toDelete?.isOwner
              ? `“${toDelete?.title}” will be removed for everyone. Questions you solved stay solved.`
              : `You will be removed from “${toDelete?.title}”. You can rejoin with the invite link.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Button>
          <Button color="error" variant="contained" disableElevation onClick={confirmDelete} disabled={deleting} sx={{ fontWeight: FONT_WEIGHTS.bold }}>
            {deleting ? 'Please wait…' : toDelete?.isOwner ? 'Delete' : 'Leave'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(toast)} autoHideDuration={2600} onClose={() => setToast('')} message={toast} />
    </Box>
  );
}
