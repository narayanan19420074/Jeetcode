import { Box, Chip } from '@mui/material';

// Which sample case is being traced. Only shown when the problem has more than one.
export default function CaseSelector({ caseCount, caseIndex, onSelect }) {
  if (caseCount < 2) return null;
  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }} role="group" aria-label="Sample case">
      {Array.from({ length: caseCount }, (_, index) => (
        <Chip
          key={index}
          size="small"
          label={`Case ${index + 1}`}
          color="primary"
          variant={index === caseIndex ? 'filled' : 'outlined'}
          onClick={() => onSelect(index)}
          aria-pressed={index === caseIndex}
        />
      ))}
    </Box>
  );
}
