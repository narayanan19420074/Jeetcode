import { Box } from '@mui/material';
import DesktopFrame from '../../dashboard/desktop/DesktopFrame';
import SectionOutlet from '../common/SectionOutlet';
import SettingsSidebar from './SettingsSidebar';
import { LAYOUT_SPACING, SIZES } from '../../../app/design/designTokens';

// When the page is exactly one window tall, only this column scrolls, so the sidebar stays put like on the dashboard.
const scrollingColumnSx = { height: SIZES.fill, overflowY: 'auto', overflowX: 'hidden', scrollbarGutter: 'stable' };

function SettingsContentColumn({ section, current, isPageOneWindowTall }) {
  return (
    <Box
      key={section}
      component="main"
      className="autohide-scroll"
      aria-label={current?.label}
      sx={{ minWidth: SIZES.flexShrinkMinWidth, minHeight: SIZES.flexShrinkMinHeight, px: LAYOUT_SPACING.frameContentGutter, ...(isPageOneWindowTall && scrollingColumnSx) }}
    >
      <SectionOutlet section={section} />
    </Box>
  );
}

// Desktop: the same frame as the dashboard (same sidebar width, borders and spacing), without a right column,
// so the open section uses the whole main area.
export default function SettingsDesktopView({ section, current, groups, query, setQuery }) {
  return (
    <DesktopFrame
      sidebar={<SettingsSidebar groups={groups} section={section} query={query} setQuery={setQuery} />}
      renderContent={(isPageOneWindowTall) => <SettingsContentColumn section={section} current={current} isPageOneWindowTall={isPageOneWindowTall} />}
    />
  );
}
