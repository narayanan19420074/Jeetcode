import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { useSnackbar } from 'notistack';
import {
  Box, Stack, Typography, Button, IconButton, Select, MenuItem, Chip, TextField, Tooltip, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, useMediaQuery, useTheme,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { problemsApi } from '../../api/problemsApi';
import { setLanguage, updateCode } from '../workspace/workspaceSlice';
import { bindMonaco } from './monacoYjs';
import { useRoom } from './useRoom';
import { useCall } from './useCall';
import CallPanel from './CallPanel';
import ChatPanel from './ChatPanel';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
];

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  const [guestName, setGuestName] = useState(() => localStorage.getItem('jc-guest-name') || '');
  const [nameDraft, setNameDraft] = useState('');
  const displayName = isAuthenticated ? user?.handle || user?.name || user?.username || 'Member' : guestName;

  const room = useRoom({ roomId, displayName });
  const call = useCall(room.socket);

  const [tab, setTab] = useState('code');
  const [stdin, setStdin] = useState('');
  const [problem, setProblem] = useState(null);

  const slug = room.meta?.problemSlug;
  useEffect(() => {
    if (!slug) return;
    problemsApi.getBySlug(slug).then(({ data }) => setProblem(data.data)).catch(() => {});
  }, [slug]);

  const disposeRef = useRef(null);
  const handleMount = useCallback(
    (editor, monaco) => {
      disposeRef.current?.();
      disposeRef.current = bindMonaco(editor, monaco, room.doc.getText('code'));
    },
    [room.doc]
  );
  useEffect(() => () => disposeRef.current?.(), []);

  const inviteLink = `${window.location.origin}/room/${roomId}`;
  const copyLink = async () => {
    try {
      if (navigator.share && isMobile) await navigator.share({ title: 'JeetCode pair room', url: inviteLink });
      else {
        await navigator.clipboard.writeText(inviteLink);
        enqueueSnackbar('Invite link copied', { variant: 'success' });
      }
    } catch {
      enqueueSnackbar(inviteLink, { variant: 'info' });
    }
  };

  const testInWorkspace = () => {
    if (!problem) return;
    dispatch(updateCode({ problemId: problem._id, language: room.language, code: room.doc.getText('code').toString() }));
    dispatch(setLanguage(room.language));
    navigate(`/workspace/${problem.slug}`);
  };

  const leave = () => navigate(isAuthenticated ? '/dashboard' : '/');

  // --- name gate (guests) ---
  if (!displayName) {
    const go = () => {
      const n = nameDraft.trim().slice(0, 30);
      if (!n) return;
      localStorage.setItem('jc-guest-name', n);
      setGuestName(n);
    };
    return (
      <Dialog open fullWidth maxWidth="xs">
        <DialogTitle>Room la join aaga un peyar?</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth margin="dense" label="Your name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" disableElevation onClick={go} disabled={!nameDraft.trim()}>Join</Button>
        </DialogActions>
      </Dialog>
    );
  }

  if (room.status === 'error') {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: '100vh', p: 3, textAlign: 'center' }}>
        <Typography variant="h6">{room.error}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" disableElevation onClick={() => navigate('/pair')}>New room</Button>
          <Button onClick={leave}>Home</Button>
        </Stack>
      </Stack>
    );
  }

  if (!room.meta) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  const friend = room.peers[0];
  const showTab = (t) => !isMobile || tab === t;

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* top bar */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap', rowGap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {room.meta.title || 'Pair room'}
        </Typography>
        <Chip size="small" label={`#${roomId}`} />
        <Select size="small" value={room.language} onChange={(e) => room.changeLanguage(e.target.value)} sx={{ minWidth: 120 }}>
          {LANGUAGES.map((l) => (
            <MenuItem key={l.id} value={l.id}>{l.label}</MenuItem>
          ))}
        </Select>
        <Chip size="small" color="primary" variant="outlined" label={`${room.me?.name} (you)`} />
        {friend ? <Chip size="small" color="success" label={friend.name} /> : <Chip size="small" label="Waiting for friend…" />}
        {room.status === 'reconnecting' && <Chip size="small" color="warning" label="Reconnecting…" />}
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" startIcon={<LinkRoundedIcon />} onClick={copyLink}>Invite</Button>
        <Tooltip title="Leave room">
          <IconButton size="small" onClick={leave}><LogoutRoundedIcon /></IconButton>
        </Tooltip>
      </Stack>

      {isMobile && (
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab value="code" label="Code" />
          <Tab value="call" label="Call & Chat" />
          {problem && <Tab value="problem" label="Problem" />}
        </Tabs>
      )}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {/* problem statement (problem rooms) */}
        {problem && showTab('problem') && (
          <Box sx={{ width: isMobile ? '100%' : 320, overflow: 'auto', p: 2, borderRight: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{problem.title}</Typography>
            <Typography variant="caption" color="text.secondary">{problem.difficulty}</Typography>
            <Typography sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }} variant="body2">{problem.description}</Typography>
            {(problem.examples || []).map((ex, i) => (
              <Box key={i} sx={{ mt: 1.5, p: 1, borderRadius: 1, bgcolor: 'action.hover', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
                {`Input: ${ex.input}\nOutput: ${ex.output}`}
              </Box>
            ))}
          </Box>
        )}

        {/* editor + output */}
        <Box sx={{ flex: 1, minWidth: 0, display: showTab('code') ? 'flex' : 'none', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              language={room.language}
              theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
              onMount={handleMount}
              options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, scrollBeyondLastLine: false, tabSize: 4 }}
            />
          </Box>
          <Box sx={{ height: 220, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 0.75 }}>
              <Typography variant="subtitle2">Output</Typography>
              {room.running && <CircularProgress size={14} />}
              {room.runResult && (
                <Chip size="small" color={room.runResult.ok ? 'success' : 'error'} label={`${room.runResult.status} · ${room.runResult.by}`} />
              )}
              <Box sx={{ flex: 1 }} />
              {problem && <Button size="small" onClick={testInWorkspace}>Test in my workspace</Button>}
              <Button
                size="small"
                variant="contained"
                disableElevation
                startIcon={<PlayArrowRoundedIcon />}
                onClick={() => room.run(stdin)}
                disabled={room.running || room.status !== 'joined'}
              >
                Run
              </Button>
            </Stack>
            <TextField size="small" placeholder="stdin (optional)" value={stdin} onChange={(e) => setStdin(e.target.value)} multiline maxRows={2} sx={{ mx: 1.5, mb: 0.5 }} />
            <Box component="pre" sx={{ m: 0, px: 1.5, py: 1, flex: 1, overflow: 'auto', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
              {room.runResult
                ? `${room.runResult.stdout}${room.runResult.stderr ? `\n${room.runResult.stderr}` : ''}`.trim() || '(no output)'
                : 'Run pannina output rendu perukkum theriyum.'}
            </Box>
          </Box>
        </Box>

        {/* call + chat */}
        <Box sx={{ width: isMobile ? '100%' : 330, display: showTab('call') ? 'flex' : 'none', flexDirection: 'column', borderLeft: isMobile ? 'none' : '1px solid', borderColor: 'divider' }}>
          <CallPanel call={call} friendName={friend?.name} hasFriend={!!friend} />
          <ChatPanel messages={room.chat} myId={room.me?.id} onSend={room.sendChat} disabled={room.status !== 'joined'} />
        </Box>
      </Box>
    </Box>
  );
}
