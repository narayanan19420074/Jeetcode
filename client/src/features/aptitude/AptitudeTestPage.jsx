import { useSelector } from 'react-redux';
import { Alert, Box, Button, CircularProgress, Drawer, Stack, Typography, useMediaQuery, ThemeProvider } from '@mui/material';
import { getTheme } from '../../app/theme';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, MEDIA_QUERIES } from '../../app/design/designTokens';
import useExamSession from './exam/useExamSession';
import ExamHeader from './exam/ExamHeader';
import ExamQuestionPane from './exam/ExamQuestionPane';
import ExamCalculator from './exam/ExamCalculator';
import ExamSummaryDialog from './exam/ExamSummaryDialog';
import PalettePanel from './exam/PalettePanel';

// Exam-style interface. Session logic (autosave, server-clock countdown,
// resume) lives in exam/useExamSession; this file only lays the screen out.

// Below this many seconds the countdown turns red so the learner notices.
const LOW_TIME_SECONDS = 300;

function ExamInterface() {
  const exam = useExamSession();
  const user = useSelector((s) => s.auth.user);
  const compact = useMediaQuery(MEDIA_QUERIES.compactTestLayout);
  const { navigate, slug, paper, questions, current, error, setError, remaining, idx, states, counts } = exam;

  if (error && !paper) {
    return (
      <Box sx={{ p: 4, maxWidth: 520, mx: 'auto' }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate(`/aptitude/${slug}`)}>Back</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }
  if (!paper || !current) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const palette = (
    <PalettePanel user={user} questions={questions} states={states} idx={idx} counts={counts} onJump={exam.goTo} onSubmit={() => exam.setConfirmOpen(true)} submitting={exam.submitting} />
  );

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: COLOR_PALETTE.slate[100], color: 'text.primary' }}>
      <ExamHeader
        saveState={exam.saveState}
        calcOpen={exam.calcOpen}
        onToggleCalc={() => exam.setCalcOpen((v) => !v)}
        isFull={exam.isFull}
        onToggleFull={exam.toggleFull}
        compact={compact}
        onOpenPalette={() => exam.setPaletteOpen(true)}
        low={remaining != null && remaining <= LOW_TIME_SECONDS}
        remaining={remaining}
      />

      {/* Section strip */}
      <Stack direction="row" sx={{ alignItems: 'center', bgcolor: COLOR_PALETTE.white, borderBottom: '1px solid', borderColor: 'divider', px: { xs: 1.5, sm: 2.5 }, height: 40, flexShrink: 0 }}>
        <Box sx={{ px: 1.5, py: 0.5, bgcolor: COLOR_PALETTE.blue[600], color: COLOR_PALETTE.white, borderRadius: RADII_PX.control, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>Quantitative Aptitude</Box>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          {questions.length} questions · +1 for correct · no negative marking
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <ExamQuestionPane
          current={current}
          cur={exam.cur}
          idx={idx}
          total={questions.length}
          setsById={exam.setsById}
          onSelect={exam.select}
          onUnmark={exam.unmark}
          onMarkNext={exam.markNext}
          onClear={exam.clearResponse}
          onGoTo={exam.goTo}
          onSaveNext={exam.saveNext}
        />
        {/* Palette column (desktop) */}
        {!compact && <Box sx={{ width: 320, flexShrink: 0, borderLeft: '1px solid', borderColor: 'divider' }}>{palette}</Box>}
      </Box>

      {/* Palette drawer (small screens) */}
      <Drawer anchor="right" open={compact && exam.paletteOpen} onClose={() => exam.setPaletteOpen(false)} PaperProps={{ sx: { width: 'min(340px, 92vw)' } }}>
        {palette}
      </Drawer>

      {exam.calcOpen && <ExamCalculator compact={compact} onClose={() => exam.setCalcOpen(false)} />}

      <ExamSummaryDialog open={exam.confirmOpen} onClose={() => exam.setConfirmOpen(false)} onSubmit={exam.submit} total={questions.length} counts={counts} remaining={remaining} />
    </Box>
  );
}

// The exam always renders in the light "exam hall" theme, whatever mode the
// rest of the app is in — fixed colours (white paper, navy header) must stay
// legible, exactly like a real exam screen.
const examTheme = getTheme('light');

export default function AptitudeTestPage() {
  return (
    <ThemeProvider theme={examTheme}>
      <ExamInterface />
    </ThemeProvider>
  );
}
