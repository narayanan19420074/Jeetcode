import { useEffect } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { LIB_ACCENT, LIB_FONT, LIB_TRACKING } from '../dashboard/components/libraryStyle';
import AiGlow from './AiGlow';
import { COLOR_PALETTE, withAlpha } from '../../app/design/designTokens';

const rise = keyframes`from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: none; }`;

const OPTIONS = [
  { key: 'live', label: 'Go live', hint: 'Talk to the assistant about your code', Icon: GraphicEqRoundedIcon },
  { key: 'fix', label: 'Fix', hint: 'Fix errors and complete my code', Icon: BuildRoundedIcon },
  { key: 'hint', label: 'Hint', hint: 'A nudge, not the answer', Icon: LightbulbOutlinedIcon },
];

const MENU_SX = {
  position: 'fixed',
  zIndex: 1360,
  left: 16,
  right: 16,
  bottom: 'calc(16px + env(safe-area-inset-bottom))',
  maxWidth: 608,
  mx: 'auto',
  p: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 0.75,
  borderRadius: '28px',
  fontFamily: LIB_FONT,
  letterSpacing: LIB_TRACKING,
  color: 'var(--lib-text)',
  bgcolor: `var(--lib-bg, ${COLOR_PALETTE.orange[50]})`,
  border: `1px solid var(--lib-divider, ${COLOR_PALETTE.custom.orangeE9DFD5})`,
  boxShadow: `0 18px 50px ${withAlpha(COLOR_PALETTE.black, 0.25)}`,
  animation: `${rise} .28s cubic-bezier(.2,.9,.3,1.1) both`,
};

const OPTION_SX = {
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  gap: 1.5,
  textAlign: 'left',
  px: 1.5,
  py: 1.25,
  borderRadius: '20px',
  fontFamily: LIB_FONT,
  bgcolor: `var(--lib-player, ${COLOR_PALETTE.custom.orangeF1E7DD})`,
  '&:hover, &:focus-visible': { filter: 'brightness(0.97)' },
};

const ICON_SX = { width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', color: LIB_ACCENT, bgcolor: alpha(LIB_ACCENT, 0.14), flexShrink: 0 };

function LauncherOption({ label, hint, Icon, onPick }) {
  return (
    <ButtonBase role="menuitem" onClick={onPick} sx={OPTION_SX}>
      <Box sx={ICON_SX}>
        <Icon />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontFamily: LIB_FONT }}>{label}</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: '20px', color: `var(--lib-muted, ${COLOR_PALETTE.custom.gray6F655B})`, letterSpacing: LIB_TRACKING, fontFamily: LIB_FONT }}>{hint}</Typography>
      </Box>
    </ButtonBase>
  );
}

// Closes the menu when Escape is pressed.
function useEscapeToClose(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

// Phone only, Library look (cream surface, Roboto, pill rows, 16px gutter). Opens when the AI icon is tapped:
// the animated screen outline plus a small menu with Go live, Fix and Hint.
export default function AiLauncher({ open, onClose, onPick }) {
  useEscapeToClose(open, onClose);

  return (
    <>
      <AiGlow active={open} />
      {open && (
        <>
          <Box onClick={onClose} sx={{ position: 'fixed', inset: 0, zIndex: 1355, bgcolor: withAlpha(COLOR_PALETTE.black, 0.28) }} />
          <Box role="menu" aria-label="AI assistant" sx={MENU_SX}>
            {OPTIONS.map(({ key, ...option }) => (
              <LauncherOption key={key} {...option} onPick={() => onPick(key)} />
            ))}
          </Box>
        </>
      )}
    </>
  );
}
