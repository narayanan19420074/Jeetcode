import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Avatar, Box, Button, ButtonBase, Collapse, IconButton, Skeleton, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import ProgressRing from '../../components/ProgressRing';
import { surface } from '../dashboard/dashboardUtils';
import PlanBuilder from './PlanBuilder';
import PlanWorkspace from './PlanWorkspace';
import { TaskLine } from './OverviewTab';
import { CountUp, Rise } from './motion';
import { StatusPill, fmtRange, paceLabel, parseInvite } from './planUtils';

const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
const EMPTY = new Map();

const railItem = (active) => (t) => ({
  width: '100%', justifyContent: 'flex-start', gap: 1, px: 1.25, py: 0.8, borderRadius: '8px', textAlign: 'left', fontFamily: 'inherit',
  color: active ? t.palette.text.primary : t.palette.text.secondary,
  bgcolor: active ? `${t.palette.primary.main}1F` : 'transparent',
  '&:hover': { bgcolor: active ? undefined : t.palette.action.hover, color: t.palette.text.primary },
});

function RailGroup({ title, plans, planId, onSelect }) {
  if (!plans.length) return null;
  return (
    <>
      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' }, px: 1.25, pt: 1.25, fontWeight: 800, letterSpacing: 0.4 }}>{title}</Typography>
      {plans.map((p) => {
        const pending = p.summary.todayTotal > p.summary.todayDone;
        return (
          <ButtonBase key={p.id} onClick={() => onSelect(p.id)} sx={[railItem(planId === p.id), { flexShrink: 0, width: { xs: 'auto', md: '100%' } }]}>
            <Typography component="span" sx={{ fontWeight: 700, color: 'text.disabled' }}>#</Typography>
            <Typography variant="body2" noWrap sx={{ flex: 1, maxWidth: { xs: 140, md: 'none' }, fontWeight: pending || planId === p.id ? 800 : 500 }}>{p.title}</Typography>
            {p.summary.status === 'behind' && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} aria-label="Behind schedule" />}
            <Typography variant="caption" color="text.secondary" sx={mono}>{p.summary.percent}%</Typography>
          </ButtonBase>
        );
      })}
    </>
  );
}

// Who is studying with you: the people in the open plan, or across all your plans on the Overview.
function FriendsCard({ plans, planId }) {
  const [open, setOpen] = useState(true);
  const friends = useMemo(() => {
    if (!plans) return [];
    const scoped = planId ? plans.filter((p) => p.id === planId) : plans;
    const byId = new Map();
    scoped.forEach((p) => (p.members || []).forEach((m) => {
      if (m.isMe) return;
      const cur = byId.get(m.id) || { ...m, shared: 0 };
      cur.shared += 1;
      byId.set(m.id, cur);
    }));
    return [...byId.values()].sort((a, b) => b.shared - a.shared || a.name.localeCompare(b.name));
  }, [plans, planId]);

  if (plans === null) return null;
  return (
    <Box sx={[surface, { display: { xs: 'none', md: 'block' }, overflow: 'hidden' }]}>
      <ButtonBase onClick={() => setOpen((o) => !o)} aria-expanded={open} sx={{ width: '100%', justifyContent: 'flex-start', gap: 1, px: 1.75, py: 1.1, fontFamily: 'inherit', textAlign: 'left' }}>
        <GroupsRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>{planId ? 'In this plan' : 'Friends'}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{friends.length}</Typography>
        <ExpandMoreRoundedIcon sx={{ fontSize: 20, color: 'text.secondary', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </ButtonBase>
      <Collapse in={open} timeout={220}>
        <Box sx={(t) => ({ borderTop: `1px solid ${t.palette.divider}`, maxHeight: 260, overflowY: 'auto', scrollbarWidth: 'thin', py: 0.5 })}>
          {friends.length === 0 ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.75, py: 1.25 }}>
              {planId ? 'No one else has joined yet. Share the invite link.' : 'Invite friends to a plan and they will show up here.'}
            </Typography>
          ) : friends.map((f) => (
            <Box key={f.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.1, px: 1.75, py: 0.7 }}>
              <Avatar src={f.avatarUrl || undefined} sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 700 }}>{f.name?.[0]?.toUpperCase()}</Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: 1.25 }}>{f.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>@{f.handle}</Typography>
              </Box>
              {!planId && f.shared > 1 && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{f.shared} plans</Typography>}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function PlanRail({ plans, planId, onOverview, onSelect, onNew, onJoinCode, codeInput, setCodeInput, codeError }) {
  const active = (plans || []).filter((p) => p.summary.status !== 'completed');
  const done = (plans || []).filter((p) => p.summary.status === 'completed');
  return (
    <Box sx={[surface, { p: 1.25, display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 0.5, overflowX: { xs: 'auto', md: 'visible' }, alignItems: { xs: 'center', md: 'stretch' } }]}>
      <ButtonBase onClick={onOverview} sx={[railItem(!planId), { flexShrink: 0, width: { xs: 'auto', md: '100%' } }]}>
        <DashboardRoundedIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Overview</Typography>
      </ButtonBase>

      {plans === null && [0, 1, 2].map((i) => <Skeleton key={i} height={32} sx={{ display: { xs: 'none', md: 'block' } }} />)}
      <RailGroup title="ACTIVE" plans={active} planId={planId} onSelect={onSelect} />
      <RailGroup title="COMPLETED" plans={done} planId={planId} onSelect={onSelect} />

      <ButtonBase onClick={onNew} sx={[railItem(false), { flexShrink: 0, width: { xs: 'auto', md: '100%' }, color: 'primary.main', mt: { md: 0.5 } }]}>
        <AddRoundedIcon sx={{ fontSize: 18 }} />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>New plan</Typography>
      </ButtonBase>

      <Box sx={{ display: { xs: 'none', md: 'block' }, mt: 1.5, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 0.75, fontWeight: 800, letterSpacing: 0.4 }}>JOIN A FRIEND'S PLAN</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
          <TextField
            size="small" placeholder="Paste invite link" value={codeInput} onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onJoinCode()} error={Boolean(codeError)} helperText={codeError || ' '}
            slotProps={{ htmlInput: { 'aria-label': 'Invite link or code' } }} fullWidth
          />
          <Tooltip title="Find plan"><IconButton onClick={onJoinCode} aria-label="Find plan" sx={{ alignSelf: 'flex-start', mt: 0.25 }}><GroupAddRoundedIcon /></IconButton></Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

function Overview({ plans, onSelect, onNew }) {
  const totals = useMemo(() => {
    const list = plans || [];
    return {
      todayTotal: list.reduce((n, p) => n + p.summary.todayTotal, 0),
      todayDone: list.reduce((n, p) => n + p.summary.todayDone, 0),
      overdue: list.reduce((n, p) => n + p.summary.overdue, 0),
      active: list.filter((p) => p.summary.status !== 'completed').length,
      streak: list.reduce((n, p) => Math.max(n, p.summary.streak), 0),
    };
  }, [plans]);

  if (plans === null) return <Skeleton variant="rounded" height={220} sx={{ borderRadius: '14px' }} />;

  if (plans.length === 0) {
    return (
      <Rise>
        <Box sx={[surface, { p: { xs: 3, sm: 5 }, textAlign: 'center' }]}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Plan your study days</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2.5, maxWidth: 480, mx: 'auto' }}>
            Pick questions, put them on the calendar and invite friends. Everything ticks off by itself when you solve it, and you can see who is ahead and who is falling behind.
          </Typography>
          <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={onNew} sx={{ fontWeight: 700 }}>Create your first plan</Button>
        </Box>
      </Rise>
    );
  }

  const withToday = plans.filter((p) => p.today.length > 0);

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Study Plan</Typography>
          <Typography variant="body2" color="text.secondary">What to study today, and how your team is doing.</Typography>
        </Box>
        <Button variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={onNew} sx={{ fontWeight: 700 }}>New plan</Button>
      </Box>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' } }}>
        {[
          ['Today', <><CountUp value={totals.todayDone} />/{totals.todayTotal}</>],
          ['Overdue', <Box component="span" sx={{ color: totals.overdue ? 'error.main' : 'success.main' }}><CountUp value={totals.overdue} /></Box>],
          ['Active plans', <CountUp value={totals.active} />],
          ['Best plan streak', <><LocalFireDepartmentRoundedIcon sx={{ fontSize: 22, color: totals.streak ? 'warning.main' : 'text.disabled', mb: -0.4 }} /> <CountUp value={totals.streak} /></>],
        ].map(([label, value], i) => (
          <Rise key={label} index={i}>
            <Box sx={[surface, { p: 2 }]}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>{label.toUpperCase()}</Typography>
              <Typography sx={[{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }, mono]}>{value}</Typography>
            </Box>
          </Rise>
        ))}
      </Box>

      <Rise index={4}>
        <Box sx={[surface, { p: 2 }]}>
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Today</Typography>
          {withToday.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Nothing scheduled for today across your plans.</Typography>
          ) : withToday.map((p) => (
            <Box key={p.id} sx={{ mb: 1 }}>
              <ButtonBase onClick={() => onSelect(p.id)} sx={{ display: 'block', textAlign: 'left', py: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}># {p.title.toUpperCase()}</Typography>
              </ButtonBase>
              {p.today.map((it) => <TaskLine key={it.id} item={it} membersById={EMPTY} />)}
            </Box>
          ))}
        </Box>
      </Rise>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))' } }}>
        {plans.map((p, i) => {
          const pace = paceLabel(p.summary.pace);
          return (
            <Rise key={p.id} index={i + 5}>
              <ButtonBase onClick={() => onSelect(p.id)} sx={[surface, { width: '100%', p: 2, gap: 2, justifyContent: 'flex-start', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color .15s', '&:hover': { borderColor: 'primary.main' } }]}>
                <ProgressRing value={p.summary.percent} max={100} label="Done" size={60} strokeWidth={7} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 700 }}># {p.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{fmtRange(p.summary.startDate, p.summary.endDate)}</Typography>
                  <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <StatusPill status={p.summary.status} small />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: pace.tone }}>{pace.text}</Typography>
                    {p.memberCount > 1 && <Typography variant="caption" color="text.secondary">· {p.memberCount} members</Typography>}
                  </Box>
                </Box>
              </ButtonBase>
            </Rise>
          );
        })}
      </Box>
    </Box>
  );
}

export default function StudyPlannerView({ isAuthenticated }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const planId = params.get('plan');
  const joinCode = params.get('join');

  const [plans, setPlans] = useState(null);
  const [error, setError] = useState('');
  const [builder, setBuilder] = useState(null); // null | { plan?: planDetail }
  const [invite, setInvite] = useState(null);
  const [joining, setJoining] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

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

  useEffect(() => { if (isAuthenticated) loadPlans(); }, [isAuthenticated, loadPlans]);

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

  if (!isAuthenticated) {
    return (
      <Box sx={[surface, { p: 4, textAlign: 'center' }]}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Log in to plan your study days</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>Create a schedule, invite friends and track progress together.</Typography>
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

  return (
    <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: '200px minmax(0,1fr)' } }}>
      <Box sx={{ position: { md: 'sticky' }, top: { md: 84, lg: 0 }, display: 'grid', gap: 2, gridTemplateColumns: 'minmax(0, 1fr)', maxHeight: { lg: 'calc(100dvh - 150px)' }, overflowY: { lg: 'auto' }, scrollbarWidth: 'thin' }}>
        <PlanRail
          plans={plans} planId={planId} onOverview={() => go()} onSelect={(id) => go({ plan: id })} onNew={() => setBuilder({})}
          onJoinCode={joinFromInput} codeInput={codeInput} setCodeInput={(v) => { setCodeInput(v); setCodeError(''); }} codeError={codeError}
        />
        <FriendsCard plans={plans} planId={planId} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        {invite && (
          <Rise>
            <Box sx={[surface, (t) => ({ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderColor: invite.error ? t.palette.error.main : t.palette.primary.main })]}>
              {invite.error ? (
                <>
                  <Typography sx={{ flex: 1 }} color="error">{invite.error}</Typography>
                  <Button onClick={() => go()}>Dismiss</Button>
                </>
              ) : (
                <>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{invite.owner?.name?.[0]?.toUpperCase() || '#'}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" color="text.secondary">{invite.owner ? `@${invite.owner.handle} invited you to` : 'You are invited to'}</Typography>
                    <Typography sx={{ fontWeight: 700 }}># {invite.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {invite.taskCount} questions · {fmtRange(invite.startDate, invite.endDate)} · {invite.memberCount} member{invite.memberCount === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                  {invite.isFull ? <Typography color="warning.main" sx={{ fontWeight: 700 }}>This plan is full</Typography> : (
                    <Button variant="contained" disableElevation disabled={joining} onClick={accept} sx={{ fontWeight: 700 }}>{joining ? 'Joining…' : 'Join plan'}</Button>
                  )}
                  <Button onClick={() => go()} disabled={joining}>Not now</Button>
                </>
              )}
            </Box>
          </Rise>
        )}

        {planId ? (
          <PlanWorkspace
            key={planId} id={planId}
            onEdit={(plan) => setBuilder({ plan })}
            onChanged={loadPlans}
            onGone={() => { loadPlans(); go(); }}
          />
        ) : (
          <Overview plans={plans} onSelect={(id) => go({ plan: id })} onNew={() => setBuilder({})} />
        )}
      </Box>
    </Box>
  );
}
