import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, RADII_PX, TEXT_MEASURE } from '../../app/design/designTokens';
import { OutlineCta, PrimaryCta } from './HomeCommon';
import HomeShot from './HomeShot';
import { STATS } from './homeContent';
import { heroTitleSx, hairline } from './homeStyles';

function LaunchOfferPill({ offerEnds }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        mb: 2.5,
        px: 1.5,
        py: 0.5,
        width: 'fit-content',
        borderRadius: RADII_PX.pill,
        alignItems: 'center',
        border: hairline,
        borderColor: (theme) => alpha(theme.palette.warning.main, 0.5),
        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
      }}
    >
      <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.subheading, color: 'warning.main' }} />
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>Launch offer: Pro is free until {offerEnds}</Typography>
    </Stack>
  );
}

function HeroStats() {
  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', columnGap: 2.5, rowGap: 0.5, mt: 3.5 }}>
      {STATS.map(({ value, label }) => (
        <Typography key={label} color="text.secondary" sx={{ fontSize: FONT_SIZES.bodyLg, whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'text.primary' }}>{value}</Box> {label}
        </Typography>
      ))}
    </Stack>
  );
}

const heroShotShadow = (theme) => `0 30px 60px -34px ${alpha(theme.palette.primary.main, 0.5)}`;

// Hero: one promise, one button, one real screenshot.
export default function HeroSection({ offerEnds, startLabel, onStart, ctaRef }) {
  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 9 }, pb: { xs: 6, md: 9 } }}>
      <Grid container spacing={{ xs: 5, md: 6 }} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          {offerEnds && <LaunchOfferPill offerEnds={offerEnds} />}
          <Typography variant="h1" sx={heroTitleSx}>
            Placement prep for coding and aptitude.
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: FONT_SIZES.subheading, md: FONT_SIZES.heading }, maxWidth: TEXT_MEASURE.lead, mb: 3.5, lineHeight: LINE_HEIGHTS.body }}>
            Practice aptitude and coding problems, take timed tests, and see your progress. All in one place.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <PrimaryCta buttonRef={ctaRef} label={startLabel} onClick={onStart} />
            <OutlineCta href="#features">See what's inside</OutlineCta>
          </Stack>
          <HeroStats />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <HomeShot src="/screens/dashboard.png" alt="JeetCode dashboard with coding problems and a streak calendar" priority sx={{ boxShadow: heroShotShadow }} />
        </Grid>
      </Grid>
    </Container>
  );
}
