import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, ButtonBase, Chip, CircularProgress, IconButton, Menu, MenuItem, Skeleton, Stack, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { DIFF_COLOR, tint } from '../../dashboard/dashboardUtils';
import { LIB_ACCENT, LIB_TRACKING, LibraryFont, PageHeader, libBackBtnSx, libChipSx, libIconBtnSx, libSearchSx, libTintBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { DIFFICULTY, difficultyMeta } from './aptitudeUi';

// Phone layout of the Aptitude Practice list. It follows the phone Problems page: same page padding, back button,
// filter menu, search pill, centred header, progress bar, pill button, chips and row sizes.

const SHORT_DIFF = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };
const STATUS_OPTIONS = [
  { value: 'todo', label: 'Not tried' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'solved', label: 'Solved' },
  { value: 'bookmarked', label: 'Bookmarked' },
];
const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label]));

const scrollRow = { display: 'flex', gap: 1, overflowX: 'auto', mx: -2, px: 2, pb: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };

export function DifficultyTag({ difficulty }) {
  const meta = difficultyMeta(difficulty);
  const color = DIFF_COLOR[meta.label] || 'var(--jc-pending)';
  return (
    <Typography
      component="span"
      sx={{ flexShrink: 0, minWidth: 43, textAlign: 'center', px: '5px', py: '2px', borderRadius: '8px', fontSize: 15, fontWeight: 400, letterSpacing: LIB_TRACKING, lineHeight: '20px', color, bgcolor: tint(color, 14) }}
    >
      {SHORT_DIFF[meta.label] || meta.label}
    </Typography>
  );
}

function StatusMark({ status }) {
  if (status === 'solved') return <CheckCircleRoundedIcon aria-label="Solved" sx={{ fontSize: 20, color: 'var(--jc-easy)' }} />;
  if (status === 'attempted') return <ErrorOutlineRoundedIcon aria-label="Attempted, not solved yet" sx={{ fontSize: 20, color: 'var(--jc-medium)' }} />;
  return <RemoveRoundedIcon aria-label="Not tried" sx={{ fontSize: 20, color: 'var(--lib-muted)', opacity: 0.6 }} />;
}

function QuestionRow({ slug, q, topic }) {
  const meta = [topic, q.acceptance == null ? null : `Acceptance ${q.acceptance}%`].filter(Boolean).join(' · ');
  return (
    <ButtonBase
      component={RouterLink}
      to={`/aptitude/${slug}/practice/${q._id}`}
      sx={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '10px', py: 2, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', borderBottom: '1px solid var(--lib-divider)' }}
    >
      <Stack sx={{ width: 43, flexShrink: 0, alignItems: 'center', gap: 1.25, pt: '2px' }}>
        <DifficultyTag difficulty={q.difficulty} />
        <StatusMark status={q.status} />
      </Stack>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-start', minWidth: 0 }}>
          <Typography sx={{ fontWeight: 500, fontSize: 18, lineHeight: '28px', letterSpacing: LIB_TRACKING, minWidth: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {q.order}. {q.title}
          </Typography>
          {q.bookmarked && <StarRoundedIcon aria-label="Bookmarked" sx={{ fontSize: 18, color: 'warning.main', flexShrink: 0, mt: '5px' }} />}
        </Stack>
        {meta && (
          <Typography noWrap sx={{ mt: 1.5, fontSize: 15, letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums', color: 'var(--lib-muted)' }}>
            {meta}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
}

function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 2.5, borderBottom: '1px solid var(--lib-divider)' }}>
      <Skeleton variant="rounded" width={43} height={24} sx={{ borderRadius: '8px' }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="40%" />
      </Box>
    </Box>
  ));
}

export default function MobilePractice({
  slug,
  hub,
  list,
  error,
  onDismissError,
  subPattern,
  difficulty,
  status,
  search,
  searchDraft,
  onSearchDraft,
  onUpdate,
  onClear,
  filtersActive,
  page,
  pageCount,
  picking,
  onPick,
}) {
  const pal = useLibraryPalette();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const totals = hub?.practice.totals;
  const topics = (hub?.practice.bySubPattern ?? []).filter((s) => s.total > 0);
  const topicTitle = Object.fromEntries((hub?.practice.bySubPattern ?? []).map((s) => [s.slug, s.title]));
  const solvedPct = totals?.total ? Math.min((totals.solved / totals.total) * 100, 100) : 0;
  const filterCount = (difficulty ? 1 : 0) + (status ? 1 : 0);

  const choose = (patch) => () => {
    setMenuAnchor(null);
    onUpdate(patch);
  };
  const goPage = (p) => {
    onUpdate({ page: String(p) });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const menuItemSx = { py: 1.25, fontSize: 16, letterSpacing: LIB_TRACKING, color: pal.text };
  const groupLabelSx = { px: 2, pt: 1, pb: 0.5, fontSize: 14, letterSpacing: LIB_TRACKING, color: pal.muted };

  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
        {/* Back + filter menu */}
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton component={RouterLink} to={`/aptitude/${slug}`} aria-label="Back to topic" sx={libBackBtnSx}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Filter questions" aria-haspopup="menu" sx={libIconBtnSx}>
            <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
              <MoreHorizRoundedIcon />
              {filterCount > 0 && <Box aria-hidden sx={{ position: 'absolute', top: -6, right: -8, width: 9, height: 9, borderRadius: '50%', bgcolor: 'error.main' }} />}
            </Box>
          </IconButton>
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search"
          value={searchDraft}
          onChange={(e) => onSearchDraft(e.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Search questions' } }}
          sx={libSearchSx}
        />

        {/* Header */}
        <PageHeader icon={CalculateRoundedIcon} title="Practice" subtitle={hub?.pattern.title ?? ' '} />
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5 }}>
          <Box
            role="progressbar"
            aria-label="Questions solved"
            aria-valuemin={0}
            aria-valuemax={totals?.total ?? 0}
            aria-valuenow={totals?.solved ?? 0}
            sx={{ width: 162, height: 8, borderRadius: 99, bgcolor: tint('#F2B63C', 28), overflow: 'hidden' }}
          >
            <Box sx={{ width: `${solvedPct}%`, height: '100%', borderRadius: 99, bgcolor: '#F2B63C', transition: 'width .5s' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 20, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {totals ? totals.solved : '–'}
            <Box component="span" sx={{ color: pal.muted, fontWeight: 400 }}>
              /{totals ? totals.total : '–'}
            </Box>
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'center', mt: 2.5 }}>
          <Button
            onClick={onPick}
            disabled={picking}
            disableElevation
            variant="contained"
            startIcon={picking ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />}
            sx={(t) => ({ height: 40, minWidth: 152, px: 3, borderRadius: 999, fontWeight: 500, fontSize: 18, letterSpacing: LIB_TRACKING, textTransform: 'none', bgcolor: pal.player, color: t.palette.mode === 'dark' ? pal.text : '#6B4A1E', '&:hover': { bgcolor: pal.player, filter: 'brightness(0.97)' } })}
          >
            Random
          </Button>
        </Stack>

        {/* Topics */}
        {topics.length > 1 && (
          <Box role="group" aria-label="Topics" sx={{ ...scrollRow, mt: 3 }}>
            <ButtonBase aria-pressed={!subPattern} onClick={() => onUpdate({ subPattern: '' })} sx={libChipSx(!subPattern)}>
              All topics
            </ButtonBase>
            {topics.map((s) => (
              <ButtonBase key={s.slug} aria-pressed={subPattern === s.slug} onClick={() => onUpdate({ subPattern: s.slug })} sx={libChipSx(subPattern === s.slug)}>
                {s.title}
              </ButtonBase>
            ))}
          </Box>
        )}

        {/* Active filters */}
        {(filtersActive && (difficulty || status || search)) && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mt: 1.5 }}>
            {search && <Chip size="small" label={`Search: ${search}`} onDelete={() => { onSearchDraft(''); onUpdate({ search: '' }); }} />}
            {difficulty && <Chip size="small" label={DIFFICULTY[difficulty]?.label ?? difficulty} onDelete={() => onUpdate({ difficulty: '' })} />}
            {status && <Chip size="small" label={STATUS_LABEL[status] ?? status} onDelete={() => onUpdate({ status: '' })} />}
            <Button size="small" onClick={onClear} sx={{ minWidth: 0, fontWeight: 700, textTransform: 'none' }}>
              Clear all
            </Button>
          </Stack>
        )}

        {error && (
          <Alert severity="info" onClose={onDismissError} sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* List */}
        <Box sx={{ mt: 3, borderTop: '1px solid var(--lib-divider)' }}>
          {!list ? (
            <SkeletonRows />
          ) : list.items.length === 0 ? (
            <Box sx={{ py: 7, px: 2, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>No questions match this view</Typography>
              <Typography sx={{ mt: 0.5, mb: 2, fontSize: 15, letterSpacing: LIB_TRACKING, color: pal.muted }}>Try another topic or clear the filters.</Typography>
              {filtersActive && (
                <Button onClick={onClear} disableElevation variant="contained" sx={{ ...libTintBtnSx, height: 40 }}>
                  Clear filters
                </Button>
              )}
            </Box>
          ) : (
            list.items.map((q) => <QuestionRow key={q._id} slug={slug} q={q} topic={subPattern ? null : topicTitle[q.subPattern] ?? q.subPattern} />)
          )}
        </Box>

        {list && pageCount > 1 && (
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', gap: 2, mt: 2 }}>
            <Button disabled={page <= 1} onClick={() => goPage(page - 1)} disableElevation variant="contained" sx={{ ...libTintBtnSx, height: 36, px: 2, fontSize: 15 }}>
              Previous
            </Button>
            <Typography sx={{ fontSize: 15, letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums', color: pal.muted }}>
              {page} / {pageCount}
            </Typography>
            <Button disabled={page >= pageCount} onClick={() => goPage(page + 1)} disableElevation variant="contained" sx={{ ...libTintBtnSx, height: 36, px: 2, fontSize: 15 }}>
              Next
            </Button>
          </Stack>
        )}
        {list && list.total > 0 && (
          <Typography sx={{ display: 'block', textAlign: 'center', mt: 1.5, fontSize: 14, color: pal.muted, fontVariantNumeric: 'tabular-nums' }}>
            {list.total} {list.total === 1 ? 'question' : 'questions'}
          </Typography>
        )}

        {/* Filter menu: choosing an item swaps the list below in place */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          slotProps={{ paper: { sx: { borderRadius: '20px', minWidth: 230, py: 0.5, bgcolor: pal.bg } } }}
        >
          <Typography sx={groupLabelSx}>Difficulty</Typography>
          {Object.entries(DIFFICULTY).map(([k, m]) => (
            <MenuItem key={k} selected={difficulty === k} onClick={choose({ difficulty: difficulty === k ? '' : k })} sx={menuItemSx}>
              {m.label}
              {difficulty === k && <CheckRoundedIcon fontSize="small" sx={{ ml: 'auto', color: LIB_ACCENT }} />}
            </MenuItem>
          ))}
          <Typography sx={{ ...groupLabelSx, pt: 1.5 }}>Status</Typography>
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s.value} selected={status === s.value} onClick={choose({ status: status === s.value ? '' : s.value })} sx={menuItemSx}>
              {s.label}
              {status === s.value && <CheckRoundedIcon fontSize="small" sx={{ ml: 'auto', color: LIB_ACCENT }} />}
            </MenuItem>
          ))}
          <MenuItem disabled={!filtersActive} onClick={() => { setMenuAnchor(null); onClear(); }} sx={{ ...menuItemSx, mt: 0.5, borderTop: `1px solid ${pal.divider}` }}>
            Remove filters
          </MenuItem>
        </Menu>
      </Box>
    </LibraryFont>
  );
}
