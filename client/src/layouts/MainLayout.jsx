import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FreeAccessBanner from '../components/FreeAccessBanner';

export default function MainLayout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <FreeAccessBanner />
      <Navbar />
      <Box component="main">
        <Outlet />
      </Box>
    </Box>
  );
}
