import { useContext } from 'react';
import { Avatar, Badge, Box, ButtonBase, Button, Chip, LinearProgress, Stack, TextField, Tooltip, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { CasePill, ConsoleField, LibContext, Result } from '../workspace/ConsolePanel';
import { LIB_ACCENT, LIB_TRACKING, libChipSx, libTintBtnSx } from '../dashboard/components/libraryStyle';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import { CodeField, PaneTabs, WsButton } from '../workspace/wsUi';
import { wsSurface } from '../workspace/workspaceTheme';
import { WS, mono } from '../workspace/wsTokens';

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
// lib: plain tinted pill without an icon (phone pair room).
export function RunChip({ running, result, sx, lib = false }) {
  if (lib) {
    if (!running && !result) return null;
    const color = running ? LIB_ACCENT : result.ok ? DIFF_COLOR.Easy : DIFF_COLOR.Hard;
    return (
      <Typography
        noWrap
        component="span"
        sx={[
          { minWidth: 0, maxWidth: '44vw', px: '10px', py: '3px', borderRadius: 999, fontSize: 14, lineHeight: '20px', fontWeight: 500, letterSpacing: LIB_TRACKING, color, bgcolor: tint(color, 14) },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {running ? 'Running…' : result.status}
      </Typography>
    );
  }
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
  const lib = useContext(LibContext);
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
        {!lib && <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
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
        <Typography sx={{ fontWeight: lib ? 700 : 800, fontSize: lib ? 20 : '1.15rem', color: result.ok ? 'success.main' : 'error.main' }}>{result.status}</Typography>
        {meta.map((m) => (
          <Typography key={m} variant="caption" color="text.secondary">
            {m}
          </Typography>
        ))}
      </Stack>
      {(out || !err) && <ConsoleField label="Output" value={out || '(no output)'} />}
      {err && <ConsoleField label="Error" value={err} tone="error" />}
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
  lib = false, // phone pair room: pill tabs, rounded blocks on cream
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
    <LibContext.Provider value={lib}>
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Box sx={{ px: lib ? 2 : 1.25, pb: lib ? 1.5 : 0.75, flexShrink: 0 }}>
        {lib ? (
          <Stack direction="row" role="tablist" sx={{ gap: 1, overflowX: 'auto' }}>
            {items.map((it) => (
              <ButtonBase key={it.value} role="tab" aria-selected={it.value === tab} onClick={() => onTab(it.value)} sx={libChipSx(it.value === tab)}>
                {it.label}
                {it.dot && <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: it.dot }} />}
              </ButtonBase>
            ))}
          </Stack>
        ) : (
          <PaneTabs size="sm" value={tab} onChange={onTab} items={items} />
        )}
      </Box>
      <Box sx={{ overflowY: 'auto', px: lib ? 2 : 1.75, pb: lib ? 2 : 1.75, flex: 1, minHeight: 0 }}>
        {tab === 'cases' && (
          <>
            <Stack direction="row" sx={{ gap: lib ? 1 : 0.5, mb: 1.5, overflowX: 'auto' }}>
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
                  input: {
                    sx: (t) =>
                      lib
                        ? { ...mono, fontSize: 14, lineHeight: 1.65, borderRadius: '16px', bgcolor: 'var(--lib-bg)', '& fieldset': { border: 'none' } }
                        : { ...mono, fontSize: '0.8rem', lineHeight: 1.65, borderRadius: `${WS.radius}px`, bgcolor: wsSurface(t).raised, '& fieldset': { border: 'none' } },
                  },
                }}
              />
            ) : (
              <>
                <ConsoleField label="Input" value={ex.input} />
                <ConsoleField label="Expected output" value={ex.output} />
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
              {lib ? (
                <Button disableElevation onClick={onSignIn} sx={{ ...libTintBtnSx, bgcolor: 'var(--lib-bg)', height: 36, px: 2, fontSize: 15 }}>
                  Sign in
                </Button>
              ) : (
                <WsButton variant="secondary" onClick={onSignIn}>
                  Sign in
                </WsButton>
              )}
            </Stack>
          ) : !sub.result && sub.status === 'idle' && !sub.error ? (
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, py: 1, color: 'text.secondary' }}>
              {!lib && <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
              <Typography variant="body2">Submit to see your verdict here. It counts for your account only.</Typography>
            </Stack>
          ) : (
            <Result result={sub.result} isSubmitView isRunning={sub.status === 'running'} consoleError={sub.error} activeCase={activeCase} onCase={onCase} />
          ))}
      </Box>
    </Stack>
    </LibContext.Provider>
  );
}
