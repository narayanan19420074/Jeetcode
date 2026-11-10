import { ButtonBase, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

// Same look as the bottom bar: the active tab is a pill tinted with the navigation blue, the others are plain text.
const tabSx = (active) => (theme) => ({
  height: SIZES.compactPillHeight,
  px: 1.5,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  borderRadius: RADII_PX.pill,
  fontFamily: 'inherit',
  fontSize: FONT_SIZES.body,
  fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium,
  color: active ? navActiveColor(theme) : 'var(--lib-muted)',
  bgcolor: active ? alpha(navActiveColor(theme), theme.palette.mode === 'dark' ? 0.24 : 0.16) : 'transparent',
});

export default function CategoryTabs({ value, onChange, options }) {
  return (
    <Stack direction="row" spacing={0.5} role="tablist" sx={{ overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
      {options.map((option) => (
        <ButtonBase key={option.value || 'all'} role="tab" aria-selected={option.value === value} onClick={() => onChange(option.value)} sx={tabSx(option.value === value)}>
          {option.label}
        </ButtonBase>
      ))}
    </Stack>
  );
}
