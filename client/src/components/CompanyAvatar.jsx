import { useState } from 'react';
import { Box } from '@mui/material';
import { getBrandLogo } from './brandLogos';

// Companies without a brand mark get a generated monogram badge: a two-tone gradient picked from the name.
const GRADIENTS = [
  ['#6366F1', '#8B5CF6'], ['#0EA5E9', '#2563EB'], ['#10B981', '#0D9488'], ['#F59E0B', '#EA580C'],
  ['#EC4899', '#BE185D'], ['#14B8A6', '#0891B2'], ['#A855F7', '#C026D3'], ['#EF4444', '#B91C1C'],
  ['#65A30D', '#16A34A'], ['#F97316', '#DB2777'], ['#3B82F6', '#4F46E5'], ['#64748B', '#334155'],
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
        fontWeight: 800,
        position: 'relative',
        fontSize: size * (text.length >= 3 ? 0.3 : 0.4),
        letterSpacing: '-0.02em',
        color: light ? 'text.primary' : '#fff',
        ...(light ? { bgcolor: '#fff' } : {
          background: `linear-gradient(145deg, ${ga}, ${gb})`,
          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 10px -4px ${gb}99`,
          '&::after': { content: '""', position: 'absolute', inset: 0, background: 'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.35), transparent 55%)', pointerEvents: 'none' },
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
