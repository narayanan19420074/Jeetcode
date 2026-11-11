import { Box, Stack, Typography } from '@mui/material';
import AppCard from '../../../components/ui/AppCard';
import CompanyAvatar from '../../../components/CompanyAvatar';
import RailCardTitle from './RailCardTitle';
import { daysLabel, examDateLabel, isUrgent } from './examSchedule';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

const EVENT_LABELS = { apply: 'Apply by', exam: 'Exam on' };

function UpcomingRow({ event }) {
  const { exam, kind, date, days } = event;
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <CompanyAvatar name={exam.brand || exam.short} size={SIZES.avatar.md} />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.semibold }}>{exam.name}</Typography>
        <Typography noWrap sx={{ color: 'text.secondary', fontSize: FONT_SIZES.body }}>{EVENT_LABELS[kind]} {examDateLabel(date)}</Typography>
      </Box>
      <Typography sx={{ flexShrink: 0, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: isUrgent(days) ? 'error.main' : 'text.secondary' }}>{daysLabel(days)}</Typography>
    </Stack>
  );
}

// The dates that need action next, soonest first: application deadlines and exam days.
export default function UpcomingCard({ events }) {
  return (
    <AppCard component="section" aria-label="Upcoming">
      <RailCardTitle>Upcoming</RailCardTitle>
      {events.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', fontSize: FONT_SIZES.body }}>No upcoming dates</Typography>
      ) : (
        <Stack spacing={2}>
          {events.map((event) => (
            <UpcomingRow key={`${event.exam.id}-${event.kind}`} event={event} />
          ))}
        </Stack>
      )}
    </AppCard>
  );
}
