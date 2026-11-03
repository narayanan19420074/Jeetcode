import { Box } from '@mui/material';
import MobileCompanyRoadmap from '../MobileCompanyRoadmap';
import MobilePrepCompanies from '../MobilePrepCompanies';
import RoadmapPresence from '../common/RoadmapPresence';

// Phone: the list stays mounted while a company roadmap is open, so the search text survives going back.
export default function PrepCompaniesMobileView({ state }) {
  const { selected, closeCompany, loading, list, shown, hasMore, query, setQuery, openCompany, sentinelRef } = state;
  return (
    <Box sx={{ px: 2, pb: 2, maxWidth: 640, mx: 'auto' }}>
      <Box sx={{ display: selected ? 'none' : 'block' }}>
        <MobilePrepCompanies loading={loading} list={list} shown={shown} hasMore={hasMore} query={query} onQuery={setQuery} onOpen={openCompany} sentinelRef={sentinelRef} />
      </Box>
      <RoadmapPresence selected={selected} style={{ paddingTop: 'calc(8px + env(safe-area-inset-top))' }}>
        <MobileCompanyRoadmap company={selected} onBack={closeCompany} />
      </RoadmapPresence>
    </Box>
  );
}
