import { Box } from '@mui/material';
import BackToDashboard from '../../../../components/BackToDashboard';
import SidebarFilterCards from './SidebarFilterCards';
import SidebarLists from './SidebarLists';
import TopicList from './TopicList';
import { BORDER_WIDTHS, SIZES } from '../../../../app/design/designTokens';

// Left column of the Problems page, built like the Aptitude page's: the way back and the filter cards stay on top,
// the topics scroll in the middle, and the learner's lists stay at the bottom.
export default function ProblemsSidebar({ lib, isAuthenticated, listsApi }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { lg: SIZES.fill }, minHeight: SIZES.flexShrinkMinHeight }}>
      <Box sx={{ display: 'grid', gap: 1.5, pb: 1.5, flexShrink: 0 }}>
        <Box><BackToDashboard /></Box>
        <SidebarFilterCards lib={lib} isAuthenticated={isAuthenticated} />
      </Box>
      <Box className="autohide-scroll" sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <TopicList groups={lib.groups} tags={lib.tags} selectedTags={lib.query.tags} onClear={() => lib.patch({ tags: [] })} onSelectGroup={(group) => lib.patch({ tags: group.tags })} onToggleTag={lib.toggleTag} />
      </Box>
      <Box className="autohide-scroll" sx={{ flexShrink: 0, maxHeight: SIZES.sidebarListsMaxHeight, overflowY: 'auto', borderTop: `${BORDER_WIDTHS.thin}px solid`, borderColor: 'divider' }}>
        <SidebarLists listsApi={listsApi} />
      </Box>
    </Box>
  );
}
