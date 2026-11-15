import { IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { FONT_WEIGHTS } from '../../../../app/design/designTokens';
import RailCard from '../RailCard';

// Card at the top of a groups or newsletters page: a Back button, the title and an optional action on the right.
export default function BackHeader({ title, backLabel, onBack, action }) {
  return (
    <RailCard sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton aria-label={backLabel} onClick={onBack} edge="start">
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flex: 1, fontWeight: FONT_WEIGHTS.bold }}>{title}</Typography>
        {action}
      </Stack>
    </RailCard>
  );
}
