import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Box,
  ButtonBase,
  Stack,
  Typography,
  Chip,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Button,
  IconButton,
  Drawer,
  TextField,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
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
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import RuleRoundedIcon from '@mui/icons-material/RuleRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import DifficultyChip from '../../components/DifficultyChip';
import InviteButton from '../room/InviteButton';
import SolutionsPanel from './community/SolutionsPanel';
import DiscussionPanel from './community/DiscussionPanel';
import ShareSolutionDialog from './community/ShareSolutionDialog';
import SplitHandle from './SplitHandle';
import MobileKeyBar from './MobileKeyBar';
import EditorScroller from './EditorScroller';
import { wsSurface, defineMonacoThemes, monacoThemeName } from './workspaceTheme';
import { formatCode, preloadFormatter } from './formatCode';
import { aiApi } from '../../api/aiApi';
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
  { label: 'Description', icon: <ArticleOutlinedIcon /> },
  { label: 'Solutions', icon: <LightbulbOutlinedIcon /> },
  { label: 'Discussion', icon: <ForumOutlinedIcon /> },
];

const AI_QUICK_PROMPTS = [
  'Give me a hint',
  'What is the time complexity?',
  'Which edge cases should I test?',
];

// Resizable layout (desktop). Sizes are remembered between visits.
const LAYOUT_KEY = 'jeetcode-workspace-layout';
const DEFAULT_LEFT = 0.42; // problem pane share of the width
const DEFAULT_CONSOLE = 0.35; // console share of the editor+console column
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const loadLayout = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
    return {
      left: clamp(Number(raw.left) || DEFAULT_LEFT, 0.2, 0.75),
      console: clamp(Number(raw.console) || DEFAULT_CONSOLE, 0.12, 0.8),
    };
  } catch {
    return { left: DEFAULT_LEFT, console: DEFAULT_CONSOLE };
  }
};

const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };

/* ---------- small building blocks ---------- */

function EmptyState({ icon, title, text }) {
  return (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', py: 6, px: 2, gap: 1.5 }}>
      <Box
        sx={(t) => ({
          width: 64,
          height: 64,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(t.palette.primary.main, 0.12),
          color: 'primary.main',
          '& svg': { fontSize: 30 },
        })}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
        {text}
      </Typography>
    </Stack>
  );
}

function SectionTitle({ icon, children }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.25 }}>
      <Box sx={{ display: 'grid', placeItems: 'center', color: 'primary.main', '& svg': { fontSize: 20 } }}>{icon}</Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{children}</Typography>
    </Stack>
  );
}

function ExampleRow({ icon, label, value, plain }) {
  return (
    <Box sx={{ mb: 1.25, '&:last-child': { mb: 0 } }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mb: 0.5, color: 'text.secondary', '& svg': { fontSize: 16 } }}>
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
      </Stack>
      {plain ? (
        <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {value}
        </Typography>
      ) : (
        <Box
          sx={(t) => ({
            ...mono,
            fontSize: '0.82rem',
            lineHeight: 1.6,
            px: 1.5,
            py: 1,
            borderRadius: '10px',
            bgcolor: wsSurface(t).raised,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          })}
        >
          {value}
        </Box>
      )}
    </Box>
  );
}

function ExampleCard({ index, example }) {
  return (
    <Box sx={{ mb: 1.5, p: 1.75, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={(t) => ({
            width: 24,
            height: 24,
            borderRadius: '8px',
            display: 'grid',
            placeItems: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
            bgcolor: alpha(t.palette.primary.main, 0.14),
            color: 'primary.main',
          })}
        >
          {index + 1}
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Example {index + 1}</Typography>
      </Stack>
      <ExampleRow icon={<LoginRoundedIcon />} label="Input" value={example.input} />
      <ExampleRow icon={<LogoutRoundedIcon />} label="Output" value={example.output} />
      {example.explanation && (
        <ExampleRow icon={<TipsAndUpdatesOutlinedIcon />} label="Explanation" value={example.explanation} plain />
      )}
    </Box>
  );
}

function ProblemSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, p: { xs: 1.5, md: 1.5 }, height: { xs: 'calc(100dvh - 56px)', md: 'calc(100vh - 64px)' } }}>
      <Box sx={{ width: { xs: '100%', md: '42%' }, flex: { xs: 'none', md: 'none' }, p: 2.5, borderRadius: '20px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Skeleton variant="rounded" height={36} sx={{ mb: 3, borderRadius: 999 }} />
        <Skeleton width="60%" height={34} />
        <Stack direction="row" sx={{ gap: 1, my: 1.5 }}>
          <Skeleton variant="rounded" width={64} height={26} sx={{ borderRadius: 999 }} />
          <Skeleton variant="rounded" width={80} height={26} sx={{ borderRadius: 999 }} />
        </Stack>
        <Skeleton height={20} />
        <Skeleton height={20} />
        <Skeleton width="80%" height={20} />
        <Skeleton variant="rounded" height={110} sx={{ mt: 3, borderRadius: '16px' }} />
      </Box>
      <Skeleton variant="rounded" sx={{ flex: 1, display: { xs: 'none', md: 'block' }, borderRadius: '20px' }} height="100%" />
    </Box>
  );
}

function MaxButton({ active, onClick, label }) {
  return (
    <Tooltip title={active ? `Restore ${label}` : `Maximize ${label}`}>
      <IconButton
        size="small"
        aria-label={active ? `Restore ${label}` : `Maximize ${label}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        sx={{ width: 32, height: 32, color: 'text.secondary', flexShrink: 0 }}
      >
        {active ? <CloseFullscreenRoundedIcon sx={{ fontSize: 17 }} /> : <OpenInFullRoundedIcon sx={{ fontSize: 17 }} />}
      </IconButton>
    </Tooltip>
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
  // Solutions / Discussion mount on first visit, then stay mounted (hidden) so
  // switching tabs doesn't lose the open thread or scroll position.
  const [mountedTabs, setMountedTabs] = useState({ 1: false, 2: false });
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
  const [mobileView, setMobileView] = useState('code'); // 'code' | 'solutions' | 'discussion'
  const descOpen = isMobile && Boolean(location.state?.problemDesc);
  const [editorFocused, setEditorFocused] = useState(false); // phone: shows the symbol bar
  const [editorInstance, setEditorInstance] = useState(null); // phone: fast-scroller needs the editor
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(0);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      text: "I'm here to help you think through the problem — ask about an approach, an edge case, or a complexity trade-off. I won't hand you the full solution.",
    },
  ]);
  const aiEndRef = useRef(null);

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
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const usable = rect.width - pad * 2;
    const f = (x - rect.left - pad) / usable;
    setLayout((l) => ({ ...l, left: clamp(f, 0.2, 0.75) }));
  };

  const dragConsole = (_x, y) => {
    const el = editorColRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const f = (rect.bottom - y) / rect.height;
    setConsoleOpen(true);
    setLayout((l) => ({ ...l, console: clamp(f, 0.12, 0.8) }));
  };

  useEffect(() => {
    dispatch(fetchProblem(slug));
    // New problem => start from a clean workspace (tabs, console, case selection).
    setDescTab(0);
    setMountedTabs({ 1: false, 2: false });
    setConsoleOpen(false);
    setActiveCase(0);
    setMaximized(null);
    setMobileView('code');
  }, [dispatch, slug]);

  // Start in the language chosen in Settings -> Editor (once per page visit;
  // switching language in the toolbar afterwards still works as before).
  useEffect(() => {
    if (editorPrefs?.defaultLanguage) dispatch(setLanguage(editorPrefs.defaultLanguage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open the console whenever a run / submit starts so the result is visible.
  useEffect(() => {
    if (runStatus === 'running' || submitStatus === 'running') {
      setConsoleOpen(true);
      setActiveCase(0);
    }
  }, [runStatus, submitStatus]);

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

  const openTab = (v) => {
    setDescTab(v);
    if (v > 0) setMountedTabs((m) => ({ ...m, [v]: true }));
  };

  const openMobileView = (v) => {
    setMobileView(v);
    if (v === 'solutions') setMountedTabs((m) => ({ ...m, 1: true }));
    if (v === 'discussion') setMountedTabs((m) => ({ ...m, 2: true }));
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 2, px: 2, textAlign: 'center' }}>
        <EmptyState icon={<CancelRoundedIcon />} title="Couldn't open this problem" text={problemError || 'Problem not found'} />
        <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Show whichever of Run / Submit the user did LAST (a stale submit result must
  // not hide a fresh run).
  const resultToShow =
    lastResultKind === 'run' ? runResult : lastResultKind === 'submit' ? submitResult : submitResult || runResult;
  const isSubmitView = lastResultKind === 'submit';
  const fmtMs = (sec) => (sec == null || Number.isNaN(parseFloat(sec)) ? null : `${Math.round(parseFloat(sec) * 1000)} ms`);
  const fmtMem = (kb) => (kb ? `${(kb / 1024).toFixed(1)} MB` : null);
  const isRunning = runStatus === 'running' || submitStatus === 'running';
  const isAccepted = resultToShow?.status === 'Accepted';
  const passedPct = resultToShow?.totalCount ? (resultToShow.passedCount / resultToShow.totalCount) * 100 : 0;
  const testResults = resultToShow?.testResults ?? [];
  const selectedCase = testResults[Math.min(activeCase, testResults.length - 1)];

  const descriptionContent = (
  <>
      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1.25, mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
          {problem.title}
        </Typography>
        <DifficultyChip difficulty={problem.difficulty} />
      </Stack>
  
      {problem.tags?.length > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
          {problem.tags.map((t) => (
            <Chip
              key={t}
              icon={<SellOutlinedIcon />}
              label={t}
              size="small"
              sx={(th) => ({
                bgcolor: alpha(th.palette.primary.main, th.palette.mode === 'dark' ? 0.14 : 0.09),
                color: 'primary.main',
                '& .MuiChip-icon': { fontSize: 14, color: 'inherit' },
              })}
            />
          ))}
        </Stack>
      )}
  
      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 3, lineHeight: 1.75 }}>
        {problem.description}
      </Typography>
  
      <SectionTitle icon={<ScienceOutlinedIcon />}>Examples</SectionTitle>
      {problem.examples.map((ex, i) => (
        <ExampleCard key={i} index={i} example={ex} />
      ))}
  
      <Box sx={{ mt: 3 }}>
        <SectionTitle icon={<RuleRoundedIcon />}>Constraints</SectionTitle>
        <Stack sx={{ gap: 0.75 }}>
          {problem.constraints.map((c, i) => (
            <Stack key={i} direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
              <DataObjectRoundedIcon sx={{ fontSize: 16, mt: '4px', color: 'text.disabled', flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary" sx={{ ...mono, fontSize: '0.8rem', lineHeight: 1.6, wordBreak: 'break-word' }}>
                {c}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </>

  );

  const panelSx = {
    bgcolor: 'background.paper',
    border: { md: '1px solid' },
    borderColor: 'divider',
    borderRadius: { xs: 0, md: '20px' },
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  };

  const split = !isMobile && !maximized; // two panes side by side, sharing one divider
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
        gap: 0,
        p: { xs: 0, md: 1.5 },
        height: { xs: 'calc(100dvh - 56px)', md: 'calc(100vh - 64px)' },
        bgcolor: { xs: 'background.paper', md: 'transparent' },
        overflow: 'hidden',
      })}
    >
      {isMobile && (
        <Box sx={{ flexShrink: 0 }}>
          {/* Tap the problem name -> description slides in from the right */}
          <ButtonBase
            onClick={openDesc}
            aria-label="Open problem description"
            sx={(t) => ({
              width: '100%',
              justifyContent: 'flex-start',
              gap: 1.25,
              pl: 1.5,
              pr: 1.5,
              py: 1.1,
              textAlign: 'left',
              borderLeft: `4px solid ${t.palette.primary.main}`,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: surf.raised,
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

          <Tabs
            value={mobileView}
            onChange={(e, v) => openMobileView(v)}
            variant="fullWidth"
            sx={{
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
            <Tab value="solutions" label="Solutions" />
            <Tab value="discussion" label="Discussion" />
          </Tabs>
        </Box>
      )}

      {/* Left pane — problem description (desktop only) */}
      {!isMobile && (
        <Box
          sx={{
            ...panelSx,
            ...(split ? { borderRadius: { xs: 0, md: '20px 0 0 20px' }, borderRight: { md: 'none' } } : {}),
            width: { xs: '100%', md: maximized === 'problem' ? '100%' : `${layout.left * 100}%` },
            minWidth: 0,
            flex: { xs: 1, md: maximized === 'problem' ? 1 : 'none' },
            display: {
              xs: 'none',
              md: maximized === 'editor' || maximized === 'console' ? 'none' : 'flex',
            },
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider', pr: 1 }}>
          <Tabs
            value={descTab}
            onChange={(e, v) => openTab(v)}
            variant="scrollable"
            scrollButtons={false}
            slotProps={{ indicator: { sx: { display: 'none' } } }}
            sx={{
              minHeight: 0,
              flexShrink: 0,
              px: 1.5,
              py: 1,
              flex: 1,
              minWidth: 0,
              '& .MuiTabs-flexContainer': { gap: 0.5 },
            }}
          >
            {DESC_TABS.map((tab) => (
              <Tab
                key={tab.label}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                sx={(t) => ({
                  minHeight: 38,
                  px: 1.75,
                  py: 0,
                  gap: 0.5,
                  borderRadius: 999,
                  color: 'text.secondary',
                  '& svg': { fontSize: 19, mr: '0 !important', mb: '0 !important' },
                  '&.Mui-selected': { color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12) },
                })}
              />
            ))}
          </Tabs>
          {!isMobile && <MaxButton active={maximized === 'problem'} onClick={() => toggleMax('problem')} label="problem" />}
          </Stack>

          <Box sx={{ overflowY: 'auto', p: { xs: 2, md: 2.5 }, flex: 1 }}>
            {descTab === 0 && descriptionContent}
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
          </Box>
        </Box>
      )}

      {/* Drag handle between problem and editor (desktop) */}
      <Box sx={{ display: { xs: 'none', md: maximized ? 'none' : 'flex' }, alignSelf: 'stretch' }}>
        <SplitHandle orientation="vertical" label="Resize problem and editor panes" onDrag={dragLeft} onReset={() => setLayout((l) => ({ ...l, left: DEFAULT_LEFT }))} />
      </Box>

      {/* Right pane — editor + runner */}
      <Box
        sx={{
          ...panelSx,
          ...(split ? { borderRadius: { xs: 0, md: '0 20px 20px 0' } } : {}),
          flex: 1,
          minWidth: 0,
          display: { xs: mobileView === 'code' ? 'flex' : 'none', md: maximized === 'problem' ? 'none' : 'flex' },
        }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, px: { xs: 1.25, md: 1.5 }, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}
        >
          <Select
            size="small"
            value={activeLanguage}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            startAdornment={<CodeRoundedIcon sx={{ fontSize: 18, mr: 0.75, color: 'primary.main' }} />}
            sx={(t) => ({
              minWidth: { xs: 120, md: 150 },
              height: 40,
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              bgcolor: wsSurface(t).raised,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.palette.divider },
              '& .MuiSelect-select': { py: 0.5 },
            })}
          >
            {LANGUAGES.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.label}
              </MenuItem>
            ))}
          </Select>

          <Stack direction="row" sx={{ alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
            <InviteButton problem={problem} language={activeLanguage} code={code} />
            <Tooltip title="AI assistant">
              <IconButton
                size="small"
                aria-label="AI assistant"
                onClick={() => dispatch(toggleAiDrawer())}
                sx={(t) => ({
                  width: 40,
                  height: 40,
                  color: aiDrawerOpen ? 'primary.main' : 'text.secondary',
                  bgcolor: aiDrawerOpen ? alpha(t.palette.primary.main, 0.16) : wsSurface(t).raised,
                  '&:hover': { bgcolor: aiDrawerOpen ? alpha(t.palette.primary.main, 0.24) : alpha(t.palette.text.primary, 0.14) },
                })}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="More">
              <IconButton size="small" aria-label="More editor actions" onClick={(e) => setMoreAnchor(e.currentTarget)} sx={(t) => ({ width: 40, height: 40, color: 'text.secondary', bgcolor: wsSurface(t).raised, '&:hover': { bgcolor: alpha(t.palette.text.primary, 0.14) } })}>
                <MoreVertRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </Tooltip>
            <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
              <MenuItem onClick={handleCopyCode}>
                <ListItemIcon>
                  <ContentCopyRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy code</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleResetCode}>
                <ListItemIcon>
                  <RestartAltRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Reset to starter</ListItemText>
              </MenuItem>
            </Menu>
            {!isMobile && <MaxButton active={maximized === 'editor'} onClick={() => toggleMax('editor')} label="editor" />}

            {/* Run / Submit: bottom bar on phones (thumb reach), here on md+ */}
            <Button
              size="small"
              variant="outlined"
              startIcon={runStatus === 'running' ? <CircularProgress size={14} /> : <PlayArrowRoundedIcon sx={{ fontSize: '18px !important' }} />}
              onClick={handleRun}
              disabled={isRunning}
              sx={{ display: { xs: 'none', md: 'inline-flex' }, height: 40, borderRadius: '12px' }}
            >
              Run
            </Button>
            <Button
              size="small"
              variant="contained"
              disableElevation
              startIcon={submitStatus === 'running' ? <CircularProgress size={14} color="inherit" /> : <CloudUploadRoundedIcon sx={{ fontSize: '18px !important' }} />}
              onClick={handleSubmit}
              disabled={isRunning}
              sx={{ display: { xs: 'none', md: 'inline-flex' }, height: 40, borderRadius: '12px', fontWeight: 700 }}
            >
              Submit
            </Button>
          </Stack>
        </Stack>

        {!isAuthenticated && (
          <Stack
            direction="row"
            sx={(t) => ({ alignItems: 'center', gap: 1, px: 1.5, py: 0.75, flexShrink: 0, bgcolor: alpha(t.palette.primary.main, 0.1), color: 'text.primary' })}
          >
            <LockOutlinedIcon sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
            <Typography variant="caption" sx={{ flex: 1, lineHeight: 1.4 }}>
              Sign in to run or submit — your progress and streak are saved.
            </Typography>
            <Button
              size="small"
              onClick={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}
              sx={{ flexShrink: 0, minWidth: 0, px: 1.5, fontWeight: 700 }}
            >
              Sign in
            </Button>
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
              padding: { top: 10, bottom: 10 },
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
                : {}),
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

        {/* Drag handle between editor and console (desktop) */}
        {!isMobile && consoleOpen && maximized !== 'console' && (
          <SplitHandle orientation="horizontal" label="Resize editor and console" onDrag={dragConsole} onReset={() => setLayout((l) => ({ ...l, console: DEFAULT_CONSOLE }))} />
        )}

        {/* Console — collapsible test case / result panel */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
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
            sx={{ alignItems: 'center', gap: 1, px: 1.5, height: { xs: 54, md: 46 }, flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}
          >
            <TerminalRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            {!(isMobile && (isRunning || resultToShow)) && <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Console</Typography>}
            {isRunning ? (
              <Chip size="small" label="Running…" color="primary" variant="outlined" />
            ) : (
              resultToShow && (
                <Chip
                  size="small"
                  icon={isAccepted ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
                  label={`${resultToShow.status} · ${resultToShow.passedCount}/${resultToShow.totalCount}`}
                  color={isAccepted ? 'success' : 'error'}
                  sx={{ fontWeight: 700, minWidth: 0, maxWidth: { xs: '44vw', md: 'none' } }}
                />
              )
            )}
            {!isMobile && !isRunning && isSubmitView && submitResult?.status === 'Accepted' && submitResult._id && (
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation(); // don't toggle the console
                  setShareOpen(true);
                }}
                sx={{ flexShrink: 0, py: 0.25 }}
              >
                Share solution
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            {isMobile && (
              <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                <Button
                  size="small"
                  variant="outlined"
                  onPointerDown={keepFocus}
                  onMouseDown={keepFocus}
                  onClick={handleRun}
                  disabled={isRunning}
                  startIcon={runStatus === 'running' ? <CircularProgress size={14} /> : <PlayArrowRoundedIcon sx={{ fontSize: '18px !important' }} />}
                  sx={{ height: 36, px: 1.25, minWidth: 0 }}
                >
                  Run
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  disableElevation
                  onPointerDown={keepFocus}
                  onMouseDown={keepFocus}
                  onClick={handleSubmit}
                  disabled={isRunning}
                  startIcon={submitStatus === 'running' ? <CircularProgress size={14} color="inherit" /> : <CloudUploadRoundedIcon sx={{ fontSize: '18px !important' }} />}
                  sx={{ height: 36, px: 1.25, minWidth: 0, fontWeight: 700 }}
                >
                  Submit
                </Button>
              </Stack>
            )}
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
            <Box sx={{ overflowY: 'auto', px: 1.5, pb: 1.5, flex: 1, minHeight: 0 }}>
              {isRunning ? (
                <Box sx={{ py: 1 }}>
                  <LinearProgress sx={{ borderRadius: 999, mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Running your code against the test cases…
                  </Typography>
                </Box>
              ) : testResults.length > 0 ? (
                <>
                  {isMobile && isSubmitView && submitResult?.status === 'Accepted' && submitResult._id && (
                    <Button size="small" variant="outlined" onClick={() => setShareOpen(true)} sx={{ mb: 1.25 }}>
                      Share solution
                    </Button>
                  )}
                  {/* Verdict summary */}
                  <Stack direction="row" sx={{ alignItems: 'baseline', flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.25, mb: 1.25 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: isAccepted ? 'success.main' : 'error.main' }}>
                      {resultToShow.status}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isSubmitView ? 'Submission' : 'Sample run'} · {resultToShow.passedCount}/{resultToShow.totalCount} test cases passed
                    </Typography>
                    {resultToShow.runtimeMs != null && (
                      <Typography variant="caption" color="text.secondary">
                        Runtime {resultToShow.runtimeMs} ms
                      </Typography>
                    )}
                    {fmtMem(resultToShow.memoryKb) && (
                      <Typography variant="caption" color="text.secondary">
                        Memory {fmtMem(resultToShow.memoryKb)}
                      </Typography>
                    )}
                  </Stack>

                  {resultToShow.status === 'Compilation Error' && selectedCase?.stderr && (
                    <Box
                      sx={(t) => ({
                        ...mono,
                        fontSize: '0.8rem',
                        lineHeight: 1.6,
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: '12px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: 'error.main',
                        bgcolor: alpha(t.palette.error.main, 0.1),
                      })}
                    >
                      {selectedCase.stderr}
                    </Box>
                  )}

                  <LinearProgress
                    variant="determinate"
                    value={passedPct}
                    color={isAccepted ? 'success' : 'error'}
                    sx={{ borderRadius: 999, height: 6, mb: 1.5 }}
                  />
                  <Stack direction="row" sx={{ gap: 0.75, mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
                    {testResults.map((r, i) => (
                      <Chip
                        key={i}
                        clickable
                        onClick={() => setActiveCase(i)}
                        icon={r.passed ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
                        label={`Case ${i + 1}`}
                        color={r.passed ? 'success' : 'error'}
                        variant={i === activeCase ? 'filled' : 'outlined'}
                        sx={{ flexShrink: 0, fontWeight: 700 }}
                      />
                    ))}
                  </Stack>
                  {selectedCase && (
                    <Box sx={{ borderRadius: '14px', border: '1px solid', borderColor: 'divider', p: 1.5 }}>
                      <ExampleRow icon={<LoginRoundedIcon />} label="Input" value={selectedCase.stdin} />
                      <ExampleRow icon={<LogoutRoundedIcon />} label="Your output" value={selectedCase.actualOutput || '—'} />
                      <ExampleRow icon={<CheckCircleRoundedIcon />} label="Expected" value={selectedCase.expectedOutput} />
                      {selectedCase.stderr && resultToShow.status !== 'Compilation Error' && (
                        <Box sx={{ mt: 1.25 }}>
                          <ExampleRow icon={<CancelRoundedIcon />} label="Error" value={selectedCase.stderr} />
                        </Box>
                      )}
                      {(fmtMs(selectedCase.time) || selectedCase.memory) && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
                          {[fmtMs(selectedCase.time) && `Time ${fmtMs(selectedCase.time)}`, fmtMem(selectedCase.memory) && `Memory ${fmtMem(selectedCase.memory)}`]
                            .filter(Boolean)
                            .join(' · ')}
                        </Typography>
                      )}
                    </Box>
                  )}
                </>
              ) : consoleError ? (
                <Box
                  sx={(t) => ({ p: 1.5, borderRadius: '12px', color: 'error.main', bgcolor: alpha(t.palette.error.main, 0.1) })}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                    {isSubmitView ? 'Submit failed' : 'Run failed'}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {consoleError}
                  </Typography>
                </Box>
              ) : (
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, py: 1, color: 'text.secondary' }}>
                  <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">Run your code against the sample test cases to see results here.</Typography>
                </Stack>
              )}
            </Box>
          )}
        </Box>
        </Box>
      </Box>

      {/* Phone: Solutions / Discussion sit next to the Code tab */}
      {isMobile && mountedTabs[1] && (
        <Box sx={{ display: mobileView === 'solutions' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
          <SolutionsPanel slug={slug} refreshKey={solutionsRefresh} onShare={() => setShareOpen(true)} onSendToEditor={handleSendToEditor} />
        </Box>
      )}
      {isMobile && mountedTabs[2] && (
        <Box sx={{ display: mobileView === 'discussion' ? 'block' : 'none', flex: 1, minHeight: 0, overflowY: 'auto', p: 2 }}>
          <DiscussionPanel slug={slug} />
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
          sx={{ alignItems: 'center', gap: 0.5, px: 1, pb: 0.75, pt: 'calc(6px + env(safe-area-inset-top))', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}
        >
          <IconButton aria-label="Back to code" onClick={closeDesc}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, flex: 1 }}>Problem</Typography>
          <DifficultyChip difficulty={problem.difficulty} />
        </Stack>
        <Box sx={{ overflowY: 'auto', p: 2, flex: 1, minHeight: 0 }}>{descriptionContent}</Box>
        <Box sx={{ flexShrink: 0, p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Button fullWidth variant="contained" disableElevation startIcon={<CodeRoundedIcon />} onClick={closeDesc} sx={{ height: 46, fontWeight: 800, borderRadius: 999 }}>
            Start coding
          </Button>
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
        <DialogActions>
          <Button onClick={() => setPendingLoad(null)}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={() => applySolution(pendingLoad)}>
            Replace
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI assistant drawer */}
      <Drawer
        anchor="right"
        open={aiDrawerOpen}
        onClose={() => dispatch(toggleAiDrawer())}
        slotProps={{ paper: { sx: { width: 'min(380px, 100vw)', borderTopLeftRadius: { sm: 24 }, borderBottomLeftRadius: { sm: 24 } } } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
              <Box sx={(t) => ({ width: 34, height: 34, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.primary.main, 0.14), color: 'primary.main' })}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>AI Assistant</Typography>
                <Typography variant="caption" color="text.secondary">
                  Hints only, no full solutions
                </Typography>
              </Box>
            </Stack>
            <IconButton size="small" aria-label="Close" onClick={() => dispatch(toggleAiDrawer())}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box
            sx={(t) => ({
              flex: 1,
              overflowY: 'auto',
              p: 2,
              scrollbarWidth: 'thin',
              scrollbarColor: 'transparent transparent',
              '&:hover': { scrollbarColor: `${alpha(t.palette.text.primary, 0.35)} transparent` },
            })}
          >
            <Stack sx={{ gap: 1.5 }}>
              {aiMessages.map((m, i) => (
                <Box
                  key={i}
                  sx={(t) => ({
                    p: 1.5,
                    borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    bgcolor: m.role === 'user' ? 'primary.main' : alpha(t.palette.primary.main, 0.08),
                    color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    ml: m.role === 'user' ? 5 : 0,
                    mr: m.role === 'user' ? 0 : 5,
                  })}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
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

          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))' }}>
            <Stack direction="row" sx={{ gap: 0.75, mb: 1.25, overflowX: 'auto', pb: 0.25 }}>
              {AI_QUICK_PROMPTS.map((p) => (
                <Chip key={p} clickable size="small" variant="outlined" label={p} onClick={() => setAiInput(p)} sx={{ flexShrink: 0 }} />
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
                slotProps={{ input: { sx: { borderRadius: 999 } } }}
              />
              <IconButton
                aria-label="Send"
                onClick={handleAiSend}
                disabled={aiLoading || !aiInput.trim()}
                sx={{ width: 40, height: 40, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
              >
                <SendRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
