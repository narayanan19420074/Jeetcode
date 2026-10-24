import { Box, Typography, alpha } from '@mui/material';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LocalCafeRoundedIcon from '@mui/icons-material/LocalCafeRounded';
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';

export const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';

export const STATUS_META = {
  placed: { label: 'Placed', color: 'info' },
  processing: { label: 'Packing', color: 'warning' },
  shipped: { label: 'Shipped', color: 'primary' },
  delivered: { label: 'Delivered', color: 'success' },
  fulfilled: { label: 'Delivered instantly', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

export const SHIP_STEPS = ['placed', 'processing', 'shipped', 'delivered'];

// Coin amount with the gold coin icon. Gold is the reward colour (see theme.js).
export function Coins({ value, size = 18, bold = true, color = 'warning.main', sx }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontVariantNumeric: 'tabular-nums', ...sx }}>
      <MonetizationOnRoundedIcon sx={{ fontSize: size, color }} />
      <Typography component="span" sx={{ fontWeight: bold ? 800 : 600, fontSize: size * 0.85, lineHeight: 1 }}>
        {fmt(value)}
      </Typography>
    </Box>
  );
}

function Tee({ c, hoodie }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <path
        d={hoodie
          ? 'M40 18 L26 26 L8 62 L24 70 L32 56 L32 104 L88 104 L88 56 L96 70 L112 62 L94 26 L80 18 Q60 34 40 18Z'
          : 'M42 16 L22 24 L6 52 L24 62 L32 52 L32 104 L88 104 L88 52 L96 62 L114 52 L98 24 L78 16 Q60 30 42 16Z'}
        fill={c}
      />
      <path d="M42 16 Q60 30 78 16" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" />
      <text x="60" y="66" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="13" fill="rgba(255,255,255,.95)">{'</>'}</text>
      {hoodie && <path d="M46 84 H74 V102 H46Z" fill="rgba(0,0,0,.18)" />}
    </svg>
  );
}

function Mug({ c }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <rect x="26" y="34" width="56" height="62" rx="8" fill="#fff" stroke={c} strokeWidth="4" />
      <path d="M82 46 H94 Q104 46 104 58 Q104 72 92 72 H82" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" />
      <text x="54" y="70" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="11" fill={c}>Accepted.</text>
      <path d="M40 24 Q44 14 40 8 M56 24 Q60 14 56 8 M72 24 Q76 14 72 8" stroke="rgba(255,255,255,.7)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Cap({ c }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
      <path d="M24 70 Q24 28 60 28 Q96 28 96 70Z" fill={c} />
      <path d="M20 72 H110 Q108 84 90 84 H24Z" fill="rgba(0,0,0,.28)" />
      <text x="60" y="58" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="14" fill="rgba(255,255,255,.95)">{'</>'}</text>
    </svg>
  );
}

const ICONS = { pro: WorkspacePremiumRoundedIcon, course: SchoolRoundedIcon, stickers: StickyNote2RoundedIcon, notebook: MenuBookRoundedIcon, mug: LocalCafeRoundedIcon };

// Illustrated tile for an item. No photos needed: drawn from the item's art key + accent colour.
export function ItemArt({ art, accent = '#6366F1', height = 150, radius = 3 }) {
  const Icon = ICONS[art];
  let inner;
  if (art === 'tee') inner = <Tee c={accent} />;
  else if (art === 'hoodie') inner = <Tee c={accent} hoodie />;
  else if (art === 'mug') inner = <Mug c={accent} />;
  else if (art === 'cap') inner = <Cap c={accent} />;
  else if (Icon) inner = <Icon sx={{ fontSize: height * 0.5, color: '#fff' }} />;
  else inner = null;
  const svg = ['tee', 'hoodie', 'mug', 'cap'].includes(art);
  return (
    <Box
      sx={{
        height,
        borderRadius: radius,
        display: 'grid',
        placeItems: 'center',
        background: `linear-gradient(135deg, ${alpha(accent, 0.28)}, ${alpha(accent, 0.08)})`,
        ...(!svg && { background: `linear-gradient(135deg, ${accent}, ${alpha(accent, 0.65)})` }),
        '& svg': svg ? { width: height * 0.72, height: height * 0.72 } : undefined,
      }}
    >
      {inner}
    </Box>
  );
}

export function priceNote(item) {
  if (item.soldOut) return 'Sold out';
  if (item.lowStock) return `Only ${item.stockLeft} left`;
  return null;
}
