import { ButtonBase, Stack, Typography } from '@mui/material';
import PopupCard from './PopupCard';

function ChoiceOption({ choice, onSelect }) {
  return (
    <ButtonBase
      onClick={() => onSelect(choice)}
      sx={{
        width: '100%',
        justifyContent: 'flex-start',
        textAlign: 'left',
        px: 2,
        py: 1.5,
        borderRadius: 3,
        bgcolor: 'var(--lib-bg)',
        border: '1px solid var(--lib-divider)',
        '&:hover': { borderColor: 'primary.main' },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Stack sx={{ alignItems: 'flex-start' }}>
        <Typography sx={{ fontWeight: 600 }}>{choice.label}</Typography>
        {choice.hint && (
          <Typography variant="caption" sx={{ color: 'var(--lib-muted)' }}>
            {choice.hint}
          </Typography>
        )}
      </Stack>
    </ButtonBase>
  );
}

// One question with tappable answers. Also used for the placement questions, which add a `question` line.
export default function ChoiceCard({ step, onSelect }) {
  return (
    <PopupCard>
      <Typography variant="h6" component="h2">
        {step.title}
      </Typography>
      {step.question && <Typography sx={{ mt: 1, fontFamily: '"JetBrains Mono", monospace', fontSize: 14 }}>{step.question}</Typography>}
      <Stack spacing={1} role="group" aria-label={step.title} sx={{ mt: 2 }}>
        {step.options.map((choice) => (
          <ChoiceOption key={choice.id} choice={choice} onSelect={onSelect} />
        ))}
      </Stack>
    </PopupCard>
  );
}
