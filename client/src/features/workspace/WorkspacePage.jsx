import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import InviteButton, { useInviteToRoom } from '../room/InviteButton';
import SolutionsPanel from './community/SolutionsPanel';
import DiscussionPanel from './community/DiscussionPanel';
import ShareSolutionDialog from './community/ShareSolutionDialog';
import SubmissionsPanel from './SubmissionsPanel';
import ProblemListDrawer from './ProblemListDrawer';
import ProblemDescription from './ProblemDescription';
import { ConsoleBody, VerdictChip } from './ConsolePanel';
import SplitHandle from './SplitHandle';
import AiAssistantDrawer from './AiAssistantDrawer';
import ConfirmDialog from './ConfirmDialog';
import ConsoleBar from './ConsoleBar';
import GuestBanner from './GuestBanner';
import LanguageSelect from './LanguageSelect';
import PhoneHeader from './PhoneHeader';
import ProblemSheet from './ProblemSheet';
import { PhoneRunButton, PhoneSubmitButton } from './PhoneRunButtons';
import MoreMenu from './MoreMenu';
import PhonePanel from './PhonePanel';
import TimerControl from './TimerControl';
import { ProblemPageSkeleton } from './ProblemSkeleton';
import { RunButton, SubmitButton } from './RunSubmitButtons';
import { copyCode } from './copyCode';
import { hoverScrollbars } from './hoverScrollbars';
import { languageLabel } from './languages';
import useAdjacentProblems from './useAdjacentProblems';
import useDescPanel from './useDescPanel';
import usePaneLayout from './usePaneLayout';
import usePaneModes from './usePaneModes';
import useRunShortcuts from './useRunShortcuts';
import useThemeColorMeta from './useThemeColorMeta';
import CodeEditor from './CodeEditor';
import useStopwatch from './useStopwatch';
import { EmptyState, MaxButton, PaneBar, PaneTabs, WsButton, WsIconButton } from './wsUi';
import { WS } from './wsTokens';
import { wsSurface } from './workspaceTheme';
import { formatCode } from './formatCode';
import { problemsApi } from '../../api/problemsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { fetchProblem, setLanguage, updateCode, runCode, submitCode, toggleAiDrawer } from './workspaceSlice';

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

export default function WorkspacePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useSelector((s) => s.auth);
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
  const sw = useStopwatch();

  const { descOpen, openDesc, closeDesc } = useDescPanel(isMobile);
  const { layout, maximized, setMaximized, toggleMax, rootRef, editorColRef, dragLeft, dragConsole, resetLeft, resetConsole } = usePaneLayout({
    storageKey: 'jeetcode-workspace-layout',
    leftMin: 0.2,
    onConsoleDrag: () => setConsoleOpen(true),
  });
  const { setLeftEl, setRightEl, tabLabels, langMode, iconActions, showKbd, narrowConsole, hideConsoleLabel } = usePaneModes(isMobile);
  const adjacent = useAdjacentProblems(slug);
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

  // Phone status bar matches the app bar instead of the old blue.
  useThemeColorMeta(isMobile ? theme.palette.background.default : theme.palette.background.paper);

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
    return <ProblemPageSkeleton />;
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
    />
  );

  return (
    <Box
      ref={rootRef}
      sx={(t) => ({
        ...hoverScrollbars(t),
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        height: { xs: '100dvh', md: 'calc(100vh - 64px)' },
        bgcolor: { xs: t.palette.background.default, md: surf.chrome },
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
          onOpenList={() => setListOpen(true)}
        />
      )}

      {/* Left pane — problem description (desktop only) */}
      {!isMobile && (
        <Box
          ref={setLeftEl}
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
            <WsIconButton title="Problem list" onClick={() => setListOpen(true)}>
              <FormatListBulletedRoundedIcon />
            </WsIconButton>
            <PaneTabs value={descTab} onChange={openTab} items={DESC_TABS} labels={tabLabels} />
            <Box sx={{ flex: 1 }} />
            <WsIconButton title="Random problem" onClick={handleRandom}>
              <ShuffleRoundedIcon />
            </WsIconButton>
            <MaxButton active={maximized === 'problem'} onClick={() => toggleMax('problem')} label="problem" />
          </PaneBar>

          <Box sx={{ overflowY: 'auto', px: 2.5, pt: 1.5, pb: 3, flex: 1, minHeight: 0 }}>
            {descTab === 0 && <ProblemDescription problem={problem} nav={nav} />}
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
        <SplitHandle orientation="vertical" label="Resize problem and editor panes" onDrag={dragLeft} onReset={resetLeft} />
      </Box>

      {/* Right pane — editor + runner */}
      <Box
        ref={setRightEl}
        sx={{
          bgcolor: { xs: 'transparent', md: surf.chrome },
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          flexDirection: 'column',
          display: { xs: mobileView === 'code' ? 'flex' : 'none', md: maximized === 'problem' ? 'none' : 'flex' },
        }}
      >
        <PaneBar sx={{ px: { xs: 1.75, md: 1.25 }, gap: { xs: 0.75, md: 0.5 }, height: { xs: 60, md: WS.bar }, bgcolor: { xs: 'transparent', md: surf.chrome }, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <LanguageSelect value={activeLanguage} onChange={(v) => dispatch(setLanguage(v))} problem={problem} langMode={langMode} isMobile={isMobile} pill={isMobile} />
          <TimerControl sw={sw} size={ctl} />

          <Box sx={{ flex: 1, minWidth: 8 }} />

          {!isMobile && <InviteButton problem={problem} language={activeLanguage} code={code} size={ctl} />}
          <WsIconButton title="AI assistant" size={ctl} active={aiDrawerOpen} onClick={() => dispatch(toggleAiDrawer())}>
            <AutoAwesomeRoundedIcon />
          </WsIconButton>
          <WsIconButton title="More" size={ctl} aria-label="More editor actions" onClick={(e) => setMoreAnchor(e.currentTarget)}>
            <MoreVertRoundedIcon />
          </WsIconButton>
          <MoreMenu
            anchorEl={moreAnchor}
            onClose={() => setMoreAnchor(null)}
            items={[
              isMobile && { key: 'invite', label: 'Invite a friend', icon: <GroupAddRoundedIcon fontSize="small" />, onClick: inviteFriend },
              { key: 'copy', label: 'Copy code', icon: <ContentCopyRoundedIcon fontSize="small" />, onClick: handleCopyCode },
              { key: 'format', label: 'Format code', icon: <AutoFixHighRoundedIcon fontSize="small" />, onClick: handleFormat },
              { key: 'reset', label: 'Reset to starter', icon: <RestartAltRoundedIcon fontSize="small" />, onClick: handleResetCode },
              { key: 'div', divider: true },
              { key: 'settings', label: 'Editor settings', icon: <SettingsOutlinedIcon fontSize="small" />, onClick: () => navigate('/settings') },
            ]}
          />
          {!isMobile && <MaxButton active={maximized === 'editor'} onClick={() => toggleMax('editor')} label="editor" />}

          {/* Run / Submit: bottom bar on phones (thumb reach), here on md+ */}
          {!isMobile && (
            <>
              <Box sx={{ width: 4 }} />
              <RunButton size="md" iconActions={iconActions} showKbd={showKbd} loading={runStatus === 'running'} disabled={isRunning} onClick={handleRun} />
              <SubmitButton size="md" iconActions={iconActions} showKbd={showKbd} loading={submitStatus === 'running'} disabled={isRunning} onClick={handleSubmit} />
            </>
          )}
        </PaneBar>

        {!isAuthenticated && (
          <GuestBanner onSignIn={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}>
            Sign in to run or submit — your progress and streak are saved.
          </GuestBanner>
        )}

        <Box ref={editorColRef} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <CodeEditor
            ref={editorApi}
            path={`${problem._id}-${activeLanguage}`}
            language={activeLanguage}
            value={code}
            onChange={handleEditorChange}
            tabSize={editorPrefs.tabSize}
            isMobile={isMobile}
            hidden={!isMobile && maximized === 'console'}
            autoFormat
            resetKey={slug}
            onReady={setEditorInstance}
          />

          {/* Seam between editor and console (desktop, only while the console is open) */}
          {!isMobile && consoleOpen && maximized !== 'console' && (
            <SplitHandle orientation="horizontal" label="Resize editor and console" onDrag={dragConsole} onReset={resetConsole} />
          )}

          {/* Console — collapsible testcase / result panel */}
          <ConsoleBar
            isMobile={isMobile}
            open={consoleOpen}
            setOpen={setConsoleOpen}
            maximized={maximized}
            setMaximized={setMaximized}
            toggleMax={toggleMax}
            size={layout.console}
            showLabel={!(isMobile && (isRunning || resultToShow)) && !hideConsoleLabel}
            chip={<VerdictChip isRunning={isRunning} result={resultToShow} sx={{ maxWidth: { xs: '44vw', md: 'none' } }} />}
            canShare={canShare}
            onShare={() => setShareOpen(true)}
            narrow={narrowConsole}
            editor={editorInstance}
            tabSize={editorPrefs.tabSize}
            mobileActions={
              <>
                <PhoneRunButton loading={runStatus === 'running'} disabled={isRunning} onClick={handleRun} />
                <PhoneSubmitButton loading={submitStatus === 'running'} disabled={isRunning} onClick={handleSubmit} />
              </>
            }
          >
            {consoleBody}
          </ConsoleBar>
        </Box>
      </Box>

      {/* Phone: Solutions / Discussion / Submissions sit next to the Code tab */}
      {isMobile && mountedTabs[1] && (
        <PhonePanel bg="transparent" show={mobileView === 'solutions'}>
          <SolutionsPanel slug={slug} refreshKey={solutionsRefresh} onShare={() => setShareOpen(true)} onSendToEditor={handleSendToEditor} />
        </PhonePanel>
      )}
      {isMobile && mountedTabs[2] && (
        <PhonePanel bg="transparent" show={mobileView === 'discussion'}>
          <DiscussionPanel slug={slug} />
        </PhonePanel>
      )}
      {isMobile && mountedTabs[3] && (
        <PhonePanel bg="transparent" show={mobileView === 'submissions'}>
          <SubmissionsPanel
            slug={slug}
            isAuthenticated={isAuthenticated}
            refreshKey={submitResult?._id ?? 0}
            onLoad={handleSendToEditor}
            onSignIn={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}
          />
        </PhonePanel>
      )}

      {/* Phone: the problem statement slides up as a sheet */}
      <ProblemSheet open={descOpen} onClose={closeDesc}>
        <ProblemDescription problem={problem} />
      </ProblemSheet>

      <ProblemListDrawer open={listOpen} onClose={() => setListOpen(false)} currentSlug={slug} onSelect={goToProblem} />

      <ShareSolutionDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        slug={slug}
        defaultSubmissionId={submitResult?._id}
        onShared={handleShared}
      />

      <ConfirmDialog
        open={Boolean(pendingLoad)}
        title="Replace your code?"
        text={`Your current ${languageLabel(pendingLoad?.language)} code in the editor will be replaced with this solution.`}
        confirmLabel="Replace"
        onCancel={() => setPendingLoad(null)}
        onConfirm={() => applySolution(pendingLoad)}
      />

      <AiAssistantDrawer
        key={slug}
        open={aiDrawerOpen}
        onClose={() => dispatch(toggleAiDrawer())}
        slug={slug}
        language={activeLanguage}
        getCode={() => code}
        isAuthenticated={isAuthenticated}
        onSignIn={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}
      />
    </Box>
  );
}
