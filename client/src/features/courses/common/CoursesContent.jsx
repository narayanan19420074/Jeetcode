import { Alert, Box, Skeleton, Typography } from '@mui/material';
import { LIB_ACCENT, LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { BORDER_WIDTHS, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import CourseCard from './CourseCard';
import LessonCard from './LessonCard';
import { pluralize } from './courseSelectors';

const GRID_COLUMNS = { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' };
const SKELETON_COUNT = 3;
const SKELETON_RATIO = '4 / 3';

function PageHeading({ title }) {
  return (
    <Typography component="h1" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: FONT_SIZES.displayLg, md: FONT_SIZES.hero }, lineHeight: 1.2 }}>
      {title}<Box component="span" aria-hidden sx={{ color: LIB_ACCENT }}>.</Box>
    </Typography>
  );
}

// Section title, a hairline and the item count on one row, with an optional line of context under it.
function SectionHeading({ title, blurb, count }) {
  const palette = useLibraryPalette();
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography component="h2" sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.heading, letterSpacing: LIB_TRACKING }}>{title}</Typography>
        <Box aria-hidden sx={{ flex: 1, borderTop: `${BORDER_WIDTHS.thin}px solid`, borderColor: palette.border }} />
        <Typography sx={{ fontSize: FONT_SIZES.body, color: palette.muted, fontVariantNumeric: 'tabular-nums' }}>{count}</Typography>
      </Box>
      {blurb && <Typography sx={{ mt: 1, fontSize: FONT_SIZES.bodyLg, color: palette.muted }}>{blurb}</Typography>}
    </Box>
  );
}

const CardGrid = ({ children }) => <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: GRID_COLUMNS }}>{children}</Box>;

function LoadingGrid() {
  return <CardGrid>{Array.from({ length: SKELETON_COUNT }, (_, index) => <Skeleton key={index} variant="rounded" sx={{ width: SIZES.fill, aspectRatio: SKELETON_RATIO, height: 'auto', borderRadius: RADII_PX.card }} />)}</CardGrid>;
}

function CourseSections({ sections, onOpen }) {
  return sections.map((section) => (
    <Box component="section" key={section.id} aria-label={section.label} sx={{ mt: 4 }}>
      <SectionHeading title={section.label} blurb={section.blurb} count={pluralize(section.courses.length, 'course')} />
      <CardGrid>{section.courses.map((course) => <CourseCard key={course.slug} course={course} onOpen={onOpen} />)}</CardGrid>
    </Box>
  ));
}

function LessonList({ lessons, onOpen }) {
  return (
    <Box component="section" aria-label="All lessons" sx={{ mt: 4 }}>
      <SectionHeading title="All Lessons" count={pluralize(lessons.length, 'lesson')} />
      <CardGrid>{lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} onOpen={onOpen} />)}</CardGrid>
    </Box>
  );
}

function EmptyState({ tab }) {
  return <Typography sx={{ mt: 6, textAlign: 'center', color: 'text.secondary', fontSize: FONT_SIZES.bodyLg }}>{tab === 'lessons' ? 'No lessons are available yet.' : 'No courses are available yet.'}</Typography>;
}

// The list of the open tab, identical on phone and desktop. Cards open the course panel of the Store.
export default function CoursesContent({ page }) {
  const { tab, sections, lessons, loading, error, data, setCourseSlug } = page;
  const items = tab === 'lessons' ? lessons : sections;
  const isLoading = loading && !data;
  return (
    <Box>
      <PageHeading title={tab === 'lessons' ? 'Lessons' : 'Courses'} />
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {isLoading && <Box sx={{ mt: 4 }}><LoadingGrid /></Box>}
      {!isLoading && items.length === 0 && !error && <EmptyState tab={tab} />}
      {tab === 'lessons' && lessons.length > 0 && <LessonList lessons={lessons} onOpen={setCourseSlug} />}
      {tab === 'courses' && <CourseSections sections={sections} onOpen={setCourseSlug} />}
    </Box>
  );
}
