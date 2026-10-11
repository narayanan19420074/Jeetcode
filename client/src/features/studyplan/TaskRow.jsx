import { Link as RouterLink } from 'react-router-dom';
import { Box, Checkbox, Chip, Typography, Tooltip } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import DifficultyChip from '../../components/DifficultyChip';
import { itemLink } from './planUtils';

const TYPE_ICON = { problem: CodeRoundedIcon, aptitude: CalculateRoundedIcon, custom: EditNoteRoundedIcon };
const TYPE_LABEL = { problem: 'Coding', aptitude: 'Aptitude', custom: 'Task' };

// One Notion-style row: checkbox | title | property chips.
// Coding / aptitude rows tick themselves when the learner solves the question,
// so their checkbox is read-only; custom rows are ticked by hand.
export default function TaskRow({ item, onToggle, showDay = false }) {
  const Icon = TYPE_ICON[item.type];
  const link = itemLink(item);
  const manual = item.type === 'custom';

  return (
    <Box
      sx={{
        display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.5, borderRadius: 2,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Tooltip title={manual ? '' : 'Completes automatically when you solve it'} placement="top-start">
        <span>
          <Checkbox
            checked={item.done}
            disabled={!manual}
            onChange={(e) => onToggle?.(item, e.target.checked)}
            size="small"
            inputProps={{ 'aria-label': `Mark "${item.title}" done` }}
          />
        </span>
      </Tooltip>

      <Icon sx={{ fontSize: 18, color: 'text.secondary' }} />

      <Typography
        component={link ? RouterLink : 'span'}
        to={link || undefined}
        variant="body2"
        sx={{
          flexGrow: 1, minWidth: 0, fontWeight: 500, color: 'text.primary', textDecoration: item.done ? 'line-through' : 'none',
          opacity: item.done ? 0.6 : 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          '&:hover': link ? { color: 'primary.main' } : undefined,
        }}
      >
        {item.title}
      </Typography>

      {showDay && <Chip size="small" variant="outlined" label={`Day ${item.day}`} />}
      {item.overdue && <Chip size="small" color="warning" label="Overdue" sx={{ fontWeight: 700 }} />}
      <Chip size="small" variant="outlined" label={TYPE_LABEL[item.type]} sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
      {item.difficulty && <DifficultyChip difficulty={item.difficulty} />}
    </Box>
  );
}
