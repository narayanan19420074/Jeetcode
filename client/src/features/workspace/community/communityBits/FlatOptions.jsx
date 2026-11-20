import { ButtonBase, Stack } from '@mui/material';
import { navActiveColor } from '../../../../components/navbar/navLinkStyles';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

function FlatOption({ on, option, onSelect }) {
  return (
    <ButtonBase
      role="tab"
      aria-selected={on}
      onClick={() => onSelect(option.value)}
      sx={(t) => ({
        gap: 0.5,
        py: 0.5,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        fontSize: FONT_SIZES.body,
        fontWeight: on ? FONT_WEIGHTS.bold : FONT_WEIGHTS.semibold,
        color: on ? navActiveColor(t) : t.palette.text.secondary,
        '&:hover': { color: on ? navActiveColor(t) : t.palette.text.primary },
        '& svg': { fontSize: FONT_SIZES.iconCompact },
      })}
    >
      {option.icon}
      {option.label}
    </ButtonBase>
  );
}

// Plain text options for the sort and filter rows of the desktop workspace. The chosen option is shown in the
// navigation blue, like the active link of the top navigation. Scrolls sideways instead of wrapping.
export default function FlatOptions({ value, onChange, options }) {
  return (
    <Stack direction="row" role="tablist" sx={{ gap: 2.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
      {options.map((option) => (
        <FlatOption key={option.value || 'all'} on={option.value === value} option={option} onSelect={onChange} />
      ))}
    </Stack>
  );
}
