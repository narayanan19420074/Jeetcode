import { Avatar, Badge, Box, ButtonBase, Chip, LinearProgress, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { formatClock } from '../workspace/useStopwatch';
import { CasePill, Result } from '../workspace/ConsolePanel';
import { CodeField, PaneTabs, WsButton, WsIconButton } from '../workspace/wsUi';
import { wsSurface } from '../workspace/workspaceTheme';
import { WS, mono } from '../workspace/wsTokens';

// Scrollbars stay invisible until the pointer is over the scrollable area
// (same behaviour as the workspace page).
export const hoverScrollbars = (t) => {
  const thumb = alpha(t.palette.text.primary, 0.35);
  return {
    '& *': { scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' },
    '& *:hover': { scrollbarColor: `${thumb} transparent` },
    '& *::-webkit-scrollbar': { width: 8, height: 8 },
    '& *::-webkit-scrollbar-track': { background: 'transparent' },
    '& *::-webkit-scrollbar-thumb': { backgroundColor: 'transparent', borderRadius: 8 },
    '& *:hover::-webkit-scrollbar-thumb': { backgroundColor: thumb },
    '& .monaco-scrollable-element > .scrollbar > .slider': { opacity: 0, transition: 'opacity .2s' },
    '& .monaco-editor:hover .monaco-scrollable-element > .scrollbar > .slider': { opacity: 1 },
  };
};

// Practice timer (personal, not shared): tap the clock to start, tap the time to pause.
export function TimerControl({ sw, size = 'md' }) {
  const h = size === 'lg' ? WS.ctrlLg : WS.ctrl;
  if (!sw.running && sw.seconds === 0) {
    return (
      <WsIconButton title="Start timer" size={size} onClick={sw.start}>
        <TimerOutlinedIcon />
      </WsIconButton>
    );
  }
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25 }}>
      <ButtonBase
        onClick={sw.running ? sw.pause : sw.start}
        aria-label={sw.running ? 'Pause timer' : 'Resume timer'}
        sx={(t) => ({
          height: h,
          px: 1.1,
          gap: 0.6,
          borderRadius: `${WS.radius}px`,
          color: sw.running ? t.palette.primary.main : t.palette.text.secondary,
          bgcolor: sw.running ? alpha(t.palette.primary.main, 0.12) : wsSurface(t).raised,
          '& svg': { fontSize: 17 },
        })}
      >
        {sw.running ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        <Typography sx={{ ...mono, fontSize: '0.8rem', fontWeight: 600, color: 'inherit' }}>{formatClock(sw.seconds)}</Typography>
      </ButtonBase>
      <WsIconButton title="Reset timer" size={size} onClick={sw.reset}>
        <RestartAltRoundedIcon sx={{ fontSize: '17px !important' }} />
      </WsIconButton>
    </Stack>
  );
}

const initialOf = (name) => (name || '').trim()[0]?.toUpperCase() || '?';

// Who is in the room: you + your friend(s). Green dot = connected right now.
export function PresenceStack({ meName, peers }) {
  const title = peers.length
    ? `${peers.map((p) => p.name).join(', ')} ${peers.length > 1 ? 'are' : 'is'} here`
    : 'Waiting for a friend to join';
  const ring = (t) => ({ border: '2px solid', borderColor: wsSurface(t).chrome, boxSizing: 'content-box' });
  return (
    <Tooltip title={title}>
      <Stack direction="row" aria-label={title} sx={{ alignItems: 'center', px: 0.5, flexShrink: 0 }}>
        <Avatar
          sx={(t) => ({ ...ring(t), width: 24, height: 24, fontSize: '0.75rem', fontWeight: 700, bgcolor: wsSurface(t).raised, color: 'text.primary' })}
        >
          {initialOf(meName)}
        </Avatar>
        {peers.slice(0, 3).map((p) => (
          <Badge
            key={p.id}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            color="success"
            sx={(t) => ({
              ml: -0.75,
              '& .MuiBadge-badge': { width: 9, height: 9, minWidth: 0, borderRadius: '50%', border: '2px solid', borderColor: wsSurface(t).chrome, boxSizing: 'content-box' },
            })}
          >
            <Avatar sx={(t) => ({ ...ring(t), width: 24, height: 24, fontSize: '0.75rem', fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' })}>
              {initialOf(p.name)}
            </Avatar>
          </Badge>
        ))}
        {peers.length === 0 && (
          <Avatar sx={(t) => ({ ...ring(t), ml: -0.75, width: 24, height: 24, bgcolor: 'transparent', color: 'text.disabled', outline: `1px dashed ${t.palette.text.disabled}`, outlineOffset: -3 })}>
            <PersonOutlineRoundedIcon sx={{ fontSize: 16 }} />
          </Avatar>
        )}
      </Stack>
    </Tooltip>
  );
}

// Verdict chip for a shared run (the submit verdict uses VerdictChip from the workspace).
export function RunChip({ running, result, sx }) {
  if (running) return <Chip size="small" label="Running…" color="primary" variant="outlined" sx={sx} />;
  if (!result) return null;
  return (
    <Chip
      size="small"
      icon={result.ok ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
      label={result.status}
      color={result.ok ? 'success' : 'error'}
      sx={[{ fontWeight: 700, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}

function RunOutput({ running, result }) {
  if (running) {
    return (
      <Box sx={{ py: 1 }}>
        <LinearProgress sx={{ borderRadius: 999, mb: 1.5 }} />
        <Typography variant="body2" color="text.secondary">
          Running the shared code…
        </Typography>
      </Box>
    );
  }
  if (!result) {
    return (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, py: 1, color: 'text.secondary' }}>
        <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />
        <Typography variant="body2">Run the code to see the output here. Both of you see the result.</Typography>
      </Stack>
    );
  }
  const out = (result.stdout || '').trim();
  const err = (result.stderr || '').trim();
  const meta = [result.by && `Run by ${result.by}`, result.time != null && result.time !== '' && `${Math.round(parseFloat(result.time) * 1000)} ms`].filter(Boolean);
  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.25, mb: 1.5 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: result.ok ? 'success.main' : 'error.main' }}>{result.status}</Typography>
        {meta.map((m) => (
          <Typography key={m} variant="caption" color="text.secondary">
            {m}
          </Typography>
        ))}
      </Stack>
      {(out || !err) && <CodeField label="Output" value={out || '(no output)'} />}
      {err && <CodeField label="Error" value={err} tone="error" />}
    </>
  );
}

// Console body: Testcase (sample cases / custom input) | Output (shared run) | Submission (your own submit).
export function RoomConsoleBody({
  problem,
  hasProblem,
  isAuthenticated,
  tab,
  onTab,
  caseSel,
  onCaseSel,
  customStdin,
  onCustomStdin,
  running,
  runResult,
  sub,
  activeCase,
  onCase,
  onSignIn,
}) {
  const examples = problem?.examples ?? [];
  const custom = caseSel === 'custom' || examples.length === 0;
  const ex = custom ? null : examples[Math.min(caseSel, examples.length - 1)];
  const okDot = 'var(--jc-easy)';
  const badDot = 'var(--jc-hard)';
  const runDot = running ? undefined : runResult ? (runResult.ok ? okDot : badDot) : undefined;
  const subDot = sub.result ? (sub.result.status === 'Accepted' ? okDot : badDot) : undefined;
  const items = [
    { value: 'cases', label: 'Testcase' },
    { value: 'run', label: 'Output', dot: runDot },
    ...(hasProblem ? [{ value: 'submit', label: 'Submission', dot: subDot }] : []),
  ];

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 1.25, pb: 0.75, flexShrink: 0 }}>
        <PaneTabs size="sm" value={tab} onChange={onTab} items={items} />
      </Box>
      <Box sx={{ overflowY: 'auto', px: 1.75, pb: 1.75, flex: 1, minHeight: 0 }}>
        {tab === 'cases' && (
          <>
            <Stack direction="row" sx={{ gap: 0.5, mb: 1.5, overflowX: 'auto' }}>
              {examples.map((_, i) => (
                <CasePill key={i} label={`Case ${i + 1}`} active={!custom && caseSel === i} onClick={() => onCaseSel(i)} />
              ))}
              <CasePill label="Custom" active={custom} onClick={() => onCaseSel('custom')} />
            </Stack>
            {custom ? (
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={10}
                placeholder="Input (stdin)"
                value={customStdin}
                onChange={(e) => onCustomStdin(e.target.value)}
                slotProps={{
                  htmlInput: { 'aria-label': 'stdin' },
                  input: { sx: (t) => ({ ...mono, fontSize: '0.8rem', lineHeight: 1.65, borderRadius: `${WS.radius}px`, bgcolor: wsSurface(t).raised, '& fieldset': { border: 'none' } }) },
                }}
              />
            ) : (
              <>
                <CodeField label="Input" value={ex.input} />
                <CodeField label="Expected output" value={ex.output} />
              </>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
              Run uses this input and shows the output to both of you.
            </Typography>
          </>
        )}

        {tab === 'run' && <RunOutput running={running} result={runResult} />}

        {tab === 'submit' &&
          (!isAuthenticated ? (
            <Stack sx={{ alignItems: 'flex-start', gap: 1, py: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Sign in to submit. Submissions are saved to your own account and streak.
              </Typography>
              <WsButton variant="secondary" onClick={onSignIn}>
                Sign in
              </WsButton>
            </Stack>
          ) : !sub.result && sub.status === 'idle' && !sub.error ? (
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, py: 1, color: 'text.secondary' }}>
              <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />
              <Typography variant="body2">Submit to see your verdict here. It counts for your account only.</Typography>
            </Stack>
          ) : (
            <Result result={sub.result} isSubmitView isRunning={sub.status === 'running'} consoleError={sub.error} activeCase={activeCase} onCase={onCase} />
          ))}
      </Box>
    </Stack>
  );
}
