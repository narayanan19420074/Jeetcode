import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Box, Typography, Button, Chip, Skeleton } from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ProgressRing from './ProgressRing';
import { prepApi } from '../api/prepApi';

const readinessColor = (pct) => {
  if (pct === null || pct === undefined) return '#3B82F6';
  if (pct < 40) return '#EF4444';
  if (pct < 70) return '#F59E0B';
  return '#10B981';
};

// Full-width hero banner for the dashboard — deliberately NOT a
// same-size grid tile like the stat cards next to it. This is the
// flagship "Prep by Company" feature, so it gets a visually distinct
// treatment (gradient, bigger ring, explicit CTA) to read as the
// dashboard's primary next-action rather than one widget among many.
// Falls back to a generic "explore prep tracks" banner if nothing is
// enrolled yet — never shows an empty/broken state.
export default function PrepReadinessCard() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    prepApi
      .listCompanies()
      .then(({ data }) => {
        const items = data?.data?.items ?? [];
        const active = items.find((c) => c.readiness !== null && c.readiness > 0) || items[0];
        setCompany(active || null);
      })
      .catch((err) => {
        console.error('Failed to load prep readiness:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />;
  }

  // Silent-fail rather than an ugly error block on the dashboard — the
  // dedicated /prep page will surface the real problem if the user goes
  // looking for it.
  if (error) return null;

  const accent = company ? readinessColor(company.readiness) : '#3B82F6';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2, sm: 4 },
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
        background: (t) =>
          t.palette.mode === 'dark'
            ? `linear-gradient(120deg, ${accent}22, transparent 60%)`
            : `linear-gradient(120deg, ${accent}14, transparent 60%)`,
      }}
    >
      {company ? (
        <>
          <ProgressRing
            value={company.readiness ?? 0}
            max={100}
            label="Ready"
            color={accent}
            size={110}
            strokeWidth={9}
          />

          <Box sx={{ flexGrow: 1, minWidth: 220 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <BusinessRoundedIcon fontSize="small" sx={{ color: accent }} />
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.05em', color: accent }}>
                Prep by Company
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              {company.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 480 }}>
              {company.description}
            </Typography>
            {company.examDurationMinutes && (
              <Chip
                icon={<AccessTimeRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
                label={`${company.examDurationMinutes} min exam`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Button
            variant="contained"
            disableElevation
            size="large"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate(`/prep/${company.slug}`)}
            sx={{ fontWeight: 700, whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Continue prep
          </Button>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <BusinessRoundedIcon fontSize="large" />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 220 }}>
            <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.05em', color: 'primary.main' }}>
              Prep by Company
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              Get exam-ready, company by company
            </Typography>
            <Typography variant="body2" color="text.secondary">
              See the exact exam pattern and track your readiness for real placement drives.
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            size="large"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate('/prep')}
            sx={{ fontWeight: 700, whiteSpace: 'nowrap', alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Explore prep tracks
          </Button>
        </>
      )}
    </Paper>
  );
}
