import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { LIB_ACCENT, LIB_TRACKING, libPanelSx, libSolidBtnSx, libTintBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { BORDER_WIDTHS, COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { FREE_FEATURES, PERIOD, PLAN_LABEL, PRICE, PRO_FEATURES, SAVING_PERCENT } from './planCatalog';

const PLAN_ICONS = { free: RocketLaunchOutlinedIcon, monthly: CalendarMonthOutlinedIcon, yearly: WorkspacePremiumOutlinedIcon };

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

// The active plan (the one the user is on) gets the accent outline, like the active entry in the sidebar.
function PlanPanel({ active = false, children }) {
  const activeSx = active ? { border: `${BORDER_WIDTHS.emphasis}px solid ${LIB_ACCENT}` } : {};
  return <Box sx={{ ...libPanelSx, p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, ...activeSx }}>{children}</Box>;
}

function MutedLine({ children, sx }) {
  const pal = useLibraryPalette();
  return <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted, ...sx }}>{children}</Typography>;
}

// Outlined icon tile; it fills with the accent colour when the plan is active.
function PlanIconTile({ icon: Icon, active }) {
  const outlineColor = active ? LIB_ACCENT : 'var(--lib-border)';
  return (
    <Box
      aria-hidden
      sx={{ width: SIZES.planIconTile, height: SIZES.planIconTile, borderRadius: RADII_PX.card, display: 'grid', placeItems: 'center', flexShrink: 0, border: `${BORDER_WIDTHS.thin}px solid ${outlineColor}`, bgcolor: active ? LIB_ACCENT : 'transparent', color: active ? COLOR_PALETTE.white : 'var(--lib-text)' }}
    >
      <Icon />
    </Box>
  );
}

function PlanTag({ children }) {
  return (
    <Box component="span" sx={{ height: SIZES.chipHeightSmall, px: 1.5, borderRadius: RADII_PX.pill, display: 'inline-flex', alignItems: 'center', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING, color: COLOR_PALETTE.white, bgcolor: LIB_ACCENT }}>
      {children}
    </Box>
  );
}

// Top right of the card: "Current plan" on the plan the user is on, "Best value" on Yearly otherwise.
function PlanCardHeader({ planKey, name, active, tag }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
      <PlanIconTile icon={PLAN_ICONS[planKey]} active={active} />
      <Typography component="h2" sx={{ flex: 1, fontSize: FONT_SIZES.heading, lineHeight: '28px', fontWeight: FONT_WEIGHTS.bold }}>
        {name}
      </Typography>
      {tag && <PlanTag>{tag}</PlanTag>}
    </Stack>
  );
}

const priceSx = { fontSize: FONT_SIZES.hero, lineHeight: '40px', fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums' };

export function FreePlanPanel({ isAuthenticated, isPro }) {
  const isActive = isAuthenticated && !isPro;
  return (
    <PlanPanel active={isActive}>
      <PlanCardHeader planKey="free" name="Free" active={isActive} tag={isActive ? 'Current plan' : null} />
      <Box>
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
    </PlanPanel>
  );
}

function ProPrice({ plan }) {
  const pal = useLibraryPalette();
  const billingNote = plan === 'yearly' ? `Billed yearly. Save ${SAVING_PERCENT}% compared with monthly.` : 'Billed monthly. Cancel anytime.';
  return (
    <Box>
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

// On the plan the user is already on, the button cancels it (recurring plans only); on the others it subscribes.
function ProPlanButton({ plan, isPro, isCurrent, canCancel, loadingPlan, onSubscribe, onCancel }) {
  const pal = useLibraryPalette();
  const isYearly = plan === 'yearly';
  if (isCurrent) {
    return canCancel ? (
      <Button disableElevation fullWidth onClick={onCancel} sx={libTintBtnSx}>
        Cancel subscription
      </Button>
    ) : null;
  }
  const disabledSx = isYearly ? { bgcolor: LIB_ACCENT, color: COLOR_PALETTE.white, opacity: 0.5 } : { color: pal.text, opacity: 0.6 };
  return (
    <Button disableElevation fullWidth disabled={Boolean(loadingPlan) || isPro} onClick={() => onSubscribe(plan)} sx={{ ...(isYearly ? libSolidBtnSx : libTintBtnSx), '&.Mui-disabled': disabledSx }}>
      {loadingPlan === plan ? <CircularProgress size={SIZES.iconSize.medium - 2} sx={{ color: isYearly ? COLOR_PALETTE.white : pal.text }} aria-label="Starting checkout" /> : 'Subscribe'}
    </Button>
  );
}

// One Pro card per billing period, so both prices are always visible.
export function ProPlanPanel({ plan, isPro, currentPlan, canCancel, loadingPlan, onSubscribe, onCancel }) {
  const isCurrent = isPro && currentPlan === plan;
  const tag = isCurrent ? 'Current plan' : plan === 'yearly' ? 'Best value' : null;
  return (
    <PlanPanel active={isCurrent}>
      <PlanCardHeader planKey={plan} name={`Pro ${PLAN_LABEL[plan]}`} active={isCurrent} tag={tag} />
      <ProPrice plan={plan} />
      <Box sx={{ flex: 1 }}>
        <MutedLine sx={{ mb: 1.5 }}>Everything in Free, plus:</MutedLine>
        <FeatureList items={PRO_FEATURES} />
      </Box>
      <ProPlanButton plan={plan} isPro={isPro} isCurrent={isCurrent} canCancel={canCancel} loadingPlan={loadingPlan} onSubscribe={onSubscribe} onCancel={onCancel} />
    </PlanPanel>
  );
}
