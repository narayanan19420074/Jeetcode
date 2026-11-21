import { Stack, Typography } from '@mui/material';
import MicroCheck from '../../learn/components/MicroCheck';
import { LESSON_WIDGETS } from '../components/LessonWidgets';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import { CommonTraps, ExamShortcuts, Formulas, KeyIdea, LessonTable } from './LessonSections';
import WorkedExample from './WorkedExample';

function LessonHeading({ lesson, index }) {
  return (
    <>
      <Typography variant="overline" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'primary.main', letterSpacing: '0.1em' }}>Lesson {index + 1} · {lesson.minutes} min read</Typography>
      <Typography variant="h4" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.02em', mb: 0.5 }}>{lesson.title}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>{lesson.summary}</Typography>
    </>
  );
}

// The full content of one lesson. `onCorrect` fires once when the learner answers the closing check correctly,
// which is what marks the lesson as done.
export default function LessonBody({ lesson, index, onCorrect }) {
  const Widget = lesson.widget ? LESSON_WIDGETS[lesson.widget] : null;
  const { question, options, correctIndex, explanation } = lesson.check;
  return (
    <>
      <LessonHeading lesson={lesson} index={index} />
      <Stack spacing={3}>
        <KeyIdea paragraphs={lesson.keyIdea} />
        <Formulas formulas={lesson.formulas} />
        {lesson.table && <LessonTable table={lesson.table} />}
        {Widget && <Widget />}
        <ExamShortcuts shortcuts={lesson.shortcut} />
        <Stack spacing={2}>{lesson.examples.map((example, position) => <WorkedExample key={example.question} example={example} index={position} />)}</Stack>
        <CommonTraps traps={lesson.traps} />
        <MicroCheck key={lesson.id} checkQuestion={{ question, options, correctIndex, explanation }} onCorrect={onCorrect} />
      </Stack>
    </>
  );
}
