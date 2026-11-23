import { Navigate, useParams } from 'react-router-dom';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { getLessonsForPattern } from '../learn/content';
import LearnDesktopView from './lesson/desktop/LearnDesktopView';
import LearnMobileView from './lesson/mobile/LearnMobileView';
import useLearnPageData from './lesson/useLearnPageData';
import useLessonCompletion from './lesson/useLessonCompletion';
import useRouteSelection from './lesson/useRouteSelection';

// Full-page Learn route (/aptitude/:slug/learn): phones and small tablets get the Library-look view, wide screens keep the top bar and lesson list.
export default function AptitudeLearnPage() {
  const { slug } = useParams();
  const lessons = getLessonsForPattern(slug);
  const data = useLearnPageData(slug);
  const { completed, markDone } = useLessonCompletion(slug, data.savedIds, lessons?.length ?? 0);
  const selection = useRouteSelection({ ids: lessons?.map((lesson) => lesson.id) ?? [], paramName: 'lesson', completed });
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('md'), { noSsr: true });

  // Patterns with only the legacy Learn content keep using it.
  if (!lessons) return <Navigate to={`/learn/${slug}`} replace />;
  if (data.loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={28} /></Box>;
  const View = isPhone ? LearnMobileView : LearnDesktopView;
  return <View slug={slug} lessons={lessons} selection={selection} completed={completed} markDone={markDone} data={data} />;
}
