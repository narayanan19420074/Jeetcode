import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { useSnackbar } from 'notistack';
import {
  Avatar, Badge, Box, ButtonBase, Stack, Typography, Button, IconButton, Select, MenuItem, Chip, TextField, Tabs, Tab, Tooltip, Drawer, Divider,
  alpha, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, LinearProgress, InputAdornment, ListItemIcon, ListItemText, Menu, useMediaQuery, useTheme,
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
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { problemsApi } from '../../api/problemsApi';
import { setLanguage, updateCode } from '../workspace/workspaceSlice';
import { bindMonaco } from './monacoYjs';
import { useRoom } from './useRoom';
import { useCall } from './useCall';
import FloatingCall from './FloatingCall';
import ChatPanel from './ChatPanel';
import AptitudeRoom from './AptitudeRoom';
import DifficultyChip from '../../components/DifficultyChip';
import MobileKeyBar from '../workspace/MobileKeyBar';
import EditorScroller from '../workspace/EditorScroller';
import { wsSurface, defineMonacoThemes, monacoThemeName } from '../workspace/workspaceTheme';
import { formatCode, replaceChangedSpan } from '../workspace/formatCode';
import { MOBILE_EDITOR_OPTIONS } from '../workspace/editorOptions';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
];

// Shared documents must indent the same way for everyone, so the room always
// uses 4 spaces (a personal tab size would make Python blocks disagree).
const ROOM_TAB = 4;
const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };
const keepFocus = (e) => e.preventDefault();

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const editorPrefs = useSelector((s) => s.ui.editor);
  const surf = wsSurface(theme);

  const [guestName, setGuestName] = useState(() => localStorage.getItem('jc-guest-name') || '');
  const [nameDraft, setNameDraft] = useState('');
  const displayName = isAuthenticated ? user?.handle || user?.name || user?.username || 'Member' : guestName;

  const room = useRoom({ roomId, displayName });
  const call = useCall(room.socket);

  const [stdin, setStdin] = useState('');
  const [problem, setProblem] = useState(null);
  const [showProblem, setShowProblem] = useState(() => window.innerWidth >= 900); // desktop side panel
  const [chatOpen, setChatOpen] = useState(false); // desktop chat drawer
  const [view, setView] = useState('code'); // phone tabs: 'code' | 'chat'
  const [consoleOpen, setConsoleOpen] = useState(false); // phone output panel
  const [editorFocused, setEditorFocused] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [seen, setSeen] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Phone: the problem opens as a panel sliding in from the right; it lives in
  // history state so the phone's Back button closes it instead of leaving the room.
  const descOpen = isMobile && Boolean(location.state?.problemDesc);
  const openDesc = () => navigate(`${location.pathname}${location.search}`, { state: { problemDesc: true } });
  const closeDesc = () => {
    if (location.state?.problemDesc) navigate(-1);
  };

  // chat badge: messages from the friend that arrived while the chat was not on screen
  const chatVisible = isMobile ? view === 'chat' : chatOpen;
  useEffect(() => {
    if (chatVisible) setSeen(room.chat.length);
  }, [chatVisible, room.chat.length]);
  const unread = chatVisible ? 0 : room.chat.filter((m, i) => i >= seen && m.from !== room.me?.id).length;

  // camera / mic permission problems show as a toast instead of taking up layout space
  useEffect(() => {
    if (call.error) enqueueSnackbar(call.error, { variant: 'warning' });
  }, [call.error, enqueueSnackbar]);

  // a run started by either of you opens the output panel on a phone
  useEffect(() => {
    if (room.running) setConsoleOpen(true);
  }, [room.running]);

  const slug = room.meta?.problemSlug;
  useEffect(() => {
    if (!slug) return;
    problemsApi.getBySlug(slug).then(({ data }) => setProblem(data.data)).catch(() => {});
  }, [slug]);

  const disposeRef = useRef(null);
  const handleMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      setEditorInstance(editor);
      editor.onDidFocusEditorText(() => setEditorFocused(true));
      editor.onDidBlurEditorText(() => setEditorFocused(false));
      disposeRef.current?.();
      disposeRef.current = bindMonaco(editor, monaco, room.doc.getText('code'));
    },
    [room.doc]
  );
  useEffect(() => () => disposeRef.current?.(), []);

  // Editor colours follow the app accent / light-dark mode (same palette as the workspace).
  const accentMain = theme.palette.primary.main;
  const uiMode = theme.palette.mode;
  useEffect(() => {
    const m = monacoRef.current;
    if (!m) return;
    defineMonacoThemes(m, accentMain);
    m.editor.setTheme(monacoThemeName(editorPrefs.theme, uiMode));
  }, [accentMain, editorPrefs.theme, uiMode]);

  // Phone status bar matches the room's top bar.
  const chromeColor = theme.palette.background.paper;
  useEffect(() => {
    const el = document.querySelector('meta[name="theme-color"]');
    if (!el) return undefined;
    const prev = el.getAttribute('content');
    el.setAttribute('content', chromeColor);
    return () => el.setAttribute('content', prev);
  }, [chromeColor]);

  // Format on request only. Automatic formatting is off in a shared room: if both
  // of you formatted at the same moment the CRDT would keep both rewrites.
  const formatNow = async (quiet) => {
    const ed = editorRef.current;
    const model = ed?.getModel();
    if (!ed || !model) return false;
    const src = model.getValue();
    const res = await formatCode(room.language, src, model.getOffsetAt(ed.getPosition()), { tabSize: ROOM_TAB });
    if (res.code === src || model.getValue() !== src) {
      if (!quiet) enqueueSnackbar('Already formatted', { variant: 'info' });
      return false;
    }
    replaceChangedSpan(ed, src, res);
    return true;
  };

  // Python: fix indentation first so one bad space doesn't fail the run for both of you.
  const handleRun = async () => {
    if (isMobile) document.activeElement?.blur?.();
    if (room.language === 'python') await formatNow(true);
    room.run(stdin);
  };

  const keyType = (text) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    ed.trigger('keyboard', 'type', { text });
  };
  const keyCommand = (id) => () => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    ed.trigger('keyboard', id, null);
  };

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
        <DialogTitle sx={{ fontWeight: 800 }}>Join the room</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1 }}>Enter a display name so your partner knows who you are.</DialogContentText>
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
  const roomReady = room.status === 'joined';

  const problemBody = problem && (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>{problem.title}</Typography>
        <DifficultyChip difficulty={problem.difficulty} />
      </Stack>
      <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.75 }} variant="body2">{problem.description}</Typography>
      {(problem.examples || []).map((ex, i) => (
        <Box key={i} sx={{ mt: 1.75, p: 1.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>Example {i + 1}</Typography>
          <Box sx={{ ...mono, mt: 0.75, px: 1.5, py: 1, borderRadius: '10px', bgcolor: surf.raised, fontSize: 12.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {`Input: ${ex.input}\nOutput: ${ex.output}`}
          </Box>
        </Box>
      ))}
      {(problem.constraints || []).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>Constraints</Typography>
          {problem.constraints.map((c, i) => (
            <Typography key={i} variant="body2" color="text.secondary" sx={{ ...mono, fontSize: '0.8rem', lineHeight: 1.7, wordBreak: 'break-word' }}>
              {c}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );

  const stdinField = (sx) => (
    <TextField
      size="small"
      placeholder="Input (stdin)"
      value={stdin}
      onChange={(e) => setStdin(e.target.value)}
      slotProps={{
        htmlInput: { 'aria-label': 'stdin' },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <KeyboardRoundedIcon sx={{ fontSize: 18 }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8rem', borderRadius: 999, bgcolor: 'background.paper' }, ...sx }}
    />
  );

  const outputBlock = (label, text, { error, muted } = {}) => (
    <Box>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mb: 0.5, color: error ? 'error.main' : 'text.secondary' }}>
        {error ? <ErrorOutlineRoundedIcon sx={{ fontSize: 16 }} /> : <LogoutRoundedIcon sx={{ fontSize: 16 }} />}
        <Typography variant="caption" sx={{ fontWeight: 700 }}>{label}</Typography>
      </Stack>
      <Box
        component="pre"
        sx={(t) => ({
          m: 0,
          px: 1.5,
          py: 1,
          borderRadius: '10px',
          ...mono,
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          bgcolor: error ? alpha(t.palette.error.main, 0.1) : wsSurface(t).raised,
          color: error ? 'error.main' : muted ? 'text.disabled' : 'text.primary',
        })}
      >
        {text}
      </Box>
    </Box>
  );

  const outputBody = (
    <Box>
      {room.running ? (
        <Box sx={{ py: 1 }}>
          <LinearProgress sx={{ borderRadius: 999, mb: 1.5 }} />
          <Typography variant="body2" color="text.secondary">Running the code…</Typography>
        </Box>
      ) : !room.runResult ? (
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, py: 1, color: 'text.secondary' }}>
          <PlayCircleOutlineRoundedIcon sx={{ fontSize: 22 }} />
          <Typography variant="body2">Run the code to see the output here. Both of you will see the result.</Typography>
        </Stack>
      ) : (
        <Stack spacing={1.25}>
          {(() => {
            const out = (room.runResult.stdout || '').trim();
            const err = (room.runResult.stderr || '').trim();
            return (
              <>
                {room.runResult.by && (
                  <Typography variant="caption" color="text.secondary">Run by {room.runResult.by}</Typography>
                )}
                {(out || !err) && outputBlock('Output', out || '(no output)', { muted: !out })}
                {err && outputBlock('Error', err, { error: true })}
              </>
            );
          })()}
        </Stack>
      )}
    </Box>
  );

  const resultChip = (maxWidth) =>
    room.running ? (
      <Chip size="small" color="primary" variant="outlined" label="Running…" />
    ) : (
      room.runResult && (
        <Chip
          size="small"
          icon={room.runResult.ok ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
          label={room.runResult.status}
          color={room.runResult.ok ? 'success' : 'error'}
          sx={{ fontWeight: 700, minWidth: 0, maxWidth }}
        />
      )
    );

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: { xs: 'background.paper', md: 'background.default' } }}>
      {/* top bar: title + a few icons. Everything else lives behind them. */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.25, pl: { xs: 2, md: 2.5 }, pr: { xs: 0.75, md: 1.5 }, pt: 'env(safe-area-inset-top)', minHeight: 56, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            {room.meta.title || 'Pair room'}
          </Typography>
          <Chip size="small" label={`#${roomId}`} sx={{ display: { xs: 'none', md: 'inline-flex' } }} />
          {room.status === 'reconnecting' && <Chip size="small" color="warning" label="Reconnecting…" />}
        </Box>

        {!isMobile && problem && (
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

        {!isMobile && (
          <Tooltip title="Chat">
            <IconButton aria-label="Open chat" onClick={() => setChatOpen(true)}>
              <Badge badgeContent={unread} color="primary" max={9}>
                <ChatBubbleOutlineRoundedIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

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

      {/* phones: problem card (tap -> slides in from the right) + Code | Chat tabs */}
      {isMobile && problem && (
        <ButtonBase
          onClick={openDesc}
          aria-label="Open problem description"
          sx={(t) => ({
            width: '100%',
            flexShrink: 0,
            justifyContent: 'flex-start',
            gap: 1.25,
            pl: 1.5,
            pr: 1.5,
            py: 1.1,
            textAlign: 'left',
            borderLeft: `4px solid ${t.palette.primary.main}`,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: wsSurface(t).raised,
          })}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.3 }}>
              {problem.title}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mt: 0.5, minWidth: 0 }}>
              <DifficultyChip difficulty={problem.difficulty} />
              {problem.tags?.length > 0 && (
                <Typography noWrap variant="caption" color="text.secondary" sx={{ minWidth: 0 }}>
                  {problem.tags.slice(0, 2).join(' · ')}
                </Typography>
              )}
            </Stack>
          </Box>
          <Stack direction="row" sx={{ alignItems: 'center', flexShrink: 0, color: 'primary.main' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>View</Typography>
            <ChevronRightRoundedIcon sx={{ fontSize: 22 }} />
          </Stack>
        </ButtonBase>
      )}

      {isMobile && (
        <Tabs
          value={view}
          onChange={(e, v) => setView(v)}
          variant="fullWidth"
          sx={{
            flexShrink: 0,
            minHeight: 42,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { minHeight: 42, py: 0, textTransform: 'none', fontWeight: 700, fontSize: '0.88rem', color: 'text.secondary' },
            '& .Mui-selected': { color: 'primary.main' },
          }}
        >
          <Tab value="code" label="Code" />
          <Tab
            value="chat"
            label={
              <Badge badgeContent={unread} color="primary" max={9} sx={{ '& .MuiBadge-badge': { right: -14, top: 2 } }}>
                Chat
              </Badge>
            }
          />
        </Tabs>
      )}

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        {!isMobile && problem && showProblem && (
          <Box sx={{ width: 340, overflow: 'auto', borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>{problemBody}</Box>
        )}

        {/* editor + output (stays mounted behind the Chat tab so the shared document keeps syncing) */}
        <Box sx={{ flex: 1, minWidth: 0, display: isMobile && view === 'chat' ? 'none' : 'flex', flexDirection: 'column' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, px: { xs: 1.25, md: 2 }, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', flexShrink: 0 }}>
            <Select
              size="small"
              value={room.language}
              onChange={(e) => room.changeLanguage(e.target.value)}
              startAdornment={<CodeRoundedIcon sx={{ fontSize: 18, mr: 0.75, color: 'primary.main' }} />}
              sx={{ minWidth: 130, height: 36, borderRadius: 999, fontSize: '0.85rem', fontWeight: 700, '& .MuiSelect-select': { py: 0.5 } }}
            >
              {LANGUAGES.map((l) => (
                <MenuItem key={l.id} value={l.id}>{l.label}</MenuItem>
              ))}
            </Select>
            {!isMobile && (
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
                  onClick={handleRun}
                  disabled={room.running || !roomReady}
                  sx={{ height: 36 }}
                >
                  Run
                </Button>
              </Stack>
            )}
          </Stack>

          <Box sx={{ position: 'relative', flex: 1, minHeight: 0, bgcolor: surf.canvas }}>
            <Editor
              height="100%"
              language={room.language}
              theme={monacoThemeName(editorPrefs.theme, uiMode)}
              beforeMount={(monaco) => {
                monacoRef.current = monaco;
                defineMonacoThemes(monaco, accentMain);
              }}
              onMount={handleMount}
              loading={<CircularProgress size={26} />}
              options={{
                fontSize: editorPrefs.fontSize,
                minimap: { enabled: editorPrefs.minimap },
                lineNumbers: editorPrefs.lineNumbers ? 'on' : 'off',
                fontLigatures: editorPrefs.ligatures,
                autoClosingBrackets: editorPrefs.autoClose ? 'languageDefined' : 'never',
                autoClosingQuotes: editorPrefs.autoClose ? 'languageDefined' : 'never',
                wordWrap: isMobile || editorPrefs.wordWrap ? 'on' : 'off',
                wrappingIndent: 'indent',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: ROOM_TAB,
                insertSpaces: true,
                detectIndentation: false,
                autoIndent: 'full',
                trimAutoWhitespace: true,
                padding: { top: 10, bottom: 10 },
                ...(isMobile ? MOBILE_EDITOR_OPTIONS : {}),
              }}
            />
            {isMobile && <EditorScroller editor={editorInstance} />}
          </Box>

          {isMobile && editorFocused && (
            <MobileKeyBar
              onKey={keyType}
              onTab={keyCommand('tab')}
              onOutdent={keyCommand('outdent')}
              onDeleteLine={keyCommand('editor.action.deleteLines')}
              onUp={keyCommand('cursorUp')}
              onDown={keyCommand('cursorDown')}
              onLeft={keyCommand('cursorLeft')}
              onRight={keyCommand('cursorRight')}
              onUndo={keyCommand('undo')}
              onRedo={keyCommand('redo')}
              onFormat={() => formatNow(false)}
            />
          )}

          {isMobile ? (
            <Box
              sx={{
                flexShrink: 0,
                maxHeight: consoleOpen ? '45%' : 'auto',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: surf.panel,
                pb: 'env(safe-area-inset-bottom)',
              }}
            >
              <Stack
                direction="row"
                onClick={() => setConsoleOpen((o) => !o)}
                sx={{ alignItems: 'center', gap: 1, px: 1.5, height: 54, flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}
              >
                <TerminalRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                {!(room.running || room.runResult) && <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Output</Typography>}
                {resultChip('44vw')}
                <Box sx={{ flex: 1 }} />
                <Button
                  size="small"
                  variant="contained"
                  disableElevation
                  onPointerDown={keepFocus}
                  onMouseDown={keepFocus}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRun();
                  }}
                  disabled={room.running || !roomReady}
                  startIcon={room.running ? <CircularProgress size={14} color="inherit" /> : <PlayArrowRoundedIcon sx={{ fontSize: '18px !important' }} />}
                  sx={{ height: 36, px: 1.5, minWidth: 0, fontWeight: 700 }}
                >
                  Run
                </Button>
                <ExpandMoreRoundedIcon sx={{ color: 'text.secondary', transition: 'transform .2s', transform: consoleOpen ? 'none' : 'rotate(180deg)' }} />
              </Stack>
              {consoleOpen && (
                <Box sx={{ overflowY: 'auto', px: 1.5, pb: 1.5, flex: 1, minHeight: 0 }}>
                  <Box sx={{ mb: 1.25 }}>{stdinField({ width: '100%' })}</Box>
                  {outputBody}
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ height: 240, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', bgcolor: surf.panel }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 1.5, height: 46, flexShrink: 0 }}>
                <TerminalRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Output</Typography>
                {resultChip('none')}
                {room.runResult && !room.running && room.runResult.by && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Run by {room.runResult.by}
                  </Typography>
                )}
                <Box sx={{ flex: 1 }} />
                {stdinField({ width: 240 })}
              </Stack>
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1.5, pb: 1.5 }}>{outputBody}</Box>
            </Box>
          )}
        </Box>

        {/* phones: chat is a tab, so the keyboard just pushes the input up */}
        {isMobile && (
          <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, display: view === 'chat' ? 'flex' : 'none', flexDirection: 'column', pb: 'env(safe-area-inset-bottom)' }}>
            <ChatPanel messages={room.chat} myId={room.me?.id} onSend={room.sendChat} disabled={!roomReady} friendName={friend?.name} />
          </Box>
        )}
      </Box>

      {/* desktop: chat side panel */}
      {!isMobile && (
        <Drawer
          anchor="right"
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          slotProps={{ paper: { sx: { width: 360, height: '100%', display: 'flex', flexDirection: 'column' } } }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ flex: 1, fontWeight: 700 }}>Chat{friend ? ` · ${friend.name}` : ''}</Typography>
            <IconButton size="small" aria-label="Close chat" onClick={() => setChatOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <ChatPanel messages={room.chat} myId={room.me?.id} onSend={room.sendChat} disabled={!roomReady} friendName={friend?.name} />
        </Drawer>
      )}

      {/* phones: problem description, slides in right -> left */}
      <Drawer anchor="right" open={descOpen} onClose={closeDesc} slotProps={{ paper: { sx: { width: '100%', maxWidth: '100%' } } }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 1, pb: 0.75, pt: 'calc(6px + env(safe-area-inset-top))', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          <IconButton aria-label="Back to code" onClick={closeDesc}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, flex: 1 }}>Problem</Typography>
        </Stack>
        <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>{problemBody}</Box>
        <Box sx={{ flexShrink: 0, p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Button fullWidth variant="contained" disableElevation startIcon={<CodeRoundedIcon />} onClick={closeDesc} sx={{ height: 46, fontWeight: 800, borderRadius: 999 }}>
            Start coding
          </Button>
        </Box>
      </Drawer>

      {/* video call: floating circles, appears only while a call is on */}
      <FloatingCall call={call} friendName={friend?.name} myName={room.me?.name} hasFriend={!!friend} />
    </Box>
  );
}
