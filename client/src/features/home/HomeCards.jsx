import { Box, Button, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { BORDER_WIDTHS, COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, RADII_PX, SIZES } from '../../app/design/designTokens';
import HomeShot from './HomeShot';
import { cardSx, cardTitleSx, planPriceSx, smallCardTitleSx } from './homeStyles';

function FeaturePoints({ points }) {
  return (
    <Stack spacing={1} sx={{ mb: 2.5 }}>
      {points.map((point) => (
        <Stack key={point} direction="row" spacing={1.1} sx={{ alignItems: 'flex-start' }}>
          <CheckRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: 'success.main' }} />
          <Typography sx={{ fontWeight: FONT_WEIGHTS.semibold, lineHeight: LINE_HEIGHTS.body }}>{point}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

// One feature: short title, one line, a real screenshot.
export function FeatureCard({ title, body, shot, alt, points, onClick, cta }) {
  return (
    <Box sx={{ ...cardSx, height: SIZES.fill, display: 'flex', flexDirection: 'column', p: { xs: 2.5, md: 3.5 } }}>
      <Typography sx={cardTitleSx}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 2, lineHeight: LINE_HEIGHTS.comfortable }}>{body}</Typography>
      {points && <FeaturePoints points={points} />}
      <Box sx={{ mt: 'auto' }}>
        {shot && <HomeShot src={shot} alt={alt} />}
        {cta && (
          <Button onClick={onClick} sx={{ mt: 1.5, px: 0, fontWeight: FONT_WEIGHTS.bold }}>
            {cta}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export function SmallCard({ title, body }) {
  return (
    <Box sx={{ ...cardSx, height: SIZES.fill, p: 3 }}>
      <Typography sx={smallCardTitleSx}>{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, lineHeight: LINE_HEIGHTS.comfortable }}>{body}</Typography>
    </Box>
  );
}

const planCardSx = (primary) => ({
  position: 'relative',
  borderRadius: RADII_PX.card,
  p: { xs: 3, md: 4 },
  border: `${BORDER_WIDTHS.emphasis}px solid`,
  borderColor: primary ? 'primary.main' : 'divider',
  bgcolor: (theme) => (primary ? alpha(theme.palette.primary.main, 0.07) : 'background.paper'),
  display: 'flex',
  flexDirection: 'column',
  height: SIZES.fill,
});

function PlanBadge({ children }) {
  return (
    <Box sx={{ position: 'absolute', top: -13, left: 24, px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'warning.main', color: COLOR_PALETTE.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.caption }}>
      {children}
    </Box>
  );
}

function PlanPoints({ points, primary }) {
  return (
    <Stack spacing={1.2} sx={{ mb: 3.5 }}>
      {points.map((point) => (
        <Stack key={point} direction="row" spacing={1.25}>
          <CheckCircleRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: primary ? 'primary.main' : 'success.main' }} />
          <Typography sx={{ fontWeight: FONT_WEIGHTS.semibold }}>{point}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

const outlinedPlanButtonSx = { borderWidth: BORDER_WIDTHS.emphasis, '&:hover': { borderWidth: BORDER_WIDTHS.emphasis } };

export function PlanCard({ name, price, note, points, cta, onCta, primary = false, badge, footnote }) {
  return (
    <Box sx={planCardSx(primary)}>
      {badge && <PlanBadge>{badge}</PlanBadge>}
      <Typography sx={cardTitleSx}>{name}</Typography>
      <Typography sx={planPriceSx}>{price}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5, mt: 0.5, fontSize: FONT_SIZES.bodyLg }}>{note}</Typography>
      <PlanPoints points={points} primary={primary} />
      <Box sx={{ mt: 'auto' }}>
        <Button fullWidth size="large" variant={primary ? 'contained' : 'outlined'} disableElevation onClick={onCta} sx={{ fontWeight: FONT_WEIGHTS.bold, py: 1.5, ...(!primary && outlinedPlanButtonSx) }}>
          {cta}
        </Button>
        {footnote && <Typography color="text.secondary" sx={{ mt: 1.5, textAlign: 'center', fontSize: FONT_SIZES.body }}>{footnote}</Typography>}
      </Box>
    </Box>
  );
}
