import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ActivateLicenseModal from '../../components/ActivateLicenseModal';
import { LIB_TRACKING, LibraryFont, libBackBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../app/design/designTokens';
import CancelSubscriptionDialog from './plans/CancelSubscriptionDialog';
import { FreePlanPanel, ProPlanPanel } from './plans/PlanPanels';
import { LicensePrompt, PlansLegalNote } from './plans/PlansFooter';
import { BILLED_PLANS } from './plans/planCatalog';
import usePlansBilling from './plans/usePlansBilling';

const pageSx = {
  px: { xs: 2, md: 0 },
  pt: 'calc(8px + env(safe-area-inset-top))',
  pb: 3,
  maxWidth: { xs: SIZES.centeredPageMaxWidth.phone, md: SIZES.centeredPageMaxWidth.desktop },
  mx: 'auto',
};

const planGridSx = { mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, 1fr)' }, gap: 1.5, alignItems: 'stretch' };

function PlansPageHeader({ isAuthenticated }) {
  const pal = useLibraryPalette();
  return (
    <>
      <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={{ ...libBackBtnSx, display: { md: 'none' } }}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <Box sx={{ mt: { xs: 0, md: 2 }, textAlign: 'center' }}>
        <Typography component="h1" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '32px' }}>
          Plans
        </Typography>
        <Typography sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: pal.muted }}>Choose the plan that fits your preparation</Typography>
      </Box>
    </>
  );
}

function PlanGrid({ billing }) {
  const { isAuthenticated, isPro, status } = billing;
  return (
    <Box sx={planGridSx}>
      <FreePlanPanel isAuthenticated={isAuthenticated} isPro={isPro} />
      {BILLED_PLANS.map((plan) => (
        <ProPlanPanel key={plan} plan={plan} isPro={isPro} currentPlan={status?.proPlan} canCancel={billing.isRecurring} loadingPlan={billing.loadingPlan} onSubscribe={billing.subscribe} onCancel={billing.cancel.open} />
      ))}
    </Box>
  );
}

// Plans: Free, Pro Monthly and Pro Yearly; the card of the plan the user is on is marked "Current plan". On wide screens it opens inside the
// dashboard main area (see DashboardViewContent); phones open it as a full screen with a back button.
export default function PlansPage() {
  const billing = usePlansBilling();
  const [licenseOpen, setLicenseOpen] = useState(false);
  const { isAuthenticated, isPro } = billing;

  return (
    <LibraryFont>
      <Box sx={pageSx}>
        <PlansPageHeader isAuthenticated={isAuthenticated} />
        {billing.error && (
          <Alert severity="error" onClose={billing.clearError} sx={{ mt: 2.5 }}>
            {billing.error}
          </Alert>
        )}
        <PlanGrid billing={billing} />
        {isAuthenticated && !isPro && <LicensePrompt onActivate={() => setLicenseOpen(true)} />}
        <PlansLegalNote />
      </Box>
      <CancelSubscriptionDialog cancel={billing.cancel} />
      <ActivateLicenseModal open={licenseOpen} onClose={() => setLicenseOpen(false)} />
    </LibraryFont>
  );
}
