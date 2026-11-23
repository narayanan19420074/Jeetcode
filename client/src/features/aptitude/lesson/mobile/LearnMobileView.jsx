import { useNavigate } from 'react-router-dom';
import { Alert, Box } from '@mui/material';
import { LibraryFont, useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { SIZES } from '../../../../app/design/designTokens';
import LessonBody from '../LessonBody';
import { LessonPager } from '../LearnPageParts';
import LearnMobileFooter from './LearnMobileFooter';
import LearnMobileHeader from './LearnMobileHeader';

function LessonScreen({ slug, lessons, selection, completed, markDone, data }) {
  const navigate = useNavigate();
  const { activeIndex, select } = selection;
  const lesson = lessons[activeIndex];
  const isLast = activeIndex === lessons.length - 1;
  const pal = useLibraryPalette();
  return (
    <Box sx={{ minHeight: SIZES.viewportHeight, bgcolor: pal.bg }}>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', maxWidth: SIZES.phonePageMaxWidth, mx: 'auto' }}>
        <LearnMobileHeader slug={slug} title={data.patternTitle} lessonIndex={activeIndex} lessonTotal={lessons.length} doneCount={completed.size} />
        {data.error && <Alert severity="warning" sx={{ mt: 2 }}>{data.error}</Alert>}
        <Box key={lesson.id} sx={{ mt: 3 }}>
          <LessonPager lessons={lessons} activeIndex={activeIndex} completed={completed} onSelect={select} />
          <LessonBody lesson={lesson} index={activeIndex} onCorrect={() => markDone(lesson.id)} />
          <LearnMobileFooter
            hasPrevious={activeIndex > 0}
            isLast={isLast}
            questionCount={data.questionCounts[lesson.id] ?? 0}
            onPrevious={() => select(lessons[activeIndex - 1].id)}
            onPractice={() => navigate(`/aptitude/${slug}/practice?subPattern=${lesson.id}`)}
            onNext={() => (isLast ? navigate(`/aptitude/${slug}/practice`) : select(lessons[activeIndex + 1].id))}
          />
        </Box>
      </Box>
    </Box>
  );
}

// Learn route on phones, in the same Library look as the topic page (cream page, centred header, pill buttons).
export default function LearnMobileView(props) {
  return (
    <LibraryFont>
      <LessonScreen {...props} />
    </LibraryFont>
  );
}
