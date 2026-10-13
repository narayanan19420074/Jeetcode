import { useState } from 'react';
import { Box } from '@mui/material';

const COLORS = ['#1A73E8', '#0B8043', '#C5221F', '#B06000', '#8430CE', '#00796B', '#C2185B', '#3949AB', '#E8710A', '#546E7A'];

const hash = (s) => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
};

const initialsOf = (name) => {
  const words = String(name || '').trim().split(/[\s.\-&]+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// Company logo when we have one, otherwise a coloured tile with the initials.
// The colour is derived from the name, so a company always looks the same.
export default function CompanyAvatar({ name, logoUrl, size = 48 }) {
  const [broken, setBroken] = useState(false);
  const showLogo = Boolean(logoUrl) && !broken;

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
        fontSize: size * 0.4,
        letterSpacing: '-0.02em',
        color: showLogo ? 'text.primary' : '#fff',
        bgcolor: showLogo ? '#fff' : COLORS[hash(String(name || '')) % COLORS.length],
        border: '1px solid',
        borderColor: 'divider',
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
      ) : (
        initialsOf(name)
      )}
    </Box>
  );
}
