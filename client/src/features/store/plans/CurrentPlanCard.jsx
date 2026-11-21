import { Box, Button, Typography } from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { tint } from '../../dashboard/dashboardUtils';
import { LIB_TRACKING, libPanelSx, libSmallBtnSx, libTintBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const PRO_ACCENT = COLOR_PALETTE.custom.amberF09A2E;

function PlanIconTile() {
  return (
    <Box
      aria-hidden
      sx={{ width: SIZES.planIconTile, height: SIZES.planIconTile, borderRadius: RADII_PX.card, display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: tint(PRO_ACCENT, 16), color: PRO_ACCENT }}
    >
      <WorkspacePremiumRoundedIcon />
    </Box>
  );
}

// Shows the subscription the signed-in user is on right now, for Free and Pro alike.
export default function CurrentPlanCard({ plan, canCancel, onCancel }) {
  const pal = useLibraryPalette();
  return (
    <Box component="section" aria-label="Current plan" sx={{ ...libPanelSx, mt: 3, p: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      <PlanIconTile />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>Current plan</Typography>
        <Typography sx={{ fontSize: FONT_SIZES.heading, lineHeight: '28px', fontWeight: FONT_WEIGHTS.bold }}>{plan.title}</Typography>
        {plan.detail && <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{plan.detail}</Typography>}
      </Box>
      {canCancel && (
        <Button disableElevation onClick={onCancel} sx={{ ...libTintBtnSx, ...libSmallBtnSx }}>
          Cancel subscription
        </Button>
      )}
    </Box>
  );
}
