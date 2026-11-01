import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import PopupCard from './PopupCard';

function RoadmapStage({ stage }) {
  return (
    <Box component="li" sx={{ listStyle: 'none', pl: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
      <Typography sx={{ fontWeight: 600 }}>
        {stage.order}. {stage.title}
        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'var(--lib-muted)' }}>
          {stage.weeks} {stage.weeks === 1 ? 'week' : 'weeks'}
        </Typography>
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--lib-muted)' }}>
        {stage.items.join(' · ')}
      </Typography>
    </Box>
  );
}

// Final card: the personalised plan built from every answer.
export default function RoadmapCard({ roadmap, onFinish }) {
  return (
    <PopupCard>
      <Chip size="small" label={roadmap.level} sx={{ textTransform: 'capitalize', mb: 1 }} />
      <Typography variant="h6" component="h2">
        {roadmap.title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--lib-muted)', mt: 0.5 }}>
        {roadmap.summary}
      </Typography>
      <Stack component="ol" spacing={2} sx={{ m: 0, mt: 2, p: 0 }}>
        {roadmap.stages.map((stage) => (
          <RoadmapStage key={stage.order} stage={stage} />
        ))}
      </Stack>
      <Button fullWidth variant="contained" disableElevation onClick={onFinish} sx={{ mt: 3 }}>
        Save plan and continue
      </Button>
    </PopupCard>
  );
}
