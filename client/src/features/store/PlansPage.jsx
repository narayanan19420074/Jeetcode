import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, IconButton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import ActivateLicenseModal from '../../components/ActivateLicenseModal';
import { LibraryFont, PageHeader, libBackBtnSx } from '../dashboard/components/libraryStyle';
import { SIZES } from '../../app/design/designTokens';
import CancelSubscriptionDialog from './plans/CancelSubscriptionDialog';
import CurrentPlanCard from './plans/CurrentPlanCard';
import { FreePlanPanel, ProPlanPanel } from './plans/PlanPanels';
import { LicensePrompt, PlansLegalNote } from './plans/PlansFooter';
import { BILLED_PLANS, describeCurrentPlan } from './plans/planCatalog';
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
  return (
    <>
      <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={{ ...libBackBtnSx, display: { md: 'none' } }}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <Box sx={{ mt: { xs: 0, md: 2 } }}>
        <PageHeader icon={WorkspacePremiumRoundedIcon} title="Plans" subtitle="Choose the plan that fits your preparation" />
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
        <ProPlanPanel key={plan} plan={plan} isPro={isPro} currentPlan={status?.proPlan} loadingPlan={billing.loadingPlan} onSubscribe={billing.subscribe} />
      ))}
    </Box>
  );
}

// Plans: the current subscription first, then Free, Pro Monthly and Pro Yearly. On wide screens it opens inside the
// dashboard main area (see DashboardViewContent); phones open it as a full screen with a back button.
export default function PlansPage() {
  const billing = usePlansBilling();
  const [licenseOpen, setLicenseOpen] = useState(false);
  const { isAuthenticated, isPro, status, isRecurring } = billing;
  const currentPlan = describeCurrentPlan({ isPro, status, isRecurring });

  return (
    <LibraryFont>
      <Box sx={pageSx}>
        <PlansPageHeader isAuthenticated={isAuthenticated} />
        {billing.error && (
          <Alert severity="error" onClose={billing.clearError} sx={{ mt: 2.5 }}>
            {billing.error}
          </Alert>
        )}
        {isAuthenticated && <CurrentPlanCard plan={currentPlan} canCancel={isPro && isRecurring} onCancel={billing.cancel.open} />}
        <PlanGrid billing={billing} />
        {isAuthenticated && !isPro && <LicensePrompt onActivate={() => setLicenseOpen(true)} />}
        <PlansLegalNote />
      </Box>
      <CancelSubscriptionDialog cancel={billing.cancel} />
      <ActivateLicenseModal open={licenseOpen} onClose={() => setLicenseOpen(false)} />
    </LibraryFont>
  );
}
