import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { LIB_ACCENT, LIB_TRACKING, libPanelSx, libSolidBtnSx, libTintBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { BORDER_WIDTHS, COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { FREE_FEATURES, PERIOD, PLAN_LABEL, PRICE, PRO_FEATURES, SAVING_PERCENT } from './planCatalog';

const CHECK_GREEN = COLOR_PALETTE.custom.emerald22A06B; // same green as the cleared level cards on the dashboard

function FeatureList({ items }) {
  return (
    <Stack component="ul" spacing={1.25} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {items.map((text) => (
        <Stack component="li" key={text} direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
          <CheckRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.display, color: CHECK_GREEN, flexShrink: 0 }} />
          <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{text}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function PlanPanel({ highlighted = false, children }) {
  const highlight = highlighted ? { border: `${BORDER_WIDTHS.emphasis}px solid ${LIB_ACCENT}` } : {};
  return <Box sx={{ ...libPanelSx, p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, ...highlight }}>{children}</Box>;
}

function MutedLine({ children, sx }) {
  const pal = useLibraryPalette();
  return <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted, ...sx }}>{children}</Typography>;
}

function PlanName({ children }) {
  return (
    <Typography component="h2" sx={{ fontSize: FONT_SIZES.heading, lineHeight: '28px', fontWeight: FONT_WEIGHTS.bold }}>
      {children}
    </Typography>
  );
}

const priceSx = { mt: 0.5, fontSize: FONT_SIZES.hero, lineHeight: '40px', fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums' };

export function FreePlanPanel({ isAuthenticated, isPro }) {
  const pal = useLibraryPalette();
  const disabledSx = { '&.Mui-disabled': { color: pal.text, opacity: 0.6 } };
  return (
    <PlanPanel>
      <Box>
        <PlanName>Free</PlanName>
        <Typography sx={priceSx}>₹0</Typography>
        <MutedLine>Everything you need to begin</MutedLine>
      </Box>
      <Box sx={{ flex: 1 }}>
        <FeatureList items={FREE_FEATURES} />
      </Box>
      {!isAuthenticated && (
        <Button component={RouterLink} to="/signup" disableElevation fullWidth sx={libTintBtnSx}>
          Sign up
        </Button>
      )}
      {isAuthenticated && !isPro && (
        <Button disabled fullWidth sx={{ ...libTintBtnSx, ...disabledSx }}>
          Current plan
        </Button>
      )}
    </PlanPanel>
  );
}

function BestValueTag() {
  return (
    <Box component="span" sx={{ height: SIZES.chipHeightSmall, px: 1.5, borderRadius: RADII_PX.pill, display: 'inline-flex', alignItems: 'center', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING, color: COLOR_PALETTE.white, bgcolor: LIB_ACCENT }}>
      Best value
    </Box>
  );
}

function ProPlanHeader({ plan }) {
  const pal = useLibraryPalette();
  const billingNote = plan === 'yearly' ? `Billed yearly. Save ${SAVING_PERCENT}% compared with monthly.` : 'Billed monthly. Cancel anytime.';
  return (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <PlanName>Pro {PLAN_LABEL[plan]}</PlanName>
        {plan === 'yearly' && <BestValueTag />}
      </Stack>
      <Typography sx={priceSx}>
        ₹{PRICE[plan].toLocaleString('en-IN')}
        <Box component="span" sx={{ ml: 1, fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.regular, letterSpacing: LIB_TRACKING, color: pal.muted }}>
          per {PERIOD[plan]}
        </Box>
      </Typography>
      <MutedLine>{billingNote}</MutedLine>
    </Box>
  );
}

// The plan the user is already on cannot be bought again.
function proButtonLabel({ plan, isPro, currentPlan }) {
  return isPro && currentPlan === plan ? 'Current plan' : 'Subscribe';
}

function ProPlanButton({ plan, isPro, currentPlan, loadingPlan, onSubscribe }) {
  const pal = useLibraryPalette();
  const isYearly = plan === 'yearly';
  const disabledSx = isYearly ? { bgcolor: LIB_ACCENT, color: COLOR_PALETTE.white, opacity: 0.5 } : { color: pal.text, opacity: 0.6 };
  return (
    <Button disableElevation fullWidth disabled={Boolean(loadingPlan) || isPro} onClick={() => onSubscribe(plan)} sx={{ ...(isYearly ? libSolidBtnSx : libTintBtnSx), '&.Mui-disabled': disabledSx }}>
      {loadingPlan === plan ? <CircularProgress size={SIZES.iconSize.medium - 2} sx={{ color: isYearly ? COLOR_PALETTE.white : pal.text }} aria-label="Starting checkout" /> : proButtonLabel({ plan, isPro, currentPlan })}
    </Button>
  );
}

// One Pro card per billing period, so both prices are always visible.
export function ProPlanPanel({ plan, isPro, currentPlan, loadingPlan, onSubscribe }) {
  return (
    <PlanPanel highlighted={plan === 'yearly'}>
      <ProPlanHeader plan={plan} />
      <Box sx={{ flex: 1 }}>
        <MutedLine sx={{ mb: 1.5 }}>Everything in Free, plus:</MutedLine>
        <FeatureList items={PRO_FEATURES} />
      </Box>
      <ProPlanButton plan={plan} isPro={isPro} currentPlan={currentPlan} loadingPlan={loadingPlan} onSubscribe={onSubscribe} />
    </PlanPanel>
  );
}
