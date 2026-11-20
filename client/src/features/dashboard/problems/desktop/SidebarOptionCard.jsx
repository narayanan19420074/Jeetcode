import { Box, ButtonBase, Typography } from '@mui/material';
import { LIGHT_CARD_MUTED_OPACITY, LIGHT_CARD_SELECTED_BG, lightCardSx } from '../../components/rail/lightCardStyles';
import { LIB_TRACKING, libSectionTitleSx } from '../../components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

const DISABLED_OPACITY = 0.5;

function OptionButton({ option, selected, disabled, onPick }) {
  return (
    <ButtonBase
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onPick(option.value)}
      sx={{ justifyContent: 'flex-start', px: 1.5, height: SIZES.navItemHeightDense, borderRadius: RADII_PX.card, fontFamily: 'inherit', letterSpacing: LIB_TRACKING, bgcolor: selected ? LIGHT_CARD_SELECTED_BG : 'transparent', opacity: disabled ? DISABLED_OPACITY : selected ? 1 : LIGHT_CARD_MUTED_OPACITY }}
    >
      <Typography noWrap sx={{ fontSize: FONT_SIZES.body, fontWeight: selected ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium }}>{option.label}</Typography>
    </ButtonBase>
  );
}

// One filter as a small white card with blue content, like the section picker of the Aptitude page: a title and text-only options.
export default function SidebarOptionCard({ title, options, value, onChange, columns, disabled = false, disabledHint }) {
  return (
    <Box component="section" aria-label={title} title={disabled ? disabledHint : undefined} sx={[...lightCardSx, { p: 1 }]}>
      <Typography component="h2" sx={[libSectionTitleSx, { px: 1.5, pb: 0.5 }]}>{title}</Typography>
      <Box role="group" aria-label={title} sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 0.5 }}>
        {options.map((option) => <OptionButton key={option.value} option={option} selected={option.value === value} disabled={disabled} onPick={onChange} />)}
      </Box>
    </Box>
  );
}
