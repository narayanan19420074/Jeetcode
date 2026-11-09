import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { Box, IconButton, Stack } from '@mui/material';
import CodeEditor from '../../workspace/CodeEditor';
import ConsoleBar from '../../workspace/ConsoleBar';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import GuestBanner from '../../workspace/GuestBanner';
import { LIB_ACCENT, libIconBtnSx } from '../../dashboard/components/libraryStyle';
import LanguageSelect from '../../workspace/LanguageSelect';
import { MaxButton, PaneBar, PaneTabs, WsIconButton } from '../../workspace/wsUi';
import MoreMenu from '../../workspace/MoreMenu';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PhoneConsoleBar from '../../workspace/PhoneConsoleBar';
import PhonePanel from '../../workspace/PhonePanel';
import { PhoneRunButton, PhoneSubmitButton } from '../../workspace/PhoneRunButtons';
import ProblemDescription from '../../workspace/ProblemDescription';
import { ProblemSkeletonBody } from '../../workspace/ProblemSkeleton';
import { RADII } from '../../../app/design/designTokens';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { RunChip } from '../RoomParts';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import SplitHandle from '../../workspace/SplitHandle';
import TimerControl from '../../workspace/TimerControl';
import { VerdictChip } from '../../workspace/ConsolePanel';
import { WS } from '../../workspace/wsTokens';
import { tint } from '../../dashboard/dashboardUtils';
import { ROOM_TAB } from './roomConstants';

export function renderRoomBody(c) {
  const { aiOpen, busy, canShare, chatPanel, consoleBody, consoleOpen, ctl, discussionPanel, dragConsole, dragLeft, editorApi, editorColRef, editorInstance, formatNow, goLogin, handleCopyCode, handleEditorReady, handleRandom, handleRun, handleSubmit, hasProblem, hideConsoleLabel, isAuthenticated, isMobile, langMode, lastKind, layout, leftItems, maximized, mobileView, moreAnchor, mountedTabs, narrowConsole, nav, openLeft, problem, resetConsole, resetLeft, room, roomReady, rootRef, runButton, setAiOpen, setConfirm, setConsoleOpen, setLeftEl, setMaximized, setMoreAnchor, setRightEl, setShareOpen, solutionsPanel, sub, submissionsPanel, submitButton, surf, sw, switching, tab, tabLabels, testInWorkspace, toggleMax } = c;
  return (
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
          <PaneBar sx={{ px: 1.5, gap: 0.5, height: WS.bar, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
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

          <Box ref={editorColRef} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', ...(isMobile && { borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, overflow: 'hidden' }) }}>
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
  );
}
