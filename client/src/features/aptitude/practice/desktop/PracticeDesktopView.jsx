import { Alert, Box } from '@mui/material';
import DesktopPageFrame from '../../../../components/DesktopPageFrame';
import { LibraryFont } from '../../../dashboard/components/libraryStyle';
import TopicsNav from '../../patternDetail/desktop/TopicsNav';
import PracticeFilters from './PracticeFilters';
import PracticeHeader from './PracticeHeader';
import PracticeQuestionList from './PracticeQuestionList';

const ALL_TOPICS = 'All topics';

// "All topics" first, then the topics that have questions. Their slug is what the subPattern filter uses ('' = all).
function buildTopicList(hub) {
  if (!hub) return [];
  const withQuestions = hub.practice.bySubPattern.filter((topic) => topic.total > 0);
  return [{ slug: '', title: ALL_TOPICS, ...hub.practice.totals }, ...withQuestions];
}

// Same three columns as the Dashboard: topics on the left, the questions in the middle, an empty right column.
export default function PracticeDesktopView({ practice }) {
  const { slug, hub, error, dismissError, filters, update } = practice;
  return (
    <LibraryFont>
      <DesktopPageFrame
        left={<TopicsNav topics={buildTopicList(hub)} activeSlug={filters.subPattern} onPick={(subPattern) => update({ subPattern })} backTo={`/aptitude/${slug}`} backLabel={`Back to ${hub?.pattern.title ?? 'topic'}`} />}
        right={<Box aria-hidden />}
      >
        <PracticeHeader totals={hub?.practice.totals} byDifficulty={hub?.practice.byDifficulty} />
        <PracticeFilters practice={practice} />
        {error && <Alert severity="info" onClose={dismissError} sx={{ mb: 2 }}>{error}</Alert>}
        <PracticeQuestionList practice={practice} />
      </DesktopPageFrame>
    </LibraryFont>
  );
}
