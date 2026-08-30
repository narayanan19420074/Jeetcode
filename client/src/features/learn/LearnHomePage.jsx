import { Link as RouterLink } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Chip } from '@mui/material';
import AutoAwesomeMotionRoundedIcon from '@mui/icons-material/AutoAwesomeMotionRounded';
import { learnTopics } from './content/topics';

export default function LearnHomePage() {
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Learn
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Aptitude concepts explained with visual, step-by-step animations.
      </Typography>

      <Grid container spacing={2}>
        {learnTopics.map((topic) => (
          <Grid item xs={12} sm={6} key={topic.slug}>
            <Paper
              component={RouterLink}
              to={`/learn/${topic.slug}`}
              elevation={0}
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 3,
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
              }}
            >
              <AutoAwesomeMotionRoundedIcon sx={{ color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {topic.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {topic.tagline}
              </Typography>
              <Chip label={`${topic.sections.length} sections`} size="small" variant="outlined" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
