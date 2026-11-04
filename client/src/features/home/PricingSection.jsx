import { Container, Grid } from '@mui/material';
import { PlanCard } from './HomeCards';
import { SectionHeading } from './HomeCommon';
import { FREE_FEATURES, PRICE_MONTH, PRICE_YEAR, PRO_FEATURES } from './homeContent';
import { anchorOffset } from './homeStyles';

// Pricing: free first, no card. While the launch offer runs, the Pro button claims the free period.
export default function PricingSection({ offerEnds, startLabel, onStart, onNavigate }) {
  return (
    <Container id="pricing" maxWidth="md" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: anchorOffset }}>
      <SectionHeading sub="The free plan has everything to begin. Pro adds the extras.">Start free. Upgrade only if you want to.</SectionHeading>
      <Grid container spacing={{ xs: 4, md: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <PlanCard name="Free" price="₹0" note="Everything you need to begin." points={FREE_FEATURES} cta={startLabel} onCta={onStart} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PlanCard
            primary
            badge={offerEnds ? `Free until ${offerEnds}` : undefined}
            name="Pro"
            price={`₹${PRICE_MONTH}`}
            note={`per month, or ₹${PRICE_YEAR.toLocaleString('en-IN')} a year`}
            points={PRO_FEATURES}
            cta={offerEnds ? 'Claim free Pro' : 'See Pro plans'}
            onCta={offerEnds ? onStart : onNavigate('/pricing')}
            footnote="Cancel anytime. You keep Pro until your paid period ends."
          />
        </Grid>
      </Grid>
    </Container>
  );
}
