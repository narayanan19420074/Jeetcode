import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { SECTIONS } from './settingsSections';

// The open settings section, loaded on demand.
export default function SectionOutlet({ section }) {
  const Section = SECTIONS[section];
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>}>
      <Section key={section} />
    </Suspense>
  );
}
