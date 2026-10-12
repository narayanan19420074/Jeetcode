import { useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { surface } from '../dashboard/dashboardUtils';
import { TaskLine } from './OverviewTab';
import { Rise } from './motion';
import { downloadIcs, relDay } from './planUtils';

const FILTERS = [['all', 'All'], ['pending', 'Pending'], ['done', 'Done'], ['overdue', 'Overdue']];

export default function ScheduleTab({ plan, today }) {
  const [filter, setFilter] = useState('all');
  const membersById = useMemo(() => new Map(plan.members.map((m) => [m.userId, m])), [plan.members]);

  const counts = useMemo(() => ({
    all: plan.items.length,
    pending: plan.items.filter((i) => !i.done).length,
    done: plan.items.filter((i) => i.done).length,
    overdue: plan.items.filter((i) => i.overdue).length,
  }), [plan.items]);

  const days = useMemo(() => {
    const keep = (i) => (filter === 'all' ? true : filter === 'pending' ? !i.done : filter === 'done' ? i.done : i.overdue);
    const m = new Map();
    plan.items.filter(keep).forEach((i) => m.set(i.date, [...(m.get(i.date) || []), i]));
    return [...m.entries()];
  }, [plan.items, filter]);

  return (
    <Rise>
      <Box sx={[surface, { p: 2 }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          <Stack direction="row" spacing={0.75} sx={{ flex: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
            {FILTERS.map(([k, label]) => (
              <Chip key={k} clickable label={`${label} · ${counts[k]}`} onClick={() => setFilter(k)} color={filter === k ? 'primary' : 'default'} variant={filter === k ? 'filled' : 'outlined'} sx={{ fontWeight: 600 }} />
            ))}
          </Stack>
          <Button size="small" startIcon={<EventRoundedIcon />} onClick={() => downloadIcs(plan)}>Add to calendar (.ics)</Button>
        </Box>

        {days.map(([date, list]) => (
          <Box key={date} sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: date === today ? 'primary.main' : 'text.secondary', whiteSpace: 'nowrap' }}>{relDay(date, today)}</Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="caption" color="text.secondary">{list.filter((i) => i.done).length}/{list.length}</Typography>
            </Box>
            {list.map((it) => <TaskLine key={it.id} item={it} membersById={membersById} />)}
          </Box>
        ))}
        {days.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>Nothing in this view.</Typography>}
      </Box>
    </Rise>
  );
}
