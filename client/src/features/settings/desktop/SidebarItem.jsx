import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, Typography } from '@mui/material';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

// One settings section in the sidebar: a tinted icon tile in the group's colour; the open section is highlighted.
export default function SidebarItem({ item, accent, active }) {
  const Icon = item.icon;
  return (
    <ButtonBase
      component={RouterLink}
      to={`/settings/${item.key}`}
      aria-current={active ? 'page' : undefined}
      sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 1.5, width: '100%', p: 1, borderRadius: '16px', textAlign: 'left', fontFamily: 'inherit', color: active ? accent : 'text.primary', bgcolor: active ? tint(accent, 14) : 'transparent', border: `1px solid ${active ? tint(accent, 40) : 'transparent'}`, '&:hover': { bgcolor: active ? tint(accent, 14) : 'action.hover' } }}
    >
      <Box aria-hidden sx={{ width: 36, height: 36, borderRadius: '12px', flexShrink: 0, display: 'grid', placeItems: 'center', color: accent, bgcolor: tint(accent, active ? 24 : 12) }}>
        <Icon sx={{ fontSize: FONT_SIZES.display }} />
      </Box>
      <Typography noWrap sx={{ fontWeight: active ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING }}>{item.label}</Typography>
    </ButtonBase>
  );
}
