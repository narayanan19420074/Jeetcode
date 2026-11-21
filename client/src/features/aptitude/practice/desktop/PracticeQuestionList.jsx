import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Collapse, Pagination, Skeleton, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { difficultyMeta } from '../../components/aptitudeUi';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { FONTS, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';
import { PRACTICE_PAGE_SIZE } from '../common/usePracticeList';

const COLUMN_TITLES = ['Status', 'Star', 'Question', 'Difficulty', 'Solution'];
const CENTERED_COLUMNS = [0, 1, 3, 4];
const rowGridSx = { display: 'grid', gridTemplateColumns: SIZES.practiceList.columns, alignItems: 'center', px: 2 };
const STATUS_ICONS = {
  solved: { Icon: CheckCircleRoundedIcon, color: 'success.main', label: 'Solved' },
  attempted: { Icon: ErrorOutlineRoundedIcon, color: 'warning.main', label: 'Attempted, not solved yet' },
  todo: { Icon: RadioButtonUncheckedRoundedIcon, color: 'text.disabled', label: 'Not attempted' },
};

function StatusIcon({ status }) {
  const { Icon, color, label } = STATUS_ICONS[status] ?? STATUS_ICONS.todo;
  return <Icon sx={{ fontSize: FONT_SIZES.display, color }} titleAccess={label} />;
}

function StarButton({ bookmarked, onToggle }) {
  const Icon = bookmarked ? StarRoundedIcon : StarBorderRoundedIcon;
  return (
    <ButtonBase onClick={(event) => { event.stopPropagation(); onToggle(); }} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'} aria-pressed={bookmarked} sx={{ borderRadius: RADII_PX.circle, p: 0.5 }}>
      <Icon sx={{ fontSize: FONT_SIZES.display, color: 'warning.main' }} />
    </ButtonBase>
  );
}

function SolutionButton({ pal, onOpen }) {
  return (
    <ButtonBase onClick={(event) => { event.stopPropagation(); onOpen(); }} aria-label="Open question and solution" sx={{ width: SIZES.iconButton.desktop, height: SIZES.iconButton.desktop, borderRadius: RADII_PX.card, border: `1px solid ${pal.border}`, bgcolor: 'background.paper', color: pal.text }}>
      <DescriptionRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
    </ButtonBase>
  );
}

function ColumnTitles({ pal }) {
  return (
    <Box sx={[rowGridSx, { py: 1, borderTop: `1px solid ${pal.divider}`, borderBottom: `1px solid ${pal.divider}` }]}>
      {COLUMN_TITLES.map((title, index) => (
        <Typography key={title} variant="caption" sx={{ fontWeight: FONT_WEIGHTS.semibold, color: pal.muted, textTransform: 'uppercase', textAlign: CENTERED_COLUMNS.includes(index) ? 'center' : 'left' }}>{title}</Typography>
      ))}
    </Box>
  );
}

function QuestionRow({ question, pal, onOpen, onToggleStar }) {
  const level = difficultyMeta(question.difficulty);
  return (
    <Box onClick={onOpen} sx={[rowGridSx, { py: 1.25, cursor: 'pointer', borderBottom: `1px solid ${pal.divider}`, '&:last-of-type': { borderBottom: 'none' }, '&:hover': { bgcolor: 'action.hover' } }]}>
      <Box sx={{ display: 'grid', placeItems: 'center' }}><StatusIcon status={question.status} /></Box>
      <Box sx={{ display: 'grid', placeItems: 'center' }}><StarButton bookmarked={Boolean(question.bookmarked)} onToggle={onToggleStar} /></Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: SIZES.flexShrinkMinWidth, pr: 2 }}>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.medium, color: pal.text, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{question.title}</Typography>
        <OpenInNewRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: pal.muted, flexShrink: 0 }} />
      </Stack>
      <Typography sx={{ fontFamily: FONTS.mono, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.caption, textAlign: 'center', color: level.color }}>{level.label}</Typography>
      <Box sx={{ display: 'grid', placeItems: 'center' }}><SolutionButton pal={pal} onOpen={onOpen} /></Box>
    </Box>
  );
}

function GroupHeader({ title, open, onToggle, pal }) {
  return (
    <ButtonBase onClick={onToggle} aria-expanded={open} sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, width: SIZES.fill, px: 2, py: 1.5, textAlign: 'left', fontFamily: 'inherit' }}>
      <ExpandMoreRoundedIcon sx={{ fontSize: FONT_SIZES.display, color: pal.muted, transform: open ? 'none' : 'rotate(-90deg)' }} />
      <Typography component="h2" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, color: pal.text }}>{title}</Typography>
    </ButtonBase>
  );
}

function Rows({ practice, pal }) {
  const navigate = useNavigate();
  const { slug, list, toggleBookmark } = practice;
  if (!list) return Array.from({ length: 8 }, (_, index) => <Skeleton key={index} variant="rectangular" height={SIZES.practiceList.skeletonRowHeight} />);
  if (list.items.length === 0) return <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>No questions in this topic yet.</Typography>;
  return list.items.map((question) => (
    <QuestionRow key={question._id} question={question} pal={pal} onOpen={() => navigate(`/aptitude/${slug}/practice/${question._id}`)} onToggleStar={() => toggleBookmark(question)} />
  ));
}

// The questions of the picked topic as one soft grey card: topic title (it folds the list), column titles and one row per
// question. Paging sits under the card.
export default function PracticeQuestionList({ practice, title }) {
  const pal = useLibraryPalette();
  const [open, setOpen] = useState(true);
  const { list, filters, pageCount, update } = practice;
  return (
    <>
      <Box sx={{ borderRadius: RADII_PX.dialog, bgcolor: pal.chip, border: `1px solid ${pal.border}`, overflow: 'hidden' }}>
        <GroupHeader title={title} open={open} onToggle={() => setOpen((value) => !value)} pal={pal} />
        <Collapse in={open} unmountOnExit>
          <ColumnTitles pal={pal} />
          <Rows practice={practice} pal={pal} />
        </Collapse>
      </Box>
      {list && list.total > PRACTICE_PAGE_SIZE && (
        <Stack sx={{ alignItems: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={filters.page} onChange={(_, next) => update({ page: String(next) })} color="primary" shape="rounded" />
        </Stack>
      )}
    </>
  );
}
