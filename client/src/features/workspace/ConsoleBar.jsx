import { Box, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { EditorStatus } from './ConsolePanel';
import { MaxButton, WsButton } from './wsUi';
import { WS } from './wsTokens';
import { wsSurface } from './workspaceTheme';

// The collapsible console under the editor: header bar (title, verdict chip,
// share, cursor status, maximize) and, when open, the page's console body.
//   size           console share of the column (usePaneLayout -> layout.console)
//   safeBottom     pad for the phone home indicator (full-screen pages)
//   showLabel      show the word "Console"
//   chip           verdict / run chip
//   canShare       a share-able accepted submission exists
//   narrow         narrow pane: share becomes an icon, cursor status hides
//   mobileActions  Run / Submit buttons (phone only)
export default function ConsoleBar({
  isMobile,
  open,
  setOpen,
  maximized,
  setMaximized,
  toggleMax,
  size,
  safeBottom = false,
  showLabel = true,
  chip,
  canShare = false,
  onShare,
  narrow = false,
  mobileActions,
  editor,
  tabSize,
  children,
}) {
  const surf = wsSurface(useTheme());
  return (
    <Box
      sx={{
        bgcolor: surf.panel,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        ...(safeBottom && { pb: { xs: 'env(safe-area-inset-bottom)', md: 0 } }),
        ...(isMobile
          ? { flexShrink: 0, maxHeight: open ? '45%' : 'auto' }
          : maximized === 'console'
            ? { flex: '1 1 0' }
            : { flex: open ? `0 0 ${size * 100}%` : '0 0 auto' }),
      }}
    >
      <Stack
        direction="row"
        onClick={() => (maximized === 'console' ? setMaximized(null) : setOpen((o) => !o))}
        sx={{ alignItems: 'center', gap: 1, px: 1.5, height: { xs: 52, md: WS.barSm }, flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}
      >
        <TerminalRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        {showLabel && <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Console</Typography>}
        {chip}
        {!isMobile && canShare && (
          <WsButton
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation(); // don't toggle the console
              onShare();
            }}
            startIcon={<IosShareRoundedIcon />}
            iconOnly={narrow}
            title="Share solution"
            sx={{ height: 26, color: 'primary.main', ...(narrow && { width: 26 }) }}
          >
            Share solution
          </WsButton>
        )}
        <Box sx={{ flex: 1 }} />
        {isMobile && (
          <Stack direction="row" sx={{ gap: 0.75, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            {mobileActions}
          </Stack>
        )}
        {!isMobile && !narrow && <EditorStatus editor={editor} tabSize={tabSize} />}
        {!isMobile && (
          <MaxButton
            active={maximized === 'console'}
            onClick={() => {
              setOpen(true);
              toggleMax('console');
            }}
            label="console"
          />
        )}
        <ExpandMoreRoundedIcon sx={{ color: 'text.secondary', transition: 'transform .2s', transform: open ? 'none' : 'rotate(180deg)' }} />
      </Stack>

      {open && (
        <Box sx={{ pt: 0.25, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {isMobile && canShare && (
            <Box sx={{ px: 1.5, pb: 1 }}>
              <WsButton variant="secondary" onClick={onShare}>
                Share solution
              </WsButton>
            </Box>
          )}
          {children}
        </Box>
      )}
    </Box>
  );
}
