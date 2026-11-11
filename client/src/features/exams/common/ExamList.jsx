import { Box } from '@mui/material';
import ExamCard from './ExamCard';
import { examDateOf } from './examSchedule';

// One column on phones, two from the small breakpoint up.
const gridSx = { display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' } };

export default function ExamList({ exams, trackFor }) {
  return (
    <Box sx={gridSx}>
      {exams.map((exam) => (
        <ExamCard key={exam.id} exam={exam} examOn={examDateOf(exam, trackFor(exam))} />
      ))}
    </Box>
  );
}
