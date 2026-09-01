import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Grid, Paper, CircularProgress, LinearProgress, Chip } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { prepApi } from '../../api/prepApi';

const readinessColor = (pct) => {
  if (pct === null) return 'primary.main';
  if (pct < 40) return 'error.main';
  if (pct < 70) return 'warning.main';
  return 'success.main';
};

export default function PrepCompaniesPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prepApi
      .listCompanies()
      .then(({ data }) => setCompanies(data.data.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Prep by Company
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pick a company — see the exact exam pattern, and exactly how ready you are for it.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {companies.map((c) => (
            <Grid key={c.slug} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper
                variant="outlined"
                onClick={() => navigate(`/prep/${c.slug}`)}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  transition: 'all 0.15s ease',
                  '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', color: '#fff' }}>
                    <BusinessRoundedIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{c.name}</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  {c.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {c.examDurationMinutes && (
                    <Chip icon={<AccessTimeRoundedIcon sx={{ fontSize: '0.9rem !important' }} />} label={`${c.examDurationMinutes} min`} size="small" variant="outlined" />
                  )}
                  <Chip label={`${c.sectionCount} sections`} size="small" variant="outlined" />
                </Box>

                {c.readiness !== null && (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Readiness</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: readinessColor(c.readiness) }}>{c.readiness}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={c.readiness}
                      sx={{ height: 6, borderRadius: 3, bgcolor: 'action.disabledBackground', '& .MuiLinearProgress-bar': { bgcolor: readinessColor(c.readiness), borderRadius: 3 } }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}

          {/* Placeholder for companies not yet built — sets expectation this grows */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', color: 'text.secondary' }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                More companies coming soon
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
