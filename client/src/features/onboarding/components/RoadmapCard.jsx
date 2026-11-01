import { Box, Chip, Stack, Typography } from '@mui/material';
import ContinueButton from './ContinueButton';
import StepCard from './StepCard';

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

// Final screen: the personalised plan built from every answer.
export default function RoadmapCard({ roadmap, onBack, onFinish }) {
  return (
    <StepCard title={roadmap.title} assistantLine={`Made for ${roadmap.learnerName}. ${roadmap.summary}`} onBack={onBack}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Chip size="small" label={roadmap.level} sx={{ textTransform: 'capitalize' }} />
      </Box>
      <Stack component="ol" spacing={2} sx={{ m: 0, p: 0 }}>
        {roadmap.stages.map((stage) => (
          <RoadmapStage key={stage.order} stage={stage} />
        ))}
      </Stack>
      <Box sx={{ mt: 3 }}>
        <ContinueButton label="Save plan and continue" onClick={onFinish} />
      </Box>
    </StepCard>
  );
}
