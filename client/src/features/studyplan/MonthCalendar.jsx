import { Box, ButtonBase, IconButton, Typography, alpha } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { monthCells } from '../dashboard/dashboardUtils';
import { monthLabel } from './planUtils';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Compact month grid for picking a date. Days before `min` are disabled; days between
// `today` and `selected` are tinted so the plan's span is visible at a glance.
export default function MonthCalendar({ cursor, onCursor, selected, onSelect, today, min }) {
  const { y, m } = cursor;
  const move = (delta) => {
    const d = new Date(Date.UTC(y, m + delta, 1));
    onCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>{monthLabel(y, m)}</Typography>
        <IconButton size="small" aria-label="Previous month" onClick={() => move(-1)}><ChevronLeftRoundedIcon fontSize="small" /></IconButton>
        <IconButton size="small" aria-label="Next month" onClick={() => move(1)}><ChevronRightRoundedIcon fontSize="small" /></IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {DOW.map((d, i) => (
          <Typography key={i} variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontWeight: 700, lineHeight: 1.6 }}>{d}</Typography>
        ))}
        {monthCells(y, m).map((cell, i) => {
          if (!cell) return <Box key={`b${i}`} />;
          const isSel = cell.key === selected;
          const isToday = cell.key === today;
          const disabled = Boolean(min) && cell.key < min;
          const inSpan = !isSel && selected && cell.key >= today && cell.key < selected;
          return (
            <ButtonBase
              key={cell.key} disabled={disabled} onClick={() => onSelect?.(cell.key)} aria-label={cell.key} aria-pressed={isSel}
              sx={(t) => ({
                height: 32, borderRadius: '8px', fontFamily: 'inherit', fontSize: 13, fontWeight: isSel || isToday ? 800 : 500,
                color: isSel ? t.palette.primary.contrastText : disabled ? t.palette.text.disabled : t.palette.text.primary,
                bgcolor: isSel ? t.palette.primary.main : inSpan ? alpha(t.palette.primary.main, 0.12) : 'transparent',
                border: `1px solid ${isToday && !isSel ? t.palette.primary.main : 'transparent'}`,
                '&:hover': { bgcolor: isSel ? t.palette.primary.main : t.palette.action.hover },
                '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 1 },
              })}
            >
              {cell.day}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
