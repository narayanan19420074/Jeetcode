import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Tabs, Tab, Button, Stack, Chip, LinearProgress, CircularProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails, Avatar, Table, TableHead, TableRow, TableCell, TableBody,
  Snackbar, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ProgressRing from '../../components/ProgressRing';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import TaskRow from './TaskRow';
import { StatusChip, dayDate, joinUrl } from './planUtils';

export default function StudyPlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [compare, setCompare] = useState(null);
  const [tab, setTab] = useState('today');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [menuEl, setMenuEl] = useState(null);
  const [confirm, setConfirm] = useState(null); // 'delete' | 'leave'

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([studyPlanApi.get(id), studyPlanApi.compare(id)]);
      setPlan(p.data.data);
      setCompare(c.data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (item, done) => {
    // optimistic tick, then re-sync from the server
    setPlan((prev) => ({ ...prev, items: prev.items.map((i) => (i.id === item.id ? { ...i, done } : i)) }));
    try {
      await studyPlanApi.toggleItem(id, item.id, done);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
    load();
  };

  const share = async () => {
    const url = joinUrl(plan.shareCode);
    const text = `Join my study plan "${plan.title}" on JeetCode and let's finish it together!`;
    try {
      if (navigator.share) await navigator.share({ title: plan.title, text, url });
      else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setToast('Invite link copied');
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  const doConfirm = async () => {
    try {
      if (confirm === 'delete') await studyPlanApi.remove(id);
      else await studyPlanApi.leave(id);
      navigate('/plans');
    } catch (err) {
      setError(extractErrorMessage(err));
      setConfirm(null);
    }
  };

  const days = useMemo(() => {
    if (!plan) return [];
    const map = new Map();
    plan.items.forEach((i) => {
      if (!map.has(i.day)) map.set(i.day, []);
      map.get(i.day).push(i);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [plan]);

  if (!plan) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>{error ? <Alert severity="error">{error}</Alert> : <CircularProgress />}</Box>;
  }

  const { summary } = plan;
  const todayItems = plan.items.filter((i) => i.day === plan.todayDay || i.overdue);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
        <ProgressRing value={summary.percent} max={100} label="Done" size={96} strokeWidth={9} />
        <Box sx={{ flexGrow: 1, minWidth: 220 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>{plan.title}</Typography>
          {plan.description && <Typography variant="body2" color="text.secondary">{plan.description}</Typography>}
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 1 }}>
            <StatusChip status={summary.status} />
            <Chip size="small" variant="outlined" label={`${summary.done}/${summary.total} tasks`} />
            <Chip size="small" variant="outlined" label={plan.todayDay < 1 ? `Starts ${dayDate(plan.startDate, 1)}` : `Day ${Math.min(plan.todayDay, plan.durationDays)}/${plan.durationDays}`} />
            {summary.overdue > 0 && <Chip size="small" color="warning" label={`${summary.overdue} overdue`} sx={{ fontWeight: 700 }} />}
            {plan.owner && <Chip size="small" variant="outlined" label={`by @${plan.owner.handle}`} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button variant="contained" disableElevation startIcon={<ShareRoundedIcon />} onClick={share} sx={{ fontWeight: 700 }}>Invite friends</Button>
          <IconButton onClick={(e) => setMenuEl(e.currentTarget)} aria-label="Plan options"><MoreVertRoundedIcon /></IconButton>
          <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
            <MenuItem onClick={() => { setMenuEl(null); setConfirm(plan.isOwner ? 'delete' : 'leave'); }} sx={{ color: 'error.main' }}>
              {plan.isOwner ? 'Delete plan' : 'Leave plan'}
            </MenuItem>
          </Menu>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab value="today" label="Today" />
        <Tab value="timeline" label="Timeline" />
        <Tab value="compare" label={`Compare (${compare?.members.length || 1})`} />
      </Tabs>

      {tab === 'today' && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          {plan.todayDay < 1 ? (
            <Typography color="text.secondary" sx={{ p: 1 }}>This plan starts on {dayDate(plan.startDate, 1)}.</Typography>
          ) : todayItems.length === 0 ? (
            <Typography color="text.secondary" sx={{ p: 1 }}>
              {summary.status === 'completed' ? 'You finished the whole plan. 🎉' : 'Nothing scheduled for today.'}
            </Typography>
          ) : (
            todayItems.map((item) => <TaskRow key={item.id} item={item} showDay={item.day !== plan.todayDay} onToggle={toggle} />)
          )}
        </Paper>
      )}

      {tab === 'timeline' && (
        <Stack spacing={1}>
          {days.map(([day, items]) => {
            const done = items.filter((i) => i.done).length;
            const isToday = day === plan.todayDay;
            return (
              <Accordion
                key={day} variant="outlined" defaultExpanded={isToday}
                sx={{ '&:before': { display: 'none' }, borderRadius: '12px !important', overflow: 'hidden', borderColor: isToday ? 'primary.main' : undefined }}
              >
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>Day {day}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>{dayDate(plan.startDate, day)}</Typography>
                    {isToday && <Chip size="small" color="primary" label="Today" sx={{ fontWeight: 700 }} />}
                    <Chip size="small" variant={done === items.length ? 'filled' : 'outlined'} color={done === items.length ? 'success' : 'default'} label={`${done}/${items.length}`} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  {items.map((item) => <TaskRow key={item.id} item={item} onToggle={toggle} />)}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}

      {tab === 'compare' && compare && (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflowX: 'auto' }}>
          {compare.members.length < 2 && (
            <Alert severity="info" sx={{ m: 2 }}>You're the only one here. Tap “Invite friends” and share the link — you'll see everyone's progress side by side.</Alert>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Member</TableCell>
                <TableCell sx={{ minWidth: 180 }}>Progress</TableCell>
                <TableCell align="center">Today</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Streak</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {compare.members.map((m, i) => (
                <TableRow key={m.userId} sx={{ bgcolor: m.isMe ? 'action.selected' : undefined }}>
                  <TableCell sx={{ fontWeight: 800 }}>{i + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={m.avatarUrl || undefined} sx={{ width: 28, height: 28, fontSize: 13 }}>{m.name?.[0]?.toUpperCase()}</Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{m.name}{m.isMe ? ' (you)' : ''}</Typography>
                        <Typography variant="caption" color="text.secondary">@{m.handle}{m.isOwner ? ' · owner' : ''}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress variant="determinate" value={m.percent} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 70, textAlign: 'right' }}>{m.done}/{m.total} · {m.percent}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{m.todayTotal ? `${m.todayDone}/${m.todayTotal}` : '—'}</TableCell>
                  <TableCell align="center"><StatusChip status={m.status} /></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                      <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: m.streak ? 'warning.main' : 'text.disabled' }} />{m.streak}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)}>
        <DialogTitle>{confirm === 'delete' ? 'Delete this plan?' : 'Leave this plan?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm === 'delete' ? 'The plan will be removed for every member. This cannot be undone.' : "You'll stop appearing in this plan's comparison. You can rejoin with the invite link."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color="error" onClick={doConfirm}>{confirm === 'delete' ? 'Delete' : 'Leave'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={2500} onClose={() => setToast('')} message={toast} />
    </Container>
  );
}
