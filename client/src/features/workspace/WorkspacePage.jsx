import { useState, useCallback, useEffect } from 'react';
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
  Divider,
  CircularProgress,
  Tooltip,
  Paper,
  Alert,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DifficultyChip from '../../components/DifficultyChip';
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

export default function WorkspacePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

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
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    {
      role: 'assistant',
      text: "I'm here to help you think through the problem — ask about an approach, an edge case, or a complexity trade-off. I won't hand you the full solution.",
    },
  ]);

  useEffect(() => {
    dispatch(fetchProblem(slug));
  }, [dispatch, slug]);

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (problemStatus === 'error' || !problem) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 2 }}>
        <Typography variant="h6" color="text.secondary">
          {problemError || 'Problem not found'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const resultToShow = submitResult || runResult;

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      {/* Left pane — problem description */}
      <Box
        sx={{
          width: '42%',
          minWidth: 340,
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Tabs value={descTab} onChange={(e, v) => setDescTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}>
          <Tab label="Description" />
          <Tab label="Solutions" />
          <Tab label="Discussion" />
        </Tabs>

        <Box sx={{ overflowY: 'auto', p: 3, flex: 1 }}>
          {descTab === 0 && (
            <>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {problem.title}
                </Typography>
                <DifficultyChip difficulty={problem.difficulty} />
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {problem.tags.map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" />
                ))}
              </Stack>

              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 3, lineHeight: 1.7 }}>
                {problem.description}
              </Typography>

              {problem.examples.map((ex, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Example {i + 1}
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    <Box>Input: {ex.input}</Box>
                    <Box>Output: {ex.output}</Box>
                    {ex.explanation && <Box sx={{ color: 'text.secondary' }}>Explanation: {ex.explanation}</Box>}
                  </Paper>
                </Box>
              ))}

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
                Constraints
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                {problem.constraints.map((c, i) => (
                  <Typography key={i} component="li" variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                    {c}
                  </Typography>
                ))}
              </Box>
            </>
          )}
          {descTab === 1 && (
            <Typography variant="body2" color="text.secondary">
              Community solutions will populate here once submissions are shared publicly.
            </Typography>
          )}
          {descTab === 2 && (
            <Typography variant="body2" color="text.secondary">
              No discussion threads yet — be the first to ask a question about this problem.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right pane — editor + runner */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Select
            size="small"
            value={activeLanguage}
            onChange={(e) => dispatch(setLanguage(e.target.value))}
            sx={{ minWidth: 140 }}
          >
            {LANGUAGES.map((l) => (
              <MenuItem key={l.id} value={l.id}>
                {l.label}
              </MenuItem>
            ))}
          </Select>

          <Stack direction="row" spacing={1}>
            <Tooltip title="AI assistant">
              <IconButton onClick={() => dispatch(toggleAiDrawer())} color={aiDrawerOpen ? 'primary' : 'default'}>
                <AutoAwesomeRoundedIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={runStatus === 'running' ? <CircularProgress size={16} /> : <PlayArrowRoundedIcon />}
              onClick={handleRun}
              disabled={runStatus === 'running' || submitStatus === 'running'}
            >
              Run
            </Button>
            <Button
              variant="contained"
              disableElevation
              startIcon={submitStatus === 'running' ? <CircularProgress size={16} color="inherit" /> : <CloudUploadRoundedIcon />}
              onClick={handleSubmit}
              disabled={runStatus === 'running' || submitStatus === 'running'}
              sx={{ fontWeight: 700 }}
            >
              Submit
            </Button>
          </Stack>
        </Stack>

        {!isAuthenticated && (
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            Sign in to run or submit code — your progress and streak are saved to your account.
          </Alert>
        )}

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Editor
            height="100%"
            language={activeLanguage === 'cpp' ? 'cpp' : activeLanguage}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
            }}
          />
        </Box>

        {/* Test case / result panel */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', maxHeight: '32%', overflowY: 'auto', p: 2 }}>
          {resultToShow && (
            <Chip
              icon={resultToShow.status === 'Accepted' ? <CheckCircleRoundedIcon /> : <CancelRoundedIcon />}
              label={`${resultToShow.status} · ${resultToShow.passedCount}/${resultToShow.totalCount} passed`}
              color={resultToShow.status === 'Accepted' ? 'success' : 'error'}
              sx={{ mb: 1.5, fontWeight: 700 }}
            />
          )}
          {resultToShow?.testResults?.length > 0 ? (
            <Stack spacing={1}>
              {resultToShow.testResults.map((r, i) => (
                <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {r.passed ? (
                      <CheckCircleRoundedIcon fontSize="small" sx={{ color: 'success.main' }} />
                    ) : (
                      <CancelRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Case {i + 1}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                    input: {r.stdin}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
                    expected: {r.expectedOutput} · got: {r.actualOutput}
                    {r.stderr ? ` · stderr: ${r.stderr}` : ''}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Run your code against the sample test cases to see results here.
            </Typography>
          )}
        </Box>
      </Box>

      {/* AI assistant drawer */}
      <Drawer anchor="right" open={aiDrawerOpen} onClose={() => dispatch(toggleAiDrawer())}>
        <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesomeRoundedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                AI Assistant
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => dispatch(toggleAiDrawer())}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <Stack spacing={1.5}>
              {aiMessages.map((m, i) => (
                <Paper
                  key={i}
                  variant={m.role === 'assistant' ? 'outlined' : 'elevation'}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: m.role === 'user' ? 'primary.main' : 'background.default',
                    color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    ml: m.role === 'user' ? 4 : 0,
                    mr: m.role === 'user' ? 0 : 4,
                  }}
                >
                  <Typography variant="body2">{m.text}</Typography>
                </Paper>
              ))}
              {aiLoading && (
                <Paper variant="outlined" elevation={0} sx={{ p: 1.5, borderRadius: 2, mr: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={14} />
                  <Typography variant="body2" color="text.secondary">
                    Thinking...
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Box>

          <Divider />
          <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Ask for a hint, not the answer..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !aiLoading && handleAiSend()}
              disabled={aiLoading}
            />
            <Button variant="contained" disableElevation onClick={handleAiSend} disabled={aiLoading || !aiInput.trim()}>
              Send
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
