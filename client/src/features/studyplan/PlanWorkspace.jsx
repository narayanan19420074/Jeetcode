import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Avatar, AvatarGroup, Box, Button, ButtonBase, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  IconButton, LinearProgress, Skeleton, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import FriendPicker from './FriendPicker';
import { DiffTag, fmtRange, itemLink, localKey, relDay, shareUrl } from './planUtils';

const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
// Each panel scrolls inside itself, so the page never grows.
const panelHeight = { xs: 'min(62dvh, 520px)', md: 'calc(100dvh - 210px)' };

function QuestionRow({ item, doers }) {
  const link = itemLink(item);
  const Icon = item.done ? CheckCircleRoundedIcon : item.overdue ? ErrorOutlineRoundedIcon : RadioButtonUncheckedRoundedIcon;
  return (
    <ButtonBase
      component={link ? RouterLink : 'div'} to={link || undefined}
      sx={(t) => ({ width: '100%', justifyContent: 'flex-start', gap: 1, px: 1, py: 0.75, borderRadius: '8px', textAlign: 'left', fontFamily: 'inherit', '&:hover': { bgcolor: t.palette.action.hover } })}
    >
      <Icon sx={{ fontSize: 19, color: item.done ? 'success.main' : item.overdue ? 'error.main' : 'text.disabled' }} />
      <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 600, textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.6 : 1 }}>{item.title}</Typography>
      {doers.length > 0 && (
        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 18, height: 18, fontSize: 9, fontWeight: 700, border: '2px solid', borderColor: 'background.paper' } }}>
          {doers.map((m) => <Avatar key={m.userId} src={m.avatarUrl || undefined} alt={m.name}>{m.name?.[0]?.toUpperCase()}</Avatar>)}
        </AvatarGroup>
      )}
      <DiffTag difficulty={item.difficulty} />
    </ButtonBase>
  );
}

export default function PlanWorkspace({ id, friends, onBack, onEdit, onGone, onChanged, onFindFriends, notify }) {
  const today = localKey();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState('questions'); // phones show one panel at a time
  const [pickerEl, setPickerEl] = useState(null);
  const [confirm, setConfirm] = useState(null); // 'delete' | 'leave' | { remove: member }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await studyPlanApi.get(id);
      setPlan(data.data);
      setError('');
      onChanged?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [id, onChanged]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Progress comes from real solves, so refresh when the learner comes back from solving something.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 60000);
    return () => { document.removeEventListener('visibilitychange', onVisible); clearInterval(timer); };
  }, [load]);

  const membersById = useMemo(() => new Map((plan?.members || []).map((m) => [m.userId, m])), [plan]);
  const memberIds = useMemo(() => new Set((plan?.members || []).map((m) => m.userId)), [plan]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(plan.shareCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { notify?.('Could not copy. Allow clipboard access and try again.'); }
  };

  const addFriend = async (f) => {
    try {
      await studyPlanApi.addMember(id, f.userId);
      notify?.(`${f.name} added`);
      await load();
    } catch (err) {
      notify?.(extractErrorMessage(err));
    }
  };

  const runConfirm = async () => {
    setBusy(true);
    try {
      if (confirm === 'delete') { await studyPlanApi.remove(id); onGone(); return; }
      if (confirm === 'leave') { await studyPlanApi.leave(id); onGone(); return; }
      await studyPlanApi.removeMember(id, confirm.remove.userId);
      setConfirm(null);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const back = (
    <IconButton onClick={onBack} aria-label="Back to plans" edge="start"><ArrowBackRoundedIcon /></IconButton>
  );

  if (!plan) {
    return error ? (
      <Box><Box sx={{ mb: 1 }}>{back}</Box><Alert severity="error">{error}</Alert></Box>
    ) : (
      <Box><Skeleton variant="rounded" height={40} sx={{ mb: 1.5, borderRadius: '10px' }} /><Skeleton variant="rounded" height={320} sx={{ borderRadius: '14px' }} /></Box>
    );
  }

  const s = plan.summary;
  const confirmText = confirm === 'delete'
    ? 'This removes the plan for everyone. Questions you solved stay solved.'
    : confirm === 'leave' ? 'You will be removed from this plan. You can rejoin with the invite link.'
      : confirm ? `${confirm.remove.name} will be removed from this plan.` : '';
  const confirmTitle = confirm === 'delete' ? 'Delete plan?' : confirm === 'leave' ? 'Leave plan?' : 'Remove member?';

  // Questions grouped by day, in schedule order.
  const days = [];
  plan.items.forEach((it) => {
    const last = days[days.length - 1];
    if (last && last.date === it.date) last.items.push(it);
    else days.push({ date: it.date, items: [it] });
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        {back}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.25 }}>{plan.title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {s.done}/{s.total} done · {fmtRange(s.startDate, s.endDate)}
          </Typography>
        </Box>
        <Tooltip title="Add friends"><IconButton onClick={(e) => setPickerEl(e.currentTarget)} aria-label="Add friends"><PersonAddRoundedIcon /></IconButton></Tooltip>
        <Tooltip title={copied ? 'Copied' : 'Copy invite link'}>
          <IconButton onClick={copy} aria-label="Copy invite link" color={copied ? 'success' : 'default'}>{copied ? <CheckRoundedIcon /> : <LinkRoundedIcon />}</IconButton>
        </Tooltip>
        {plan.isOwner && <Tooltip title="Edit plan"><IconButton onClick={() => onEdit(plan)} aria-label="Edit plan"><EditRoundedIcon /></IconButton></Tooltip>}
        <Tooltip title={plan.isOwner ? 'Delete plan' : 'Leave plan'}>
          <IconButton onClick={() => setConfirm(plan.isOwner ? 'delete' : 'leave')} aria-label={plan.isOwner ? 'Delete plan' : 'Leave plan'} color="error" edge="end">
            {plan.isOwner ? <DeleteOutlineRoundedIcon /> : <ExitToAppRoundedIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>{error}</Alert>}

      <ToggleButtonGroup
        size="small" exclusive value={panel} onChange={(_, v) => v && setPanel(v)} fullWidth
        sx={{ display: { xs: 'flex', md: 'none' }, mb: 1 }}
      >
        <ToggleButton value="questions" sx={{ gap: 0.75, textTransform: 'none', fontWeight: 700 }}><ListAltRoundedIcon fontSize="small" />Questions · {s.total}</ToggleButton>
        <ToggleButton value="friends" sx={{ gap: 0.75, textTransform: 'none', fontWeight: 700 }}><GroupsRoundedIcon fontSize="small" />Friends · {plan.members.length}</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: 'grid', gap: 1.5, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.6fr) minmax(0,1fr)' } }}>
        <Box sx={[surface, { display: { xs: panel === 'questions' ? 'block' : 'none', md: 'block' }, height: panelHeight, overflowY: 'auto', scrollbarWidth: 'thin', p: 0.75 }]}>
          {days.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>No questions in this plan.</Typography>}
          {days.map((d) => (
            <Box key={d.date}>
              <Typography variant="caption" sx={{ display: 'block', px: 1, pt: 0.9, pb: 0.2, fontWeight: 800, letterSpacing: 0.4, color: d.date === today ? 'primary.main' : 'text.secondary' }}>
                {relDay(d.date, today).toUpperCase()}
              </Typography>
              {d.items.map((it) => <QuestionRow key={it.id} item={it} doers={it.doneBy.map((u) => membersById.get(u)).filter((m) => m && !m.isMe)} />)}
            </Box>
          ))}
        </Box>

        <Box sx={[surface, { display: { xs: panel === 'friends' ? 'block' : 'none', md: 'block' }, height: panelHeight, overflowY: 'auto', scrollbarWidth: 'thin', p: 1.25 }]}>
          {plan.members.map((m) => (
            <Box key={m.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.8 }}>
              <Avatar src={m.avatarUrl || undefined} sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700 }}>{m.name?.[0]?.toUpperCase()}</Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 700, flex: 1 }}>{m.isMe ? 'You' : m.name}</Typography>
                  <Typography variant="caption" sx={[{ fontWeight: 700 }, mono]}>{m.done}/{m.total}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate" value={m.percent} aria-label={`${m.name} progress`}
                  color={m.status === 'completed' ? 'success' : m.status === 'behind' ? 'error' : 'primary'} sx={{ mt: 0.4, height: 5, borderRadius: 3 }}
                />
              </Box>
              {plan.isOwner && !m.isOwner && (
                <Tooltip title="Remove"><IconButton size="small" onClick={() => setConfirm({ remove: m })} aria-label={`Remove ${m.name}`}><PersonRemoveRoundedIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <FriendPicker anchorEl={pickerEl} onClose={() => setPickerEl(null)} friends={friends} memberIds={memberIds} onAdd={addFriend} onFindFriends={onFindFriends} />

      <Dialog open={Boolean(confirm)} onClose={() => !busy && setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{confirmTitle}</DialogTitle>
        <DialogContent><DialogContentText>{confirmText}</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={busy}>Cancel</Button>
          <Button color="error" variant="contained" disableElevation onClick={runConfirm} disabled={busy} sx={{ fontWeight: 700 }}>
            {confirm === 'delete' ? 'Delete' : confirm === 'leave' ? 'Leave' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
