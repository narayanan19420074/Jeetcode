import { Box, Container, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { COLOR_PALETTE, FONT_SIZES, LINE_HEIGHTS, RADII_PX } from '../../app/design/designTokens';
import { OutlineCta, PrimaryCta } from './HomeCommon';
import { closingTitleSx } from './homeStyles';

const bannerSx = {
  borderRadius: RADII_PX.card,
  px: { xs: 3, md: 8 },
  py: { xs: 5, md: 7 },
  textAlign: 'center',
  color: COLOR_PALETTE.white,
  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${COLOR_PALETTE.slate[900]} 90%)`,
};

// Final call to action: plain banner, no art. The dark gradient is the same in light and dark mode on purpose.
export default function ClosingSection({ startLabel, onStart, onNavigate, ctaRef }) {
  return (
    <Container maxWidth="lg" sx={{ pb: { xs: 7, md: 10 } }}>
      <Box sx={bannerSx}>
        <Typography sx={closingTitleSx}>Your first question is two minutes away.</Typography>
        <Typography sx={{ color: alpha(COLOR_PALETTE.white, 0.85), fontSize: FONT_SIZES.subheading, mb: 3.5, lineHeight: LINE_HEIGHTS.relaxed }}>
          Create your free account and solve your first question.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'center' }}>
          <PrimaryCta light buttonRef={ctaRef} label={startLabel} onClick={onStart} />
          <OutlineCta onDark onClick={onNavigate('/pair')}>Try a pair room</OutlineCta>
        </Stack>
      </Box>
    </Container>
  );
}
