import { useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Chip, IconButton, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography, alpha,
} from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import { Rise } from './motion';
import { Sparkline, StatusPill, daysSince, fmtDay, paceLabel, relTime, shareUrl } from './planUtils';

const CELL = 24;
const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };

// Rows = members, columns = questions (grouped by day): who solved what, at a glance.
function Matrix({ plan, today }) {
  const items = plan.items;
  const months = useMemo(() => {
    const out = [];
    items.forEach((i) => {
      const m = i.date.slice(0, 7);
      const last = out[out.length - 1];
      if (last && last.key === m) last.span += 1;
      else out.push({ key: m, span: 1, label: new Date(`${i.date}T00:00:00Z`).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short' }) });
    });
    return out;
  }, [items]);
  const days = useMemo(() => {
    const out = [];
    items.forEach((i) => {
      const last = out[out.length - 1];
      if (last && last.date === i.date) last.span += 1;
      else out.push({ date: i.date, span: 1 });
    });
    return out;
  }, [items]);

  const sticky = { position: 'sticky', left: 0, zIndex: 2, bgcolor: 'background.paper' };
  const cols = `168px repeat(${items.length}, ${CELL}px)`;

  return (
    <Box sx={{ overflowX: 'auto', pb: 0.5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: cols, width: 'max-content', rowGap: '3px' }}>
        <Box sx={sticky} />
        {months.map((m) => (
          <Typography key={m.key} variant="caption" color="text.secondary" sx={{ gridColumn: `span ${m.span}`, fontWeight: 700, overflow: 'hidden', pl: 0.25 }}>{m.label}</Typography>
        ))}

        <Box sx={sticky} />
        {days.map((d) => (
          <Tooltip key={d.date} title={fmtDay(d.date)}>
            <Typography variant="caption" sx={{ gridColumn: `span ${d.span}`, textAlign: 'center', fontWeight: d.date === today ? 800 : 500, color: d.date === today ? 'primary.main' : 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', ...mono }}>
              {Number(d.date.slice(8))}
            </Typography>
          </Tooltip>
        ))}

        {plan.members.map((m) => (
          <Box key={m.userId} sx={{ display: 'contents' }}>
            <Box sx={[sticky, { display: 'flex', alignItems: 'center', gap: 1, pr: 1, height: CELL + 4 }]}>
              <Avatar src={m.avatarUrl || undefined} sx={{ width: 22, height: 22, fontSize: 11, fontWeight: 700 }}>{m.name?.[0]?.toUpperCase()}</Avatar>
              <Typography variant="caption" noWrap sx={{ flex: 1, fontWeight: m.isMe ? 800 : 600 }}>{m.isMe ? 'You' : m.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={mono}>{m.done}/{m.total}</Typography>
            </Box>
            {items.map((it) => {
              const done = it.doneBy.includes(m.userId);
              const missed = !done && it.date < today;
              return (
                <Tooltip key={it.id} title={`${m.isMe ? 'You' : m.name} · ${it.title} · ${done ? 'Solved' : missed ? 'Missed' : it.date === today ? 'Due today' : 'Upcoming'}`} disableInteractive>
                  <Box sx={{ width: CELL, height: CELL + 4, display: 'grid', placeItems: 'center' }}>
                    <Box
                      sx={(t) => ({
                        width: 16, height: 16, borderRadius: '5px', display: 'grid', placeItems: 'center',
                        bgcolor: done ? t.palette.success.main : missed ? alpha(t.palette.error.main, 0.18) : 'transparent',
                        border: done ? 'none' : `1.5px solid ${missed ? t.palette.error.main : it.date === today ? t.palette.warning.main : t.palette.divider}`,
                      })}
                    >
                      {done && <CheckRoundedIcon sx={{ fontSize: 12, color: '#fff' }} />}
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function TeamTab({ plan, today, reload, onGone }) {
  const [copied, setCopied] = useState(false);
  const [nudged, setNudged] = useState({}); // userId -> 'sent' | error text
  const [removing, setRemoving] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');
  const link = shareUrl(plan.shareCode);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* link is visible in the field so it can be copied by hand */ }
  };

  const nudge = async (m) => {
    try {
      await studyPlanApi.nudge(plan.id, m.userId);
      setNudged((p) => ({ ...p, [m.userId]: 'sent' }));
    } catch (err) {
      setNudged((p) => ({ ...p, [m.userId]: extractErrorMessage(err) }));
    }
  };

  const remove = async (m) => {
    try {
      await studyPlanApi.removeMember(plan.id, m.userId);
      setRemoving(null);
      reload();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  const destroy = async () => {
    try {
      if (plan.isOwner) await studyPlanApi.remove(plan.id);
      else await studyPlanApi.leave(plan.id);
      onGone();
    } catch (err) {
      setError(extractErrorMessage(err));
      setLeaving(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      <Rise>
        <Box sx={[surface, { p: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }]}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontWeight: 700 }}>Invite friends</Typography>
            <Typography variant="body2" color="text.secondary">Anyone with this link can join (max 20). They see the same schedule, you see each other's progress.</Typography>
          </Box>
          <TextField size="small" value={link} onFocus={(e) => e.target.select()} slotProps={{ input: { readOnly: true }, htmlInput: { 'aria-label': 'Invite link' } }} sx={{ minWidth: 240, flex: 1 }} />
          <Button variant="contained" disableElevation onClick={copy} color={copied ? 'success' : 'primary'} startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />} sx={{ fontWeight: 700, minWidth: 130 }}>
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </Box>
      </Rise>

      <Rise index={1}>
        <TableContainer sx={[surface]}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 36 }}>#</TableCell>
                <TableCell>Member</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Progress</TableCell>
                <TableCell align="center">Today</TableCell>
                <TableCell align="center">Pace</TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Streak</TableCell>
                <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>7 days</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Last active</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {plan.members.map((m, i) => {
                const pace = paceLabel(m.pace);
                const idle = daysSince(m.lastActiveAt) > 2 && m.status !== 'completed' && m.status !== 'upcoming';
                const canNudge = !m.isMe && (m.status === 'behind' || m.todayTotal > m.todayDone);
                return (
                  <TableRow key={m.userId} sx={(t) => ({ bgcolor: m.isMe ? alpha(t.palette.primary.main, 0.07) : 'transparent' })}>
                    <TableCell sx={[{ fontWeight: 700, color: 'text.secondary' }, mono]}>{i + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar src={m.avatarUrl || undefined} sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700 }}>{m.name?.[0]?.toUpperCase()}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{m.name}{m.isMe ? ' (you)' : ''}</Typography>
                            {m.isOwner && <Chip size="small" label="owner" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography variant="caption" color="text.secondary">@{m.handle}</Typography>
                            <StatusPill status={m.status} small />
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={m.percent} color={m.status === 'behind' ? 'error' : m.status === 'completed' ? 'primary' : 'success'} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                        <Typography variant="caption" sx={[{ fontWeight: 700, minWidth: 64, textAlign: 'right' }, mono]}>{m.done}/{m.total} · {m.percent}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={[{ fontWeight: 700 }, mono]}>{m.todayTotal ? `${m.todayDone}/${m.todayTotal}` : '—'}</TableCell>
                    <TableCell align="center"><Typography variant="caption" sx={{ fontWeight: 700, color: pace.tone, whiteSpace: 'nowrap' }}>{pace.text}</Typography></TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                        <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: m.streak ? 'warning.main' : 'text.disabled' }} />
                        <Typography variant="caption" sx={[{ fontWeight: 700 }, mono]}>{m.streak}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: 'none', md: 'table-cell' }, color: 'primary.main' }}><Sparkline values={m.week} /></TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="caption" sx={{ color: idle ? 'warning.main' : 'text.secondary', fontWeight: idle ? 700 : 400 }}>{relTime(m.lastActiveAt)}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {nudged[m.userId] === 'sent' ? (
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Nudged ✓</Typography>
                      ) : nudged[m.userId] ? (
                        <Typography variant="caption" color="text.secondary">{nudged[m.userId]}</Typography>
                      ) : canNudge ? (
                        <Tooltip title="Send a friendly reminder in the plan channel">
                          <Button size="small" startIcon={<NotificationsActiveRoundedIcon sx={{ fontSize: 16 }} />} onClick={() => nudge(m)}>Nudge</Button>
                        </Tooltip>
                      ) : null}
                      {plan.isOwner && !m.isOwner && (removing === m.userId ? (
                        <Box component="span" sx={{ ml: 0.5 }}>
                          <Button size="small" color="error" onClick={() => remove(m)}>Remove</Button>
                          <Button size="small" onClick={() => setRemoving(null)}>Cancel</Button>
                        </Box>
                      ) : (
                        <Tooltip title="Remove from plan"><IconButton size="small" onClick={() => setRemoving(m.userId)} aria-label={`Remove ${m.name}`}><PersonRemoveRoundedIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Rise>

      <Rise index={2}>
        <Box sx={[surface, { p: 2 }]}>
          <Typography sx={{ fontWeight: 700 }}>Who solved what</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Each column is a question in schedule order. Green = solved, red = missed, orange outline = due today.</Typography>
          <Matrix plan={plan} today={today} />
        </Box>
      </Rise>

      <Rise index={3}>
        <Box sx={[surface, { p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }]}>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ fontWeight: 700 }}>{plan.isOwner ? 'Delete this plan' : 'Leave this plan'}</Typography>
            <Typography variant="body2" color="text.secondary">{plan.isOwner ? 'Removes the plan, its chat and everyone’s access. Questions you solved stay solved.' : 'You will disappear from the team board. You can rejoin with the invite link.'}</Typography>
          </Box>
          {leaving ? (
            <Stack direction="row" spacing={1}>
              <Button color="error" variant="contained" disableElevation onClick={destroy}>{plan.isOwner ? 'Yes, delete' : 'Yes, leave'}</Button>
              <Button onClick={() => setLeaving(false)}>Cancel</Button>
            </Stack>
          ) : (
            <Button color="error" variant="outlined" onClick={() => setLeaving(true)}>{plan.isOwner ? 'Delete plan' : 'Leave plan'}</Button>
          )}
        </Box>
      </Rise>
    </Box>
  );
}
