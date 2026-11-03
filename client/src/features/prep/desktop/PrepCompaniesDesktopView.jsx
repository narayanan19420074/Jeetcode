import { Box, Container, Typography } from '@mui/material';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import MobileCompanyRoadmap from '../MobileCompanyRoadmap';
import RoadmapPresence from '../common/RoadmapPresence';
import CompaniesHeader from './CompaniesHeader';
import CompaniesList from './CompaniesList';
import CompaniesSearch from './CompaniesSearch';

// Desktop Companies in the Library look: centred header, pill search, two-column list. The list stays mounted
// while a company roadmap is open, so the search text and scroll position survive going back.
export default function PrepCompaniesDesktopView({ state }) {
  const { selected, closeCompany, loading, list, query, setQuery } = state;
  return (
    <LibraryFont>
      <Container maxWidth={false} sx={{ maxWidth: 960, py: 3, px: 3 }}>
        <Box sx={{ display: selected ? 'none' : 'grid', gap: 3, justifyItems: 'center' }}>
          <Box sx={{ width: '100%' }}><CompaniesHeader /></Box>
          <CompaniesSearch query={query} onQuery={setQuery} />
          <Box sx={{ width: '100%' }}><CompaniesList {...state} onOpen={state.openCompany} /></Box>
          {!loading && list.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              Company names and logos belong to their owners and are shown only to identify each company.
            </Typography>
          )}
        </Box>
        <RoadmapPresence selected={selected} style={{ maxWidth: 720, margin: '0 auto' }}>
          <MobileCompanyRoadmap company={selected} onBack={closeCompany} />
        </RoadmapPresence>
      </Container>
    </LibraryFont>
  );
}
