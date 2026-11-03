import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES } from '../../../app/design/designTokens';

// One divider-separated row of the phone settings list (Library look).
export default function PhoneRow({ to, title, subtitle, leading }) {
  const pal = useLibraryPalette();
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', py: 1.25, textAlign: 'left', fontFamily: 'inherit', color: pal.text, borderBottom: `1px solid ${pal.divider}`, '&:last-of-type': { borderBottom: 'none' } }}
    >
      {leading}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{title}</Typography>
        {subtitle && <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{subtitle}</Typography>}
      </Box>
      <ChevronRightRoundedIcon aria-hidden sx={{ color: pal.muted, flexShrink: 0 }} />
    </ButtonBase>
  );
}
