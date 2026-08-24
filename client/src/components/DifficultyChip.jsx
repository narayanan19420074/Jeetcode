import { Chip } from '@mui/material';
import { difficultyColor } from '../theme/theme';

export default function DifficultyChip({ difficulty, size = 'small' }) {
  const color = difficultyColor(difficulty);
  return (
    <Chip
      label={difficulty}
      size={size}
      sx={{
        color,
        bgcolor: `${color}1A`, // ~10% alpha tint of the difficulty color
        fontWeight: 700,
        border: 'none',
      }}
    />
  );
}
