import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, useMediaQuery } from '@mui/material';
import { MEDIA_QUERIES } from '../../app/design/designTokens';
import { useContest } from '../contest/contestUtils';
import ClosingSection from './ClosingSection';
import ContestBand from './ContestBand';
import FaqSection from './FaqSection';
import FeaturesSection from './FeaturesSection';
import HeroSection from './HeroSection';
import HomeFooter from './HomeFooter';
import HomeNavBar from './HomeNavBar';
import HowItWorksSection from './HowItWorksSection';
import PricingSection from './PricingSection';
import StickyCta from './StickyCta';
import StorySection from './StorySection';
import { START_LABEL, buildFaq } from './homeContent';
import { useLaunchOffer, useOnScreen } from './homeHooks';
import { pageSx } from './homeStyles';

// The launch offer is not shown on phones.
function useVisibleLaunchOffer() {
  const isPhone = useMediaQuery(MEDIA_QUERIES.belowMd);
  const offerEnds = useLaunchOffer();
  return isPhone ? null : offerEnds;
}

// The sticky bar on phones shows only while neither the hero button nor the closing button is on screen.
function useStickyCtaVisibility(heroCtaRef, closingCtaRef) {
  const heroCtaVisible = useOnScreen(heroCtaRef);
  const closingCtaVisible = useOnScreen(closingCtaRef);
  return !heroCtaVisible && !closingCtaVisible;
}

export default function HomePage() {
  const navigate = useNavigate();
  const authed = useSelector((state) => state.auth.isAuthenticated);
  const offerEnds = useVisibleLaunchOffer();
  const { contest } = useContest();
  const heroCtaRef = useRef(null);
  const closingCtaRef = useRef(null);
  const showStickyCta = useStickyCtaVisibility(heroCtaRef, closingCtaRef);

  const onNavigate = (path) => () => navigate(path);
  const onStart = () => navigate(authed ? '/dashboard' : '/signup');
  const startLabel = authed ? 'Open dashboard' : START_LABEL;

  return (
    <Box id="top" sx={pageSx}>
      <HomeNavBar authed={authed} onStart={onStart} onLogin={onNavigate('/login')} />
      <HeroSection offerEnds={offerEnds} startLabel={startLabel} onStart={onStart} ctaRef={heroCtaRef} />
      <FeaturesSection onNavigate={onNavigate} />
      <HowItWorksSection startLabel={startLabel} onStart={onStart} />
      <ContestBand contest={contest} />
      <PricingSection offerEnds={offerEnds} startLabel={startLabel} onStart={onStart} onNavigate={onNavigate} />
      <StorySection />
      <FaqSection items={buildFaq(contest)} />
      <ClosingSection startLabel={startLabel} onStart={onStart} onNavigate={onNavigate} ctaRef={closingCtaRef} />
      <HomeFooter authed={authed} onNavigate={onNavigate} />
      {showStickyCta && <StickyCta label={startLabel} onClick={onStart} />}
    </Box>
  );
}
