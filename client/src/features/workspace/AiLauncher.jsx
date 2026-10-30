import { useEffect } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { LIB_ACCENT, LIB_FONT, LIB_TRACKING } from '../dashboard/components/libraryStyle';
import AiGlow from './AiGlow';

const rise = keyframes`from { opacity: 0; transform: translateY(18px) scale(.96); } to { opacity: 1; transform: none; }`;

const OPTIONS = [
  { key: 'live', label: 'Go live', hint: 'Talk to the assistant', Icon: GraphicEqRoundedIcon, color: LIB_ACCENT },
  { key: 'fix', label: 'Fix', hint: 'Find the bug in my code', Icon: BuildRoundedIcon, color: LIB_ACCENT },
  { key: 'hint', label: 'Hint', hint: 'A nudge, not the answer', Icon: LightbulbOutlinedIcon, color: LIB_ACCENT },
];

// Phone only, Library look (cream surface, Roboto, pill rows, 16px gutter). Opens when the AI icon is tapped: the animated screen outline plus a small menu with Go live, Fix and Hint.
export default function AiLauncher({ open, onClose, onPick }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <AiGlow active={open} />
      {open && (
        <>
          <Box onClick={onClose} sx={{ position: 'fixed', inset: 0, zIndex: 1355, bgcolor: 'rgba(0,0,0,0.28)' }} />
          <Box
            role="menu"
            aria-label="AI assistant"
            sx={{
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
              bgcolor: 'var(--lib-bg, #FDF8F4)',
              border: '1px solid var(--lib-divider, #E9DFD5)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.25)',
              animation: `${rise} .28s cubic-bezier(.2,.9,.3,1.1) both`,
            }}
          >
            {OPTIONS.map(({ key, label, hint, Icon, color }) => (
              <ButtonBase
                key={key}
                role="menuitem"
                onClick={() => onPick(key)}
                sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', gap: 1.5, textAlign: 'left', px: 1.5, py: 1.25, borderRadius: '20px', fontFamily: LIB_FONT, bgcolor: 'var(--lib-player, #F1E7DD)', '&:hover, &:focus-visible': { filter: 'brightness(0.97)' } }}
              >
                <Box sx={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', color, bgcolor: alpha(color, 0.14), flexShrink: 0 }}>
                  <Icon />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontFamily: LIB_FONT }}>{label}</Typography>
                  <Typography sx={{ fontSize: 14, lineHeight: '20px', color: 'var(--lib-muted, #6F655B)', letterSpacing: LIB_TRACKING, fontFamily: LIB_FONT }}>
                    {hint}
                  </Typography>
                </Box>
              </ButtonBase>
            ))}
          </Box>
        </>
      )}
    </>
  );
}
