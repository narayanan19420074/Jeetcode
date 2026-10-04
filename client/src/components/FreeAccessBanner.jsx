import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { apiClient } from '../api/apiClient';

const DAY_MS = 86400000;
const dismissKey = (until) => `jeetcode-offer-dismissed:${until.toISOString().slice(0, 10)}`;

const wasDismissed = (until) => {
  try {
    return localStorage.getItem(dismissKey(until)) === '1';
  } catch {
    return false;
  }
};

// Slim announcement bar for the launch offer. The dismissal is remembered
// per end-date, so a future offer with a new date shows up again.
export default function FreeAccessBanner() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [until, setUntil] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    apiClient
      .get('/health')
      .then((res) => {
        const d = res.data?.freeAccessUntil ? new Date(res.data.freeAccessUntil) : null;
        if (d && d > new Date()) {
          setUntil(d);
          setHidden(wasDismissed(d));
        }
      })
      .catch(() => {});
  }, []);

  if (!until || hidden) return null;

  const dateText = until.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const daysLeft = Math.max(1, Math.ceil((until.getTime() - Date.now()) / DAY_MS));

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(dismissKey(until), '1');
    } catch {
      /* storage blocked: the bar just comes back on the next visit */
    }
  };

  return (
    <Box
      role="region"
      aria-label="Launch offer"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: { xs: 1, sm: 1.75 },
        minHeight: 44,
        pl: { xs: 1.5, sm: 3 },
        pr: { xs: 5, sm: 6 },
        py: 0.75,
        color: '#fff',
        background: 'linear-gradient(90deg, #1D4ED8 0%, #4F46E5 55%, #7C3AED 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.14)',
      }}
    >
      <WorkspacePremiumRoundedIcon sx={{ fontSize: 20, flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />

      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35, textAlign: { xs: 'left', sm: 'center' } }}>
        {isAuthenticated ? (
          <>Pro is free for everyone until {dateText}. Every company-tagged problem is unlocked on your account.</>
        ) : (
          <>Launch offer: sign in and get Pro free until {dateText}.</>
        )}
      </Typography>

      <Box
        sx={{
          flexShrink: 0,
          px: 1,
          py: 0.2,
          borderRadius: 999,
          fontSize: '0.72rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          bgcolor: 'rgba(255,255,255,0.18)',
          display: { xs: 'none', md: 'block' },
        }}
      >
        {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
      </Box>

      {!isAuthenticated && (
        <Button
          component={RouterLink}
          to="/login"
          size="small"
          disableElevation
          sx={{
            flexShrink: 0,
            fontWeight: 700,
            px: 1.75,
            borderRadius: 999,
            bgcolor: '#fff',
            color: '#1D4ED8',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
          }}
        >
          Sign in
        </Button>
      )}

      <IconButton
        onClick={dismiss}
        size="small"
        aria-label="Dismiss launch offer"
        sx={{
          position: 'absolute',
          right: { xs: 4, sm: 12 },
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.85)',
          '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.14)' },
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
