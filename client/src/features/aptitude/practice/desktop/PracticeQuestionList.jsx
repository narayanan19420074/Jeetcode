import { useNavigate } from 'react-router-dom';
import { Box, Pagination, Paper, Skeleton, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { difficultyMeta } from '../../components/aptitudeUi';
import { FONTS, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';
import { PRACTICE_PAGE_SIZE } from '../common/usePracticeList';

const mono = { fontFamily: FONTS.mono };
const COLUMN_TITLES = ['', '#', 'Question', 'Topic', 'Accept.', 'Level'];
const FIRST_RIGHT_ALIGNED_COLUMN = 4;
const rowGridSx = { display: 'grid', gridTemplateColumns: SIZES.practiceList.columns, alignItems: 'center', px: 2 };
const STATUS_ICONS = {
  solved: { Icon: CheckCircleRoundedIcon, color: 'success.main', label: 'Solved' },
  attempted: { Icon: ErrorOutlineRoundedIcon, color: 'warning.main', label: 'Attempted, not solved yet' },
  todo: { Icon: RadioButtonUncheckedRoundedIcon, color: 'text.disabled', label: 'Not attempted' },
};

function StatusIcon({ status }) {
  const { Icon, color, label } = STATUS_ICONS[status] ?? STATUS_ICONS.todo;
  return <Icon sx={{ fontSize: FONT_SIZES.heading, color }} titleAccess={label} />;
}

function ListHeader() {
  return (
    <Box sx={[rowGridSx, { py: 1, borderBottom: '1px solid', borderColor: 'divider' }]}>
      {COLUMN_TITLES.map((title, index) => (
        <Typography key={title || index} variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary', textAlign: index >= FIRST_RIGHT_ALIGNED_COLUMN ? 'right' : 'left' }}>{title}</Typography>
      ))}
    </Box>
  );
}

function QuestionTitle({ question }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: SIZES.flexShrinkMinWidth, pr: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.semibold, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{question.title}</Typography>
      {question.bookmarked && <StarRoundedIcon sx={{ fontSize: FONT_SIZES.title, color: 'warning.main', flexShrink: 0 }} />}
    </Stack>
  );
}

function QuestionRow({ question, topicTitle, onOpen }) {
  const level = difficultyMeta(question.difficulty);
  return (
    <Box onClick={onOpen} sx={[rowGridSx, { py: 1.5, cursor: 'pointer', borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' }, '&:hover': { bgcolor: 'action.hover' } }]}>
      <StatusIcon status={question.status} />
      <Typography variant="body2" color="text.secondary" sx={mono}>{question.order}</Typography>
      <QuestionTitle question={question} />
      <Typography variant="caption" color="text.secondary" noWrap sx={{ pr: 1 }}>{topicTitle}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ ...mono, textAlign: 'right' }}>{question.acceptance == null ? '—' : `${question.acceptance}%`}</Typography>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, color: level.color, textAlign: 'right' }}>{level.label}</Typography>
    </Box>
  );
}

function EmptyList() {
  return (
    <Box sx={{ py: 7, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>No questions match these filters</Typography>
      <Typography variant="body2" color="text.secondary">Try a different topic or clear the filters.</Typography>
    </Box>
  );
}

function ListFooter({ list, page, pageCount, onPage }) {
  return (
    <>
      {list.total > PRACTICE_PAGE_SIZE && (
        <Stack sx={{ alignItems: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(_, next) => onPage(String(next))} color="primary" shape="rounded" />
        </Stack>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>{list.total} question{list.total === 1 ? '' : 's'}</Typography>
    </>
  );
}

// The questions of the pattern as a table, with paging underneath.
export default function PracticeQuestionList({ practice }) {
  const navigate = useNavigate();
  const { slug, list, subTitles, filters, pageCount, update } = practice;
  return (
    <>
      <Paper variant="outlined" sx={{ borderRadius: RADII_PX.card, overflow: 'hidden' }}>
        <ListHeader />
        {!list && Array.from({ length: 8 }, (_, index) => <Skeleton key={index} variant="rectangular" height={SIZES.practiceList.skeletonRowHeight} />)}
        {list?.items.length === 0 && <EmptyList />}
        {list?.items.map((question) => (
          <QuestionRow key={question._id} question={question} topicTitle={subTitles[question.subPattern] ?? question.subPattern} onOpen={() => navigate(`/aptitude/${slug}/practice/${question._id}`)} />
        ))}
      </Paper>
      {list && <ListFooter list={list} page={filters.page} pageCount={pageCount} onPage={(page) => update({ page })} />}
    </>
  );
}
