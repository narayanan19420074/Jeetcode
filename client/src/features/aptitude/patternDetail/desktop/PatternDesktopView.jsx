import { Alert, Skeleton } from '@mui/material';
import BackIconButton from '../../../../components/BackIconButton';
import DesktopPageFrame from '../../../../components/DesktopPageFrame';
import { LibraryFont } from '../../../dashboard/components/libraryStyle';
import { RADII_PX } from '../../../../app/design/designTokens';
import useLessonCompletion from '../../lesson/useLessonCompletion';
import useRouteSelection from '../../lesson/useRouteSelection';
import RightColumn from './RightColumn';
import TopicStudy from './TopicStudy';
import TopicsNav from './TopicsNav';

function PatternLoadingState({ error }) {
  return (
    <DesktopPageFrame left={<BackIconButton to="/aptitude" label="Back to Aptitude" />}>
      {error ? <Alert severity="error">{error}</Alert> : <Skeleton variant="rounded" height={260} sx={{ borderRadius: RADII_PX.card }} />}
    </DesktopPageFrame>
  );
}

function PatternStudyPage({ detail }) {
  const { slug, data, learn } = detail;
  const topics = data.practice.bySubPattern;
  const { completed, markDone } = useLessonCompletion(slug, data.progress.completedSubsections, learn.learnTotal);
  const { activeId, activeIndex, select } = useRouteSelection({ ids: topics.map((topic) => topic.slug), paramName: 'topic', completed });
  return (
    <DesktopPageFrame left={<TopicsNav topics={topics} activeSlug={activeId} onPick={select} />} right={<RightColumn detail={detail} topic={topics[activeIndex]} />}>
      <TopicStudy topics={topics} activeIndex={activeIndex} lessons={learn.lessons} onSelect={select} onCorrect={markDone} />
    </DesktopPageFrame>
  );
}

// Desktop topic page in the shared page frame: topics on the left, the learn content of the picked topic in the middle
// (with Previous and Next under it) and one card on the right with Practice and Test of that same topic.
export default function PatternDesktopView({ detail }) {
  return (
    <LibraryFont>
      {detail.data ? <PatternStudyPage detail={detail} /> : <PatternLoadingState error={detail.error} />}
    </LibraryFont>
  );
}
