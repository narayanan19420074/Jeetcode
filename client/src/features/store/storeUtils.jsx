import { Box, Typography } from '@mui/material';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { FF } from '../quests/questUtils';

export const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—';

// `tone` is a Tag tone from QuestParts (orange / green / red / coin / dark).
export const STATUS_META = {
  placed: { label: 'Placed', tone: 'dark' },
  processing: { label: 'Packing', tone: 'coin' },
  shipped: { label: 'Shipped', tone: 'orange' },
  delivered: { label: 'Delivered', tone: 'green' },
  fulfilled: { label: 'Delivered instantly', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'dark' },
};

export const SHIP_STEPS = ['placed', 'processing', 'shipped', 'delivered'];

// Coin amount with the gold coin icon, in the game gold that stays readable in light and dark mode.
export function Coins({ value, size = 18, bold = true, color = FF.coin, sx }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontVariantNumeric: 'tabular-nums', ...sx }}>
      <MonetizationOnRoundedIcon sx={{ fontSize: size, color, filter: 'drop-shadow(0 1px 2px rgba(143,98,0,0.45))' }} />
      <Typography component="span" sx={{ fontWeight: bold ? 900 : 600, fontSize: size * 0.85, lineHeight: 1, color: FF.text }}>
        {fmt(value)}
      </Typography>
    </Box>
  );
}

// ---- Product mock-ups: white goods with the JeetCode mark printed on, drawn as shaded SVG ----
const INK = '#334155';

function Defs() {
  return (
    <defs>
      <linearGradient id="jcWhite" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#DCE1E9" />
      </linearGradient>
      <linearGradient id="jcCyl" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#D5DAE3" />
        <stop offset="0.35" stopColor="#FFFFFF" />
        <stop offset="0.75" stopColor="#F1F3F7" />
        <stop offset="1" stopColor="#CBD1DB" />
      </linearGradient>
      <filter id="jcShadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.2" />
      </filter>
    </defs>
  );
}

function Print({ x, y, c, size = 16, label = true }) {
  return (
    <g textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight="700">
      <text x={x} y={y} fontSize={size} fill={c}>{'</>'}</text>
      {label && <text x={x} y={y + size * 0.78} fontSize={size * 0.5} fill={INK} letterSpacing="0.8">JeetCode</text>}
    </g>
  );
}

function Tee({ c }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <Defs />
      <g filter="url(#jcShadow)">
        <path d="M72 26 L38 40 L10 80 L38 98 L52 82 L52 178 L148 178 L148 82 L162 98 L190 80 L162 40 L128 26 Q100 46 72 26Z" fill="url(#jcWhite)" stroke="#CDD3DC" strokeWidth="1.2" />
      </g>
      <path d="M72 26 Q100 46 128 26 L124 24 Q100 40 76 24Z" fill="#E4E8EE" />
      <path d="M76 25 Q100 52 124 25" fill="none" stroke="#C3CAD5" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 82 Q60 100 56 120" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="6" />
      <path d="M148 82 Q140 100 144 120" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="6" />
      <path d="M52 170 H148" stroke="#C9CFD9" strokeWidth="1.5" />
      <Print x={100} y={92} c={c} size={22} />
    </svg>
  );
}

function Hoodie({ c }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <Defs />
      <g filter="url(#jcShadow)">
        <path d="M70 30 L36 44 L10 96 L34 108 L50 88 L50 178 L150 178 L150 88 L166 108 L190 96 L164 44 L130 30 Q100 22 70 30Z" fill="url(#jcWhite)" stroke="#CDD3DC" strokeWidth="1.2" />
      </g>
      <path d="M70 30 Q100 12 130 30 Q124 62 100 66 Q76 62 70 30Z" fill="#E3E7EE" stroke="#C9CFD9" strokeWidth="1.2" />
      <path d="M82 34 Q100 24 118 34 Q114 54 100 57 Q86 54 82 34Z" fill="#CBD1DB" />
      <path d="M92 66 V92 M108 66 V92" stroke="#B7BFCC" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M68 140 H132 L138 172 H62Z" fill="#000" fillOpacity="0.04" stroke="#CDD3DC" strokeWidth="1.2" />
      <Print x={100} y={116} c={c} size={18} label={false} />
    </svg>
  );
}

function Mug({ c }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <Defs />
      <ellipse cx="98" cy="170" rx="62" ry="10" fill="#FFFFFF" stroke="#D3D8E0" />
      <ellipse cx="98" cy="168" rx="48" ry="6" fill="#E6E9EF" />
      <path d="M136 90 Q168 90 168 118 Q168 146 132 146" fill="none" stroke="#D3D8E0" strokeWidth="11" strokeLinecap="round" />
      <path d="M136 90 Q164 90 164 118 Q164 142 132 142" fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
      <g filter="url(#jcShadow)">
        <path d="M56 66 H140 V132 Q140 164 98 164 Q56 164 56 132Z" fill="url(#jcCyl)" stroke="#CDD3DC" strokeWidth="1.2" />
      </g>
      <ellipse cx="98" cy="66" rx="42" ry="10" fill="#F6F7FA" stroke="#CDD3DC" strokeWidth="1.2" />
      <ellipse cx="98" cy="67" rx="36" ry="7" fill="#B7824A" />
      <ellipse cx="94" cy="65" rx="14" ry="2.5" fill="#fff" fillOpacity="0.28" />
      <path d="M84 50 Q90 40 84 30 M102 50 Q108 40 102 30" stroke="#B8BFCB" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <Print x={98} y={112} c={c} size={20} />
    </svg>
  );
}

function Notebook({ c }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <Defs />
      <rect x="62" y="30" width="98" height="144" rx="5" fill="#D9DEE6" />
      <rect x="58" y="26" width="98" height="144" rx="5" fill="#E9ECF1" />
      <g filter="url(#jcShadow)">
        <rect x="52" y="22" width="98" height="144" rx="6" fill="url(#jcWhite)" stroke="#CDD3DC" strokeWidth="1.2" />
      </g>
      <rect x="52" y="22" width="12" height="144" rx="4" fill="#DDE2EA" />
      <path d="M64 22 V166" stroke="#C3CAD5" strokeWidth="1.2" />
      <rect x="132" y="22" width="7" height="144" fill={c} opacity="0.92" />
      <Print x={97} y={84} c={c} size={26} />
      <g stroke="#CBD1DB" strokeWidth="1.6" strokeLinecap="round">
        <path d="M78 120 H118" /><path d="M78 128 H112" />
      </g>
    </svg>
  );
}

function Cap({ c }) {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <Defs />
      <g filter="url(#jcShadow)">
        <path d="M42 128 Q40 56 100 54 Q160 56 158 128Z" fill="url(#jcWhite)" stroke="#CDD3DC" strokeWidth="1.2" />
        <path d="M34 128 Q100 112 166 128 Q176 150 100 154 Q24 150 34 128Z" fill="#E1E5EC" stroke="#C9CFD9" strokeWidth="1.2" />
      </g>
      <path d="M100 54 V124 M72 62 Q64 96 66 124 M128 62 Q136 96 134 124" stroke="#D0D5DE" strokeWidth="1.2" fill="none" />
      <circle cx="100" cy="53" r="4" fill="#DDE2EA" stroke="#C9CFD9" />
      <Print x={100} y={104} c={c} size={20} label={false} />
    </svg>
  );
}

function Stickers() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <Defs />
      <g filter="url(#jcShadow)">
        <rect x="30" y="30" width="140" height="140" rx="10" fill="url(#jcWhite)" stroke="#CDD3DC" strokeWidth="1.2" />
      </g>
      <circle cx="68" cy="68" r="22" fill="#4F46E5" />
      <text x="68" y="74" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="16" fill="#fff">{'</>'}</text>
      <rect x="98" y="48" width="58" height="24" rx="12" fill="#10B981" />
      <text x="127" y="64" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="10" fill="#fff">Accepted.</text>
      <rect x="44" y="104" width="46" height="22" rx="11" fill="#F43F5E" />
      <text x="67" y="119" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="11" fill="#fff">TLE</text>
      <path d="M130 100 l8 17 18 2 -13 12 4 18 -17 -9 -16 9 4 -18 -13 -12 18 -2z" fill="#F59E0B" />
      <rect x="44" y="136" width="56" height="20" rx="10" fill="#0EA5E9" />
      <text x="72" y="150" textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize="9" fill="#fff">O(log n)</text>
    </svg>
  );
}

const ICONS = { pro: WorkspacePremiumRoundedIcon, course: SchoolRoundedIcon };
const SVG_ART = { tee: Tee, hoodie: Hoodie, mug: Mug, notebook: Notebook, cap: Cap, stickers: Stickers };

// Product picture in an item slot: the accent colour glows behind it, like a game inventory tile.
// If the catalog item has `image` (a real photo), that is shown instead of the drawn mock-up.
export function ItemArt({ art, accent = '#6366F1', height = 150, image = null }) {
  const Svg = SVG_ART[art];
  const Icon = ICONS[art];
  return (
    <Box sx={{ height, background: `radial-gradient(circle at 50% 58%, ${accent}40, transparent 68%), ${FF.well}`, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
      {image ? (
        <Box component="img" src={image} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : Svg ? (
        <Box sx={{ width: height * 0.92, height: height * 0.92 }}>
          <Svg c={accent} />
        </Box>
      ) : Icon ? (
        <Box sx={{ width: height * 0.52, height: height * 0.52, display: 'grid', placeItems: 'center', background: `linear-gradient(135deg, ${accent}, ${accent}B3)`, boxShadow: `0 6px 18px ${accent}59`, clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}>
          <Icon sx={{ fontSize: height * 0.3, color: '#fff' }} />
        </Box>
      ) : null}
    </Box>
  );
}

export function priceNote(item) {
  if (item.soldOut) return 'Sold out';
  if (item.lowStock) return `Only ${item.stockLeft} left`;
  return null;
}
