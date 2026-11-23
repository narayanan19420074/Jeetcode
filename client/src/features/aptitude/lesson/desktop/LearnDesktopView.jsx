import { useNavigate } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import LessonBody from '../LessonBody';
import LessonFooter from '../LessonFooter';
import { SIZES } from '../../../../app/design/designTokens';
import { LEARN_PAGE_MAX, LearnTopBar, LessonList, LessonPager } from '../LearnPageParts';

const CONTENT_MAX = 760;
const LIST_WIDTH = 270;

function LessonColumn({ slug, lessons, selection, completed, markDone, data }) {
  const navigate = useNavigate();
  const { activeIndex, select } = selection;
  const lesson = lessons[activeIndex];
  const isLast = activeIndex === lessons.length - 1;
  return (
    <Box key={lesson.id} sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth, maxWidth: CONTENT_MAX }}>
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

// Learn route on wide screens: top bar, the lesson list on the left and one lesson at a time.
export default function LearnDesktopView({ slug, lessons, selection, completed, markDone, data }) {
  const navigate = useNavigate();
  const lesson = lessons[selection.activeIndex];
  return (
    <Box sx={{ minHeight: SIZES.viewportHeight, bgcolor: 'background.default' }}>
      <LearnTopBar title={data.patternTitle} lessonIndex={selection.activeIndex} lessonTotal={lessons.length} lessonTitle={lesson.title} doneCount={completed.size} onBack={() => navigate(`/aptitude/${slug}`)} />
      <Box sx={{ maxWidth: LEARN_PAGE_MAX, mx: 'auto', px: 2, py: 4, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box sx={{ width: LIST_WIDTH, flexShrink: 0 }}>
          <LessonList lessons={lessons} activeId={selection.activeId} completed={completed} onSelect={selection.select} />
        </Box>
        <LessonColumn slug={slug} lessons={lessons} selection={selection} completed={completed} markDone={markDone} data={data} />
      </Box>
    </Box>
  );
}
