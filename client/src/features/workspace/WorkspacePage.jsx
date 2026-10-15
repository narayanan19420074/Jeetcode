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
import DifficultyChip from '../../components/DifficultyChip';
import InviteButton from '../room/InviteButton';
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
    aiDrawerOpen,
  } = useSelector((s) => s.workspace);

  const [descTab, setDescTab] = useState(0);
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

  useEffect(() => {
    dispatch(fetchProblem(slug));
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

  const resultToShow = submitResult || runResult;
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 0, md: 1.5 },
        p: { xs: 0, md: 1.5 },
        height: { xs: 'calc(100dvh - 56px)', md: 'calc(100vh - 64px)' },
        overflow: 'hidden',
      }}
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
          width: { xs: '100%', md: '42%' },
          minWidth: { xs: 0, md: 340 },
          flex: { xs: 1, md: 'none' },
          display: { xs: mobileView === 'problem' ? 'flex' : 'none', md: 'flex' },
        }}
      >
        <Tabs
          value={descTab}
          onChange={(e, v) => setDescTab(v)}
          variant="scrollable"
          scrollButtons={false}
          slotProps={{ indicator: { sx: { display: 'none' } } }}
          sx={{
            minHeight: 0,
            flexShrink: 0,
            px: 1.5,
            py: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
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
          {descTab === 1 && (
            <EmptyState
              icon={<LightbulbOutlinedIcon />}
              title="No solutions yet"
              text="Community solutions will appear here once submissions are shared publicly."
            />
          )}
          {descTab === 2 && (
            <EmptyState
              icon={<ForumOutlinedIcon />}
              title="No discussions yet"
              text="Be the first to ask a question about this problem."
            />
          )}
        </Box>
      </Box>

      {/* Right pane — editor + runner */}
      <Box
        sx={{
          ...panelSx,
          flex: 1,
          minWidth: 0,
          display: { xs: mobileView === 'code' ? 'flex' : 'none', md: 'flex' },
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

        <Box sx={{ flex: 1, minHeight: 0 }}>
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

        {/* Console — collapsible test case / result panel */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: consoleOpen ? '45%' : 'auto' }}>
          <Stack
            direction="row"
            onClick={() => setConsoleOpen((o) => !o)}
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
            <Box sx={{ flex: 1 }} />
            <ExpandMoreRoundedIcon
              sx={{ color: 'text.secondary', transition: 'transform .2s', transform: consoleOpen ? 'none' : 'rotate(180deg)' }}
            />
          </Stack>

          {consoleOpen && (
            <Box sx={{ overflowY: 'auto', px: 1.5, pb: 1.5 }}>
              {isRunning ? (
                <Box sx={{ py: 1 }}>
                  <LinearProgress sx={{ borderRadius: 999, mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Running your code against the test cases…
                  </Typography>
                </Box>
              ) : testResults.length > 0 ? (
                <>
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
                      <ExampleRow icon={<CheckCircleRoundedIcon />} label="Expected" value={selectedCase.expectedOutput} />
                      <ExampleRow icon={<LogoutRoundedIcon />} label="Your output" value={selectedCase.actualOutput || '—'} />
                      {selectedCase.stderr && (
                        <Box sx={{ mt: 1.25 }}>
                          <ExampleRow icon={<CancelRoundedIcon />} label="Error" value={selectedCase.stderr} />
                        </Box>
                      )}
                    </Box>
                  )}
                </>
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

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
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
