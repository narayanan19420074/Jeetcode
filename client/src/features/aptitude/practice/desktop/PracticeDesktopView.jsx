import { Alert, Box } from '@mui/material';
import DesktopPageFrame from '../../../../components/DesktopPageFrame';
import { LibraryFont } from '../../../dashboard/components/libraryStyle';
import TopicsNav from '../../patternDetail/desktop/TopicsNav';
import PracticeQuestionList from './PracticeQuestionList';

const ALL_TOPICS = 'All topics';

// "All topics" first, then the topics that have questions. Their slug is what the subPattern filter uses ('' = all).
function buildTopicList(hub) {
  if (!hub) return [];
  const withQuestions = hub.practice.bySubPattern.filter((topic) => topic.total > 0);
  return [{ slug: '', title: ALL_TOPICS, ...hub.practice.totals }, ...withQuestions];
}

// Same three columns as the Dashboard: the topics (each with how far you are) on the left, the questions of the picked
// topic in the middle, an empty right column.
export default function PracticeDesktopView({ practice }) {
  const { slug, hub, error, dismissError, filters, update } = practice;
  const topics = buildTopicList(hub);
  const title = topics.find((topic) => topic.slug === filters.subPattern)?.title ?? ALL_TOPICS;
  return (
    <LibraryFont>
      <DesktopPageFrame
        left={<TopicsNav topics={topics} activeSlug={filters.subPattern} onPick={(subPattern) => update({ subPattern })} backTo={`/aptitude/${slug}`} backLabel={`Back to ${hub?.pattern.title ?? 'topic'}`} />}
        right={<Box aria-hidden />}
      >
        {error && <Alert severity="info" onClose={dismissError} sx={{ mb: 2 }}>{error}</Alert>}
        <PracticeQuestionList practice={practice} title={title} />
      </DesktopPageFrame>
    </LibraryFont>
  );
}
