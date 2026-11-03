import { useState } from 'react';
import { Box } from '@mui/material';
import { getBrandLogo } from './brandLogos';
import { COLOR_PALETTE, withAlpha } from '../app/design/designTokens';

// Companies without a brand mark get a generated monogram badge: a two-tone gradient picked from the name.
const GRADIENTS = [
  [COLOR_PALETTE.indigo[500], COLOR_PALETTE.violet[500]], [COLOR_PALETTE.sky[500], COLOR_PALETTE.blue[600]], [COLOR_PALETTE.emerald[500], COLOR_PALETTE.teal[600]], [COLOR_PALETTE.amber[500], COLOR_PALETTE.orange[600]],
  [COLOR_PALETTE.pink[500], COLOR_PALETTE.pink[700]], [COLOR_PALETTE.teal[500], COLOR_PALETTE.cyan[600]], [COLOR_PALETTE.purple[500], COLOR_PALETTE.custom.purpleC026D3], [COLOR_PALETTE.red[500], COLOR_PALETTE.red[700]],
  [COLOR_PALETTE.custom.green65A30D, COLOR_PALETTE.green[600]], [COLOR_PALETTE.orange[500], COLOR_PALETTE.pink[600]], [COLOR_PALETTE.blue[500], COLOR_PALETTE.indigo[600]], [COLOR_PALETTE.slate[500], COLOR_PALETTE.slate[700]],
];

const hash = (s) => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
};

// Short names (TCS, IBM, SAP) show whole; longer ones show a one- or two-letter monogram.
const initialsOf = (name) => {
  const words = String(name || '').trim().split(/[\s.\-&]+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].length <= 3 ? words[0].toUpperCase() : words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Company logo when we have one (admin-set logoUrl, else a free brand mark from brandLogos.js),
// otherwise a coloured tile with the initials.
// The colour is derived from the name, so a company always looks the same.
export default function CompanyAvatar({ name, logoUrl, size = 48 }) {
  const [broken, setBroken] = useState(false);
  const showLogo = Boolean(logoUrl) && !broken;
  const brand = showLogo ? null : getBrandLogo(name);
  const light = showLogo || Boolean(brand);
  const [ga, gb] = GRADIENTS[hash(String(name || '')) % GRADIENTS.length];
  const text = initialsOf(name);

  return (
    <Box
      aria-hidden="true"
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: `${Math.round(size * 0.26)}px`,
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 'fontWeightBold',
        position: 'relative',
        fontSize: size * (text.length >= 3 ? 0.3 : 0.4),
        letterSpacing: '-0.02em',
        color: light ? 'text.primary' : COLOR_PALETTE.white,
        ...(light ? { bgcolor: COLOR_PALETTE.white } : {
          background: `linear-gradient(145deg, ${ga}, ${gb})`,
          textShadow: `0 1px 2px ${withAlpha(COLOR_PALETTE.black, 0.25)}`,
          boxShadow: `inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.35)}, 0 4px 10px -4px ${gb}99`,
          '&::after': { content: '""', position: 'absolute', inset: 0, background: `radial-gradient(circle at 25% 15%, ${withAlpha(COLOR_PALETTE.white, 0.35)}, transparent 55%)`, pointerEvents: 'none' },
        }),
        border: '1px solid',
        borderColor: light ? 'divider' : 'transparent',
      }}
    >
      {showLogo ? (
        <Box
          component="img"
          src={logoUrl}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'contain', p: `${Math.round(size * 0.14)}px` }}
        />
      ) : brand ? (
        <Box component="svg" viewBox="0 0 24 24" aria-hidden="true" sx={{ width: '60%', height: '60%' }}>
          <path d={brand.path} fill={brand.color} />
        </Box>
      ) : (
        text
      )}
    </Box>
  );
}
