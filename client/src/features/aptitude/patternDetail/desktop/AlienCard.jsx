import { Box, Typography, alpha } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import AppCard from '../../../../components/ui/AppCard';
import Alien3D from '../../components/Alien3D';
import { CountUp, XpBar } from '../../components/MotionBits';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, withAlpha } from '../../../../app/design/designTokens';

const ALIEN_SIZE = 132;
// Alien3D draws a stage 1.3 times taller than it is wide.
const ALIEN_STAGE_HEIGHT_RATIO = 1.3;
const TINT = { dark: 0.18, light: 0.1 };

const tintedBackground = (color) => (theme) => `linear-gradient(150deg, ${alpha(color, TINT[theme.palette.mode] ?? TINT.light)} 0%, transparent 70%)`;

// The learner's current alien for this topic: it evolves as the topic's XP grows.
export default function AlienCard({ rank, xp }) {
  const { alien, next, pct, toNext } = rank;
  return (
    <AppCard component="section" aria-label="Topic rank" sx={{ textAlign: 'center', backgroundImage: tintedBackground(alien.color) }}>
      <Box sx={{ width: ALIEN_SIZE, height: Math.round(ALIEN_SIZE * ALIEN_STAGE_HEIGHT_RATIO), mx: 'auto' }}>
        <Alien3D kind={alien.key} size={ALIEN_SIZE} wave />
      </Box>
      <Typography sx={{ mt: 1, fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.bold }}>
        {alien.name} · {alien.title}
      </Typography>
      <Typography sx={{ mt: 0.5, display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums' }}>
        <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: 'warning.main' }} />
        <CountUp value={xp} /> XP
      </Typography>
      <Box sx={{ mt: 1.5 }}>
        <XpBar pct={pct} color={alien.color} height={6} track={withAlpha(COLOR_PALETTE.slate[400], 0.22)} />
      </Box>
      <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: FONT_SIZES.body }}>
        {next ? `${toNext} XP to ${next.name}` : 'Max evolution'}
      </Typography>
    </AppCard>
  );
}
