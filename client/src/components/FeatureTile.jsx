import { Paper, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function FeatureTile({ icon, title, description, to, badge = 'New', accentColor = 'primary.main' }) {
  const navigate = useNavigate();
  return (
    <Paper
      variant="outlined"
      onClick={() => navigate(to)}
      sx={{
        p: 2.5,
        borderRadius: 3,
        height: '100%',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: accentColor,
          transform: 'translateY(-2px)',
          boxShadow: (t) => (t.palette.mode === 'dark' ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.08)'),
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 2, bgcolor: accentColor, color: '#fff', flexShrink: 0 }}>
          {icon}
        </Box>
        {badge && (
          <Typography variant="caption" sx={{ fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
            {badge}
          </Typography>
        )}
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
      >
        {description}
      </Typography>
    </Paper>
  );
}
