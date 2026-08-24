import { Paper, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

export default function VisualizerDashboardCard() {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', color: '#fff' }}>
          <BarChartRoundedIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Algorithm Visualizer</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        Watch sorting, searching, and graph algorithms run step by step — see Big-O stop being just a formula.
      </Typography>
      <Button component={RouterLink} to="/visualizer" variant="outlined" sx={{ fontWeight: 600, alignSelf: 'flex-start' }}>
        Explore
      </Button>
    </Paper>
  );
}
