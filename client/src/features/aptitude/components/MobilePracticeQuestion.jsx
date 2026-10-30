import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, ButtonBase, CircularProgress, IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { DIFF_COLOR, tint } from '../../dashboard/dashboardUtils';
import { LIB_ACCENT, LIB_TRACKING, LibraryFont, libBackBtnSx, libIconBtnSx, libPanelSx, libSectionTitleSx, libSolidBtnSx, libTintBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { OPTION_LABELS, difficultyMeta, formatClock, formatDuration } from './aptitudeUi';
import { DifficultyTag } from './MobilePractice';

// Phone layout of a single Aptitude practice question. Same page padding, back button, type scale (18px question,
// 16px body, 15px muted details), cream panels and pill buttons as the phone Problems and Aptitude pages.
// It shows the question, the four options and, after checking, the verdict, the solution and the exam shortcut.

const BODY = { fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING, whiteSpace: 'pre-line' };

function Shell({ slug, children, right }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton component={RouterLink} to={`/aptitude/${slug}/practice`} aria-label="Back to practice list" sx={libBackBtnSx}>
            <ArrowBackRoundedIcon />
          </IconButton>
          {right}
        </Stack>
        {children}
      </Box>
    </LibraryFont>
  );
}

// Loading and failure states of the question screen.
export function MobileQuestionState({ slug, error }) {
  return (
    <Shell slug={slug}>
      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      )}
    </Shell>
  );
}

// "Refer to the table below…" material for data-interpretation and comprehension questions.
function chartToTable(set) {
  const series = set.chart?.series ?? [];
  if (series.length === 0) return null;
  const labels = series[0].data.map((d) => d.label);
  return { columns: [set.chart?.xLabel || '', ...series.map((s) => s.name)], rows: labels.map((label, i) => [label, ...series.map((s) => s.data[i]?.value ?? '')]) };
}

function Stimulus({ set }) {
  if (!set) return null;
  const table = set.type === 'table' ? set.table : set.type === 'text' ? null : chartToTable(set);
  const cell = { fontSize: 15, lineHeight: '20px', py: 1, px: 1.25, color: 'var(--lib-text)', borderBottom: '1px solid var(--lib-divider)', whiteSpace: 'nowrap' };
  return (
    <Box sx={{ ...libPanelSx, p: 2, mt: 3 }}>
      {set.title && <Typography sx={{ fontWeight: 500, fontSize: 18, lineHeight: '28px', letterSpacing: LIB_TRACKING, mb: 0.5 }}>{set.title}</Typography>}
      {set.type === 'text' && <Typography sx={BODY}>{set.text}</Typography>}
      {table && (
        <Box sx={{ overflowX: 'auto', mx: -1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {table.columns.map((c, i) => (
                  <TableCell key={i} sx={{ ...cell, fontWeight: 700 }}>
                    {c}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((r, ri) => (
                <TableRow key={ri}>
                  {r.map((c, ci) => (
                    <TableCell key={ci} sx={{ ...cell, fontVariantNumeric: 'tabular-nums' }}>
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Box>
  );
}

// state: idle | selected | correct | wrong | dim
function Option({ index, text, state, disabled, onClick }) {
  const accent = state === 'correct' ? DIFF_COLOR.Easy : state === 'wrong' ? DIFF_COLOR.Hard : state === 'selected' ? LIB_ACCENT : null;
  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      aria-pressed={state === 'selected'}
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        px: 2,
        py: 1.5,
        minHeight: 56,
        borderRadius: '16px',
        border: '1.5px solid',
        borderColor: accent || 'var(--lib-border)',
        bgcolor: accent ? tint(accent, 12) : 'var(--lib-chip)',
        opacity: state === 'dim' ? 0.55 : 1,
        '&.Mui-disabled': { pointerEvents: 'none' },
      }}
    >
      <Box
        aria-hidden
        sx={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: 15, fontWeight: 500, border: '1.5px solid', borderColor: accent || 'var(--lib-muted)', bgcolor: accent || 'transparent', color: accent ? '#fff' : 'var(--lib-muted)' }}
      >
        {OPTION_LABELS[index]}
      </Box>
      <Typography sx={{ ...BODY, flex: 1, fontWeight: 500, minWidth: 0 }}>{text}</Typography>
      {state === 'correct' && <CheckCircleRoundedIcon aria-label="Correct answer" sx={{ fontSize: 22, color: DIFF_COLOR.Easy, flexShrink: 0 }} />}
      {state === 'wrong' && <CancelRoundedIcon aria-label="Your answer, wrong" sx={{ fontSize: 22, color: DIFF_COLOR.Hard, flexShrink: 0 }} />}
    </ButtonBase>
  );
}

export default function MobilePracticeQuestion({ slug, data, result, selected, checking, elapsed, bookmarked, error, onDismissError, onSelect, onCheck, onRetry, onGo, onBookmark }) {
  const pal = useLibraryPalette();
  const { question, set, position, totalInPattern, prevId, nextId, nextUnsolvedId, targetTimeSec } = data;
  const dm = difficultyMeta(question.difficulty);
  const target = result?.targetTimeSec ?? targetTimeSec;
  const slow = elapsed > target;
  const onPace = result?.isCorrect && result.timeSpentSec <= target;
  const forward = nextUnsolvedId || nextId;

  const optionState = (i) => {
    if (!result) return selected === i ? 'selected' : 'idle';
    if (i === result.correctOptionIndex) return 'correct';
    if (i === selected) return 'wrong';
    return 'dim';
  };

  // After checking: the main button moves on; the rest sit beneath it in one row.
  const secondary = [];
  if (result) {
    if (prevId) secondary.push({ label: 'Previous', onClick: () => onGo(prevId) });
    if (!result.isCorrect) secondary.push({ label: 'Try again', onClick: onRetry });
    if (nextId && nextUnsolvedId !== nextId) secondary.push({ label: 'Next question', onClick: () => onGo(nextId) });
  }

  return (
    <Shell
      slug={slug}
      right={
        <IconButton onClick={onBookmark} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark question'} aria-pressed={bookmarked} sx={libIconBtnSx}>
          {bookmarked ? <StarRoundedIcon sx={{ color: 'warning.main' }} /> : <StarBorderRoundedIcon />}
        </IconButton>
      }
    >
      {/* Meta: level, position, timer */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, mt: 1 }}>
        <DifficultyTag difficulty={question.difficulty} />
        <Typography sx={{ fontSize: 15, lineHeight: '20px', letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums', color: pal.muted }}>
          {position} / {totalInPattern}
        </Typography>
        <Typography
          aria-label={`Time ${formatClock(elapsed)}, target ${formatDuration(target)}`}
          sx={{ ml: 'auto', fontSize: 15, lineHeight: '20px', letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums', color: slow && !result ? 'var(--jc-medium)' : pal.muted }}
        >
          {formatClock(elapsed)}
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" onClose={onDismissError} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Stimulus set={set} />

      <Typography sx={{ mt: 3, fontWeight: 500, fontSize: 18, lineHeight: '28px', letterSpacing: LIB_TRACKING, whiteSpace: 'pre-line' }}>{question.questionText}</Typography>

      <Stack role="group" aria-label="Answer options" sx={{ mt: 2.5, gap: 1.25 }}>
        {question.options.map((o, i) => (
          <Option key={i} index={i} text={o.text} state={optionState(i)} disabled={!!result || checking} onClick={() => onSelect(i)} />
        ))}
      </Stack>

      {/* Before checking */}
      {!result && (
        <>
          <Button onClick={onCheck} disabled={selected === null || checking} fullWidth disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 3 }}>
            {checking ? <CircularProgress size={20} color="inherit" /> : 'Check answer'}
          </Button>
          <Stack direction="row" sx={{ gap: 1.5, mt: 1.5 }}>
            <Button onClick={() => onGo(prevId)} disabled={!prevId} fullWidth disableElevation variant="contained" sx={libTintBtnSx}>
              Previous
            </Button>
            <Button onClick={() => onGo(nextId)} disabled={!nextId} fullWidth disableElevation variant="contained" sx={libTintBtnSx}>
              Skip
            </Button>
          </Stack>
        </>
      )}

      {/* After checking */}
      {result && (
        <>
          <Box role="status" sx={{ ...libPanelSx, mt: 3, p: 2, borderColor: result.isCorrect ? DIFF_COLOR.Easy : DIFF_COLOR.Hard, bgcolor: tint(result.isCorrect ? DIFF_COLOR.Easy : DIFF_COLOR.Hard, 10) }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: '28px', color: result.isCorrect ? DIFF_COLOR.Easy : DIFF_COLOR.Hard }}>{result.isCorrect ? 'Correct' : 'Not quite'}</Typography>
            <Typography sx={{ fontSize: 15, lineHeight: '20px', letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums', color: pal.muted }}>
              {formatDuration(result.timeSpentSec)} · target {formatDuration(result.targetTimeSec)}
              {result.isCorrect && (onPace ? ' · on pace' : ' · slower than exam pace')}
            </Typography>
          </Box>

          {result.explanation && (
            <>
              <Typography component="h2" sx={{ ...libSectionTitleSx, mt: 4, mb: 1 }}>
                Solution
              </Typography>
              <Typography sx={BODY}>{result.explanation}</Typography>
            </>
          )}

          {result.shortcut && (
            <>
              <Typography component="h2" sx={{ ...libSectionTitleSx, mt: 4, mb: 1 }}>
                Exam shortcut
              </Typography>
              <Box sx={{ ...libPanelSx, p: 2 }}>
                <Typography sx={BODY}>{result.shortcut}</Typography>
              </Box>
            </>
          )}

          <Button onClick={() => (forward ? onGo(forward) : onGo(null))} fullWidth disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 4 }}>
            {forward ? (nextUnsolvedId ? 'Next unsolved' : 'Next question') : 'Back to topic'}
          </Button>
          {secondary.length > 0 && (
            <Stack direction="row" sx={{ gap: 1.5, mt: 1.5 }}>
              {secondary.map((b) => (
                <Button key={b.label} onClick={b.onClick} fullWidth disableElevation variant="contained" sx={libTintBtnSx}>
                  {b.label}
                </Button>
              ))}
            </Stack>
          )}
        </>
      )}
    </Shell>
  );
}
