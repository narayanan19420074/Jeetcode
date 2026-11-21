import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { getLessonsForPattern } from '../learn/content';
import LessonBody from './lesson/LessonBody';
import LessonFooter from './lesson/LessonFooter';
import { LEARN_PAGE_MAX, LearnTopBar, LessonList, LessonPager } from './lesson/LearnPageParts';
import useLearnPageData from './lesson/useLearnPageData';
import useLessonCompletion from './lesson/useLessonCompletion';
import useRouteSelection from './lesson/useRouteSelection';

const CONTENT_MAX = 760;
const LIST_WIDTH = 270;

function LessonColumn({ slug, lessons, selection, completed, markDone, data }) {
  const navigate = useNavigate();
  const { activeIndex, select } = selection;
  const lesson = lessons[activeIndex];
  const isLast = activeIndex === lessons.length - 1;
  return (
    <Box key={lesson.id} sx={{ flex: 1, minWidth: 0, maxWidth: CONTENT_MAX }}>
      {data.error && <Alert severity="warning" sx={{ mb: 2 }}>{data.error}</Alert>}
      <LessonPager lessons={lessons} activeIndex={activeIndex} completed={completed} onSelect={select} />
      <LessonBody lesson={lesson} index={activeIndex} onCorrect={() => markDone(lesson.id)} />
      <LessonFooter
        hasPrevious={activeIndex > 0}
        isLast={isLast}
        questionCount={data.questionCounts[lesson.id] ?? 0}
        onPrevious={() => select(lessons[activeIndex - 1].id)}
        onPractice={() => navigate(`/aptitude/${slug}/practice?subPattern=${lesson.id}`)}
        onNext={() => (isLast ? navigate(`/aptitude/${slug}/practice`) : select(lessons[activeIndex + 1].id))}
      />
    </Box>
  );
}

// Full-page Learn route (/aptitude/:slug/learn), used on phones: top bar, lesson list and one lesson at a time.
export default function AptitudeLearnPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const lessons = getLessonsForPattern(slug);
  const data = useLearnPageData(slug);
  const { completed, markDone } = useLessonCompletion(slug, data.savedIds, lessons?.length ?? 0);
  const selection = useRouteSelection({ ids: lessons?.map((lesson) => lesson.id) ?? [], paramName: 'lesson', completed });

  // Patterns with only the legacy Learn content keep using it.
  if (!lessons) return <Navigate to={`/learn/${slug}`} replace />;
  if (data.loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={28} /></Box>;
  const lesson = lessons[selection.activeIndex];
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <LearnTopBar title={data.patternTitle} lessonIndex={selection.activeIndex} lessonTotal={lessons.length} lessonTitle={lesson.title} doneCount={completed.size} onBack={() => navigate(`/aptitude/${slug}`)} />
      <Box sx={{ maxWidth: LEARN_PAGE_MAX, mx: 'auto', px: 2, py: { xs: 2.5, md: 4 }, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ width: LIST_WIDTH, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
          <LessonList lessons={lessons} activeId={selection.activeId} completed={completed} onSelect={selection.select} />
        </Box>
        <LessonColumn slug={slug} lessons={lessons} selection={selection} completed={completed} markDone={markDone} data={data} />
      </Box>
    </Box>
  );
}
