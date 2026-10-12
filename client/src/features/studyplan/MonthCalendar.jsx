import { Box, ButtonBase, IconButton, Typography, alpha } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { monthCells } from '../dashboard/dashboardUtils';
import { monthLabel } from './planUtils';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
// state -> theme palette key
export const MARK_TONE = { done: 'success', partial: 'warning', overdue: 'error', upcoming: 'info', scheduled: 'primary' };
export const MARK_LEGEND = [['success', 'Done'], ['warning', 'In progress'], ['error', 'Missed'], ['info', 'Upcoming']];

// Month grid shared by the plan builder (pick a date) and the plan view (see progress).
// marks: { 'YYYY-MM-DD': { count, state } } — state picks the tint.
export default function MonthCalendar({ cursor, onCursor, selected, onSelect, today, marks = {} }) {
  const { y, m } = cursor;
  const move = (delta) => {
    const d = new Date(Date.UTC(y, m + delta, 1));
    onCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography sx={{ fontWeight: 700, flex: 1 }}>{monthLabel(y, m)}</Typography>
        <IconButton size="small" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeftRoundedIcon fontSize="small" /></IconButton>
        <ButtonBase
          onClick={() => { const t = new Date(`${today}T00:00:00Z`); onCursor({ y: t.getUTCFullYear(), m: t.getUTCMonth() }); }}
          sx={{ fontSize: 12, fontWeight: 700, px: 1, borderRadius: 1, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          Today
        </ButtonBase>
        <IconButton size="small" aria-label="Next month" onClick={() => move(1)}><ChevronRightRoundedIcon fontSize="small" /></IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {DOW.map((d, i) => (
          <Typography key={i} variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontWeight: 700 }}>{d}</Typography>
        ))}
        {monthCells(y, m).map((cell, i) => {
          if (!cell) return <Box key={`b${i}`} />;
          const mark = marks[cell.key];
          const isSel = cell.key === selected;
          const isToday = cell.key === today;
          const tone = mark ? MARK_TONE[mark.state] || 'primary' : null;
          return (
            <ButtonBase
              key={cell.key}
              onClick={() => onSelect?.(cell.key)}
              aria-label={`${cell.key}${mark ? `, ${mark.count} question${mark.count === 1 ? '' : 's'}` : ''}`}
              aria-pressed={isSel}
              sx={(t) => ({
                aspectRatio: '1', borderRadius: '8px', flexDirection: 'column', gap: 0.2, fontFamily: 'inherit',
                fontSize: 13, fontWeight: isSel || isToday ? 800 : 600,
                color: isSel ? t.palette.primary.contrastText : 'text.primary',
                bgcolor: isSel ? t.palette.primary.main : tone ? alpha(t.palette[tone].main, 0.14) : 'transparent',
                border: `1px solid ${isToday && !isSel ? t.palette.primary.main : 'transparent'}`,
                transition: 'background-color .12s',
                '&:hover': { bgcolor: isSel ? t.palette.primary.main : t.palette.action.hover },
                '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 1 },
              })}
            >
              {cell.day}
              {mark && (
                <Box component="span" sx={(t) => ({ fontSize: 9, fontWeight: 800, lineHeight: 1, color: isSel ? t.palette.primary.contrastText : t.palette[tone].main })}>
                  {mark.count}
                </Box>
              )}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
