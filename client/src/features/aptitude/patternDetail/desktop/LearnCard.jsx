import { Box, Button, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import AppCard from '../../../../components/ui/AppCard';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

const LEARN_ACCENT = COLOR_PALETTE.blue[500];

function LearnHeader({ title, meta }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: SIZES.controlHeight.desktop, height: SIZES.controlHeight.desktop, display: 'grid', placeItems: 'center', borderRadius: RADII_PX.card, bgcolor: LEARN_ACCENT, color: COLOR_PALETTE.white }}>
        <MenuBookRoundedIcon />
      </Box>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography component="h1" sx={{ fontSize: FONT_SIZES.displayLg, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2 }}>{title}</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: FONT_SIZES.bodyLg }}>Learn · {meta}</Typography>
      </Box>
    </Stack>
  );
}

function LessonRow({ lesson, done }) {
  const Icon = done ? CheckCircleRoundedIcon : RadioButtonUncheckedRoundedIcon;
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
      <Icon aria-label={done ? 'Completed' : 'Not started'} sx={{ color: done ? 'success.main' : 'text.disabled' }} />
      <Typography sx={{ fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.medium }}>{lesson.title}</Typography>
    </Stack>
  );
}

const startLabel = ({ learnDone, learnTotal }) => {
  if (learnDone === 0) return 'Start learning';
  return learnDone >= learnTotal && learnTotal > 0 ? 'Review lessons' : 'Continue learning';
};

// Centre of the desktop topic page: the topic title and its lessons. Learning is the only thing in the middle column;
// Practice, Test and the alien live in the right column.
export default function LearnCard({ title, meta, learn, onLearn }) {
  const { lessons, hasLearn, completedLessonIds } = learn;
  return (
    <AppCard component="section" aria-label="Learn">
      <LearnHeader title={title} meta={meta} />
      {hasLearn ? (
        <Button onClick={onLearn} disableElevation variant="contained" startIcon={<PlayArrowRoundedIcon />} sx={{ mt: 2.5, mb: lessons ? 2 : 0, fontWeight: FONT_WEIGHTS.bold, textTransform: 'none' }}>
          {startLabel(learn)}
        </Button>
      ) : (
        <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: FONT_SIZES.bodyLg }}>Lessons for this topic are coming soon.</Typography>
      )}
      {lessons?.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} done={completedLessonIds.has(lesson.id)} />)}
    </AppCard>
  );
}
