import { ButtonBase, Stack, Tooltip } from '@mui/material';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

// One tab of the desktop problem pane. The open tab is marked by a bottom border in the navigation blue (the same
// border as the active link of the top navigation), not by a filled pill. Closed tabs keep a transparent border of
// the same width so the labels never shift.
const tabSx = (on) => (t) => ({
  height: SIZES.fill,
  px: 1.5,
  gap: 1,
  flexShrink: 0,
  borderRadius: RADII_PX.square,
  fontSize: FONT_SIZES.body,
  fontWeight: on ? FONT_WEIGHTS.bold : FONT_WEIGHTS.semibold,
  whiteSpace: 'nowrap',
  color: on ? t.palette.text.primary : t.palette.text.secondary,
  borderBottom: `${SIZES.navActiveIndicator}px solid ${on ? navActiveColor(t) : 'transparent'}`,
  '&:hover': { color: t.palette.text.primary },
  '& svg': { fontSize: FONT_SIZES.iconCompact },
  '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: -2 },
});

function UnderlineTab({ item, on, showLabel, onChange }) {
  const tab = (
    <ButtonBase role="tab" aria-selected={on} aria-label={showLabel ? undefined : item.label} onClick={() => onChange(item.value)} sx={tabSx(on)}>
      {item.icon}
      {showLabel && item.label}
    </ButtonBase>
  );
  return showLabel ? tab : <Tooltip title={item.label}>{tab}</Tooltip>;
}

// items = [{ value, label, icon }]. labels: 'all' | 'active' (only the open tab keeps its name) | 'none' (icons only),
// chosen from the pane width by usePaneModes. The tabs fill the full height of the bar so the border sits on its bottom edge.
export default function UnderlineTabs({ value, onChange, items, labels = 'all' }) {
  return (
    <Stack direction="row" role="tablist" sx={{ alignSelf: 'stretch', gap: 0.5, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
      {items.map((item) => {
        const on = item.value === value;
        const showLabel = labels === 'all' || !item.icon || (labels === 'active' && on);
        return <UnderlineTab key={item.value} item={item} on={on} showLabel={showLabel} onChange={onChange} />;
      })}
    </Stack>
  );
}
