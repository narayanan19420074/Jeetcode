import { Box, LinearProgress } from '@mui/material';
import BackIconButton from '../../../../components/BackIconButton';
import { MenuCard, MenuRow, MenuRowLabel } from '../../../../components/MenuCard';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { RADII_PX, SIZES, withAlpha } from '../../../../app/design/designTokens';

const TRACK_ALPHA = 0.1;

// Topics with no questions yet show no count; the learner can still open them to read.
const topicCount = (topic) => (topic.total === 0 ? '' : `${topic.solved}/${topic.total}`);

// How far the learner is in a topic, as a thin bar under its name (shown only when the topic has questions).
function TopicProgress({ topic }) {
  const pal = useLibraryPalette();
  if (topic.total === 0) return null;
  return <LinearProgress variant="determinate" color="success" value={(topic.solved / topic.total) * 100} aria-label={`${topic.solved} of ${topic.total} solved`} sx={{ height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, bgcolor: withAlpha(pal.text, TRACK_ALPHA) }} />;
}

// Left column of the desktop topic and practice pages: the back icon (it goes to the Aptitude home unless `backTo` says
// otherwise) and the shared grey menu card listing the topics of this pattern, each with its progress. Picking a topic
// opens its content in the middle.
export default function TopicsNav({ topics, activeSlug, onPick, backTo = '/aptitude', backLabel = 'Back to Aptitude' }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box><BackIconButton to={backTo} label={backLabel} /></Box>
      <MenuCard title="Topics">
        {topics.map((topic) => (
          <MenuRow key={topic.slug} selected={topic.slug === activeSlug} onClick={() => onPick(topic.slug)}>
            <MenuRowLabel label={topic.title} count={topicCount(topic)} selected={topic.slug === activeSlug} />
            <TopicProgress topic={topic} />
          </MenuRow>
        ))}
      </MenuCard>
    </Box>
  );
}
