import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Box,
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
  ToggleButtonGroup,
  ToggleButton,
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
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
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
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import DifficultyChip from '../../components/DifficultyChip';
import InviteButton from '../room/InviteButton';
import SolutionsPanel from './community/SolutionsPanel';
import DiscussionPanel from './community/DiscussionPanel';
import ShareSolutionDialog from './community/ShareSolutionDialog';
import SplitHandle from './SplitHandle';
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
            bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.1 : 0.07),
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileView, setMobileView] = useState('problem');
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

  const code = problem
    ? codeByProblem[problem._id]?.[activeLanguage] ?? problem.starterCode[activeLanguage]
    : '';

  const handleEditorChange = useCallback(
    (value) => {
      if (!problem) return;
      dispatch(updateCode({ problemId: problem._id, language: activeLanguage, code: value ?? '' }));
    },
    [dispatch, problem, activeLanguage]
  );

  const handleRun = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
    dispatch(runCode({ problemSlug: slug, language: activeLanguage, code }));
  };

  const handleSubmit = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
    dispatch(submitCode({ problemSlug: slug, language: activeLanguage, code }));
  };

  const openTab = (v) => {
    setDescTab(v);
    if (v > 0) setMountedTabs((m) => ({ ...m, [v]: true }));
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
    setMobileView('problem');
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
        overflow: 'hidden',
      })}
    >
      {isMobile && (
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={mobileView}
          onChange={(e, v) => v && setMobileView(v)}
          sx={(t) => ({
            m: 1.25,
            mb: 1,
            flexShrink: 0,
            p: 0.5,
            gap: 0.5,
            borderRadius: 999,
            bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.12 : 0.08),
            '& .MuiToggleButtonGroup-grouped': {
              border: 0,
              borderRadius: '999px !important',
              py: 0.9,
              gap: 0.75,
              fontWeight: 700,
              color: 'text.secondary',
              '& svg': { fontSize: 19 },
              '&.Mui-selected': {
                bgcolor: 'background.paper',
                color: 'primary.main',
                boxShadow: `0 1px 4px ${alpha(t.palette.primary.main, 0.25)}`,
              },
              '&.Mui-selected:hover': { bgcolor: 'background.paper' },
            },
          })}
        >
          <ToggleButton value="problem">
            <ArticleRoundedIcon />
            Problem
          </ToggleButton>
          <ToggleButton value="code">
            <CodeRoundedIcon />
            Code
          </ToggleButton>
        </ToggleButtonGroup>
      )}

      {/* Left pane — problem description */}
      <Box
        sx={{
          ...panelSx,
          ...(split ? { borderRadius: { xs: 0, md: '20px 0 0 20px' }, borderRight: { md: 'none' } } : {}),
          width: { xs: '100%', md: maximized === 'problem' ? '100%' : `${layout.left * 100}%` },
          minWidth: 0,
          flex: { xs: 1, md: maximized === 'problem' ? 1 : 'none' },
          display: {
            xs: mobileView === 'problem' ? 'flex' : 'none',
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
          {descTab === 0 && (
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
          )}
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
          sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, px: { xs: 1.25, md: 1.5 }, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}
        >
          <Select
            size="small"
            value={activeLanguage}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            startAdornment={<CodeRoundedIcon sx={{ fontSize: 18, mr: 0.75, color: 'primary.main' }} />}
            sx={{
              minWidth: { xs: 120, md: 150 },
              height: 36,
              borderRadius: 999,
              fontSize: '0.85rem',
              fontWeight: 700,
              '& .MuiSelect-select': { py: 0.5 },
            }}
          >
            {LANGUAGES.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.label}
              </MenuItem>
            ))}
          </Select>

          <Stack direction="row" sx={{ alignItems: 'center', gap: { xs: 0.25, md: 0.75 } }}>
            <InviteButton problem={problem} language={activeLanguage} code={code} />
            <Tooltip title="AI assistant">
              <IconButton
                size="small"
                aria-label="AI assistant"
                onClick={() => dispatch(toggleAiDrawer())}
                sx={(t) => ({
                  width: 36,
                  height: 36,
                  color: aiDrawerOpen ? 'primary.main' : 'text.secondary',
                  bgcolor: aiDrawerOpen ? alpha(t.palette.primary.main, 0.14) : 'transparent',
                })}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="More">
              <IconButton size="small" aria-label="More editor actions" onClick={(e) => setMoreAnchor(e.currentTarget)} sx={{ width: 36, height: 36, color: 'text.secondary' }}>
                <MoreVertRoundedIcon sx={{ fontSize: 20 }} />
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

            {/* Phones: compact icon buttons. md+: labelled buttons. */}
            <Tooltip title="Run">
              <span>
                <IconButton
                  size="small"
                  aria-label="Run"
                  onClick={handleRun}
                  disabled={isRunning}
                  sx={(t) => ({ display: { xs: 'inline-flex', md: 'none' }, width: 36, height: 36, border: `1px solid ${t.palette.primary.main}`, color: 'primary.main' })}
                >
                  {runStatus === 'running' ? <CircularProgress size={18} /> : <PlayArrowRoundedIcon sx={{ fontSize: 22 }} />}
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Submit">
              <span>
                <IconButton
                  size="small"
                  aria-label="Submit"
                  onClick={handleSubmit}
                  disabled={isRunning}
                  sx={{ display: { xs: 'inline-flex', md: 'none' }, width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
                >
                  {submitStatus === 'running' ? <CircularProgress size={18} color="inherit" /> : <CloudUploadRoundedIcon sx={{ fontSize: 20 }} />}
                </IconButton>
              </span>
            </Tooltip>
            <Button
              size="small"
              variant="outlined"
              startIcon={runStatus === 'running' ? <CircularProgress size={14} /> : <PlayArrowRoundedIcon sx={{ fontSize: '18px !important' }} />}
              onClick={handleRun}
              disabled={isRunning}
              sx={{ display: { xs: 'none', md: 'inline-flex' }, height: 36 }}
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
              sx={{ display: { xs: 'none', md: 'inline-flex' }, height: 36, fontWeight: 700 }}
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
        <Box sx={{ flex: 1, minHeight: 0, display: !isMobile && maximized === 'console' ? 'none' : 'block' }}>
          <Editor
            height="100%"
            language={activeLanguage === 'cpp' ? 'cpp' : activeLanguage}
            theme={editorPrefs.theme === 'auto' ? (uiMode === 'dark' ? 'vs-dark' : 'vs') : editorPrefs.theme}
            value={code}
            onChange={handleEditorChange}
            loading={<CircularProgress size={26} />}
            options={{
              fontSize: editorPrefs.fontSize,
              minimap: { enabled: editorPrefs.minimap },
              wordWrap: editorPrefs.wordWrap ? 'on' : 'off',
              lineNumbers: editorPrefs.lineNumbers ? 'on' : 'off',
              fontLigatures: editorPrefs.ligatures,
              autoClosingBrackets: editorPrefs.autoClose ? 'languageDefined' : 'never',
              autoClosingQuotes: editorPrefs.autoClose ? 'languageDefined' : 'never',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: editorPrefs.tabSize,
              padding: { top: 10 },
            }}
          />
        </Box>

        {/* Drag handle between editor and console (desktop) */}
        {!isMobile && consoleOpen && maximized !== 'console' && (
          <SplitHandle orientation="horizontal" label="Resize editor and console" onDrag={dragConsole} onReset={() => setLayout((l) => ({ ...l, console: DEFAULT_CONSOLE }))} />
        )}

        {/* Console — collapsible test case / result panel */}
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: (t) => (t.palette.mode === 'dark' ? alpha('#000', 0.28) : alpha(t.palette.primary.main, 0.045)),
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
            sx={{ alignItems: 'center', gap: 1, px: 1.5, height: 46, flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}
          >
            <TerminalRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Console</Typography>
            {isRunning ? (
              <Chip size="small" label="Running…" color="primary" variant="outlined" />
            ) : (
              resultToShow && (
                <Chip
                  size="small"
                  icon={isAccepted ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
                  label={`${resultToShow.status} · ${resultToShow.passedCount}/${resultToShow.totalCount}`}
                  color={isAccepted ? 'success' : 'error'}
                  sx={{ fontWeight: 700 }}
                />
              )
            )}
            {!isRunning && isSubmitView && submitResult?.status === 'Accepted' && submitResult._id && (
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
