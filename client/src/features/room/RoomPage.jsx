import AptitudeRoom from './AptitudeRoom';
import { Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FONT_WEIGHTS } from '../../app/design/designTokens';
import { PhoneScope } from '../workspace/phoneStyle';
import { WsButton } from '../workspace/wsUi';
import { bindMonaco } from './monacoYjs';
import { copyCode } from '../workspace/copyCode';
import { extractErrorMessage } from '../../api/apiClient';
import { hoverScrollbars } from '../workspace/hoverScrollbars';
import { problemsApi } from '../../api/problemsApi';
import { setLanguage, updateCode } from '../workspace/workspaceSlice';
import useAdjacentProblems from '../workspace/useAdjacentProblems';
import useChipsPref from '../workspace/useChipsPref';
import useDescPanel from '../workspace/useDescPanel';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useLibraryPalette } from '../dashboard/components/libraryStyle';
import { useNavigate, useParams } from 'react-router-dom';
import usePaneLayout from '../workspace/usePaneLayout';
import usePaneModes from '../workspace/usePaneModes';
import { useRoomSession } from './RoomSession';
import useRoomSubmit from './useRoomSubmit';
import useRunShortcuts from '../workspace/useRunShortcuts';
import { useSnackbar } from 'notistack';
import useStopwatch from '../workspace/useStopwatch';
import useThemeColorMeta from '../workspace/useThemeColorMeta';
import { wsSurface } from '../workspace/workspaceTheme';
import { buildRoomPanels } from './roomPage/buildRoomPanels';
import { renderRoomHeader } from './roomPage/renderRoomHeader';
import { renderRoomBody } from './roomPage/renderRoomBody';
import { renderRoomOverlays } from './roomPage/renderRoomOverlays';

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
        <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>Join the room</DialogTitle>
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


  const ctx = { activeCase, adjacent, aiOpen, busy, call, caseSel, chatVisible, closeDesc, closeSession, confirm, consoleOpen, consoleTab, copyLink, customStdin, descOpen, dispatch, displayName, dragConsole, dragLeft, editorApi, editorColRef, editorInstance, enqueueSnackbar, examples, formatNow, friendsAnchor, goLogin, guestName, handleCopyCode, handleEditorReady, handleRandom, handleRun, handleSendToEditor, handleShared, handleSubmit, hideConsoleLabel, home, iconActions, inviteLink, isAuthenticated, isMobile, langMode, lastKind, layout, leave, leftTab, listOpen, maximized, minimize, mobileView, moreAnchor, mountTab, mountedTabs, nameDraft, narrowConsole, navigate, openDesc, openLeft, openMobileView, pal, pipOk, popOut, problem, ready, replaceSharedCode, resetConsole, resetLeft, room, roomId, rootRef, runConfirm, seen, setActiveCase, setAiOpen, setCaseSel, setConfirm, setConsoleOpen, setConsoleTab, setCustomStdin, setEditorInstance, setFriendsAnchor, setGuestName, setLastKind, setLeftEl, setLeftTab, setListOpen, setMaximized, setMobileView, setMoreAnchor, setMountedTabs, setNameDraft, setProblem, setRightEl, setSeen, setShareOpen, setSolutionsRefresh, setSwitching, shareOpen, sharedCode, showKbd, showTags, slug, solutionsRefresh, stdin, sub, surf, sw, switchProblem, switching, tabLabels, testInWorkspace, theme, toggleMax, toggleTags, unread, user };
  Object.assign(ctx, buildRoomPanels(ctx));

  const page = (
    <Box sx={(t) => ({ ...hoverScrollbars(t), height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: isMobile ? pal.bg : surf.chrome, overflow: 'hidden' })}>
      {renderRoomHeader(ctx)}

      {renderRoomBody(ctx)}

      {renderRoomOverlays(ctx)}
    </Box>
  );

  return isMobile ? <PhoneScope>{page}</PhoneScope> : page;
}
