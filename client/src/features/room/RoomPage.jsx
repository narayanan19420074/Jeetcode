import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { useSnackbar } from 'notistack';
import {
  Avatar, Badge, Box, Stack, Typography, Button, IconButton, Select, MenuItem, Chip, TextField, Tooltip, Collapse, Drawer, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, ListItemIcon, ListItemText, Menu, useMediaQuery, useTheme,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { problemsApi } from '../../api/problemsApi';
import { setLanguage, updateCode } from '../workspace/workspaceSlice';
import { bindMonaco } from './monacoYjs';
import { useRoom } from './useRoom';
import { useCall } from './useCall';
import FloatingCall from './FloatingCall';
import ChatPanel from './ChatPanel';
import AptitudeRoom from './AptitudeRoom';

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

  const [stdin, setStdin] = useState('');
  const [problem, setProblem] = useState(null);
  const [showProblem, setShowProblem] = useState(() => window.innerWidth >= 900);
  const [chatOpen, setChatOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);

  // chat badge: messages from the friend that arrived while the chat was closed
  useEffect(() => {
    if (chatOpen) setSeen(room.chat.length);
  }, [chatOpen, room.chat.length]);
  const unread = chatOpen ? 0 : room.chat.filter((m, i) => i >= seen && m.from !== room.me?.id).length;

  // camera / mic permission problems show as a toast instead of taking up layout space
  useEffect(() => {
    if (call.error) enqueueSnackbar(call.error, { variant: 'warning' });
  }, [call.error, enqueueSnackbar]);

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
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: '100dvh', p: 3, textAlign: 'center' }}>
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
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100dvh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (room.meta.kind === 'aptitude') {
    return <AptitudeRoom room={room} call={call} roomId={roomId} copyLink={copyLink} leave={leave} />;
  }

  const friend = room.peers[0];
  const problemBody = problem && (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{problem.title}</Typography>
      <Typography variant="caption" color="text.secondary">{problem.difficulty}</Typography>
      <Typography sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }} variant="body2">{problem.description}</Typography>
      {(problem.examples || []).map((ex, i) => (
        <Box key={i} sx={{ mt: 1.5, p: 1, borderRadius: 1, bgcolor: 'action.hover', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap' }}>
          {`Input: ${ex.input}\nOutput: ${ex.output}`}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* top bar: title + a few icons. Everything else lives behind them. */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, pl: { xs: 2, md: 2.5 }, pr: { xs: 0.75, md: 1.5 }, pt: 'env(safe-area-inset-top)', minHeight: 56, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {room.meta.title || 'Pair room'}
          </Typography>
          <Chip size="small" label={`#${roomId}`} sx={{ display: { xs: 'none', md: 'inline-flex' } }} />
          {room.status === 'reconnecting' && <Chip size="small" color="warning" label="Reconnecting…" />}
        </Box>

        {problem && (
          <Tooltip title={showProblem ? 'Hide problem' : 'Show problem'}>
            <IconButton aria-label="Toggle problem" aria-pressed={showProblem} onClick={() => setShowProblem((v) => !v)} color={showProblem ? 'primary' : 'default'}>
              <DescriptionRoundedIcon />
            </IconButton>
          </Tooltip>
        )}

        {/* friend: just a small avatar, green dot while they are in the room */}
        <Tooltip title={friend ? `${friend.name} is here` : 'Waiting for friend'}>
          <Box sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}>
            {friend ? (
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color="success"
                sx={{ '& .MuiBadge-badge': { width: 11, height: 11, borderRadius: '50%', border: '2px solid', borderColor: 'background.paper', boxSizing: 'content-box' } }}
              >
                <Avatar sx={{ width: 30, height: 30, fontSize: '0.85rem', fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  {friend.name?.[0]?.toUpperCase()}
                </Avatar>
              </Badge>
            ) : (
              <Avatar sx={{ width: 30, height: 30, bgcolor: 'action.hover', color: 'text.secondary' }}>
                <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
              </Avatar>
            )}
          </Box>
        </Tooltip>

        {!call.localStream && (
          <Tooltip title="Start video call">
            <IconButton aria-label="Start video call" onClick={call.start}>
              <VideocamRoundedIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Chat">
          <IconButton aria-label="Open chat" onClick={() => setChatOpen(true)}>
            <Badge badgeContent={unread} color="primary" max={9}>
              <ChatBubbleOutlineRoundedIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton aria-label="More options" onClick={(e) => setMenuAnchor(e.currentTarget)}>
          <MoreVertRoundedIcon />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
          <MenuItem onClick={() => { setMenuAnchor(null); copyLink(); }}>
            <ListItemIcon><LinkRoundedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Invite link" />
          </MenuItem>
          {problem && (
            <MenuItem onClick={() => { setMenuAnchor(null); testInWorkspace(); }}>
              <ListItemIcon><OpenInNewRoundedIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Test in my workspace" />
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={() => { setMenuAnchor(null); leave(); }}>
            <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Leave room" />
          </MenuItem>
        </Menu>
      </Stack>

      {/* phones: problem is a collapsible card under the bar (tap the icon again to tuck it away) */}
      {isMobile && problem && (
        <Collapse in={showProblem} unmountOnExit>
          <Box sx={{ maxHeight: '45dvh', overflow: 'auto', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>{problemBody}</Box>
        </Collapse>
      )}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {!isMobile && problem && showProblem && (
          <Box sx={{ width: 340, overflow: 'auto', borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>{problemBody}</Box>
        )}

        {/* editor + output */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, px: { xs: 1.25, md: 2 }, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Select
              size="small"
              value={room.language}
              onChange={(e) => room.changeLanguage(e.target.value)}
              sx={{ minWidth: 124, height: 36, fontSize: '0.85rem', fontWeight: 600, '& .MuiSelect-select': { py: 0.5 } }}
            >
              {LANGUAGES.map((l) => (
                <MenuItem key={l.id} value={l.id}>{l.label}</MenuItem>
              ))}
            </Select>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              {room.running && <CircularProgress size={16} />}
              {room.runResult && !room.running && (
                <Chip size="small" color={room.runResult.ok ? 'success' : 'error'} label={`${room.runResult.status} · ${room.runResult.by}`} />
              )}
              <Button
                size="small"
                variant="contained"
                disableElevation
                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: '18px !important' }} />}
                onClick={() => room.run(stdin)}
                disabled={room.running || room.status !== 'joined'}
                sx={{ height: 36 }}
              >
                Run
              </Button>
            </Stack>
          </Stack>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              language={room.language}
              theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
              onMount={handleMount}
              options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, scrollBeyondLastLine: false, tabSize: 4 }}
            />
          </Box>

          <Box sx={{ height: { xs: 150, md: 200 }, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', pb: 'env(safe-area-inset-bottom)' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 1.5, pt: 0.75 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Output</Typography>
              <TextField
                size="small"
                placeholder="stdin (optional)"
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                slotProps={{ htmlInput: { 'aria-label': 'stdin' } }}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { height: 32, fontSize: '0.8rem' } }}
              />
            </Stack>
            <Box component="pre" sx={{ m: 0, px: 1.5, py: 1, flex: 1, overflow: 'auto', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap' }}>
              {room.runResult
                ? `${room.runResult.stdout}${room.runResult.stderr ? `\n${room.runResult.stderr}` : ''}`.trim() || '(no output)'
                : 'Run pannina output rendu perukkum theriyum.'}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* chat: bottom sheet on phones, side panel on desktop */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? '100%' : 360,
              height: isMobile ? '70dvh' : '100%',
              borderRadius: isMobile ? '24px 24px 0 0' : 0,
              display: 'flex',
              flexDirection: 'column',
              pb: 'env(safe-area-inset-bottom)',
            },
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ flex: 1, fontWeight: 700 }}>Chat{friend ? ` · ${friend.name}` : ''}</Typography>
          <IconButton size="small" aria-label="Close chat" onClick={() => setChatOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <ChatPanel messages={room.chat} myId={room.me?.id} onSend={room.sendChat} disabled={room.status !== 'joined'} />
      </Drawer>

      {/* video call: floating circles, appears only while a call is on */}
      <FloatingCall call={call} friendName={friend?.name} myName={room.me?.name} hasFriend={!!friend} />
    </Box>
  );
}
