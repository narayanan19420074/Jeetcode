import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FONT_WEIGHTS, LINE_HEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import { PrimaryCta, SectionHeading } from './HomeCommon';
import { STEPS } from './homeContent';
import { anchorOffset, bandSx, smallCardTitleSx } from './homeStyles';

function StepNumber({ number }) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        width: SIZES.avatar.md,
        height: SIZES.avatar.md,
        borderRadius: RADII_PX.card,
        display: 'grid',
        placeItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
        color: 'primary.main',
        fontWeight: FONT_WEIGHTS.bold,
      }}
    >
      {number}
    </Box>
  );
}

// How it works: three plain steps, no images.
export default function HowItWorksSection({ startLabel, onStart }) {
  return (
    <Box id="how-it-works" sx={{ ...bandSx, scrollMarginTop: anchorOffset }}>
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <SectionHeading>Start in two minutes</SectionHeading>
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {STEPS.map((step, index) => (
            <Grid key={step.title} size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <StepNumber number={index + 1} />
                <Box>
                  <Typography sx={smallCardTitleSx}>{step.title}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5, lineHeight: LINE_HEIGHTS.comfortable }}>{step.body}</Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: { xs: 5, md: 6 } }}>
          <PrimaryCta label={startLabel} onClick={onStart} />
        </Box>
      </Container>
    </Box>
  );
}
