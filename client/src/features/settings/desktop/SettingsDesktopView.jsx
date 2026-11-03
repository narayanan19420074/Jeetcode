import { useRef } from 'react';
import { Box } from '@mui/material';
import useViewportFill from '../../dashboard/useViewportFill';
import SectionOutlet from '../common/SectionOutlet';
import SettingsHeader from './SettingsHeader';
import SettingsSidebar from './SettingsSidebar';

const SIDEBAR_WIDTH = 264;
const MIN_HEIGHT = 420;

// Desktop: the page itself never scrolls. The sidebar and the content pane each get their own scrollbar, and the height
// is whatever is left under the navbar (and the free-access banner, if it is showing).
export default function SettingsDesktopView({ user, section, current, groups, query, setQuery }) {
  const rootRef = useRef(null);
  const fillHeight = useViewportFill(rootRef, true, MIN_HEIGHT);
  const rootSx = { maxWidth: 1120, mx: 'auto', px: 3, pt: 3, pb: 2 };
  const fillSx = fillHeight ? { height: fillHeight, display: 'flex', flexDirection: 'column', overflow: 'hidden' } : {};
  const gridFillSx = fillHeight ? { flex: 1, minHeight: 0, gridTemplateRows: 'minmax(0, 1fr)', alignItems: 'stretch' } : {};
  const mainFillSx = fillHeight ? { minHeight: 0, overflowY: 'auto', pr: 1.5, pb: 3 } : {};
  return (
    <Box ref={rootRef} sx={{ ...rootSx, ...fillSx }}>
      <SettingsHeader user={user} />
      <Box sx={{ display: 'grid', gridTemplateColumns: `${SIDEBAR_WIDTH}px minmax(0, 1fr)`, gap: 5, alignItems: 'start', ...gridFillSx }}>
        <SettingsSidebar groups={groups} section={section} query={query} setQuery={setQuery} fill={Boolean(fillHeight)} />
        <Box key={section} component="main" aria-label={current?.label} sx={{ minWidth: 0, maxWidth: 780, ...mainFillSx }}>
          <SectionOutlet section={section} />
        </Box>
      </Box>
    </Box>
  );
}
