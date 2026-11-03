import { Box, Stack, Typography } from '@mui/material';
import NqtExploreCard from '../../components/NqtExploreCard';
import { LIB_TRACKING, useLibraryPalette } from '../../components/libraryStyle';
import { useExploreData } from '../common/exploreData';
import CompanyGrid from './CompanyGrid';
import ExploreSection from './ExploreSection';
import ToolCards from './ToolCards';
import TopicChips from './TopicChips';

// Desktop Explore (inside the dashboard) in the Library look, with the same sections as the phone screen:
// practice tools, companies, topics. A section is hidden when the server has nothing for it.
export default function ExploreDesktopView({ onBrowse }) {
  const palette = useLibraryPalette();
  const { tags, companies } = useExploreData();
  return (
    <Stack spacing={4}>
      <Box>
        <Typography component="h1" sx={{ fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>Explore</Typography>
        <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: palette.muted }}>Practice tools and shortcuts</Typography>
      </Box>
      <Box sx={{ '& a': { mb: 0 }, '&:empty': { display: 'none' } }}><NqtExploreCard hideForNewUser /></Box>
      <ExploreSection title="Practice tools"><ToolCards /></ExploreSection>
      {(companies === null || companies.length > 0) && <ExploreSection title="Companies"><CompanyGrid companies={companies} onBrowse={onBrowse} /></ExploreSection>}
      {(tags === null || tags.length > 0) && <ExploreSection title="Topics"><TopicChips tags={tags} onBrowse={onBrowse} /></ExploreSection>}
    </Stack>
  );
}
