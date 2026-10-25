import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { useSnackbar } from 'notistack';
import {
  Box, ButtonBase, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Drawer, ListItemIcon, ListItemText, Menu, MenuItem, Skeleton, Stack, TextField, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PictureInPictureAltRoundedIcon from '@mui/icons-material/PictureInPictureAltRounded';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { problemsApi } from '../../api/problemsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { setLanguage, updateCode } from '../workspace/workspaceSlice';
import { bindMonaco } from './monacoYjs';
import { useRoomSession } from './RoomSession';
import useRoomSubmit from './useRoomSubmit';
import FloatingCall from './FloatingCall';
import ChatPanel from './ChatPanel';
import AptitudeRoom from './AptitudeRoom';
import RoomAiDrawer from './RoomAiDrawer';
import { PresenceStack, RoomConsoleBody, RunChip, TimerControl, hoverScrollbars } from './RoomParts';
import DifficultyChip from '../../components/DifficultyChip';
import ProblemDescription from '../workspace/ProblemDescription';
import SolutionsPanel from '../workspace/community/SolutionsPanel';
import DiscussionPanel from '../workspace/community/DiscussionPanel';
import ShareSolutionDialog from '../workspace/community/ShareSolutionDialog';
import SubmissionsPanel from '../workspace/SubmissionsPanel';
import { EditorStatus, VerdictChip } from '../workspace/ConsolePanel';
import SplitHandle from '../workspace/SplitHandle';
import MobileKeyBar from '../workspace/MobileKeyBar';
import EditorScroller from '../workspace/EditorScroller';
import useStopwatch from '../workspace/useStopwatch';
import { MaxButton, PaneBar, PaneTabs, WsButton, WsIconButton, WsSelect, useElementWidth } from '../workspace/wsUi';
import { WS } from '../workspace/wsTokens';
import { wsSurface, defineMonacoThemes, monacoThemeName } from '../workspace/workspaceTheme';
import { formatCode, replaceChangedSpan } from '../workspace/formatCode';
import { MOBILE_EDITOR_OPTIONS } from '../workspace/editorOptions';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
];

// Shared documents must indent the same way for everyone, so the room always
// uses 4 spaces (a personal tab size would make Python blocks disagree).
const ROOM_TAB = 4;
const LANG_SHORT = { javascript: 'JS', python: 'Py', cpp: 'C++', java: 'Java' };
const keepFocus = (e) => e.preventDefault();

// Resizable layout (desktop). Sizes are remembered between visits.
const LAYOUT_KEY = 'jeetcode-room-layout';
const DEFAULT_LEFT = 0.42;
const DEFAULT_CONSOLE = 0.35;
const LEFT_MIN = 0.25;
const LEFT_MAX = 0.65;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const loadLayout = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
    return {
      left: clamp(Number(raw.left) || DEFAULT_LEFT, LEFT_MIN, LEFT_MAX),
      console: clamp(Number(raw.console) || DEFAULT_CONSOLE, 0.12, 0.8),
    };
  } catch {
    return { left: DEFAULT_LEFT, console: DEFAULT_CONSOLE };
  }
};

function ProblemSkeleton() {
  return (
    <Box sx={{ pt: 0.5 }}>
      <Skeleton width="55%" height={32} />
      <Skeleton variant="rounded" width={72} height={24} sx={{ my: 1.5, borderRadius: 999 }} />
      <Skeleton height={20} />
      <Skeleton height={20} />
      <Skeleton width="80%" height={20} />
      <Skeleton variant="rounded" height={110} sx={{ mt: 3, borderRadius: `${WS.radius + 2}px` }} />
    </Box>
  );
}

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

  // The connection lives above the routes, so minimizing keeps the call and the room alive.
  const { room, call, close: closeSession, popOut, pipOk, ready } = useRoomSession(roomId, displayName);
  const slug = room.meta?.problemSlug;
  const sub = useRoomSubmit(slug);
  const sw = useStopwatch();

  const [problem, setProblem] = useState(null);
  const [leftTab, setLeftTab] = useState(null); // desktop left pane; null = default (problem, or chat when the room has none)
  const [mountedTabs, setMountedTabs] = useState({ solutions: false, discussion: false, submissions: false });
  const [mobileView, setMobileView] = useState('code'); // phone tabs
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState('cases'); // 'cases' | 'run' | 'submit'
  const [lastKind, setLastKind] = useState(null); // 'run' | 'submit' — which verdict the console bar shows
  const [caseSel, setCaseSel] = useState(0); // sample index | 'custom'
  const [customStdin, setCustomStdin] = useState('');
  const [activeCase, setActiveCase] = useState(0);
  const [editorFocused, setEditorFocused] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [seen, setSeen] = useState(0);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [solutionsRefresh, setSolutionsRefresh] = useState(0);
  const [confirm, setConfirm] = useState(null); // { type: 'solution', sol } | { type: 'reset' }
  const [adjacent, setAdjacent] = useState({ prev: null, next: null }); // slugs for the prev / next arrows
  const [switching, setSwitching] = useState(false);
  // Pane widths (desktop): labels shrink to icons as a pane gets narrower, same as the workspace.
  const [leftEl, setLeftEl] = useState(null);
  const [rightEl, setRightEl] = useState(null);
  const leftW = useElementWidth(leftEl);
  const rightW = useElementWidth(rightEl);

  // Resizable split panes + maximize (desktop only)
  const [layout, setLayout] = useState(loadLayout);
  const [maximized, setMaximized] = useState(null); // null | 'left' | 'editor' | 'console'
  const rootRef = useRef(null);
  const editorColRef = useRef(null);
  const toggleMax = (which) => setMaximized((m) => (m === which ? null : which));

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const disposeRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
    } catch {
      // storage unavailable — layout just won't be remembered
    }
  }, [layout]);

  // Esc leaves a maximized pane.
  useEffect(() => {
    if (!maximized) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMaximized(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [maximized]);

  const dragLeft = (x) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setLayout((l) => ({ ...l, left: clamp((x - rect.left) / rect.width, LEFT_MIN, LEFT_MAX) }));
  };
  const dragConsole = (_x, y) => {
    const el = editorColRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setConsoleOpen(true);
    setLayout((l) => ({ ...l, console: clamp((rect.bottom - y) / rect.height, 0.12, 0.8) }));
  };

  // Phone: the problem opens as a panel sliding in from the right; it lives in
  // history state so the phone's Back button closes it instead of leaving the room.
  const descOpen = isMobile && Boolean(location.state?.problemDesc);
  const openDesc = () => navigate(`${location.pathname}${location.search}`, { state: { problemDesc: true } });
  const closeDesc = () => {
    if (location.state?.problemDesc) navigate(-1);
  };

  // chat badge: messages from the friend that arrived while the chat was not on screen
  const chatVisible = isMobile ? mobileView === 'chat' : (leftTab ?? (slug ? 'desc' : 'chat')) === 'chat' && maximized !== 'editor' && maximized !== 'console';
  useEffect(() => {
    if (chatVisible) setSeen(room.chat.length);
  }, [chatVisible, room.chat.length]);
  const unread = chatVisible ? 0 : room.chat.filter((m, i) => i >= seen && m.from !== room.me?.id).length;

  // camera / mic permission problems show as a toast instead of taking up layout space
  useEffect(() => {
    if (call.error) enqueueSnackbar(call.error, { variant: 'warning' });
  }, [call.error, enqueueSnackbar]);

  // A run started by either of you opens the console on the shared output.
  useEffect(() => {
    if (room.running) {
      setLastKind('run');
      setConsoleOpen(true);
      setConsoleTab('run');
    }
  }, [room.running]);

  // New problem (either of you switched) => clean tabs, console and case selection.
  useEffect(() => {
    setProblem(null);
    setMountedTabs({ solutions: false, discussion: false, submissions: false });
    setLeftTab(null);
    setConsoleOpen(false);
    setConsoleTab('cases');
    setCaseSel(0);
    setActiveCase(0);
    setLastKind(null);
    setMaximized(null);
    setMobileView('code');
  }, [slug]);

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    problemsApi.getBySlug(slug).then(({ data }) => !cancelled && setProblem(data.data)).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Previous / next problem slugs (arrows beside the title).
  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    setAdjacent({ prev: null, next: null });
    problemsApi
      .getAdjacent(slug)
      .then(({ data }) => !cancelled && setAdjacent({ prev: data.data.prev, next: data.data.next }))
      .catch(() => {}); // arrows just stay disabled
    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  const sharedCode = () => room.doc.getText('code').toString();

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

  // Sample case (or custom text) chosen in the Testcase tab is what Run sends as stdin.
  const examples = problem?.examples ?? [];
  const stdin = caseSel === 'custom' || examples.length === 0 ? customStdin : examples[Math.min(caseSel, examples.length - 1)]?.input ?? '';

  const goLogin = () => navigate('/login', { state: { from: { pathname: `/room/${roomId}` } } });
  const busy = room.running || sub.status === 'running';

  // Python: fix indentation first so one bad space doesn't fail the run for both of you.
  const handleRun = async () => {
    if (isMobile) document.activeElement?.blur?.();
    if (room.language === 'python') await formatNow(true);
    room.run(stdin);
  };

  // Submit is personal: it judges the shared code and saves the result to YOUR account.
  const handleSubmit = async () => {
    if (!slug) return;
    if (!isAuthenticated) {
      enqueueSnackbar('Sign in to submit', { variant: 'info' });
      goLogin();
      return;
    }
    if (isMobile) document.activeElement?.blur?.();
    setLastKind('submit');
    setConsoleOpen(true);
    setConsoleTab('submit');
    setActiveCase(0);
    if (room.language === 'python') await formatNow(true);
    sub.submit({ language: room.language, code: sharedCode() });
  };

  // Keyboard shortcuts (desktop): Ctrl/Cmd + ' runs, Ctrl/Cmd + Enter submits.
  const actionsRef = useRef({});
  actionsRef.current = { run: handleRun, submit: handleSubmit, busy: busy || room.status !== 'joined' };
  useEffect(() => {
    if (isMobile) return undefined;
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      const isRun = e.key === "'";
      const isSubmit = e.key === 'Enter';
      if (!isRun && !isSubmit) return;
      const t = e.target;
      const inEditor = t?.closest?.('.monaco-editor');
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      if (typing && !inEditor) return; // Ctrl+Enter in a chat / comment box must not submit code
      e.preventDefault();
      e.stopPropagation();
      const a = actionsRef.current;
      if (a.busy) return;
      (isRun ? a.run : a.submit)();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isMobile]);

  // Symbol bar actions (phone)
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

  // Replaces the shared document for both of you (a CRDT edit, so it syncs like typing).
  const replaceSharedCode = (text, lang) => {
    const ytext = room.doc.getText('code');
    room.doc.transact(() => {
      if (ytext.length > 0) ytext.delete(0, ytext.length);
      if (text) ytext.insert(0, text);
    }, 'room-ui');
    // text first, then language: the server only swaps in a starter when the text is still the old starter
    if (lang && lang !== room.language) room.changeLanguage(lang);
  };

  const handleSendToEditor = (sol) => {
    const current = sharedCode();
    const starter = problem?.starterCode?.[room.language] ?? '';
    const hasOwnWork = current.trim() !== '' && current.trim() !== starter.trim() && current !== sol.code;
    if (hasOwnWork) setConfirm({ type: 'solution', sol });
    else {
      replaceSharedCode(sol.code, sol.language);
      setMobileView('code');
      enqueueSnackbar('Solution loaded in the shared editor', { variant: 'success' });
    }
  };

  const runConfirm = () => {
    if (!confirm) return;
    if (confirm.type === 'solution') {
      replaceSharedCode(confirm.sol.code, confirm.sol.language);
      setMobileView('code');
      enqueueSnackbar('Solution loaded in the shared editor', { variant: 'success' });
    } else {
      replaceSharedCode(problem?.starterCode?.[room.language] ?? '', null);
      enqueueSnackbar('Code reset to the starter template', { variant: 'info' });
    }
    setConfirm(null);
  };

  const handleShared = () => {
    setSolutionsRefresh((k) => k + 1);
    openLeft('solutions');
    setMobileView('solutions');
    setMountedTabs((m) => ({ ...m, solutions: true }));
    enqueueSnackbar('Solution shared', { variant: 'success' });
  };

  const handleCopyCode = async () => {
    setMoreAnchor(null);
    try {
      await navigator.clipboard.writeText(sharedCode());
      enqueueSnackbar('Code copied', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not copy code', { variant: 'error' });
    }
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
    dispatch(updateCode({ problemId: problem._id, language: room.language, code: sharedCode() }));
    dispatch(setLanguage(room.language));
    navigate(`/workspace/${problem.slug}`);
  };

  // Switching problem changes it for BOTH of you (the server swaps the shared editor to the new starter code).
  const switchProblem = async (target) => {
    if (!target || switching) return;
    setSwitching(true);
    try {
      const { data } = await problemsApi.getBySlug(target);
      const p = data.data;
      const st = p.starterCode || {};
      room.changeProblem({ slug: p.slug, title: p.title, starters: { javascript: st.javascript, python: st.python, cpp: st.cpp, java: st.java } });
    } catch (e) {
      enqueueSnackbar(extractErrorMessage(e), { variant: 'error' });
    } finally {
      setSwitching(false);
    }
  };
  const handleRandom = async () => {
    try {
      const { data } = await problemsApi.getRandom();
      await switchProblem(data.data.slug);
    } catch (e) {
      enqueueSnackbar(extractErrorMessage(e), { variant: 'error' });
    }
  };

  const home = isAuthenticated ? '/dashboard' : '/';
  // Close (X): end the call, leave the room for good.
  const leave = () => {
    closeSession();
    navigate(home);
  };
  // Minimize: go back to the problem; a small floating call circle follows you around.
  const minimize = () => navigate(slug ? `/workspace/${slug}` : home);

  const mountTab = (v) => {
    if (v === 'solutions' || v === 'discussion' || v === 'submissions') setMountedTabs((m) => ({ ...m, [v]: true }));
  };
  function openLeft(v) {
    setLeftTab(v);
    mountTab(v);
  }
  const openMobileView = (v) => {
    setMobileView(v);
    mountTab(v);
  };

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
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <WsButton variant="primary" onClick={go} disabled={!nameDraft.trim()}>
            Join
          </WsButton>
        </DialogActions>
      </Dialog>
    );
  }

  if (ready && room.status === 'error') {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: '100dvh', p: 3, textAlign: 'center' }}>
        <Typography variant="h6">{room.error}</Typography>
        <Stack direction="row" spacing={1}>
          <WsButton variant="primary" onClick={() => navigate('/pair')}>
            New room
          </WsButton>
          <WsButton variant="secondary" onClick={leave}>
            Home
          </WsButton>
        </Stack>
      </Stack>
    );
  }

  if (!ready || !room.meta) {
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
  const hasProblem = Boolean(slug);
  const ctl = isMobile ? 'lg' : 'md';
  const nav = { hasPrev: Boolean(adjacent.prev), hasNext: Boolean(adjacent.next), onPrev: () => switchProblem(adjacent.prev), onNext: () => switchProblem(adjacent.next), size: ctl };
  // Responsive-by-pane (desktop): what to drop as a pane gets narrower.
  const tabLabels = !leftW || leftW >= 560 ? 'all' : leftW >= 340 ? 'active' : 'none';
  const langMode = isMobile || !rightW || rightW >= 520 ? 'full' : rightW >= 420 ? 'short' : 'icon';
  const iconActions = !isMobile && rightW > 0 && rightW < 700; // Run / Submit lose their words
  const showKbd = rightW >= 950;
  const narrowConsole = !isMobile && rightW > 0 && rightW < 640; // hide cursor status, share -> icon
  const hideConsoleLabel = !isMobile && rightW > 0 && rightW < 460;
  const langLabel = LANGUAGES.find((l) => l.id === room.language)?.label;
  const tab = leftTab ?? (hasProblem ? 'desc' : 'chat');
  const unreadDot = unread > 0 ? theme.palette.primary.main : undefined;
  const canShare = lastKind === 'submit' && sub.status !== 'running' && sub.result?.status === 'Accepted' && Boolean(sub.result._id);

  const chatItem = { value: 'chat', label: 'Chat', icon: <ChatBubbleOutlineRoundedIcon />, dot: unreadDot };
  const leftItems = hasProblem
    ? [
        { value: 'desc', label: 'Description', icon: <ArticleOutlinedIcon /> },
        { value: 'solutions', label: 'Solutions', icon: <LightbulbOutlinedIcon /> },
        { value: 'discussion', label: 'Discussion', icon: <ForumOutlinedIcon /> },
        { value: 'submissions', label: 'Submissions', icon: <HistoryRoundedIcon /> },
        chatItem,
      ]
    : [chatItem];
  const mobileItems = [
    { value: 'code', label: 'Code' },
    ...(hasProblem
      ? [
          { value: 'solutions', label: 'Solutions' },
          { value: 'discussion', label: 'Discussion' },
          { value: 'submissions', label: 'Submissions' },
        ]
      : []),
    { value: 'chat', label: 'Chat', dot: unreadDot },
  ];

  const chatPanel = <ChatPanel messages={room.chat} myId={room.me?.id} onSend={room.sendChat} disabled={!roomReady} friendName={friend?.name} />;

  const solutionsPanel = <SolutionsPanel slug={slug} refreshKey={solutionsRefresh} onShare={() => setShareOpen(true)} onSendToEditor={handleSendToEditor} />;
  const discussionPanel = <DiscussionPanel slug={slug} />;
  const submissionsPanel = (
    <SubmissionsPanel slug={slug} isAuthenticated={isAuthenticated} refreshKey={sub.result?._id ?? 0} onLoad={handleSendToEditor} onSignIn={goLogin} />
  );

  const consoleBody = (
    <RoomConsoleBody
      problem={problem}
      hasProblem={hasProblem}
      isAuthenticated={isAuthenticated}
      tab={consoleTab}
      onTab={setConsoleTab}
      caseSel={caseSel}
      onCaseSel={setCaseSel}
      customStdin={customStdin}
      onCustomStdin={setCustomStdin}
      running={room.running}
      runResult={room.runResult}
      sub={sub}
      activeCase={activeCase}
      onCase={setActiveCase}
      onSignIn={goLogin}
    />
  );

  const runButton = (size) => (
    <WsButton
      size={size}
      variant="secondary"
      startIcon={<PlayArrowRoundedIcon />}
      loading={room.running}
      disabled={busy || !roomReady}
      onPointerDown={isMobile ? keepFocus : undefined}
      onMouseDown={isMobile ? keepFocus : undefined}
      onClick={handleRun}
      iconOnly={iconActions}
      title="Run (Ctrl + ')"
      kbd={isMobile || !showKbd ? undefined : "Ctrl '"}
    >
      Run
    </WsButton>
  );
  const submitButton = (size) =>
    hasProblem && (
      <WsButton
        size={size}
        variant="primary"
        startIcon={<CloudUploadRoundedIcon />}
        loading={sub.status === 'running'}
        disabled={busy || !roomReady}
        onPointerDown={isMobile ? keepFocus : undefined}
        onMouseDown={isMobile ? keepFocus : undefined}
        onClick={handleSubmit}
        iconOnly={iconActions}
        title="Submit (Ctrl + Enter)"
        kbd={isMobile || !showKbd ? undefined : 'Ctrl ↵'}
      >
        Submit
      </WsButton>
    );

  return (
    <Box sx={(t) => ({ ...hoverScrollbars(t), height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: surf.chrome, overflow: 'hidden' })}>
      {/* top bar: where you are, who is here, invite / call / leave */}
      <PaneBar
        height="auto"
        sx={{ minHeight: 48, pt: 'env(safe-area-inset-top)', px: { xs: 0.75, md: 1.5 }, gap: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1, pl: { xs: 1, md: 0.5 } }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {room.meta.title || problem?.title || 'Pair room'}
          </Typography>
          <Typography noWrap sx={{ display: { xs: 'none', md: 'block' }, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.72rem', color: 'text.disabled' }}>
            #{roomId}
          </Typography>
          {room.status === 'reconnecting' && (
            <Typography noWrap sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'warning.main' }}>
              Reconnecting…
            </Typography>
          )}
        </Box>

        <PresenceStack meName={room.me?.name || displayName} peers={room.peers} />

        {isMobile ? (
          <WsIconButton title="Invite link" size={ctl} onClick={copyLink}>
            <LinkRoundedIcon />
          </WsIconButton>
        ) : (
          <WsButton variant="secondary" startIcon={<LinkRoundedIcon />} onClick={copyLink}>
            Invite
          </WsButton>
        )}
        <WsIconButton
          title={call.localStream ? 'End video call' : 'Start video call'}
          size={ctl}
          active={Boolean(call.localStream)}
          onClick={call.localStream ? call.stop : call.start}
        >
          <VideocamRoundedIcon />
        </WsIconButton>
        {pipOk && call.localStream && (
          <WsIconButton title="Float the call circle over other tabs and apps" size={ctl} onClick={popOut}>
            <PictureInPictureAltRoundedIcon />
          </WsIconButton>
        )}
        <WsIconButton title="Minimize (keep the call in a small circle)" size={ctl} onClick={minimize}>
          <MinimizeRoundedIcon />
        </WsIconButton>
        <WsIconButton title="Close room" size={ctl} onClick={leave}>
          <CloseRoundedIcon />
        </WsIconButton>
      </PaneBar>

      <Box
        ref={rootRef}
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, bgcolor: surf.chrome, overflow: 'hidden' }}
      >
        {isMobile && (
          <Box sx={{ flexShrink: 0, bgcolor: surf.chrome }}>
            {/* Tap the problem name -> description slides in from the right */}
            {hasProblem && problem && (
              <ButtonBase
                onClick={openDesc}
                aria-label="Open problem description"
                sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.25, px: 2, pt: 1.25, pb: 0.75, textAlign: 'left' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
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
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Problem</Typography>
                  <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
                </Stack>
              </ButtonBase>
            )}
            <PaneBar height={48} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <PaneTabs size="lg" value={mobileView} onChange={openMobileView} items={mobileItems} />
            </PaneBar>
          </Box>
        )}

        {/* Left pane — problem, community tabs and pair chat (desktop only) */}
        {!isMobile && (
          <Box
            ref={setLeftEl}
            sx={{
              bgcolor: surf.chrome,
              width: maximized === 'left' ? '100%' : `${layout.left * 100}%`,
              minWidth: 0,
              flex: maximized === 'left' ? 1 : 'none',
              display: maximized === 'editor' || maximized === 'console' ? 'none' : 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <PaneBar>
              <PaneTabs value={tab} onChange={openLeft} items={leftItems} labels={tabLabels} />
              <Box sx={{ flex: 1 }} />
              {hasProblem && (
                <WsIconButton title="Random problem" onClick={handleRandom} disabled={switching}>
                  <ShuffleRoundedIcon />
                </WsIconButton>
              )}
              <MaxButton active={maximized === 'left'} onClick={() => toggleMax('left')} label="panel" />
            </PaneBar>

            <Box sx={{ display: tab === 'chat' ? 'none' : 'block', overflowY: 'auto', px: 2.5, pt: 1.5, pb: 3, flex: 1, minHeight: 0 }}>
              {tab === 'desc' && (problem ? <ProblemDescription problem={problem} nav={nav} /> : <ProblemSkeleton />)}
              {mountedTabs.solutions && <Box sx={{ display: tab === 'solutions' ? 'block' : 'none' }}>{solutionsPanel}</Box>}
              {mountedTabs.discussion && <Box sx={{ display: tab === 'discussion' ? 'block' : 'none' }}>{discussionPanel}</Box>}
              {mountedTabs.submissions && <Box sx={{ display: tab === 'submissions' ? 'block' : 'none' }}>{submissionsPanel}</Box>}
            </Box>
            <Box sx={{ display: tab === 'chat' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>{chatPanel}</Box>
          </Box>
        )}

        {/* The single seam between left pane and editor (desktop) */}
        <Box sx={{ display: { xs: 'none', md: maximized ? 'none' : 'flex' }, alignSelf: 'stretch' }}>
          <SplitHandle orientation="vertical" label="Resize side panel and editor" onDrag={dragLeft} onReset={() => setLayout((l) => ({ ...l, left: DEFAULT_LEFT }))} />
        </Box>

        {/* Right pane — shared editor + runner (stays mounted behind the phone tabs so the document keeps syncing) */}
        <Box
          ref={setRightEl}
          sx={{
            bgcolor: surf.chrome,
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            flexDirection: 'column',
            display: { xs: mobileView === 'code' ? 'flex' : 'none', md: maximized === 'left' ? 'none' : 'flex' },
          }}
        >
          <PaneBar sx={{ px: 1.25, gap: 0.5, height: { xs: 52, md: WS.bar }, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
            {(() => {
              const select = (
                <WsSelect
                  value={room.language}
                  onChange={(e) => room.changeLanguage(e.target.value)}
                  renderValue={(v) => (langMode === 'icon' ? '' : langMode === 'short' ? LANG_SHORT[v] : LANGUAGES.find((l) => l.id === v)?.label)}
                  startAdornment={<CodeRoundedIcon sx={{ fontSize: 17, mr: langMode === 'icon' ? 0 : 0.75, color: 'primary.main' }} />}
                  sx={
                    isMobile
                      ? { height: WS.ctrlLg, minWidth: 124, '& .MuiSelect-select': { height: `${WS.ctrlLg}px` } }
                      : langMode === 'short'
                        ? { minWidth: 0, '& .MuiSelect-select': { pr: '26px !important' } }
                        : langMode === 'icon'
                          ? { minWidth: 0, '& .MuiSelect-select': { pl: 1, pr: '22px !important' }, '& .MuiSelect-icon': { right: 2 } }
                          : undefined
                  }
                >
                  {LANGUAGES.map((l) => (
                    <MenuItem key={l.id} value={l.id} disabled={l.id === 'java' && Boolean(problem) && !problem?.starterCode?.java}>
                      {l.label}
                    </MenuItem>
                  ))}
                </WsSelect>
              );
              return langMode === 'icon' ? (
                <Tooltip title={langLabel}>
                  <span style={{ display: 'inline-flex' }}>{select}</span>
                </Tooltip>
              ) : (
                select
              );
            })()}
            <TimerControl sw={sw} size={ctl} />

            <Box sx={{ flex: 1, minWidth: 8 }} />

            {hasProblem && (
              <WsIconButton title="AI assistant" size={ctl} active={aiOpen} onClick={() => setAiOpen((o) => !o)}>
                <AutoAwesomeRoundedIcon />
              </WsIconButton>
            )}
            <WsIconButton title="More" size={ctl} aria-label="More editor actions" onClick={(e) => setMoreAnchor(e.currentTarget)}>
              <MoreVertRoundedIcon />
            </WsIconButton>
            <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
              <MenuItem onClick={handleCopyCode}>
                <ListItemIcon>
                  <ContentCopyRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy code</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMoreAnchor(null);
                  formatNow(false);
                }}
              >
                <ListItemIcon>
                  <AutoFixHighRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Format code</ListItemText>
              </MenuItem>
              {problem && (
                <MenuItem
                  onClick={() => {
                    setMoreAnchor(null);
                    setConfirm({ type: 'reset' });
                  }}
                >
                  <ListItemIcon>
                    <RestartAltRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Reset to starter</ListItemText>
                </MenuItem>
              )}
              {problem && <Divider />}
              {problem && (
                <MenuItem
                  onClick={() => {
                    setMoreAnchor(null);
                    testInWorkspace();
                  }}
                >
                  <ListItemIcon>
                    <OpenInNewRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Open in my workspace</ListItemText>
                </MenuItem>
              )}
            </Menu>
            {!isMobile && <MaxButton active={maximized === 'editor'} onClick={() => toggleMax('editor')} label="editor" />}

            {/* Run / Submit: bottom bar on phones (thumb reach), here on md+ */}
            {!isMobile && (
              <>
                <Box sx={{ width: 4 }} />
                {runButton('md')}
                {submitButton('md')}
              </>
            )}
          </PaneBar>

          {!isAuthenticated && hasProblem && (
            <Stack direction="row" sx={(t) => ({ alignItems: 'center', gap: 1, px: 1.5, py: 0.75, flexShrink: 0, bgcolor: alpha(t.palette.primary.main, 0.1), color: 'text.primary' })}>
              <LockOutlinedIcon sx={{ fontSize: 17, color: 'primary.main', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ flex: 1, lineHeight: 1.4 }}>
                You can run code together as a guest. Sign in to submit and save your progress.
              </Typography>
              <WsButton variant="ghost" onClick={goLogin} sx={{ color: 'primary.main', height: 28 }}>
                Sign in
              </WsButton>
            </Stack>
          )}

          <Box ref={editorColRef} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ position: 'relative', bgcolor: surf.canvas, flex: 1, minHeight: 0, display: !isMobile && maximized === 'console' ? 'none' : 'block' }}>
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
                  fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
                  minimap: { enabled: editorPrefs.minimap },
                  lineNumbers: editorPrefs.lineNumbers ? 'on' : 'off',
                  fontLigatures: editorPrefs.ligatures,
                  autoClosingBrackets: editorPrefs.autoClose ? 'languageDefined' : 'never',
                  autoClosingQuotes: editorPrefs.autoClose ? 'languageDefined' : 'never',
                  wordWrap: isMobile || editorPrefs.wordWrap ? 'on' : 'off',
                  wrappingIndent: 'indent',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  tabSize: ROOM_TAB,
                  insertSpaces: true,
                  detectIndentation: false,
                  autoIndent: 'full',
                  trimAutoWhitespace: true,
                  padding: { top: 12, bottom: 12 },
                  ...(isMobile ? MOBILE_EDITOR_OPTIONS : { lineNumbersMinChars: 3 }),
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

            {/* Seam between editor and console (desktop, only while the console is open) */}
            {!isMobile && consoleOpen && maximized !== 'console' && (
              <SplitHandle orientation="horizontal" label="Resize editor and console" onDrag={dragConsole} onReset={() => setLayout((l) => ({ ...l, console: DEFAULT_CONSOLE }))} />
            )}

            {/* Console — collapsible testcase / output / submission panel */}
            <Box
              sx={{
                bgcolor: surf.panel,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                pb: { xs: 'env(safe-area-inset-bottom)', md: 0 },
                ...(isMobile
                  ? { flexShrink: 0, maxHeight: consoleOpen ? '45%' : 'auto' }
                  : maximized === 'console'
                    ? { flex: '1 1 0' }
                    : { flex: consoleOpen ? `0 0 ${layout.console * 100}%` : '0 0 auto' }),
              }}
            >
              <Stack
                direction="row"
                onClick={() => (maximized === 'console' ? setMaximized(null) : setConsoleOpen((o) => !o))}
                sx={{ alignItems: 'center', gap: 1, px: 1.5, height: { xs: 52, md: WS.barSm }, flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}
              >
                <TerminalRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                {!(isMobile && (busy || room.runResult || sub.result)) && !hideConsoleLabel && <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Console</Typography>}
                {lastKind === 'submit' ? (
                  <VerdictChip isRunning={sub.status === 'running'} result={sub.result} sx={{ maxWidth: { xs: '44vw', md: 'none' } }} />
                ) : (
                  <RunChip running={room.running} result={room.runResult} sx={{ maxWidth: { xs: '44vw', md: 'none' } }} />
                )}
                {!isMobile && canShare && isAuthenticated && (
                  <WsButton
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation(); // don't toggle the console
                      setShareOpen(true);
                    }}
                    startIcon={<IosShareRoundedIcon />}
                    iconOnly={narrowConsole}
                    title="Share solution"
                    sx={{ height: 26, color: 'primary.main', ...(narrowConsole && { width: 26 }) }}
                  >
                    Share solution
                  </WsButton>
                )}
                <Box sx={{ flex: 1 }} />
                {isMobile && (
                  <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    {runButton('lg')}
                    {submitButton('lg')}
                  </Stack>
                )}
                {!isMobile && !narrowConsole && <EditorStatus editor={editorInstance} tabSize={ROOM_TAB} />}
                {!isMobile && (
                  <MaxButton
                    active={maximized === 'console'}
                    onClick={() => {
                      setConsoleOpen(true);
                      toggleMax('console');
                    }}
                    label="console"
                  />
                )}
                <ExpandMoreRoundedIcon sx={{ color: 'text.secondary', transition: 'transform .2s', transform: consoleOpen ? 'none' : 'rotate(180deg)' }} />
              </Stack>

              {consoleOpen && (
                <Box sx={{ pt: 0.25, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  {isMobile && canShare && (
                    <Box sx={{ px: 1.5, pb: 1 }}>
                      <WsButton variant="secondary" onClick={() => setShareOpen(true)}>
                        Share solution
                      </WsButton>
                    </Box>
                  )}
                  {consoleBody}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Phone: Solutions / Discussion / Submissions / Chat sit next to the Code tab */}
        {isMobile && hasProblem && mountedTabs.solutions && (
          <Box sx={{ display: mobileView === 'solutions' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1.5, pb: 3, bgcolor: surf.chrome }}>{solutionsPanel}</Box>
        )}
        {isMobile && hasProblem && mountedTabs.discussion && (
          <Box sx={{ display: mobileView === 'discussion' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1.5, pb: 3, bgcolor: surf.chrome }}>{discussionPanel}</Box>
        )}
        {isMobile && hasProblem && mountedTabs.submissions && (
          <Box sx={{ display: mobileView === 'submissions' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1.5, pb: 3, bgcolor: surf.chrome }}>{submissionsPanel}</Box>
        )}
        {isMobile && (
          <Box sx={{ display: mobileView === 'chat' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column', pb: 'env(safe-area-inset-bottom)' }}>{chatPanel}</Box>
        )}
      </Box>

      {/* Phone: problem description, slides in right -> left */}
      <Drawer anchor="right" open={descOpen} onClose={closeDesc} slotProps={{ paper: { sx: { width: '100%', maxWidth: '100%' } } }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 1, pb: 0.75, pt: 'calc(6px + env(safe-area-inset-top))', flexShrink: 0, bgcolor: surf.chrome }}>
          <WsIconButton title="Back to code" size="lg" onClick={closeDesc}>
            <ArrowBackRoundedIcon />
          </WsIconButton>
          <Typography sx={{ fontWeight: 700, flex: 1 }}>Problem</Typography>
        </Stack>
        <Box sx={{ overflowY: 'auto', px: 2, pt: 1, pb: 3, flex: 1, minHeight: 0, bgcolor: surf.chrome }}>
          {problem ? <ProblemDescription problem={problem} nav={nav} /> : <ProblemSkeleton />}
        </Box>
        <Box sx={{ flexShrink: 0, p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', bgcolor: surf.chrome }}>
          <WsButton fullWidth size="lg" variant="primary" startIcon={<CodeRoundedIcon />} onClick={closeDesc}>
            Start coding
          </WsButton>
        </Box>
      </Drawer>

      {hasProblem && (
        <RoomAiDrawer
          open={aiOpen}
          onClose={() => setAiOpen(false)}
          slug={slug}
          language={room.language}
          getCode={sharedCode}
          isAuthenticated={isAuthenticated}
          onSignIn={goLogin}
        />
      )}

      {hasProblem && (
        <ShareSolutionDialog open={shareOpen} onClose={() => setShareOpen(false)} slug={slug} defaultSubmissionId={sub.result?._id} onShared={handleShared} />
      )}

      <Dialog open={Boolean(confirm)} onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{confirm?.type === 'reset' ? 'Reset the shared code?' : 'Replace the shared code?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm?.type === 'reset' ? 'The editor goes back to the starter template' : 'The editor will be replaced with this solution'} for you and {friend?.name || 'your partner'}.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 0.5 }}>
          <WsButton variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </WsButton>
          <WsButton variant="primary" onClick={runConfirm}>
            {confirm?.type === 'reset' ? 'Reset' : 'Replace'}
          </WsButton>
        </DialogActions>
      </Dialog>

      {/* video call: floating circles, appears only while a call is on */}
      <FloatingCall call={call} friendName={friend?.name} myName={room.me?.name} hasFriend={!!friend} />
    </Box>
  );
}
