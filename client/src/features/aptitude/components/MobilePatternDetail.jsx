import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, ButtonBase, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { DIFF_COLOR, tint } from '../../dashboard/dashboardUtils';
import { HeaderTile, LIB_TRACKING, LibraryFont, libBackBtnSx, libChipSx, libPanelSx, libSectionTitleSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { formatDuration } from './aptitudeUi';

// Phone layout of a single Aptitude topic (for example Number System). It follows the phone Problems and
// Aptitude pages: same page padding, back button, centred header, progress bar, row sizes and type scale.
// It only shows what a learner needs: overall progress, the three ways to study, topics and past tests.

const ROW_TITLE = { fontWeight: 500, fontSize: 18, lineHeight: '28px', letterSpacing: LIB_TRACKING };
const ROW_META = { fontSize: 15, lineHeight: '20px', letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums' };

const accuracyColor = (acc) => (acc == null ? 'var(--lib-muted)' : acc >= 75 ? DIFF_COLOR.Easy : acc >= 50 ? DIFF_COLOR.Medium : DIFF_COLOR.Hard);

// Tappable row: title and one status line on the left, optional value and a chevron on the right.
function Row({ title, meta, metaColor, value, valueColor, disabled, solved, onClick, divider = true }) {
  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '10px',
        py: 2,
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        opacity: disabled ? 0.5 : 1,
        borderBottom: divider ? '1px solid var(--lib-divider)' : 'none',
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Typography noWrap sx={{ ...ROW_TITLE, minWidth: 0 }}>
            {title}
          </Typography>
          {solved && <CheckCircleRoundedIcon aria-label="Completed" sx={{ fontSize: 20, color: DIFF_COLOR.Easy, flexShrink: 0 }} />}
        </Stack>
        <Typography noWrap sx={{ ...ROW_META, mt: 0.5, color: metaColor || 'var(--lib-muted)' }}>
          {meta}
        </Typography>
      </Box>
      {value != null && (
        <Typography component="span" sx={{ ...ROW_META, flexShrink: 0, color: valueColor || 'var(--lib-muted)' }}>
          {value}
        </Typography>
      )}
      {!disabled && <ChevronRightRoundedIcon aria-hidden sx={{ fontSize: 22, color: 'var(--lib-muted)', flexShrink: 0 }} />}
    </ButtonBase>
  );
}

function Shell({ children }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>{children}</Box>
    </LibraryFont>
  );
}

function BackButton() {
  return (
    <IconButton component={RouterLink} to="/aptitude" aria-label="Back to Aptitude" sx={libBackBtnSx}>
      <ArrowBackRoundedIcon />
    </IconButton>
  );
}

export function MobilePatternSkeleton() {
  return (
    <Shell>
      <BackButton />
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <Skeleton variant="rounded" width={81} height={81} sx={{ mx: 'auto', borderRadius: '22px' }} />
        <Skeleton width={180} height={32} sx={{ mx: 'auto', mt: 1.5 }} />
        <Skeleton width={120} height={24} sx={{ mx: 'auto' }} />
      </Box>
      <Skeleton variant="rounded" height={190} sx={{ mt: 3, borderRadius: '20px' }} />
    </Shell>
  );
}

export function MobilePatternError({ message }) {
  return (
    <Shell>
      <BackButton />
      <Alert severity="error" sx={{ mt: 2 }}>
        {message}
      </Alert>
    </Shell>
  );
}

export default function MobilePatternDetail({
  slug,
  data,
  error,
  hasLearn,
  learnLine,
  learnDone,
  learnTotal,
  testLine,
  practiceLine,
  onLearn,
  onPractice,
  onTest,
  onOpenAttempt,
  onOpenBookmarks,
}) {
  const pal = useLibraryPalette();
  const { pattern, progress, practice, recentAttempts, activeTest } = data;
  const { totals, bySubPattern, bookmarkedCount } = practice;
  const bestPassed = progress.bestScore >= pattern.passPercentage;
  const solvedPct = totals.total ? Math.min((totals.solved / totals.total) * 100, 100) : 0;

  return (
    <Shell>
      <BackButton />

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 1.5 }}>
        <HeaderTile>
          <CalculateRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
        </HeaderTile>
        <Typography
          component="h1"
          sx={{ mt: 1.5, fontWeight: 700, fontSize: 26, lineHeight: '32px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {pattern.title}
        </Typography>
        <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: LIB_TRACKING, color: pal.muted }}>{pattern.category || 'Aptitude'}</Typography>

        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5 }}>
          <Box
            role="progressbar"
            aria-label="Questions solved"
            aria-valuemin={0}
            aria-valuemax={totals.total}
            aria-valuenow={totals.solved}
            sx={{ width: 162, height: 8, borderRadius: 99, bgcolor: tint('#F2B63C', 28), overflow: 'hidden' }}
          >
            <Box sx={{ width: `${solvedPct}%`, height: '100%', borderRadius: 99, bgcolor: '#F2B63C', transition: 'width .5s' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 20, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            {totals.solved}
            <Box component="span" sx={{ color: pal.muted, fontWeight: 400 }}>
              /{totals.total}
            </Box>
          </Typography>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Study options */}
      <Box component="section" aria-label="Study options" sx={{ ...libPanelSx, mt: 3, px: 2 }}>
        <Row title="Learn" meta={learnLine} disabled={!hasLearn} solved={learnTotal > 0 && learnDone === learnTotal} onClick={onLearn} />
        <Row title="Practice" meta={practiceLine} solved={totals.total > 0 && totals.solved === totals.total} onClick={onPractice} />
        <Row
          title="Test"
          meta={testLine}
          metaColor={activeTest ? 'var(--lib-text)' : undefined}
          solved={!activeTest && bestPassed}
          onClick={onTest}
          divider={false}
        />
      </Box>

      {/* Topics */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 4, mb: 0.5 }}>
        <Typography component="h2" sx={libSectionTitleSx}>
          Topics
        </Typography>
        {bookmarkedCount > 0 && (
          <ButtonBase onClick={onOpenBookmarks} aria-label={`Bookmarked questions: ${bookmarkedCount}`} sx={libChipSx(false)}>
            Bookmarked · {bookmarkedCount}
          </ButtonBase>
        )}
      </Stack>
      <Box sx={{ borderTop: '1px solid var(--lib-divider)' }}>
        {bySubPattern.map((sp) => {
          const empty = sp.total === 0;
          return (
            <Row
              key={sp.slug}
              title={sp.title}
              meta={empty ? 'Coming soon' : `${sp.solved}/${sp.total} solved`}
              value={empty || sp.accuracy == null ? null : `${sp.accuracy}%`}
              valueColor={accuracyColor(sp.accuracy)}
              disabled={empty}
              solved={!empty && sp.solved === sp.total}
              onClick={() => onPractice(sp.slug)}
            />
          );
        })}
      </Box>

      {/* Recent tests */}
      {recentAttempts.length > 0 && (
        <>
          <Typography component="h2" sx={{ ...libSectionTitleSx, mt: 4, mb: 0.5 }}>
            Recent tests
          </Typography>
          <Box sx={{ borderTop: '1px solid var(--lib-divider)' }}>
            {recentAttempts.map((a) => {
              const passed = a.score >= pattern.passPercentage;
              const color = passed ? DIFF_COLOR.Easy : DIFF_COLOR.Hard;
              return (
                <Row
                  key={a._id}
                  title={`${a.correctCount}/${a.totalCount} correct`}
                  meta={`${new Date(a.createdAt).toLocaleDateString()} · ${formatDuration(a.timeTakenSec)}`}
                  value={`${a.score}%`}
                  valueColor={color}
                  onClick={() => onOpenAttempt(a._id)}
                />
              );
            })}
          </Box>
        </>
      )}
    </Shell>
  );
}
