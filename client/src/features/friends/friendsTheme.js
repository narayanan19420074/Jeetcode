import { createTheme } from '@mui/material/styles';

// "The room": the Friends page is built from modules (header, counts, list, chat) that stand on one
// ivory floor. Only two colours are used: warm ivory and deep merlot rose. Everything else is a shade of those.
export const FR_LIGHT = {
  dark: false,
  base: '#F3E8E2', room: 'linear-gradient(160deg,#F8EFE9 0%,#EFE0D8 100%)',
  ink: '#3B1624', muted: '#8A6672', line: 'rgba(138,102,114,0.22)',
  accent: '#8E2C48', accentLight: '#B4476B', accentDark: '#6E1F3A', onAccent: '#FFF7F3',
  accentGrad: 'linear-gradient(135deg,#B4476B 0%,#8E2C48 55%,#6E1F3A 100%)',
  accentGlow: '0 10px 22px -8px rgba(142,44,72,0.75), inset 0 1px 0 rgba(255,255,255,0.3)',
  raised: '6px 6px 14px rgba(160,108,100,0.30), -6px -6px 14px rgba(255,252,248,0.95)',
  raisedSm: '3px 3px 8px rgba(160,108,100,0.28), -3px -3px 8px rgba(255,252,248,0.95)',
  pressed: 'inset 4px 4px 9px rgba(160,108,100,0.30), inset -4px -4px 9px rgba(255,252,248,0.95)',
  border: '1px solid rgba(255,255,255,0.75)', roomShadow: '0 30px 60px -36px rgba(110,31,58,0.45)',
  blush: 'radial-gradient(circle at 100% 0%, rgba(180,71,107,0.16), transparent 62%)',
};

export const FR_DARK = {
  dark: true,
  base: '#2B1520', room: 'linear-gradient(160deg,#22101A 0%,#321925 100%)',
  ink: '#F6E7E1', muted: '#BD98A4', line: 'rgba(246,231,225,0.14)',
  accent: '#E58AA3', accentLight: '#F2A9BC', accentDark: '#B5476B', onAccent: '#2B1520',
  accentGrad: 'linear-gradient(135deg,#F2A9BC 0%,#E58AA3 50%,#C85A7C 100%)',
  accentGlow: '0 10px 22px -8px rgba(229,138,163,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
  raised: '6px 6px 14px rgba(10,2,7,0.6), -5px -5px 12px rgba(229,138,163,0.07)',
  raisedSm: '3px 3px 8px rgba(10,2,7,0.55), -3px -3px 8px rgba(229,138,163,0.06)',
  pressed: 'inset 4px 4px 9px rgba(10,2,7,0.6), inset -3px -3px 8px rgba(229,138,163,0.07)',
  border: '1px solid rgba(246,231,225,0.10)', roomShadow: '0 30px 60px -36px rgba(0,0,0,0.85)',
  blush: 'radial-gradient(circle at 100% 0%, rgba(229,138,163,0.14), transparent 62%)',
};

export const frTokens = (mode) => (mode === 'dark' ? FR_DARK : FR_LIGHT);

export const SERIF = '"Playfair Display","Georgia","Times New Roman",serif';

// Chat, activity feed and the dialogs sit inside the room, so they pick up the same two colours.
export const frTheme = (base) => {
  const T = frTokens(base.palette.mode);
  return createTheme(base, {
    palette: {
      primary: { main: T.accent, light: T.accentLight, dark: T.accentDark, contrastText: T.onAccent },
      background: { paper: T.base },
    },
  });
};
