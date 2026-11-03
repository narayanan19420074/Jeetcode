import { Paper, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import { COLOR_PALETTE, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

export default function VisualizerDashboardCard() {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: RADII_PX.card, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: RADII_PX.card, bgcolor: 'primary.main', color: COLOR_PALETTE.white }}>
          <BarChartRoundedIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: FONT_WEIGHTS.bold }}>Algorithm Visualizer</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        Watch sorting, searching, and graph algorithms run step by step — see Big-O stop being just a formula.
      </Typography>
      <Button component={RouterLink} to="/visualizer" variant="outlined" sx={{ fontWeight: FONT_WEIGHTS.semibold, alignSelf: 'flex-start' }}>
        Explore
      </Button>
    </Paper>
  );
}
