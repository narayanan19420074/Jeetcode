import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Box,
  ButtonBase,
  Stack,
  Typography,
  MenuItem,
  Drawer,
  TextField,
  CircularProgress,
  Chip,
  Skeleton,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import DifficultyChip from '../../components/DifficultyChip';
import InviteButton from '../room/InviteButton';
import SolutionsPanel from './community/SolutionsPanel';
import DiscussionPanel from './community/DiscussionPanel';
import ShareSolutionDialog from './community/ShareSolutionDialog';
import SubmissionsPanel from './SubmissionsPanel';
import ProblemDescription from './ProblemDescription';
import { ConsoleBody, EditorStatus, VerdictChip } from './ConsolePanel';
import SplitHandle from './SplitHandle';
import MobileKeyBar from './MobileKeyBar';
import EditorScroller from './EditorScroller';
import useStopwatch, { formatClock } from './useStopwatch';
import { EmptyState, MaxButton, PaneBar, PaneTabs, WsButton, WsIconButton, WsSelect } from './wsUi';
import { WS, mono } from './wsTokens';
import { wsSurface, defineMonacoThemes, monacoThemeName } from './workspaceTheme';
import { formatCode, preloadFormatter } from './formatCode';
import { aiApi } from '../../api/aiApi';
import { problemsApi } from '../../api/problemsApi';
import { extractErrorMessage } from '../../api/apiClient';
import {
  fetchProblem,
  setLanguage,
  updateCode,
  runCode,
  submitCode,
  toggleAiDrawer,
} from './workspaceSlice';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
];

const DESC_TABS = [
  { value: 0, label: 'Description', icon: <ArticleOutlinedIcon /> },
  { value: 1, label: 'Solutions', icon: <LightbulbOutlinedIcon /> },
  { value: 2, label: 'Discussion', icon: <ForumOutlinedIcon /> },
  { value: 3, label: 'Submissions', icon: <HistoryRoundedIcon /> },
];

const MOBILE_TABS = [
  { value: 'code', label: 'Code' },
  { value: 'solutions', label: 'Solutions' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'submissions', label: 'Submissions' },
];

const AI_QUICK_PROMPTS = [
  'Give me a hint',
  'What is the time complexity?',
  'Which edge cases should I test?',
];

const AI_WELCOME = {
  role: 'assistant',
  text: "I'm here to help you think through the problem — ask about an approach, an edge case, or a complexity trade-off. I won't hand you the full solution.",
};

// Resizable layout (desktop). Sizes are remembered between visits.
const LAYOUT_KEY = 'jeetcode-workspace-layout';
const DEFAULT_LEFT = 0.42; // problem pane share of the width
const DEFAULT_CONSOLE = 0.35; // console share of the editor+console column
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

/* ---------- small building blocks ---------- */

function ProblemSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: { xs: 'calc(100dvh - 56px)', md: 'calc(100vh - 64px)' }, bgcolor: 'background.paper' }}>
      <Box sx={{ width: { xs: '100%', md: '42%' }, p: 2.5 }}>
        <Skeleton variant="rounded" height={32} width="60%" sx={{ mb: 3, borderRadius: `${WS.radius}px` }} />
        <Skeleton width="55%" height={32} />
        <Skeleton variant="rounded" width={72} height={24} sx={{ my: 1.5, borderRadius: 999 }} />
        <Skeleton height={20} />
        <Skeleton height={20} />
        <Skeleton width="80%" height={20} />
        <Skeleton variant="rounded" height={110} sx={{ mt: 3, borderRadius: `${WS.radius + 2}px` }} />
      </Box>
      <Skeleton variant="rectangular" sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} height="100%" />
    </Box>
  );
}

// Practice timer: tap the clock to start, tap the time to pause.
function TimerControl({ sw, size = 'md' }) {
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

/* ---------- page ---------- */

export default function WorkspacePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useSelector((s) => s.auth);
  // Settings -> Editor / Appearance
  const editorPrefs = useSelector((s) => s.ui.editor);
  const uiMode = useSelector((s) => s.ui.mode);

  const {
    currentProblem: problem,
    problemStatus,
    problemError,
    activeLanguage,
    codeByProblem,
    runStatus,
    runResult,
    submitStatus,
    submitResult,
    lastResultKind,
    consoleError,
    aiDrawerOpen,
  } = useSelector((s) => s.workspace);

  const [descTab, setDescTab] = useState(0);
  // Solutions / Discussion / Submissions mount on first visit, then stay mounted
  // (hidden) so switching tabs doesn't lose the open thread or scroll position.
  const [mountedTabs, setMountedTabs] = useState({ 1: false, 2: false, 3: false });
  const [shareOpen, setShareOpen] = useState(false);
  const [solutionsRefresh, setSolutionsRefresh] = useState(0);
  const [pendingLoad, setPendingLoad] = useState(null); // solution waiting for overwrite confirmation
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const location = useLocation();
  const surf = wsSurface(theme);
  const monacoRef = useRef(null);
  // Phone: one page. Tabs = Code | Solutions | Discussion. The problem text opens
  // as a panel sliding in from the right (kept in history state so the phone's
  // Back button closes it instead of leaving the page).
  const [mobileView, setMobileView] = useState('code'); // 'code' | 'solutions' | 'discussion' | 'submissions'
  const descOpen = isMobile && Boolean(location.state?.problemDesc);
  const [editorFocused, setEditorFocused] = useState(false); // phone: shows the symbol bar
  const [editorInstance, setEditorInstance] = useState(null); // fast-scroller + status bar need the editor
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState('cases'); // 'cases' | 'result'
  const [activeCase, setActiveCase] = useState(0);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([AI_WELCOME]);
  const aiEndRef = useRef(null);
  const sw = useStopwatch();

  // Resizable split panes + maximize (desktop only)
  const [layout, setLayout] = useState(loadLayout);
  const [maximized, setMaximized] = useState(null); // null | 'problem' | 'editor' | 'console'
  const rootRef = useRef(null);
  const editorColRef = useRef(null);
  const toggleMax = (which) => setMaximized((m) => (m === which ? null : which));

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
    const f = (x - rect.left) / rect.width;
    setLayout((l) => ({ ...l, left: clamp(f, LEFT_MIN, LEFT_MAX) }));
  };

  const dragConsole = (_x, y) => {
    const el = editorColRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const f = (rect.bottom - y) / rect.height;
    setConsoleOpen(true);
    setLayout((l) => ({ ...l, console: clamp(f, 0.12, 0.8) }));
  };

  const resetSw = sw.reset;
  useEffect(() => {
    dispatch(fetchProblem(slug));
    // New problem => start from a clean workspace (tabs, console, case selection).
    setDescTab(0);
    setMountedTabs({ 1: false, 2: false, 3: false });
    setConsoleOpen(false);
    setConsoleTab('cases');
    setActiveCase(0);
    setMaximized(null);
    setMobileView('code');
    setAiMessages([AI_WELCOME]);
    resetSw();
  }, [dispatch, slug, resetSw]);

  // Start in the language chosen in Settings -> Editor (once per page visit;
  // switching language in the toolbar afterwards still works as before).
  useEffect(() => {
    if (editorPrefs?.defaultLanguage) dispatch(setLanguage(editorPrefs.defaultLanguage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open the console on the Result tab whenever a run / submit starts.
  useEffect(() => {
    if (runStatus === 'running' || submitStatus === 'running') {
      setConsoleOpen(true);
      setConsoleTab('result');
      setActiveCase(0);
    }
  }, [runStatus, submitStatus]);

  // A solved problem stops the clock.
  const pauseSw = sw.pause;
  useEffect(() => {
    if (submitResult?.status === 'Accepted') pauseSw();
  }, [submitResult, pauseSw]);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [aiMessages, aiLoading, aiDrawerOpen]);

  // Editor colours follow the app accent / light-dark mode.
  const accentMain = theme.palette.primary.main;
  useEffect(() => {
    const m = monacoRef.current;
    if (!m) return;
    defineMonacoThemes(m, accentMain);
    m.editor.setTheme(monacoThemeName(editorPrefs.theme, uiMode));
  }, [accentMain, editorPrefs.theme, uiMode]);

  // Phone status bar matches the app bar instead of the old blue.
  const chromeColor = theme.palette.background.paper;
  useEffect(() => {
    const el = document.querySelector('meta[name="theme-color"]');
    if (!el) return undefined;
    const prev = el.getAttribute('content');
    el.setAttribute('content', chromeColor);
    return () => el.setAttribute('content', prev);
  }, [chromeColor]);

  const code = problem
    ? codeByProblem[problem._id]?.[activeLanguage] ?? problem.starterCode[activeLanguage]
    : '';

  // ---- auto-format: Prettier (JS) / indentation fixer (Python) ----
  const editorRef = useRef(null);
  const fmtTimer = useRef(null);
  const composingRef = useRef(false);
  const pasteUntil = useRef(0);
  const fmtCtx = useRef({ language: activeLanguage, tabSize: editorPrefs.tabSize });
  useEffect(() => {
    fmtCtx.current = { language: activeLanguage, tabSize: editorPrefs.tabSize };
    if (activeLanguage === 'javascript') preloadFormatter();
  }, [activeLanguage, editorPrefs.tabSize]);
  useEffect(() => () => clearTimeout(fmtTimer.current), []);

  const runAutoFormat = useCallback(async () => {
    const ed = editorRef.current;
    const model = ed?.getModel();
    if (!ed || !model || composingRef.current) return;
    const sel = ed.getSelection();
    if (sel && !sel.isEmpty()) return;
    const src = model.getValue();
    const { language, tabSize } = fmtCtx.current;
    const res = await formatCode(language, src, model.getOffsetAt(ed.getPosition()), { tabSize });
    // nothing to do, or the user kept typing while we were formatting
    if (res.code === src || model.getValue() !== src || composingRef.current) return;
    // replace only the span that changed so the caret / scroll stay put
    let start = 0;
    const maxStart = Math.min(src.length, res.code.length);
    while (start < maxStart && src[start] === res.code[start]) start += 1;
    let endOld = src.length;
    let endNew = res.code.length;
    while (endOld > start && endNew > start && src[endOld - 1] === res.code[endNew - 1]) {
      endOld -= 1;
      endNew -= 1;
    }
    const a = model.getPositionAt(start);
    const b = model.getPositionAt(endOld);
    ed.pushUndoStop();
    ed.executeEdits('auto-format', [
      {
        range: { startLineNumber: a.lineNumber, startColumn: a.column, endLineNumber: b.lineNumber, endColumn: b.column },
        text: res.code.slice(start, endNew),
      },
    ]);
    ed.pushUndoStop();
    ed.setPosition(model.getPositionAt(res.cursorOffset));
  }, []);

  const scheduleAutoFormat = useCallback(
    (delay = 1200) => {
      if (Date.now() < pasteUntil.current) return; // a paste already queued a faster format
      clearTimeout(fmtTimer.current);
      fmtTimer.current = setTimeout(runAutoFormat, delay);
    },
    [runAutoFormat]
  );

  const handleEditorMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      setEditorInstance(editor);
      // Don't touch the text while the phone keyboard is composing a word.
      editor.onDidCompositionStart(() => {
        composingRef.current = true;
      });
      editor.onDidCompositionEnd(() => {
        composingRef.current = false;
        scheduleAutoFormat();
      });
      editor.onDidFocusEditorText(() => setEditorFocused(true));
      editor.onDidBlurEditorText(() => setEditorFocused(false));
      editor.onDidPaste(() => {
        clearTimeout(fmtTimer.current);
        pasteUntil.current = Date.now() + 500;
        fmtTimer.current = setTimeout(runAutoFormat, 250);
      });
    },
    [runAutoFormat, scheduleAutoFormat]
  );

  const handleEditorChange = useCallback(
    (value) => {
      if (!problem) return;
      dispatch(updateCode({ problemId: problem._id, language: activeLanguage, code: value ?? '' }));
      scheduleAutoFormat();
    },
    [dispatch, problem, activeLanguage, scheduleAutoFormat]
  );

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
  const keepFocus = (e) => e.preventDefault(); // tapping Run must not drop the keyboard mid-tap

  // Safety net: whatever is typed, Run / Submit send correctly indented code.
  const prepareCode = async () => {
    clearTimeout(fmtTimer.current);
    const res = await formatCode(activeLanguage, code, 0, { tabSize: editorPrefs.tabSize });
    if (res.code !== code) {
      dispatch(updateCode({ problemId: problem._id, language: activeLanguage, code: res.code }));
    }
    return res.code;
  };

  const handleRun = async () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
    if (isMobile) document.activeElement?.blur?.(); // close the keyboard so the result is visible
    const finalCode = await prepareCode();
    dispatch(runCode({ problemSlug: slug, language: activeLanguage, code: finalCode }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
    if (isMobile) document.activeElement?.blur?.();
    const finalCode = await prepareCode();
    dispatch(submitCode({ problemSlug: slug, language: activeLanguage, code: finalCode }));
  };

  // Keyboard shortcuts (desktop): Ctrl/Cmd + ' runs, Ctrl/Cmd + Enter submits.
  const isRunning = runStatus === 'running' || submitStatus === 'running';
  const actionsRef = useRef({});
  actionsRef.current = { run: handleRun, submit: handleSubmit, busy: isRunning || !problem };
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
      if (typing && !inEditor) return; // Ctrl+Enter in a comment box must not submit code
      e.preventDefault();
      e.stopPropagation();
      const a = actionsRef.current;
      if (a.busy) return;
      (isRun ? a.run : a.submit)();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isMobile]);

  const openTab = (v) => {
    setDescTab(v);
    if (v > 0) setMountedTabs((m) => ({ ...m, [v]: true }));
  };

  const openMobileView = (v) => {
    setMobileView(v);
    if (v === 'solutions') setMountedTabs((m) => ({ ...m, 1: true }));
    if (v === 'discussion') setMountedTabs((m) => ({ ...m, 2: true }));
    if (v === 'submissions') setMountedTabs((m) => ({ ...m, 3: true }));
  };

  const openDesc = () => navigate(`${location.pathname}${location.search}`, { state: { problemDesc: true } });
  const closeDesc = () => {
    if (location.state?.problemDesc) navigate(-1);
  };

  // Puts a community solution's code into the editor (and switches language).
  const applySolution = (sol) => {
    dispatch(setLanguage(sol.language));
    dispatch(updateCode({ problemId: problem._id, language: sol.language, code: sol.code }));
    setMobileView('code');
    setPendingLoad(null);
    enqueueSnackbar('Solution loaded in the editor', { variant: 'success' });
  };

  const handleSendToEditor = (sol) => {
    const current = codeByProblem[problem._id]?.[sol.language];
    const starter = problem.starterCode[sol.language];
    const hasOwnWork = current != null && current.trim() !== '' && current !== starter && current !== sol.code;
    if (hasOwnWork) setPendingLoad(sol);
    else applySolution(sol);
  };

  const handleShared = () => {
    setSolutionsRefresh((k) => k + 1);
    openTab(1);
    setMobileView('solutions');
    enqueueSnackbar('Solution shared', { variant: 'success' });
  };

  const handleResetCode = () => {
    setMoreAnchor(null);
    if (!problem) return;
    dispatch(updateCode({ problemId: problem._id, language: activeLanguage, code: problem.starterCode[activeLanguage] ?? '' }));
    enqueueSnackbar('Code reset to the starter template', { variant: 'info' });
  };

  const handleCopyCode = async () => {
    setMoreAnchor(null);
    try {
      await navigator.clipboard.writeText(code);
      enqueueSnackbar('Code copied', { variant: 'success' });
    } catch {
      enqueueSnackbar('Could not copy code', { variant: 'error' });
    }
  };

  const handleFormat = () => {
    setMoreAnchor(null);
    runAutoFormat();
  };

  const handleRandom = async () => {
    try {
      const { data } = await problemsApi.getRandom();
      navigate(`/workspace/${data.data.slug}`);
    } catch (e) {
      enqueueSnackbar(extractErrorMessage(e), { variant: 'error' });
    }
  };

  const handleAiSend = async () => {
    if (!aiInput.trim() || !problem || aiLoading) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
      return;
    }

    const question = aiInput.trim();
    const userMsg = { role: 'user', text: question };
    const historyForApi = aiMessages.slice(-6); // exclude the new question, sent separately
    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const { data } = await aiApi.hint({
        problemSlug: slug,
        language: activeLanguage,
        code,
        question,
        history: historyForApi,
      });
      setAiMessages((prev) => [...prev, { role: 'assistant', text: data.data.hint }]);
    } catch (err) {
      setAiMessages((prev) => [...prev, { role: 'assistant', text: extractErrorMessage(err) }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (problemStatus === 'loading') {
    return <ProblemSkeleton />;
  }

  if (problemStatus === 'error' || !problem) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 1, px: 2, textAlign: 'center' }}>
        <EmptyState
          icon={<CancelRoundedIcon />}
          title="Couldn't open this problem"
          text={problemError || 'Problem not found'}
          action={
            <WsButton variant="secondary" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/dashboard')} sx={{ mt: 1 }}>
              Back to Dashboard
            </WsButton>
          }
        />
      </Box>
    );
  }

  // Show whichever of Run / Submit the user did LAST (a stale submit result must
  // not hide a fresh run).
  const resultToShow =
    lastResultKind === 'run' ? runResult : lastResultKind === 'submit' ? submitResult : submitResult || runResult;
  const isSubmitView = lastResultKind === 'submit';
  const canShare = !isRunning && isSubmitView && submitResult?.status === 'Accepted' && Boolean(submitResult._id);
  const ctl = isMobile ? 'lg' : 'md';

  const consoleBody = (
    <ConsoleBody
      problem={problem}
      isRunning={isRunning}
      result={resultToShow}
      isSubmitView={isSubmitView}
      consoleError={consoleError}
      tab={consoleTab}
      onTab={setConsoleTab}
      activeCase={activeCase}
      onCase={setActiveCase}
    />
  );

  const hoverScrollbars = (t) => {
    const thumb = alpha(t.palette.text.primary, 0.35);
    return {
      // Scrollbars stay invisible until the pointer is over the scrollable area.
      '& *': { scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' },
      '& *:hover': { scrollbarColor: `${thumb} transparent` },
      '& *::-webkit-scrollbar': { width: 8, height: 8 },
      '& *::-webkit-scrollbar-track': { background: 'transparent' },
      '& *::-webkit-scrollbar-thumb': { backgroundColor: 'transparent', borderRadius: 8 },
      '& *:hover::-webkit-scrollbar-thumb': { backgroundColor: thumb },
      // Monaco draws its own scrollbars
      '& .monaco-scrollable-element > .scrollbar > .slider': { opacity: 0, transition: 'opacity .2s' },
      '& .monaco-editor:hover .monaco-scrollable-element > .scrollbar > .slider': { opacity: 1 },
    };
  };

  return (
    <Box
      ref={rootRef}
      sx={(t) => ({
        ...hoverScrollbars(t),
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: { xs: 'calc(100dvh - 56px)', md: 'calc(100vh - 64px)' },
        bgcolor: surf.chrome,
        overflow: 'hidden',
      })}
    >
      {isMobile && (
        <Box sx={{ flexShrink: 0, bgcolor: surf.chrome }}>
          {/* Tap the problem name -> description slides in from the right */}
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

          {/* the one hairline: header block vs. content */}
          <PaneBar height={48} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <PaneTabs size="lg" value={mobileView} onChange={openMobileView} items={MOBILE_TABS} />
          </PaneBar>
        </Box>
      )}

      {/* Left pane — problem description (desktop only) */}
      {!isMobile && (
        <Box
          sx={{
            bgcolor: surf.chrome,
            width: maximized === 'problem' ? '100%' : `${layout.left * 100}%`,
            minWidth: 0,
            flex: maximized === 'problem' ? 1 : 'none',
            display: maximized === 'editor' || maximized === 'console' ? 'none' : 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <PaneBar>
            <PaneTabs value={descTab} onChange={openTab} items={DESC_TABS} />
            <Box sx={{ flex: 1 }} />
            <WsIconButton title="Random problem" onClick={handleRandom}>
              <ShuffleRoundedIcon />
            </WsIconButton>
            <MaxButton active={maximized === 'problem'} onClick={() => toggleMax('problem')} label="problem" />
          </PaneBar>

          <Box sx={{ overflowY: 'auto', px: 2.5, pt: 1.5, pb: 3, flex: 1, minHeight: 0 }}>
            {descTab === 0 && <ProblemDescription problem={problem} />}
            {mountedTabs[1] && (
              <Box sx={{ display: descTab === 1 ? 'block' : 'none' }}>
                <SolutionsPanel slug={slug} refreshKey={solutionsRefresh} onShare={() => setShareOpen(true)} onSendToEditor={handleSendToEditor} />
              </Box>
            )}
            {mountedTabs[2] && (
              <Box sx={{ display: descTab === 2 ? 'block' : 'none' }}>
                <DiscussionPanel slug={slug} />
              </Box>
            )}
            {mountedTabs[3] && (
              <Box sx={{ display: descTab === 3 ? 'block' : 'none' }}>
                <SubmissionsPanel
                  slug={slug}
                  isAuthenticated={isAuthenticated}
                  refreshKey={submitResult?._id ?? 0}
                  onLoad={handleSendToEditor}
                  onSignIn={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}
                />
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* The single seam between problem and editor (desktop) */}
      <Box sx={{ display: { xs: 'none', md: maximized ? 'none' : 'flex' }, alignSelf: 'stretch' }}>
        <SplitHandle orientation="vertical" label="Resize problem and editor panes" onDrag={dragLeft} onReset={() => setLayout((l) => ({ ...l, left: DEFAULT_LEFT }))} />
      </Box>

      {/* Right pane — editor + runner */}
      <Box
        sx={{
          bgcolor: surf.chrome,
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          flexDirection: 'column',
          display: { xs: mobileView === 'code' ? 'flex' : 'none', md: maximized === 'problem' ? 'none' : 'flex' },
        }}
      >
        <PaneBar sx={{ px: { xs: 1.25, md: 1.25 }, gap: { xs: 0.5, md: 0.5 }, height: { xs: 52, md: WS.bar }, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <WsSelect
            value={activeLanguage}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            startAdornment={<CodeRoundedIcon sx={{ fontSize: 17, mr: 0.75, color: 'primary.main' }} />}
            sx={isMobile ? { height: WS.ctrlLg, minWidth: 124, '& .MuiSelect-select': { height: `${WS.ctrlLg}px` } } : undefined}
          >
            {LANGUAGES.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.label}
              </MenuItem>
            ))}
          </WsSelect>
          <TimerControl sw={sw} size={ctl} />

          <Box sx={{ flex: 1, minWidth: 8 }} />

          <InviteButton problem={problem} language={activeLanguage} code={code} size={ctl} />
          <WsIconButton title="AI assistant" size={ctl} active={aiDrawerOpen} onClick={() => dispatch(toggleAiDrawer())}>
            <AutoAwesomeRoundedIcon />
          </WsIconButton>
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
            <MenuItem onClick={handleFormat}>
              <ListItemIcon>
                <AutoFixHighRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Format code</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleResetCode}>
              <ListItemIcon>
                <RestartAltRoundedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Reset to starter</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setMoreAnchor(null);
                navigate('/settings');
              }}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Editor settings</ListItemText>
            </MenuItem>
          </Menu>
          {!isMobile && <MaxButton active={maximized === 'editor'} onClick={() => toggleMax('editor')} label="editor" />}

          {/* Run / Submit: bottom bar on phones (thumb reach), here on md+ */}
          {!isMobile && (
            <>
              <Box sx={{ width: 4 }} />
              <WsButton
                variant="secondary"
                startIcon={<PlayArrowRoundedIcon />}
                loading={runStatus === 'running'}
                disabled={isRunning}
                onClick={handleRun}
                kbd="Ctrl '"
              >
                Run
              </WsButton>
              <WsButton
                variant="primary"
                startIcon={<CloudUploadRoundedIcon />}
                loading={submitStatus === 'running'}
                disabled={isRunning}
                onClick={handleSubmit}
                kbd="Ctrl ↵"
              >
                Submit
              </WsButton>
            </>
          )}
        </PaneBar>

        {!isAuthenticated && (
          <Stack
            direction="row"
            sx={(t) => ({ alignItems: 'center', gap: 1, px: 1.5, py: 0.75, flexShrink: 0, bgcolor: alpha(t.palette.primary.main, 0.1), color: 'text.primary' })}
          >
            <LockOutlinedIcon sx={{ fontSize: 17, color: 'primary.main', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ flex: 1, lineHeight: 1.4 }}>
              Sign in to run or submit — your progress and streak are saved.
            </Typography>
            <WsButton variant="ghost" onClick={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })} sx={{ color: 'primary.main', height: 28 }}>
              Sign in
            </WsButton>
          </Stack>
        )}

        <Box ref={editorColRef} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ position: 'relative', bgcolor: surf.canvas, flex: 1, minHeight: 0, display: !isMobile && maximized === 'console' ? 'none' : 'block' }}>
            <Editor
              height="100%"
              language={activeLanguage === 'cpp' ? 'cpp' : activeLanguage}
              theme={monacoThemeName(editorPrefs.theme, uiMode)}
              beforeMount={(monaco) => {
                monacoRef.current = monaco;
                defineMonacoThemes(monaco, accentMain);
              }}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              loading={<CircularProgress size={26} />}
              options={{
                fontSize: editorPrefs.fontSize,
                fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Consolas, monospace',
                minimap: { enabled: editorPrefs.minimap },
                wordWrap: isMobile || editorPrefs.wordWrap ? 'on' : 'off', // phones: never scroll sideways
                wrappingIndent: 'indent',
                lineNumbers: editorPrefs.lineNumbers ? 'on' : 'off',
                fontLigatures: editorPrefs.ligatures,
                autoClosingBrackets: editorPrefs.autoClose ? 'languageDefined' : 'never',
                autoClosingQuotes: editorPrefs.autoClose ? 'languageDefined' : 'never',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: editorPrefs.tabSize,
                insertSpaces: true,
                detectIndentation: false,
                autoIndent: 'full',
                trimAutoWhitespace: true,
                smoothScrolling: true,
                padding: { top: 12, bottom: 12 },
                ...(isMobile
                  ? {
                      folding: false,
                      glyphMargin: false,
                      lineNumbersMinChars: 2,
                      lineDecorationsWidth: 6,
                      renderLineHighlight: 'gutter',
                      overviewRulerLanes: 0,
                      hideCursorInOverviewRuler: true,
                      scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                      stickyScroll: { enabled: false },
                      // Popups cover a phone screen and Enter would accept them instead of adding a new line.
                      quickSuggestions: false,
                      suggestOnTriggerCharacters: false,
                      acceptSuggestionOnEnter: 'off',
                      acceptSuggestionOnCommitCharacter: false,
                      wordBasedSuggestions: 'off',
                      parameterHints: { enabled: false },
                      hover: { enabled: false },
                      contextmenu: false,
                      occurrencesHighlight: 'off',
                      selectionHighlight: false,
                    }
                  : { lineNumbersMinChars: 3 }),
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
            />
          )}

          {/* Seam between editor and console (desktop, only while the console is open) */}
          {!isMobile && consoleOpen && maximized !== 'console' && (
            <SplitHandle orientation="horizontal" label="Resize editor and console" onDrag={dragConsole} onReset={() => setLayout((l) => ({ ...l, console: DEFAULT_CONSOLE }))} />
          )}

          {/* Console — collapsible testcase / result panel */}
          <Box
            sx={{
              bgcolor: surf.panel,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
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
              {!(isMobile && (isRunning || resultToShow)) && <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Console</Typography>}
              <VerdictChip isRunning={isRunning} result={resultToShow} sx={{ maxWidth: { xs: '44vw', md: 'none' } }} />
              {!isMobile && canShare && (
                <WsButton
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation(); // don't toggle the console
                    setShareOpen(true);
                  }}
                  sx={{ height: 26, color: 'primary.main' }}
                >
                  Share solution
                </WsButton>
              )}
              <Box sx={{ flex: 1 }} />
              {isMobile && (
                <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <WsButton
                    size="lg"
                    variant="secondary"
                    onPointerDown={keepFocus}
                    onMouseDown={keepFocus}
                    onClick={handleRun}
                    disabled={isRunning}
                    loading={runStatus === 'running'}
                    startIcon={<PlayArrowRoundedIcon />}
                  >
                    Run
                  </WsButton>
                  <WsButton
                    size="lg"
                    variant="primary"
                    onPointerDown={keepFocus}
                    onMouseDown={keepFocus}
                    onClick={handleSubmit}
                    disabled={isRunning}
                    loading={submitStatus === 'running'}
                    startIcon={<CloudUploadRoundedIcon />}
                  >
                    Submit
                  </WsButton>
                </Stack>
              )}
              {!isMobile && <EditorStatus editor={editorInstance} tabSize={editorPrefs.tabSize} />}
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
              <ExpandMoreRoundedIcon
                sx={{ color: 'text.secondary', transition: 'transform .2s', transform: consoleOpen ? 'none' : 'rotate(180deg)' }}
              />
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

      {/* Phone: Solutions / Discussion / Submissions sit next to the Code tab */}
      {isMobile && mountedTabs[1] && (
        <Box sx={{ display: mobileView === 'solutions' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1.5, pb: 3, bgcolor: surf.chrome }}>
          <SolutionsPanel slug={slug} refreshKey={solutionsRefresh} onShare={() => setShareOpen(true)} onSendToEditor={handleSendToEditor} />
        </Box>
      )}
      {isMobile && mountedTabs[2] && (
        <Box sx={{ display: mobileView === 'discussion' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1.5, pb: 3, bgcolor: surf.chrome }}>
          <DiscussionPanel slug={slug} />
        </Box>
      )}
      {isMobile && mountedTabs[3] && (
        <Box sx={{ display: mobileView === 'submissions' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 1.5, pb: 3, bgcolor: surf.chrome }}>
          <SubmissionsPanel
            slug={slug}
            isAuthenticated={isAuthenticated}
            refreshKey={submitResult?._id ?? 0}
            onLoad={handleSendToEditor}
            onSignIn={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}
          />
        </Box>
      )}

      {/* Phone: problem description, slides in right -> left */}
      <Drawer
        anchor="right"
        open={descOpen}
        onClose={closeDesc}
        slotProps={{ paper: { sx: { width: '100%', maxWidth: '100%' } } }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', gap: 0.5, px: 1, pb: 0.75, pt: 'calc(6px + env(safe-area-inset-top))', flexShrink: 0, bgcolor: surf.chrome }}
        >
          <WsIconButton title="Back to code" size="lg" onClick={closeDesc}>
            <ArrowBackRoundedIcon />
          </WsIconButton>
          <Typography sx={{ fontWeight: 700, flex: 1 }}>Problem</Typography>
        </Stack>
        <Box sx={{ overflowY: 'auto', px: 2, pt: 1, pb: 3, flex: 1, minHeight: 0, bgcolor: surf.chrome }}>
          <ProblemDescription problem={problem} />
        </Box>
        <Box sx={{ flexShrink: 0, p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', bgcolor: surf.chrome }}>
          <WsButton fullWidth size="lg" variant="primary" startIcon={<CodeRoundedIcon />} onClick={closeDesc}>
            Start coding
          </WsButton>
        </Box>
      </Drawer>

      <ShareSolutionDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        slug={slug}
        defaultSubmissionId={submitResult?._id}
        onShared={handleShared}
      />

      <Dialog open={Boolean(pendingLoad)} onClose={() => setPendingLoad(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Replace your code?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your current {LANGUAGES.find((l) => l.id === pendingLoad?.language)?.label} code in the editor will be replaced with this solution.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 0.5 }}>
          <WsButton variant="ghost" onClick={() => setPendingLoad(null)}>
            Cancel
          </WsButton>
          <WsButton variant="primary" onClick={() => applySolution(pendingLoad)}>
            Replace
          </WsButton>
        </DialogActions>
      </Dialog>

      {/* AI assistant drawer */}
      <Drawer
        anchor="right"
        open={aiDrawerOpen}
        onClose={() => dispatch(toggleAiDrawer())}
        slotProps={{ paper: { sx: { width: 'min(400px, 100vw)', borderRadius: 0 } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <PaneBar height={56} sx={{ px: 2, gap: 1.25 }}>
            <Box sx={(t) => ({ width: 32, height: 32, borderRadius: `${WS.radius}px`, display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.primary.main, 0.14), color: 'primary.main' })}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 19 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.95rem' }}>AI Assistant</Typography>
              <Typography variant="caption" color="text.secondary">
                Hints only, no full solutions
              </Typography>
            </Box>
            {aiMessages.length > 1 && (
              <WsIconButton title="Clear chat" onClick={() => setAiMessages([AI_WELCOME])}>
                <DeleteSweepOutlinedIcon />
              </WsIconButton>
            )}
            <WsIconButton title="Close" onClick={() => dispatch(toggleAiDrawer())}>
              <CloseRoundedIcon />
            </WsIconButton>
          </PaneBar>

          <Box
            sx={(t) => ({
              flex: 1,
              overflowY: 'auto',
              px: 2,
              py: 1.5,
              scrollbarWidth: 'thin',
              scrollbarColor: 'transparent transparent',
              '&:hover': { scrollbarColor: `${alpha(t.palette.text.primary, 0.35)} transparent` },
            })}
          >
            <Stack sx={{ gap: 1.25 }}>
              {aiMessages.map((m, i) => (
                <Box
                  key={i}
                  sx={(t) => ({
                    px: 1.5,
                    py: 1.1,
                    borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                    bgcolor: m.role === 'user' ? 'primary.main' : wsSurface(t).raised,
                    color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    ml: m.role === 'user' ? 5 : 0,
                    mr: m.role === 'user' ? 0 : 5,
                  })}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                    {m.text}
                  </Typography>
                </Box>
              ))}
              {aiLoading && (
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <CircularProgress size={14} />
                  <Typography variant="body2">Thinking…</Typography>
                </Stack>
              )}
              <div ref={aiEndRef} />
            </Stack>
          </Box>

          <Box sx={{ px: 2, pt: 1, pb: 'calc(14px + env(safe-area-inset-bottom))' }}>
            <Stack direction="row" sx={{ gap: 0.75, mb: 1.25, overflowX: 'auto', pb: 0.25 }}>
              {AI_QUICK_PROMPTS.map((p) => (
                <Chip
                  key={p}
                  clickable
                  size="small"
                  label={p}
                  onClick={() => setAiInput(p)}
                  sx={(t) => ({ flexShrink: 0, borderRadius: `${WS.radius}px`, bgcolor: wsSurface(t).raised, fontWeight: 600 })}
                />
              ))}
            </Stack>
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Ask for a hint, not the answer..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !aiLoading && handleAiSend()}
                disabled={aiLoading}
                slotProps={{ input: { sx: (t) => ({ borderRadius: `${WS.radius}px`, height: WS.ctrlLg, bgcolor: wsSurface(t).raised, '& fieldset': { border: 'none' } }) } }}
              />
              <WsIconButton
                title="Send"
                size="lg"
                onClick={handleAiSend}
                disabled={aiLoading || !aiInput.trim()}
                sx={(t) => ({ color: t.palette.primary.contrastText, bgcolor: t.palette.primary.main, '&:hover': { bgcolor: t.palette.primary.dark, color: t.palette.primary.contrastText }, '&.Mui-disabled': { bgcolor: t.palette.action.disabledBackground, color: t.palette.text.disabled } })}
              >
                <SendRoundedIcon />
              </WsIconButton>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
