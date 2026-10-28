import { Chip } from '@mui/material';
import { difficultyColor } from '../app/theme';

export default function DifficultyChip({ difficulty, size = 'small' }) {
  const color = difficultyColor(difficulty);
  return (
    <Chip
      label={difficulty}
      size={size}
      sx={{
        color,
        bgcolor: `color-mix(in srgb, ${color} 12%, transparent)`,
        fontWeight: 700,
        border: 'none',
      }}
    />
  );
}
