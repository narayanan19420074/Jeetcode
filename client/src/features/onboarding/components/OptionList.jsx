import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { getOptionIcon } from '../optionIcons';

function OptionTile({ choice, index }) {
  const Icon = getOptionIcon(choice.icon);
  return (
    <Box sx={{ width: 44, height: 44, flex: 'none', display: 'grid', placeItems: 'center', borderRadius: '12px', bgcolor: 'var(--lib-chip)', color: 'primary.main', fontWeight: 600 }}>
      {Icon ? <Icon /> : String.fromCharCode(65 + index)}
    </Box>
  );
}

function RadioDot({ isSelected }) {
  return (
    <Box aria-hidden sx={{ width: 22, height: 22, flex: 'none', display: 'grid', placeItems: 'center', borderRadius: '50%', border: '2px solid', borderColor: isSelected ? 'primary.main' : 'var(--lib-muted)' }}>
      {isSelected && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'primary.main' }} />}
    </Box>
  );
}

function OptionRow({ choice, index, isSelected, isDisabled, onSelect }) {
  return (
    <ButtonBase
      role="radio"
      aria-checked={isSelected}
      disabled={isDisabled}
      onClick={() => onSelect(choice.id)}
      sx={{
        width: '100%',
        gap: 1.5,
        p: 1.5,
        justifyContent: 'flex-start',
        textAlign: 'left',
        borderRadius: '16px',
        border: '2px solid',
        borderColor: isSelected ? 'primary.main' : 'var(--lib-divider)',
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <OptionTile choice={choice} index={index} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>{choice.label}</Typography>
        {choice.hint && (
          <Typography variant="body2" sx={{ color: 'var(--lib-muted)' }}>
            {choice.hint}
          </Typography>
        )}
      </Box>
      <RadioDot isSelected={isSelected} />
    </ButtonBase>
  );
}

// Single-choice answers as selectable cards, announced to screen readers as a radio group.
export default function OptionList({ label, options, selectedId, isDisabled, onSelect }) {
  return (
    <Stack spacing={1.5} role="radiogroup" aria-label={label}>
      {options.map((choice, index) => (
        <OptionRow key={choice.id} choice={choice} index={index} isSelected={choice.id === selectedId} isDisabled={isDisabled} onSelect={onSelect} />
      ))}
    </Stack>
  );
}
