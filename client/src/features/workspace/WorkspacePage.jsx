import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { ConsoleBody } from './ConsolePanel';
import { EmptyState, WsButton } from './wsUi';
import PhoneHeader from './PhoneHeader';
import { PhoneScope } from './phoneStyle';
import { ProblemPageSkeleton } from './ProblemSkeleton';
import SplitHandle from './SplitHandle';
import { applyDefaultLanguage, fetchProblem, loadSavedLanguage, runCode, setLanguage, submitCode, updateCode } from './workspaceSlice';
import { copyCode } from './copyCode';
import { extractErrorMessage } from '../../api/apiClient';
import { formatCode } from './formatCode';
import { hoverScrollbars } from './hoverScrollbars';
import { problemsApi } from '../../api/problemsApi';
import { saveLastProblem } from './lastProblem';
import useAdjacentProblems from './useAdjacentProblems';
import { useCallback, useEffect, useRef, useState } from 'react';
import useChipsPref from './useChipsPref';
import useDescPanel from './useDescPanel';
import { useDispatch, useSelector } from 'react-redux';
import { useInviteToRoom } from '../room/InviteButton';
import { useLibraryPalette } from '../dashboard/components/libraryStyle';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import usePaneLayout from './usePaneLayout';
import usePaneModes from './usePaneModes';
import useRunShortcuts from './useRunShortcuts';
import { useSnackbar } from 'notistack';
import useStopwatch from './useStopwatch';
import useThemeColorMeta from './useThemeColorMeta';
import { wsSurface } from './workspaceTheme';
import { renderProblemPane } from './page/renderProblemPane';
import { renderEditorPane } from './page/renderEditorPane';
import { renderPhoneTabs } from './page/renderPhoneTabs';
import { renderPageOverlays } from './page/renderPageOverlays';
import { MOBILE_TABS } from './page/workspaceTabs';

export default function WorkspacePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user: authUser } = useSelector((s) => s.auth);
  // Settings -> Editor / Appearance
  const editorPrefs = useSelector((s) => s.ui.editor);

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
  const surf = wsSurface(theme);
  const pal = useLibraryPalette();
  // Phone: show or hide the tags (difficulty, topics, companies); chosen from the header menu.
  const [showTags, toggleTags] = useChipsPref();
  // Phone: one page. Tabs = Code | Solutions | Discussion | Submissions. The problem text opens
  // as a sheet sliding up from the bottom (kept in history state so the phone's
  // Back button closes it instead of leaving the page).
  const [mobileView, setMobileView] = useState('code'); // 'code' | 'solutions' | 'discussion' | 'submissions'
  const [editorInstance, setEditorInstance] = useState(null); // the status bar needs the editor
  const editorApi = useRef(null); // CodeEditor: format() / cancelPendingFormat()
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState('cases'); // 'cases' | 'result'
  const [activeCase, setActiveCase] = useState(0);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [listOpen, setListOpen] = useState(false); // problem list overlay (left)
  const [aiMenuOpen, setAiMenuOpen] = useState(false); // AI icon menu: Go live / Fix / Hint (see AiAssistantLayer)
  const [visualizerOpen, setVisualizerOpen] = useState(false); // step-by-step code visualizer (see CodeVisualizerLayer)
  const sw = useStopwatch();

  const { descOpen, openDesc, closeDesc } = useDescPanel(isMobile);
  const { layout, maximized, setMaximized, toggleMax, rootRef, editorColRef, dragLeft, dragConsole, resetLeft, resetConsole } = usePaneLayout({
    storageKey: 'jeetcode-workspace-layout',
    leftMin: 0.2,
    onConsoleDrag: () => setConsoleOpen(true),
  });
  const { setLeftEl, setRightEl, tabLabels, langMode, iconActions, showKbd, narrowConsole, hideConsoleLabel } = usePaneModes(isMobile);
  const adjacent = useAdjacentProblems(slug);

  // Remember this problem so the Problems page can offer Resume.
  useEffect(() => {
    if (problem && problem.slug === slug) saveLastProblem(authUser?.id, problem);
  }, [problem, slug, authUser?.id]);
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
    resetSw();
  }, [dispatch, slug, resetSw]);

  // Start in the language last used here. Before one has been picked, fall back to the
  // language chosen in Settings -> Editor (once per page visit).
  useEffect(() => {
    if (!loadSavedLanguage() && editorPrefs?.defaultLanguage) dispatch(applyDefaultLanguage(editorPrefs.defaultLanguage));
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

  // Phone status bar matches the app bar instead of the old blue.
  useThemeColorMeta(isMobile ? pal.bg : theme.palette.background.paper);

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

  // Safety net: whatever is typed, Run / Submit send correctly indented code.
  const prepareCode = async () => {
    editorApi.current?.cancelPendingFormat();
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

  const isRunning = runStatus === 'running' || submitStatus === 'running';
  useRunShortcuts({ isMobile, run: handleRun, submit: handleSubmit, busy: isRunning || !problem });

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

  const handleCopyCode = () => copyCode(code, enqueueSnackbar);

  // Visualizing runs the code on the server, so it needs a signed-in user, like Run.
  const handleVisualize = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
    setVisualizerOpen(true);
  };
  const { invite: inviteFriend } = useInviteToRoom({ problem, language: activeLanguage, code });

  const handleFormat = () => {
    setMoreAnchor(null);
    editorApi.current?.format();
  };

  const handleRandom = async () => {
    try {
      const { data } = await problemsApi.getRandom();
      navigate(`/workspace/${data.data.slug}`);
    } catch (e) {
      enqueueSnackbar(extractErrorMessage(e), { variant: 'error' });
    }
  };

  // Phone back arrow: return to wherever the user came from (Problems, Dashboard...); a direct link goes to Problems.
  const handleBack = () => (location.key !== 'default' ? navigate(-1) : navigate('/problems'));

  // Prev / next arrow. Phone: replace (not push) so Back doesn't walk through every problem
  // and the description drawer closes onto the new problem's editor.
  const goToProblem = (target) => {
    if (!target) return;
    navigate(`/workspace/${target}`, isMobile ? { replace: true } : undefined);
  };

  if (problemStatus === 'loading') {
    return isMobile ? (
      <PhoneScope>
        <ProblemPageSkeleton phone />
      </PhoneScope>
    ) : (
      <ProblemPageSkeleton />
    );
  }

  if (problemStatus === 'error' || !problem) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: { xs: '100dvh', md: 'calc(100vh - 64px)' }, gap: 1, px: 2, textAlign: 'center' }}>
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
  const ctl = isMobile ? 'xl' : 'md';
  const nav = {
    hasPrev: Boolean(adjacent.prev),
    hasNext: Boolean(adjacent.next),
    onPrev: () => goToProblem(adjacent.prev),
    onNext: () => goToProblem(adjacent.next),
    size: ctl,
  };

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
      lib={isMobile}
    />
  );

  // Phone header menu: problem list, then the editor actions (only on the Code tab).
  const onCodeTab = mobileView === 'code';
  const phoneMenu = [
    { key: 'list', label: 'Problem list', onClick: () => setListOpen(true) },
    onCodeTab && { key: 'div-editor', divider: true },
    onCodeTab && { key: 'invite', label: 'Invite a friend', onClick: inviteFriend },
    onCodeTab && { key: 'copy', label: 'Copy code', onClick: handleCopyCode },
    onCodeTab && { key: 'format', label: 'Format code', onClick: handleFormat },
    onCodeTab && { key: 'reset', label: 'Reset to starter', onClick: handleResetCode },
    onCodeTab && { key: 'div-settings', divider: true },
    onCodeTab && { key: 'settings', label: 'Editor settings', onClick: () => navigate('/settings') },
  ];

  const ctx = { activeCase, activeLanguage, adjacent, aiDrawerOpen, aiMenuOpen, applySolution, authUser, canShare, closeDesc, code, codeByProblem, consoleBody, consoleError, consoleOpen, consoleTab, ctl, descOpen, descTab, dispatch, dragConsole, dragLeft, editorApi, editorColRef, editorInstance, editorPrefs, enqueueSnackbar, goToProblem, handleBack, handleCopyCode, handleEditorChange, handleFormat, handleRandom, handleResetCode, handleRun, handleSendToEditor, handleShared, handleSubmit, handleVisualize, hideConsoleLabel, iconActions, inviteFriend, isAuthenticated, isMobile, isRunning, isSubmitView, langMode, lastResultKind, layout, listOpen, location, maximized, mobileView, moreAnchor, mountedTabs, narrowConsole, nav, navigate, onCodeTab, openDesc, openMobileView, openTab, pal, pauseSw, pendingLoad, phoneMenu, prepareCode, problem, problemError, problemStatus, resetConsole, resetLeft, resetSw, resultToShow, rootRef, runResult, runStatus, setActiveCase, setAiMenuOpen, setConsoleOpen, setConsoleTab, setDescTab, setEditorInstance, setLeftEl, setListOpen, setMaximized, setMobileView, setMoreAnchor, setMountedTabs, setPendingLoad, setRightEl, setShareOpen, setSolutionsRefresh, setVisualizerOpen, shareOpen, showKbd, showTags, slug, solutionsRefresh, submitResult, submitStatus, surf, sw, tabLabels, theme, toggleMax, toggleTags, visualizerOpen };

  const page = (
    <Box
      ref={rootRef}
      sx={(t) => ({
        ...hoverScrollbars(t),
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: { xs: '100dvh', md: 'calc(100vh - 64px)' },
        bgcolor: { xs: pal.bg, md: surf.chrome },
        overflow: 'hidden',
      })}
    >
      {isMobile && (
        <PhoneHeader
          problem={problem}
          tabs={MOBILE_TABS}
          view={mobileView}
          onView={openMobileView}
          onBack={handleBack}
          onOpenProblem={openDesc}
          chipsOn={showTags}
          onToggleChips={toggleTags}
          menuItems={phoneMenu}
        />
      )}

      {renderProblemPane(ctx)}

      {/* The single seam between problem and editor (desktop) */}
      <Box sx={{ display: { xs: 'none', md: maximized ? 'none' : 'flex' }, alignSelf: 'stretch' }}>
        <SplitHandle orientation="vertical" label="Resize problem and editor panes" onDrag={dragLeft} onReset={resetLeft} />
      </Box>

      {renderEditorPane(ctx)}

      {renderPhoneTabs(ctx)}

      {renderPageOverlays(ctx)}
    </Box>
  );


  return isMobile ? <PhoneScope>{page}</PhoneScope> : page;
}
