import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { tint } from '../../dashboardUtils';
import { LIB_TRACKING, useLibraryPalette } from '../../components/libraryStyle';
import { TOOLS } from '../common/exploreData';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../../app/design/designTokens';

function ToolCard({ tool, palette }) {
  const { to, title, text, icon: Icon, color, bg } = tool;
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={(theme) => ({ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, p: 2, minHeight: 96, borderRadius: RADII_PX.card, border: `1.5px solid ${palette.border}`, textAlign: 'left', fontFamily: 'inherit', color: palette.text, bgcolor: theme.palette.mode === 'dark' ? tint(color, 16) : bg })}
    >
      <Icon aria-hidden sx={{ fontSize: FONT_SIZES.hero, flex: 'none', color }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING }}>{title}</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: palette.muted }}>{text}</Typography>
      </Box>
      <ChevronRightRoundedIcon aria-hidden sx={{ flex: 'none', color: palette.muted }} />
    </ButtonBase>
  );
}

// The three practice tools as pastel cards, one per colour of the dashboard categories.
export default function ToolCards() {
  const palette = useLibraryPalette();
  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { md: 'minmax(0,1fr)', lg: 'repeat(3, minmax(0,1fr))' } }}>
      {TOOLS.map((tool) => <ToolCard key={tool.to} tool={tool} palette={palette} />)}
    </Box>
  );
}
