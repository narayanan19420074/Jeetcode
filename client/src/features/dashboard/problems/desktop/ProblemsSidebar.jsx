import { Box } from '@mui/material';
import BackToDashboard from '../../../../components/BackToDashboard';
import TopicList from './TopicList';

// Left column of the Problems page: the way back and the topics. The filters and the learner's lists are in the right column.
export default function ProblemsSidebar({ lib }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box><BackToDashboard /></Box>
      <TopicList groups={lib.groups} tags={lib.tags} selectedTags={lib.query.tags} onClear={() => lib.patch({ tags: [] })} onSelectGroup={(group) => lib.patch({ tags: group.tags })} onToggleTag={lib.toggleTag} />
    </Box>
  );
}
