import { Box, ButtonBase, Typography } from '@mui/material';
import { railCardSx } from '../../components/rail/railCardStyles';
import { SOFT } from '../../components/rail/railTokens';
import { LIB_TRACKING, libSectionTitleSx } from '../../components/libraryStyle';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

const SELECTED_TINT = 0.18;
const DISABLED_OPACITY = 0.5;

function OptionButton({ option, selected, disabled, onPick }) {
  return (
    <ButtonBase
      disabled={disabled}
      aria-pressed={selected}
      onClick={() => onPick(option.value)}
      sx={{ justifyContent: 'flex-start', px: 1.5, height: SIZES.navItemHeightDense, borderRadius: RADII_PX.card, fontFamily: 'inherit', letterSpacing: LIB_TRACKING, color: selected ? COLOR_PALETTE.white : SOFT, bgcolor: selected ? withAlpha(COLOR_PALETTE.white, SELECTED_TINT) : 'transparent', opacity: disabled ? DISABLED_OPACITY : 1 }}
    >
      <Typography noWrap sx={{ fontSize: FONT_SIZES.body, fontWeight: selected ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium }}>{option.label}</Typography>
    </ButtonBase>
  );
}

// One filter as a small indigo card, like the section picker of the Aptitude page: a title and text-only options.
export default function SidebarOptionCard({ title, options, value, onChange, columns, disabled = false, disabledHint }) {
  return (
    <Box component="section" aria-label={title} title={disabled ? disabledHint : undefined} sx={[...railCardSx, { p: 1 }]}>
      <Typography component="h2" sx={[libSectionTitleSx, { px: 1.5, pb: 0.5 }]}>{title}</Typography>
      <Box role="group" aria-label={title} sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 0.5 }}>
        {options.map((option) => <OptionButton key={option.value} option={option} selected={option.value === value} disabled={disabled} onPick={onChange} />)}
      </Box>
    </Box>
  );
}
