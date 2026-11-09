import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ChatPanel from '../ChatPanel';
import DiscussionPanel from '../../workspace/community/DiscussionPanel';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { RoomConsoleBody } from '../RoomParts';
import { RunButton, SubmitButton } from '../../workspace/RunSubmitButtons';
import SolutionsPanel from '../../workspace/community/SolutionsPanel';
import SubmissionsPanel from '../../workspace/SubmissionsPanel';

export function buildRoomPanels(c) {
  const { activeCase, adjacent, busy, call, caseSel, consoleTab, copyLink, customStdin, formatNow, goLogin, handleCopyCode, handleRun, handleSendToEditor, handleSubmit, iconActions, isAuthenticated, isMobile, lastKind, leave, leftTab, mobileView, pipOk, popOut, problem, room, setActiveCase, setCaseSel, setConfirm, setConsoleTab, setCustomStdin, setFriendsAnchor, setListOpen, setShareOpen, showKbd, slug, solutionsRefresh, sub, switchProblem, testInWorkspace, theme, unread } = c;
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
  return { canShare, chatItem, chatPanel, consoleBody, ctl, discussionPanel, friend, hasProblem, leftItems, mobileItems, nav, onCodeTab, phoneMenu, roomReady, runButton, solutionsPanel, submissionsPanel, submitButton, tab, unreadDot };
}
