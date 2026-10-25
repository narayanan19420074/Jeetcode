import { Box, ButtonBase, IconButton, Typography, alpha } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { monthCells } from '../dashboard/dashboardUtils';
import { monthLabel } from './planUtils';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Compact month grid for picking a date. Days before `min` are disabled; days between
// `today` and `selected` are tinted so the plan's span is visible at a glance.
export default function MonthCalendar({ cursor, onCursor, selected, onSelect, today, min, accent }) {
  const { y, m } = cursor;
  const move = (delta) => {
    const d = new Date(Date.UTC(y, m + delta, 1));
    onCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 15, flex: 1 }}>{monthLabel(y, m)}</Typography>
        <IconButton aria-label="Previous month" onClick={() => move(-1)}><ChevronLeftRoundedIcon /></IconButton>
        <IconButton aria-label="Next month" onClick={() => move(1)}><ChevronRightRoundedIcon /></IconButton>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
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
                height: 40, borderRadius: '10px', fontFamily: 'inherit', fontSize: 14, fontWeight: isSel || isToday ? 800 : 500,
                color: isSel ? (accent ? '#FFFFFF' : t.palette.primary.contrastText) : disabled ? t.palette.text.disabled : t.palette.text.primary,
                bgcolor: isSel ? (accent || t.palette.primary.main) : inSpan ? alpha(accent || t.palette.primary.main, 0.16) : 'transparent',
                border: `1.5px solid ${isToday && !isSel ? (accent || t.palette.primary.main) : 'transparent'}`,
                '&:hover': { bgcolor: isSel ? (accent || t.palette.primary.main) : t.palette.action.hover },
                '&.Mui-focusVisible': { outline: `2px solid ${accent || t.palette.primary.main}`, outlineOffset: 1 },
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
