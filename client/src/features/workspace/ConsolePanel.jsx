import { useEffect, useState } from 'react';
import { Box, ButtonBase, Chip, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { wsSurface } from './workspaceTheme';
import { WS, mono } from './wsTokens';
import { CodeField, PaneTabs } from './wsUi';

const fmtMs = (sec) => (sec == null || Number.isNaN(parseFloat(sec)) ? null : `${Math.round(parseFloat(sec) * 1000)} ms`);
const fmtMem = (kb) => (kb ? `${(kb / 1024).toFixed(1)} MB` : null);

// Verdict chip shown in the console header.
export function VerdictChip({ isRunning, result, sx }) {
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

function CasePill({ label, dot, active, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={(t) => ({
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
      })}
    >
      {dot && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: dot }} />}
      {label}
    </ButtonBase>
  );
}

function Samples({ examples }) {
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
      <Stack direction="row" sx={{ gap: 0.5, mb: 1.5, overflowX: 'auto' }}>
        {examples.map((_, idx) => (
          <CasePill key={idx} label={`Case ${idx + 1}`} active={idx === i} onClick={() => setI(idx)} />
        ))}
      </Stack>
      <CodeField label="Input" value={ex.input} />
      <CodeField label="Expected output" value={ex.output} />
    </>
  );
}

function Result({ result, isSubmitView, isRunning, consoleError, activeCase, onCase }) {
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
          <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: ok ? 'success.main' : 'error.main' }}>{result.status}</Typography>
          <Typography variant="caption" color="text.secondary">
            {isSubmitView ? 'Submission' : 'Sample run'} · {result.passedCount}/{result.totalCount} test cases passed
          </Typography>
          {stats.map((s) => (
            <Typography key={s} variant="caption" color="text.secondary">
              {s}
            </Typography>
          ))}
        </Stack>

        {result.status === 'Compilation Error' && sel?.stderr && <CodeField label="Compiler output" value={sel.stderr} tone="error" />}

        <Stack direction="row" sx={{ gap: 0.5, mb: 1.5, overflowX: 'auto' }}>
          {testResults.map((r, i) => (
            <CasePill key={i} label={`Case ${i + 1}`} dot={r.passed ? 'var(--jc-easy)' : 'var(--jc-hard)'} active={i === activeCase} onClick={() => onCase(i)} />
          ))}
        </Stack>

        {sel && (
          <>
            <CodeField label="Input" value={sel.stdin} />
            <CodeField label="Your output" value={sel.actualOutput || '—'} tone={sel.passed ? undefined : 'error'} />
            <CodeField label="Expected output" value={sel.expectedOutput} />
            {sel.stderr && result.status !== 'Compilation Error' && <CodeField label="Error" value={sel.stderr} tone="error" />}
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
      <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />
      <Typography variant="body2">Run your code to see the results here.</Typography>
    </Stack>
  );
}

// Console body: "Testcase" (the problem's sample cases) and "Result" tabs.
export function ConsoleBody({ problem, isRunning, result, isSubmitView, consoleError, tab, onTab, activeCase, onCase }) {
  const hasResult = Boolean(result?.testResults?.length);
  const dot = isRunning ? undefined : hasResult ? (result.status === 'Accepted' ? 'var(--jc-easy)' : 'var(--jc-hard)') : undefined;
  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 1.25, pb: 0.75, flexShrink: 0 }}>
        <PaneTabs
          size="sm"
          value={tab}
          onChange={onTab}
          items={[
            { value: 'cases', label: 'Testcase' },
            { value: 'result', label: 'Result', dot },
          ]}
        />
      </Box>
      <Box sx={{ overflowY: 'auto', px: 1.75, pb: 1.75, flex: 1, minHeight: 0 }}>
        {tab === 'cases' ? (
          <Samples examples={problem.examples ?? []} />
        ) : (
          <Result result={result} isSubmitView={isSubmitView} isRunning={isRunning} consoleError={consoleError} activeCase={activeCase} onCase={onCase} />
        )}
      </Box>
    </Stack>
  );
}
