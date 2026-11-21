import { Box, Typography } from '@mui/material';
import LessonBody from '../../lesson/LessonBody';
import TopicFooter from './TopicFooter';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

const CONTENT_MAX = 760;

function ComingSoon({ title }) {
  return (
    <>
      <Typography component="h1" sx={{ fontSize: FONT_SIZES.displayLg, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2 }}>{title}</Typography>
      <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: FONT_SIZES.bodyLg }}>Learn content for this topic is coming soon. You can still practise it.</Typography>
    </>
  );
}

// Middle of the desktop topic page: the learn content of the topic picked on the left, or a note while it is being written.
// Previous and Next move between topics; Practice and Test of the topic are in the card on the right.
// Lessons are matched to topics by id (a lesson id is the topic's slug).
export default function TopicStudy({ topics, activeIndex, lessons, onSelect, onCorrect }) {
  const topic = topics[activeIndex];
  if (!topic) return <ComingSoon title="Topics are coming soon" />;
  const lesson = lessons?.find((item) => item.id === topic.slug);
  const isLast = activeIndex === topics.length - 1;
  return (
    <Box key={topic.slug} sx={{ maxWidth: CONTENT_MAX }}>
      {lesson ? <LessonBody lesson={lesson} index={lessons.indexOf(lesson)} onCorrect={() => onCorrect(lesson.id)} /> : <ComingSoon title={topic.title} />}
      <TopicFooter
        hasPrevious={activeIndex > 0}
        hasNext={!isLast}
        onPrevious={() => onSelect(topics[activeIndex - 1].slug)}
        onNext={() => onSelect(topics[activeIndex + 1].slug)}
      />
    </Box>
  );
}
