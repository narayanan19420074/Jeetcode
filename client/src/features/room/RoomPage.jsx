import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PictureInPictureAltRoundedIcon from '@mui/icons-material/PictureInPictureAltRounded';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { problemsApi } from '../../api/problemsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { setLanguage, updateCode } from '../workspace/workspaceSlice';
import { bindMonaco } from './monacoYjs';
import { useRoomSession } from './RoomSession';
import useRoomSubmit from './useRoomSubmit';
import FloatingCall from './FloatingCall';
import ChatPanel from './ChatPanel';
import AptitudeRoom from './AptitudeRoom';
import { PresenceStack, RoomConsoleBody, RunChip } from './RoomParts';
import ProblemDescription from '../workspace/ProblemDescription';
import SolutionsPanel from '../workspace/community/SolutionsPanel';
import DiscussionPanel from '../workspace/community/DiscussionPanel';
import ShareSolutionDialog from '../workspace/community/ShareSolutionDialog';
import SubmissionsPanel from '../workspace/SubmissionsPanel';
import ProblemListDrawer from '../workspace/ProblemListDrawer';
import InviteFriendsDialog from './InviteFriendsDialog';
import { VerdictChip } from '../workspace/ConsolePanel';
import SplitHandle from '../workspace/SplitHandle';
import AiAssistantDrawer from '../workspace/AiAssistantDrawer';
import ConfirmDialog from '../workspace/ConfirmDialog';
import ConsoleBar from '../workspace/ConsoleBar';
import GuestBanner from '../workspace/GuestBanner';
import PhoneConsoleBar from '../workspace/PhoneConsoleBar';
import PhoneHeader from '../workspace/PhoneHeader';
import PhoneProblemDescription from '../workspace/PhoneProblemDescription';
import PhoneProblemList from '../workspace/PhoneProblemList';
import ProblemSheet from '../workspace/ProblemSheet';
import { PhoneRunButton, PhoneSubmitButton } from '../workspace/PhoneRunButtons';
import { PhoneScope } from '../workspace/phoneStyle';
import useChipsPref from '../workspace/useChipsPref';
import { LIB_ACCENT, libIconBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { tint } from '../dashboard/dashboardUtils';
import LanguageSelect from '../workspace/LanguageSelect';
import MoreMenu from '../workspace/MoreMenu';
import PhonePanel from '../workspace/PhonePanel';
import TimerControl from '../workspace/TimerControl';
import { ProblemSkeletonBody } from '../workspace/ProblemSkeleton';
import { RunButton, SubmitButton } from '../workspace/RunSubmitButtons';
import { copyCode } from '../workspace/copyCode';
import { hoverScrollbars } from '../workspace/hoverScrollbars';
import useAdjacentProblems from '../workspace/useAdjacentProblems';
import useDescPanel from '../workspace/useDescPanel';
import usePaneLayout from '../workspace/usePaneLayout';
import usePaneModes from '../workspace/usePaneModes';
import useRunShortcuts from '../workspace/useRunShortcuts';
import useThemeColorMeta from '../workspace/useThemeColorMeta';
import CodeEditor from '../workspace/CodeEditor';
import useStopwatch from '../workspace/useStopwatch';
import { MaxButton, PaneBar, PaneTabs, WsButton, WsIconButton } from '../workspace/wsUi';
import { WS } from '../workspace/wsTokens';
import { wsSurface } from '../workspace/workspaceTheme';

// Shared documents must indent the same way for everyone, so the room always
// uses 4 spaces (a personal tab size would make Python blocks disagree).
const ROOM_TAB = 4;

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const surf = wsSurface(theme);
  const pal = useLibraryPalette();
  // Phone: show or hide the tags (difficulty, topics, companies); chosen from the header menu.
  const [showTags, toggleTags] = useChipsPref();

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
  const [editorInstance, setEditorInstance] = useState(null);
  const [seen, setSeen] = useState(0);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [solutionsRefresh, setSolutionsRefresh] = useState(0);
  const [confirm, setConfirm] = useState(null); // { type: 'solution', sol } | { type: 'reset' }
  const [switching, setSwitching] = useState(false);
  const [listOpen, setListOpen] = useState(false); // problem list overlay (left)
  const [friendsAnchor, setFriendsAnchor] = useState(null); // "call a friend" dropdown
  const adjacent = useAdjacentProblems(slug);
  const { descOpen, openDesc, closeDesc } = useDescPanel(isMobile);
  const { layout, maximized, setMaximized, toggleMax, rootRef, editorColRef, dragLeft, dragConsole, resetLeft, resetConsole } = usePaneLayout({
    storageKey: 'jeetcode-room-layout',
    leftMin: 0.25,
    onConsoleDrag: () => setConsoleOpen(true),
  });
  const { setLeftEl, setRightEl, tabLabels, langMode, iconActions, showKbd, narrowConsole, hideConsoleLabel } = usePaneModes(isMobile);

  const editorApi = useRef(null); // CodeEditor: format()

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

  // Called once when the editor mounts: bind it to the shared Yjs text, unbind on unmount.
  const handleEditorReady = (editor, monaco) => {
    setEditorInstance(editor);
    return bindMonaco(editor, monaco, room.doc.getText('code'));
  };

  // Phone status bar matches the room's top bar.
  useThemeColorMeta(isMobile ? pal.bg : theme.palette.background.paper);

  const sharedCode = () => room.doc.getText('code').toString();

  // Format on request only. Automatic formatting is off in a shared room: if both
  // of you formatted at the same moment the CRDT would keep both rewrites.
  const formatNow = async (quiet) => {
    const changed = await editorApi.current?.format();
    if (!changed && !quiet) enqueueSnackbar('Already formatted', { variant: 'info' });
    return Boolean(changed);
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

  useRunShortcuts({ isMobile, run: handleRun, submit: handleSubmit, busy: busy || room.status !== 'joined' });

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

  const handleCopyCode = () => copyCode(sharedCode(), enqueueSnackbar);

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
      lib={isMobile}
    />
  );

  const runButton = (size) => (
    <RunButton size={size} isMobile={isMobile} iconActions={iconActions} showKbd={showKbd} loading={room.running} disabled={busy || !roomReady} onClick={handleRun} />
  );
  const submitButton = (size) =>
    hasProblem && (
      <SubmitButton size={size} isMobile={isMobile} iconActions={iconActions} showKbd={showKbd} loading={sub.status === 'running'} disabled={busy || !roomReady} onClick={handleSubmit} />
    );

  // Phone header menu: room actions, then the editor actions (only on the Code tab).
  const onCodeTab = mobileView === 'code';
  const phoneMenu = [
    { key: 'list', label: 'Problem list', onClick: () => setListOpen(true) },
    isAuthenticated && { key: 'friend', label: 'Call a friend', onClick: (el) => setFriendsAnchor(el) },
    { key: 'invite', label: 'Invite link', onClick: copyLink },
    pipOk && call.localStream && { key: 'pip', label: 'Float the call circle', onClick: popOut },
    onCodeTab && { key: 'div-editor', divider: true },
    onCodeTab && { key: 'copy', label: 'Copy code', onClick: handleCopyCode },
    onCodeTab && { key: 'format', label: 'Format code', onClick: () => formatNow(false) },
    onCodeTab && problem && { key: 'reset', label: 'Reset to starter', onClick: () => setConfirm({ type: 'reset' }) },
    onCodeTab && problem && { key: 'workspace', label: 'Open in my workspace', onClick: testInWorkspace },
    { key: 'div-leave', divider: true },
    { key: 'leave', label: 'Close room', onClick: leave },
  ];

  const page = (
    <Box sx={(t) => ({ ...hoverScrollbars(t), height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: isMobile ? pal.bg : surf.chrome, overflow: 'hidden' })}>
      {/* phone: header in the Library look; desktop: top bar with where you are, who is here, invite / call / leave */}
      {isMobile ? (
        <PhoneHeader
          problem={hasProblem ? problem : null}
          title={`${room.meta.title || problem?.title || 'Pair room'}${room.status === 'reconnecting' ? ' · Reconnecting…' : ''}`}
          tabs={mobileItems}
          view={mobileView}
          onView={openMobileView}
          onBack={minimize}
          backLabel="Minimize room"
          onOpenProblem={hasProblem && problem ? openDesc : undefined}
          chipsOn={showTags}
          onToggleChips={hasProblem ? toggleTags : undefined}
          menuItems={phoneMenu}
          trailing={
            <>
              <PresenceStack meName={room.me?.name || displayName} peers={room.peers} />
              <IconButton
                onClick={call.localStream ? call.stop : call.start}
                aria-label={call.localStream ? 'End video call' : 'Start video call'}
                aria-pressed={Boolean(call.localStream)}
                sx={[libIconBtnSx, Boolean(call.localStream) && { bgcolor: tint(LIB_ACCENT, 16), color: LIB_ACCENT, '&:hover': { bgcolor: tint(LIB_ACCENT, 16) } }]}
              >
                <VideocamRoundedIcon />
              </IconButton>
            </>
          }
        />
      ) : (
      <PaneBar
        height="auto"
        sx={{ minHeight: 48, pt: 'env(safe-area-inset-top)', px: { xs: 0.75, md: 1.5 }, gap: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <WsIconButton title="Problem list" size={ctl} onClick={() => setListOpen(true)}>
          <FormatListBulletedRoundedIcon />
        </WsIconButton>
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1, pl: { xs: 0.5, md: 0.5 } }}>
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

        {isAuthenticated && (
          <WsIconButton title="Call a friend" size={ctl} active={Boolean(friendsAnchor)} onClick={(e) => setFriendsAnchor(e.currentTarget)}>
            <PersonAddAlt1RoundedIcon />
          </WsIconButton>
        )}
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
      )}

      <Box
        ref={rootRef}
        sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, bgcolor: isMobile ? 'transparent' : surf.chrome, overflow: 'hidden' }}
      >

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
              {tab === 'desc' && (problem ? <ProblemDescription problem={problem} nav={nav} /> : <ProblemSkeletonBody />)}
              {mountedTabs.solutions && <Box sx={{ display: tab === 'solutions' ? 'block' : 'none' }}>{solutionsPanel}</Box>}
              {mountedTabs.discussion && <Box sx={{ display: tab === 'discussion' ? 'block' : 'none' }}>{discussionPanel}</Box>}
              {mountedTabs.submissions && <Box sx={{ display: tab === 'submissions' ? 'block' : 'none' }}>{submissionsPanel}</Box>}
            </Box>
            <Box sx={{ display: tab === 'chat' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>{chatPanel}</Box>
          </Box>
        )}

        {/* The single seam between left pane and editor (desktop) */}
        <Box sx={{ display: { xs: 'none', md: maximized ? 'none' : 'flex' }, alignSelf: 'stretch' }}>
          <SplitHandle orientation="vertical" label="Resize side panel and editor" onDrag={dragLeft} onReset={resetLeft} />
        </Box>

        {/* Right pane — shared editor + runner (stays mounted behind the phone tabs so the document keeps syncing) */}
        <Box
          ref={setRightEl}
          sx={{
            bgcolor: isMobile ? 'transparent' : surf.chrome,
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            flexDirection: 'column',
            display: { xs: mobileView === 'code' ? 'flex' : 'none', md: maximized === 'left' ? 'none' : 'flex' },
          }}
        >
          {isMobile ? (
            // Phone toolbar: language, timer, AI assistant. The editor actions live in the header menu.
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 2, height: 56, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              <LanguageSelect value={room.language} onChange={room.changeLanguage} problem={problem} langMode={langMode} isMobile={isMobile} pill />
              <TimerControl sw={sw} size={ctl} lib />
              <Box sx={{ flex: 1, minWidth: 8 }} />
              {hasProblem && (
                <IconButton
                  onClick={() => setAiOpen((o) => !o)}
                  aria-label="AI assistant"
                  aria-pressed={aiOpen}
                  sx={[libIconBtnSx, aiOpen && { bgcolor: tint(LIB_ACCENT, 16), color: LIB_ACCENT, '&:hover': { bgcolor: tint(LIB_ACCENT, 16) } }]}
                >
                  <AutoAwesomeRoundedIcon />
                </IconButton>
              )}
            </Stack>
          ) : (
          <PaneBar sx={{ px: 1.25, gap: 0.5, height: WS.bar, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
            <LanguageSelect value={room.language} onChange={room.changeLanguage} problem={problem} langMode={langMode} isMobile={isMobile} />
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
            <MoreMenu
              anchorEl={moreAnchor}
              onClose={() => setMoreAnchor(null)}
              items={[
                { key: 'copy', label: 'Copy code', icon: <ContentCopyRoundedIcon fontSize="small" />, onClick: handleCopyCode },
                { key: 'format', label: 'Format code', icon: <AutoFixHighRoundedIcon fontSize="small" />, onClick: () => formatNow(false) },
                problem && { key: 'reset', label: 'Reset to starter', icon: <RestartAltRoundedIcon fontSize="small" />, onClick: () => setConfirm({ type: 'reset' }) },
                problem && { key: 'div', divider: true },
                problem && { key: 'workspace', label: 'Open in my workspace', icon: <OpenInNewRoundedIcon fontSize="small" />, onClick: testInWorkspace },
              ]}
            />
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
          )}

          {!isAuthenticated && hasProblem && (
            <GuestBanner lib={isMobile} onSignIn={goLogin}>You can run code together as a guest. Sign in to submit and save your progress.</GuestBanner>
          )}

          <Box ref={editorColRef} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', ...(isMobile && { borderRadius: '20px 20px 0 0', overflow: 'hidden' }) }}>
            <CodeEditor
              ref={editorApi}
              language={room.language}
              tabSize={ROOM_TAB}
              isMobile={isMobile}
              hidden={!isMobile && maximized === 'console'}
              onReady={handleEditorReady}
              onFormatKey={() => formatNow(false)}
            />

            {/* Seam between editor and console (desktop, only while the console is open) */}
            {!isMobile && consoleOpen && maximized !== 'console' && (
              <SplitHandle orientation="horizontal" label="Resize editor and console" onDrag={dragConsole} onReset={resetConsole} />
            )}

            {/* Console — collapsible testcase / output / submission panel */}
            {isMobile ? (
              <PhoneConsoleBar
                open={consoleOpen}
                setOpen={setConsoleOpen}
                showLabel={!(busy || room.runResult || sub.result)}
                chip={
                  lastKind === 'submit' ? (
                    <VerdictChip lib isRunning={sub.status === 'running'} result={sub.result} />
                  ) : (
                    <RunChip lib running={room.running} result={room.runResult} />
                  )
                }
                canShare={canShare && isAuthenticated}
                onShare={() => setShareOpen(true)}
                actions={
                  <>
                    <PhoneRunButton loading={room.running} disabled={busy || !roomReady} onClick={handleRun} />
                    {hasProblem && <PhoneSubmitButton loading={sub.status === 'running'} disabled={busy || !roomReady} onClick={handleSubmit} />}
                  </>
                }
              >
                {consoleBody}
              </PhoneConsoleBar>
            ) : (
            <ConsoleBar
              isMobile={isMobile}
              open={consoleOpen}
              setOpen={setConsoleOpen}
              maximized={maximized}
              setMaximized={setMaximized}
              toggleMax={toggleMax}
              size={layout.console}
              safeBottom
              showLabel={!(isMobile && (busy || room.runResult || sub.result)) && !hideConsoleLabel}
              chip={
                lastKind === 'submit' ? (
                  <VerdictChip isRunning={sub.status === 'running'} result={sub.result} sx={{ maxWidth: { xs: '44vw', md: 'none' } }} />
                ) : (
                  <RunChip running={room.running} result={room.runResult} sx={{ maxWidth: { xs: '44vw', md: 'none' } }} />
                )
              }
              canShare={canShare && isAuthenticated}
              onShare={() => setShareOpen(true)}
              narrow={narrowConsole}
              editor={editorInstance}
              tabSize={ROOM_TAB}
              mobileActions={
                <>
                  {runButton('lg')}
                  {submitButton('lg')}
                </>
              }
            >
              {consoleBody}
            </ConsoleBar>
            )}
          </Box>
        </Box>

        {/* Phone: Solutions / Discussion / Submissions / Chat sit next to the Code tab */}
        {isMobile && hasProblem && mountedTabs.solutions && <PhonePanel bg="transparent" show={mobileView === 'solutions'}>{solutionsPanel}</PhonePanel>}
        {isMobile && hasProblem && mountedTabs.discussion && <PhonePanel bg="transparent" show={mobileView === 'discussion'}>{discussionPanel}</PhonePanel>}
        {isMobile && hasProblem && mountedTabs.submissions && <PhonePanel bg="transparent" show={mobileView === 'submissions'}>{submissionsPanel}</PhonePanel>}
        {isMobile && (
          <Box sx={{ display: mobileView === 'chat' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column', pb: 'env(safe-area-inset-bottom)' }}>{chatPanel}</Box>
        )}
      </Box>

      {isAuthenticated && <InviteFriendsDialog anchorEl={friendsAnchor} onClose={() => setFriendsAnchor(null)} roomId={roomId} roomTitle={room.meta.title || problem?.title} />}

      {/* Problem list overlay: picking one switches the problem for BOTH of you */}
      {isMobile ? (
        <PhoneProblemList open={listOpen} onOpen={() => setListOpen(true)} onClose={() => setListOpen(false)} currentSlug={slug} onSelect={switchProblem} disabled={switching} />
      ) : (
        <ProblemListDrawer open={listOpen} onClose={() => setListOpen(false)} currentSlug={slug} onSelect={switchProblem} disabled={switching} />
      )}

      {/* Phone: the problem statement as a sheet sliding up (see useDescPanel) */}
      <ProblemSheet open={descOpen} onClose={closeDesc}>
        {problem ? <PhoneProblemDescription problem={problem} showTags={showTags} nav={nav} /> : <ProblemSkeletonBody />}
      </ProblemSheet>

      {hasProblem && (
        <AiAssistantDrawer
          key={slug}
          welcomeNote="This chat is private to you."
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

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.type === 'reset' ? 'Reset the shared code?' : 'Replace the shared code?'}
        text={`${confirm?.type === 'reset' ? 'The editor goes back to the starter template' : 'The editor will be replaced with this solution'} for you and ${friend?.name || 'your partner'}.`}
        confirmLabel={confirm?.type === 'reset' ? 'Reset' : 'Replace'}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />

      {/* video call: floating circles, appears only while a call is on */}
      <FloatingCall call={call} friendName={friend?.name} myName={room.me?.name} hasFriend={!!friend} />
    </Box>
  );

  return isMobile ? <PhoneScope>{page}</PhoneScope> : page;
}
