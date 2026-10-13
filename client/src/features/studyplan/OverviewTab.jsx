import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Button, ButtonBase, LinearProgress, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ProgressRing from '../../components/ProgressRing';
import { surface } from '../dashboard/dashboardUtils';
import MonthCalendar, { MARK_LEGEND } from './MonthCalendar';
import { CountUp, Rise } from './motion';
import { AvatarStack, DiffTag, daysSince, itemLink, keyToDate, paceLabel, relTime } from './planUtils';

const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };

function Stat({ index, label, sub, children }) {
  return (
    <Rise index={index}>
      <Box sx={[surface, { p: 2, height: '100%' }]}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>{label.toUpperCase()}</Typography>
        <Box sx={{ mt: 0.5, minHeight: 40, display: 'flex', alignItems: 'center' }}>{children}</Box>
        <Typography variant="caption" color="text.secondary">{sub}</Typography>
      </Box>
    </Rise>
  );
}

export function TaskLine({ item, membersById, hideMe = false }) {
  const link = itemLink(item);
  const Icon = item.done ? CheckCircleRoundedIcon : item.overdue ? ErrorOutlineRoundedIcon : RadioButtonUncheckedRoundedIcon;
  const doers = item.doneBy.map((id) => membersById.get(id)).filter((m) => m && !(hideMe && m.isMe));
  return (
    <ButtonBase
      component={link ? RouterLink : 'div'} to={link || undefined}
      sx={(t) => ({ width: '100%', justifyContent: 'flex-start', gap: 1.25, px: 1, py: 0.9, borderRadius: '10px', textAlign: 'left', fontFamily: 'inherit', '&:hover': { bgcolor: t.palette.action.hover } })}
    >
      <Icon sx={{ fontSize: 20, color: item.done ? 'success.main' : item.overdue ? 'error.main' : 'text.disabled' }} />
      <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 600, textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.65 : 1 }}>{item.title}</Typography>
      <AvatarStack users={doers} max={3} size={20} />
      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'inline' } }}>{item.type === 'problem' ? 'Coding' : 'Aptitude'}</Typography>
      <DiffTag difficulty={item.difficulty} />
    </ButtonBase>
  );
}

export default function OverviewTab({ plan, today, onOpenTeam }) {
  const s = plan.summary;
  const membersById = useMemo(() => new Map(plan.members.map((m) => [m.userId, m])), [plan.members]);
  const [cursor, setCursor] = useState(() => {
    const d = keyToDate(s.startDate && s.startDate > today ? s.startDate : today);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });

  const todayItems = plan.items.filter((i) => i.date === today || i.overdue);
  const pace = paceLabel(s.pace);

  const marks = useMemo(() => {
    const byDate = new Map();
    plan.items.forEach((i) => byDate.set(i.date, [...(byDate.get(i.date) || []), i]));
    return Object.fromEntries(
      [...byDate.entries()].map(([date, list]) => {
        const done = list.filter((i) => i.done).length;
        const state = done === list.length ? 'done' : date < today ? 'overdue' : done > 0 || date === today ? 'partial' : 'upcoming';
        return [date, { count: list.length, state }];
      })
    );
  }, [plan.items, today]);

  const team = [...plan.members].sort((a, b) => (b.todayTotal ? b.todayDone / b.todayTotal : -1) - (a.todayTotal ? a.todayDone / a.todayTotal : -1) || b.percent - a.percent);

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'minmax(0, 1fr)' }}>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' } }}>
        <Stat index={0} label="Progress" sub={`${s.done} of ${s.total} questions`}>
          <ProgressRing value={s.percent} max={100} label="Done" size={64} strokeWidth={7} />
        </Stat>
        <Stat index={1} label="Today" sub={s.todayTotal ? (s.todayDone === s.todayTotal ? 'All done for today' : `${s.todayTotal - s.todayDone} to go`) : 'Nothing scheduled'}>
          <Box sx={{ width: '100%' }}>
            <Typography sx={[{ fontSize: 26, fontWeight: 700, lineHeight: 1.1 }, mono]}><CountUp value={s.todayDone} /><Box component="span" sx={{ color: 'text.secondary', fontSize: 16 }}>/{s.todayTotal}</Box></Typography>
            <LinearProgress variant="determinate" value={s.todayTotal ? (s.todayDone / s.todayTotal) * 100 : 0} sx={{ mt: 0.75, height: 5, borderRadius: 3 }} />
          </Box>
        </Stat>
        <Stat index={2} label="Pace" sub={s.overdue ? `${s.overdue} overdue` : 'Nothing overdue'}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: pace.tone }}>{pace.text}</Typography>
        </Stat>
        <Stat index={3} label="Plan streak" sub="consecutive plan days finished">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocalFireDepartmentRoundedIcon sx={{ color: s.streak ? 'warning.main' : 'text.disabled' }} />
            <Typography sx={[{ fontSize: 26, fontWeight: 700 }, mono]}><CountUp value={s.streak} /></Typography>
          </Box>
        </Stat>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1fr) 290px' } }}>
        <Box sx={{ display: 'grid', gap: 2, minWidth: 0, gridTemplateColumns: 'minmax(0, 1fr)' }}>
          <Rise index={4}>
            <Box sx={[surface, { p: 2 }]}>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Today{s.overdue ? ' + overdue' : ''}</Typography>
              {todayItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1.5 }}>
                  {s.status === 'completed' ? 'You finished the whole plan.' : 'Nothing scheduled for today. Check the Schedule tab for what is next.'}
                </Typography>
              ) : todayItems.map((it) => <TaskLine key={it.id} item={it} membersById={membersById} />)}
            </Box>
          </Rise>

          <Rise index={5}>
            <Box sx={[surface, { p: 2 }]}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Typography sx={{ fontWeight: 700, flex: 1 }}>Team today</Typography>
                <Button size="small" onClick={onOpenTeam}>Open team board</Button>
              </Box>
              {team.length < 2 && <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>You are the only member. Copy the invite link from the header to study together.</Typography>}
              {team.map((m) => {
                const p = paceLabel(m.pace);
                const idle = daysSince(m.lastActiveAt) > 2 && m.status !== 'completed' && m.status !== 'upcoming';
                return (
                  <Box key={m.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.9 }}>
                    <Avatar src={m.avatarUrl || undefined} sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700 }}>{m.name?.[0]?.toUpperCase()}</Avatar>
                    <Typography variant="body2" noWrap sx={{ width: { xs: 90, sm: 130 }, fontWeight: 600 }}>{m.isMe ? 'You' : m.name}</Typography>
                    <Box sx={{ flex: 1, minWidth: 60 }}>
                      <LinearProgress variant="determinate" value={m.todayTotal ? (m.todayDone / m.todayTotal) * 100 : 0} color={m.todayTotal && m.todayDone === m.todayTotal ? 'success' : 'primary'} sx={{ height: 6, borderRadius: 3 }} />
                    </Box>
                    <Typography variant="caption" sx={[{ width: 34, textAlign: 'right', fontWeight: 700 }, mono]}>{m.todayTotal ? `${m.todayDone}/${m.todayTotal}` : '—'}</Typography>
                    <Typography variant="caption" sx={{ width: 64, textAlign: 'right', fontWeight: 700, color: p.tone, display: { xs: 'none', sm: 'block' } }}>{p.text}</Typography>
                    <Typography variant="caption" sx={{ width: 62, textAlign: 'right', display: { xs: 'none', md: 'block' }, color: idle ? 'warning.main' : 'text.secondary' }}>{relTime(m.lastActiveAt)}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Rise>
        </Box>

        <Rise index={6}>
          <Box sx={[surface, { p: 2 }]}>
            <MonthCalendar cursor={cursor} onCursor={setCursor} today={today} marks={marks} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.5 }}>
              {MARK_LEGEND.map(([tone, label]) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={(t) => ({ width: 8, height: 8, borderRadius: '50%', bgcolor: t.palette[tone].main })} />
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Rise>
      </Box>
    </Box>
  );
}
