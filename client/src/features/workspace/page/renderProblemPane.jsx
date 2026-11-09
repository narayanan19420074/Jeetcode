import { Box } from '@mui/material';
import DiscussionPanel from '../community/DiscussionPanel';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import { MaxButton, PaneBar, PaneTabs, WsIconButton } from '../wsUi';
import ProblemDescription from '../ProblemDescription';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import SolutionsPanel from '../community/SolutionsPanel';
import SubmissionsPanel from '../SubmissionsPanel';
import { DESC_TABS, MOBILE_TABS } from './workspaceTabs';

export function renderProblemPane(c) {
  const { descTab, handleRandom, handleSendToEditor, isAuthenticated, isMobile, layout, maximized, mountedTabs, nav, navigate, openTab, problem, setLeftEl, setListOpen, setShareOpen, slug, solutionsRefresh, submitResult, surf, tabLabels, toggleMax } = c;
  return (
      !isMobile && (
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
      )
  );
}
