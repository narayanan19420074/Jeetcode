import { useNavigate } from 'react-router-dom';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ProgressRing from './ProgressRing';
import CompanyAvatar from './CompanyAvatar';

const AMBER = '#FBBF24';

// Sidebar card for the Companies page: how ready the learner is for the company they are working on.
// `tracks` = the prep tracks from /prep/companies (null while loading). Falls back to a "start here" card.
export default function PrepReadinessCard({ tracks }) {
  const navigate = useNavigate();

  if (tracks === null) return <Skeleton variant="rounded" height={360} sx={{ borderRadius: '16px' }} />;

  const started = tracks.filter((t) => t.readiness !== null && t.readiness > 0);
  const active = started.slice().sort((a, b) => b.readiness - a.readiness)[0] || tracks[0] || null;
  const others = started.filter((t) => t.slug !== active?.slug).slice(0, 3);
  const avg = started.length ? Math.round(started.reduce((n, t) => n + t.readiness, 0) / started.length) : 0;

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', color: '#fff', background: 'linear-gradient(135deg,#1E1B4B 0%,#3730A3 55%,#6D28D9 100%)', boxShadow: '0 14px 28px -16px rgba(2,6,23,0.85), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
      <Box aria-hidden sx={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.26), transparent 70%)', pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', left: -40, bottom: 20, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', p: 2.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, opacity: 0.9 }}>
          <BusinessRoundedIcon sx={{ fontSize: 18, color: AMBER }} />
          <Typography sx={{ fontWeight: 800, fontSize: 12, letterSpacing: 0.8 }}>PREPARATION READINESS</Typography>
        </Box>

        {active ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.75 }}>
              <Box sx={{ color: '#fff', flexShrink: 0 }}>
                <ProgressRing value={active.readiness ?? 0} max={100} label="Ready" color={AMBER} size={104} strokeWidth={9} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <CompanyAvatar name={active.name} logoUrl={active.logoUrl} size={36} />
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2, mt: 0.75, overflowWrap: 'anywhere' }}>{active.name}</Typography>
                {active.examDurationMinutes && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5, opacity: 0.85 }}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{active.examDurationMinutes} min exam</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 1.5, px: 1.5, py: 1.1, borderRadius: '16px 16px 16px 4px', bgcolor: 'rgba(255,255,255,0.14)' }}>
              <Typography sx={{ fontSize: '0.84rem', lineHeight: 1.4, fontWeight: 700 }}>
                {active.readiness ? `You are ${active.readiness}% ready. Keep going!` : 'Start this track to see how ready you are.'}
              </Typography>
              {active.description && <Typography noWrap sx={{ fontSize: '0.76rem', mt: 0.3, opacity: 0.85 }}>{active.description}</Typography>}
            </Box>

            <Button
              onClick={() => navigate(`/prep/${active.slug}`)} startIcon={<BoltRoundedIcon />} endIcon={<ArrowForwardRoundedIcon />} disableElevation fullWidth
              sx={{ mt: 1.75, height: 44, borderRadius: '14px', bgcolor: AMBER, color: '#1B1200', fontWeight: 800, fontSize: '0.92rem', '&:hover': { bgcolor: '#F5B50F' } }}
            >
              {active.readiness ? 'Continue prep' : 'Start prep'}
            </Button>

            {others.length > 0 && (
              <Box sx={{ mt: 1.75, display: 'grid', gap: 1 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, opacity: 0.75 }}>ALSO IN PROGRESS · AVG {avg}%</Typography>
                {others.map((t) => (
                  <Box key={t.slug} component="button" type="button" onClick={() => navigate(`/prep/${t.slug}`)} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0, border: 0, bgcolor: 'transparent', color: 'inherit', fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
                    <CompanyAvatar name={t.name} logoUrl={t.logoUrl} size={26} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700 }}>{t.name}</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#FDE68A', fontVariantNumeric: 'tabular-nums' }}>{t.readiness}%</Typography>
                      </Box>
                      <Box sx={{ mt: 0.4, height: 5, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
                        <Box sx={{ width: `${Math.max(t.readiness, 4)}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${AMBER}, #F59E0B)` }} />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Get exam-ready, company by company</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.85, mt: 0.5 }}>Pick a company to see its exam pattern and track how ready you are.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
