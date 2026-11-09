import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import { Box, IconButton, Stack } from '@mui/material';
import CodeEditor from '../CodeEditor';
import ConsoleBar from '../ConsoleBar';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import GuestBanner from '../GuestBanner';
import InviteButton from '../../room/InviteButton';
import { LIB_ACCENT, libIconBtnSx } from '../../dashboard/components/libraryStyle';
import LanguageSelect from '../LanguageSelect';
import { MaxButton, PaneBar, WsIconButton } from '../wsUi';
import MoreMenu from '../MoreMenu';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PhoneConsoleBar from '../PhoneConsoleBar';
import { PhoneRunButton, PhoneSubmitButton } from '../PhoneRunButtons';
import { RADII } from '../../../app/design/designTokens';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { RunButton, SubmitButton } from '../RunSubmitButtons';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SplitHandle from '../SplitHandle';
import TimerControl from '../TimerControl';
import { VerdictChip } from '../ConsolePanel';
import VisualizeButton from '../codeVisualizer/VisualizeButton';
import { WS } from '../wsTokens';
import { setLanguage, toggleAiDrawer } from '../workspaceSlice';
import { tint } from '../../dashboard/dashboardUtils';

export function renderEditorPane(c) {
  const { activeLanguage, aiDrawerOpen, canShare, code, consoleBody, consoleOpen, ctl, dispatch, dragConsole, editorApi, editorColRef, editorInstance, editorPrefs, handleCopyCode, handleEditorChange, handleFormat, handleResetCode, handleRun, handleSubmit, handleVisualize, hideConsoleLabel, iconActions, inviteFriend, isAuthenticated, isMobile, isRunning, langMode, layout, maximized, mobileView, moreAnchor, narrowConsole, navigate, problem, resetConsole, resultToShow, runStatus, setAiMenuOpen, setConsoleOpen, setEditorInstance, setMaximized, setMoreAnchor, setRightEl, setShareOpen, showKbd, slug, submitStatus, surf, sw, toggleMax, visualizerOpen } = c;
  return (
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
        {isMobile ? (
          // Phone toolbar: language, timer, AI assistant. The editor actions live in the header menu.
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 2, height: 56, flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            <LanguageSelect value={activeLanguage} onChange={(v) => dispatch(setLanguage(v))} problem={problem} langMode={langMode} isMobile={isMobile} pill />
            <TimerControl sw={sw} size={ctl} lib />
            <Box sx={{ flex: 1, minWidth: 8 }} />
            <VisualizeButton isMobile onClick={handleVisualize} />
            <IconButton
              onClick={() => setAiMenuOpen(true)}
              aria-label="AI assistant"
              aria-pressed={aiDrawerOpen}
              sx={[libIconBtnSx, aiDrawerOpen && { bgcolor: tint(LIB_ACCENT, 16), color: LIB_ACCENT, '&:hover': { bgcolor: tint(LIB_ACCENT, 16) } }]}
            >
              <AutoAwesomeRoundedIcon />
            </IconButton>
          </Stack>
        ) : (
        <PaneBar sx={{ px: 1.5, gap: 0.5, height: WS.bar, bgcolor: surf.chrome, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
          <LanguageSelect value={activeLanguage} onChange={(v) => dispatch(setLanguage(v))} problem={problem} langMode={langMode} isMobile={isMobile} />
          <TimerControl sw={sw} size={ctl} />

          <Box sx={{ flex: 1, minWidth: 8 }} />

          {!isMobile && <InviteButton problem={problem} language={activeLanguage} code={code} size={ctl} />}
          <VisualizeButton size={ctl} active={visualizerOpen} onClick={handleVisualize} />
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
        )}

        {!isAuthenticated && (
          <GuestBanner lib={isMobile} onSignIn={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}>
            Sign in to run or submit — your progress and streak are saved.
          </GuestBanner>
        )}

        <Box ref={editorColRef} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', ...(isMobile && { borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, overflow: 'hidden' }) }}>
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
          {isMobile ? (
            <PhoneConsoleBar
              open={consoleOpen}
              setOpen={setConsoleOpen}
              showLabel={!(isRunning || resultToShow)}
              chip={<VerdictChip lib isRunning={isRunning} result={resultToShow} />}
              canShare={canShare}
              onShare={() => setShareOpen(true)}
              actions={
                <>
                  <PhoneRunButton loading={runStatus === 'running'} disabled={isRunning} onClick={handleRun} />
                  <PhoneSubmitButton loading={submitStatus === 'running'} disabled={isRunning} onClick={handleSubmit} />
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
            showLabel={!hideConsoleLabel}
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
          )}
        </Box>
      </Box>
  );
}
