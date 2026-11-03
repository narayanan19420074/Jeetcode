import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { apiClient } from '../api/apiClient';
import { COLOR_PALETTE, RADII_PX, SIZES, withAlpha } from '../app/design/designTokens';

const DAY_MS = 86400000;
const dismissKey = (until) => `jeetcode-offer-dismissed:${until.toISOString().slice(0, 10)}`;

const wasDismissed = (until) => {
  try {
    return localStorage.getItem(dismissKey(until)) === '1';
  } catch {
    return false;
  }
};

const rememberDismissal = (until) => {
  try {
    localStorage.setItem(dismissKey(until), '1');
  } catch {
    /* storage blocked: the bar just comes back on the next visit */
  }
};

// The offer end date comes from the health endpoint. An offer that has already ended, or a failed request, shows nothing.
const fetchOfferEnd = () =>
  apiClient
    .get('/health')
    .then((res) => {
      const end = res.data?.freeAccessUntil ? new Date(res.data.freeAccessUntil) : null;
      return end && end > new Date() ? end : null;
    })
    .catch(() => null);

// The dismissal is remembered per end-date, so a future offer with a new date shows up again.
function useLaunchOffer() {
  const [until, setUntil] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    fetchOfferEnd().then((end) => {
      if (!end) return;
      setUntil(end);
      setHidden(wasDismissed(end));
    });
  }, []);

  const dismiss = () => {
    setHidden(true);
    rememberDismissal(until);
  };
  return { until, hidden, dismiss };
}

const bannerSx = {
  position: 'relative',
  // Hidden on phones; shown from the md breakpoint up.
  display: { xs: 'none', md: 'flex' },
  alignItems: 'center',
  justifyContent: 'center',
  gap: { xs: 1, sm: 1.75 },
  minHeight: SIZES.touchTarget,
  pl: { xs: 1.5, sm: 3 },
  pr: { xs: 5, sm: 6 },
  py: 0.75,
  color: COLOR_PALETTE.white,
  background: `linear-gradient(90deg, ${COLOR_PALETTE.slate[900]} 0%, ${COLOR_PALETTE.slate[800]} 55%, ${COLOR_PALETTE.slate[700]} 100%)`,
  borderBottom: `1px solid ${withAlpha(COLOR_PALETTE.white, 0.14)}`,
};

function OfferMessage({ isAuthenticated, dateText }) {
  return (
    <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemibold', textAlign: { xs: 'left', sm: 'center' } }}>
      {isAuthenticated ? (
        <>Pro is free for everyone until {dateText}. Every company-tagged problem is unlocked on your account.</>
      ) : (
        <>Launch offer: sign in and get Pro free until {dateText}.</>
      )}
    </Typography>
  );
}

function DaysLeftBadge({ daysLeft }) {
  const badgeSx = {
    flexShrink: 0,
    px: 1,
    py: 0.2,
    borderRadius: RADII_PX.pill,
    typography: 'micro',
    fontWeight: 'fontWeightBold',
    whiteSpace: 'nowrap',
    bgcolor: withAlpha(COLOR_PALETTE.white, 0.18),
    display: { xs: 'none', md: 'block' },
  };
  return <Box sx={badgeSx}>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</Box>;
}

function SignInButton() {
  const buttonSx = {
    flexShrink: 0,
    fontWeight: 'fontWeightBold',
    px: 1.75,
    borderRadius: RADII_PX.pill,
    bgcolor: COLOR_PALETTE.white,
    color: COLOR_PALETTE.slate[900],
    '&:hover': { bgcolor: withAlpha(COLOR_PALETTE.white, 0.9) },
  };
  return (
    <Button component={RouterLink} to="/login" size="small" disableElevation sx={buttonSx}>
      Sign in
    </Button>
  );
}

function DismissButton({ onDismiss }) {
  const buttonSx = {
    position: 'absolute',
    right: { xs: 4, sm: 12 },
    top: '50%',
    transform: 'translateY(-50%)',
    color: withAlpha(COLOR_PALETTE.white, 0.85),
    '&:hover': { color: COLOR_PALETTE.white, bgcolor: withAlpha(COLOR_PALETTE.white, 0.14) },
  };
  return (
    <IconButton onClick={onDismiss} size="small" aria-label="Dismiss launch offer" sx={buttonSx}>
      <CloseRoundedIcon fontSize="small" />
    </IconButton>
  );
}

// Slim announcement bar for the launch offer.
export default function FreeAccessBanner() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { until, hidden, dismiss } = useLaunchOffer();

  if (!until || hidden) return null;

  const dateText = until.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const daysLeft = Math.max(1, Math.ceil((until.getTime() - Date.now()) / DAY_MS));

  return (
    <Box role="region" aria-label="Launch offer" sx={bannerSx}>
      <WorkspacePremiumRoundedIcon sx={{ fontSize: SIZES.iconSize.medium, flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
      <OfferMessage isAuthenticated={isAuthenticated} dateText={dateText} />
      <DaysLeftBadge daysLeft={daysLeft} />
      {!isAuthenticated && <SignInButton />}
      <DismissButton onDismiss={dismiss} />
    </Box>
  );
}
