import { createContext, useContext, useEffect, useState } from 'react';
import { Box, ButtonBase, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { wsSurface } from './workspaceTheme';
import { WS, mono } from './wsTokens';
import { CodeField, PaneTabs } from './wsUi';
import { LIB_ACCENT, LIB_TRACKING, libChipSx } from '../dashboard/components/libraryStyle';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';

const fmtMs = (sec) => (sec == null || Number.isNaN(parseFloat(sec)) ? null : `${Math.round(parseFloat(sec) * 1000)} ms`);
const fmtMem = (kb) => (kb ? `${(kb / 1024).toFixed(1)} MB` : null);

// The phone workspace shows the console in the Library look (ConsoleBody lib): pill chips and tabs,
// 16px rounded blocks on cream. The flag reaches the pieces below through this context, so the pair room
// (which uses the same pieces) keeps its own look.
const LibContext = createContext(false);

function LibCodeField({ label, value, tone }) {
  return (
    <Box sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
      <Typography sx={{ display: 'block', mb: 0.5, fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>{label}</Typography>
      <Box
        sx={{
          ...mono,
          fontSize: 14,
          lineHeight: 1.65,
          px: 1.5,
          py: 1,
          borderRadius: '16px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: tone === 'error' ? 'var(--jc-hard)' : 'var(--lib-text)',
          bgcolor: tone === 'error' ? tint('var(--jc-hard)', 12) : 'var(--lib-bg)',
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

function Field(props) {
  const lib = useContext(LibContext);
  return lib ? <LibCodeField {...props} /> : <CodeField {...props} />;
}

// Verdict chip shown in the console header. lib: plain tinted pill without an icon (phone workspace).
export function VerdictChip({ isRunning, result, sx, lib = false }) {
  if (lib) {
    if (!isRunning && !result) return null;
    const ok = !isRunning && result.status === 'Accepted';
    const color = isRunning ? LIB_ACCENT : ok ? DIFF_COLOR.Easy : DIFF_COLOR.Hard;
    return (
      <Typography
        noWrap
        component="span"
        sx={[
          { minWidth: 0, maxWidth: '44vw', px: '10px', py: '3px', borderRadius: 999, fontSize: 14, lineHeight: '20px', fontWeight: 500, letterSpacing: LIB_TRACKING, color, bgcolor: tint(color, 14) },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {isRunning ? 'Running…' : `${result.status} · ${result.passedCount}/${result.totalCount}`}
      </Typography>
    );
  }
  if (isRunning) return <Chip size="small" label="Running…" color="primary" variant="outlined" sx={sx} />;
  if (!result) return null;
  const ok = result.status === 'Accepted';
  return (
    <Chip
      size="small"
      icon={ok ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
      label={`${result.status} · ${result.passedCount}/${result.totalCount}`}
      color={ok ? 'success' : 'error'}
      sx={[{ fontWeight: 700, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}

// Cursor position + indent, shown at the right of the console bar.
// It listens to the editor itself so typing never re-renders the whole page.
export function EditorStatus({ editor, tabSize }) {
  const [pos, setPos] = useState({ line: 1, col: 1 });
  useEffect(() => {
    if (!editor) return undefined;
    const read = () => {
      const p = editor.getPosition();
      if (p) setPos({ line: p.lineNumber, col: p.column });
    };
    read();
    const d = editor.onDidChangeCursorPosition(read);
    return () => d.dispose();
  }, [editor]);
  return (
    <Typography noWrap sx={{ ...mono, fontSize: '0.72rem', color: 'text.secondary', flexShrink: 0 }}>
      Ln {pos.line}, Col {pos.col}
      <Box component="span" sx={{ mx: 1, opacity: 0.4 }}>
        |
      </Box>
      Spaces: {tabSize}
    </Typography>
  );
}

export function CasePill({ label, dot, active, onClick }) {
  const lib = useContext(LibContext);
  return (
    <ButtonBase
      onClick={onClick}
      sx={(t) =>
        lib
          ? libChipSx(active)
          : {
        height: 28,
        px: 1.25,
        gap: 0.75,
        flexShrink: 0,
        borderRadius: `${WS.radius}px`,
        fontSize: '0.78rem',
        fontWeight: 600,
        color: active ? t.palette.text.primary : t.palette.text.secondary,
        bgcolor: active ? wsSurface(t).raised : 'transparent',
        '&:hover': { bgcolor: active ? wsSurface(t).raised : alpha(t.palette.text.primary, 0.06) },
      }}
    >
      {dot && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dot }} />}
      {label}
    </ButtonBase>
  );
}

function Samples({ examples }) {
  const lib = useContext(LibContext);
  const [i, setI] = useState(0);
  if (!examples.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        This problem has no sample cases. Run your code to see the results.
      </Typography>
    );
  }
  const ex = examples[Math.min(i, examples.length - 1)];
  return (
    <>
      <Stack direction="row" sx={{ gap: lib ? 1 : 0.5, mb: 1.5, overflowX: 'auto' }}>
        {examples.map((_, idx) => (
          <CasePill key={idx} label={`Case ${idx + 1}`} active={idx === i} onClick={() => setI(idx)} />
        ))}
      </Stack>
      <Field label="Input" value={ex.input} />
      <Field label="Expected output" value={ex.output} />
    </>
  );
}

export function Result({ result, isSubmitView, isRunning, consoleError, activeCase, onCase }) {
  const lib = useContext(LibContext);
  if (isRunning) {
    return (
      <Box sx={{ py: 1 }}>
        <LinearProgress sx={{ borderRadius: 999, mb: 1.5 }} />
        <Typography variant="body2" color="text.secondary">
          Running your code against the test cases…
        </Typography>
      </Box>
    );
  }
  const testResults = result?.testResults ?? [];
  if (testResults.length > 0) {
    const ok = result.status === 'Accepted';
    const sel = testResults[Math.min(activeCase, testResults.length - 1)];
    const stats = [result.runtimeMs != null && `Runtime ${result.runtimeMs} ms`, fmtMem(result.memoryKb) && `Memory ${fmtMem(result.memoryKb)}`].filter(Boolean);
    return (
      <>
        <Stack direction="row" sx={{ alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.25, mb: 1.5 }}>
          <Typography sx={{ fontWeight: lib ? 700 : 800, fontSize: lib ? 20 : '1.15rem', color: ok ? 'success.main' : 'error.main' }}>{result.status}</Typography>
          <Typography variant="caption" color="text.secondary">
            {isSubmitView ? 'Submission' : 'Sample run'} · {result.passedCount}/{result.totalCount} test cases passed
          </Typography>
          {stats.map((s) => (
            <Typography key={s} variant="caption" color="text.secondary">
              {s}
            </Typography>
          ))}
        </Stack>

        {result.status === 'Compilation Error' && sel?.stderr && <Field label="Compiler output" value={sel.stderr} tone="error" />}

        <Stack direction="row" sx={{ gap: lib ? 1 : 0.5, mb: 1.5, overflowX: 'auto' }}>
          {testResults.map((r, i) => (
            <CasePill key={i} label={`Case ${i + 1}`} dot={r.passed ? 'var(--jc-easy)' : 'var(--jc-hard)'} active={i === activeCase} onClick={() => onCase(i)} />
          ))}
        </Stack>

        {sel && (
          <>
            <Field label="Input" value={sel.stdin} />
            <Field label="Your output" value={sel.actualOutput || '—'} tone={sel.passed ? undefined : 'error'} />
            <Field label="Expected output" value={sel.expectedOutput} />
            {sel.stderr && result.status !== 'Compilation Error' && <Field label="Error" value={sel.stderr} tone="error" />}
            {(fmtMs(sel.time) || sel.memory) && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {[fmtMs(sel.time) && `Time ${fmtMs(sel.time)}`, fmtMem(sel.memory) && `Memory ${fmtMem(sel.memory)}`].filter(Boolean).join(' · ')}
              </Typography>
            )}
          </>
        )}
      </>
    );
  }
  if (consoleError) {
    return (
      <Box sx={(t) => ({ p: 1.5, borderRadius: `${WS.radius}px`, color: 'error.main', bgcolor: alpha(t.palette.error.main, 0.1) })}>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
          {isSubmitView ? 'Submit failed' : 'Run failed'}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {consoleError}
        </Typography>
      </Box>
    );
  }
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, py: 1, color: 'text.secondary' }}>
      {!lib && <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
      <Typography variant="body2">Run your code to see the results here.</Typography>
    </Stack>
  );
}

// Console body: "Testcase" (the problem's sample cases) and "Result" tabs.
// lib: the phone workspace look (pill tabs, rounded blocks on cream).
export function ConsoleBody({ problem, isRunning, result, isSubmitView, consoleError, tab, onTab, activeCase, onCase, lib = false }) {
  const hasResult = Boolean(result?.testResults?.length);
  const dot = isRunning ? undefined : hasResult ? (result.status === 'Accepted' ? 'var(--jc-easy)' : 'var(--jc-hard)') : undefined;
  return (
    <LibContext.Provider value={lib}>
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ px: lib ? 2 : 1.25, pb: lib ? 1.5 : 0.75, flexShrink: 0 }}>
          {lib ? (
            <Stack direction="row" role="tablist" sx={{ gap: 1 }}>
              {[
                { value: 'cases', label: 'Testcase' },
                { value: 'result', label: 'Result', dot },
              ].map((it) => (
                <ButtonBase key={it.value} role="tab" aria-selected={it.value === tab} onClick={() => onTab(it.value)} sx={libChipSx(it.value === tab)}>
                  {it.label}
                  {it.dot && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: it.dot }} />}
                </ButtonBase>
              ))}
            </Stack>
          ) : (
            <PaneTabs
              size="sm"
              value={tab}
              onChange={onTab}
              items={[
                { value: 'cases', label: 'Testcase' },
                { value: 'result', label: 'Result', dot },
              ]}
            />
          )}
        </Box>
        <Box sx={{ overflowY: 'auto', px: lib ? 2 : 1.75, pb: lib ? 2 : 1.75, flex: 1, minHeight: 0 }}>
          {tab === 'cases' ? (
            <Samples examples={problem.examples ?? []} />
          ) : (
            <Result result={result} isSubmitView={isSubmitView} isRunning={isRunning} consoleError={consoleError} activeCase={activeCase} onCase={onCase} />
          )}
        </Box>
      </Stack>
    </LibContext.Provider>
  );
}
