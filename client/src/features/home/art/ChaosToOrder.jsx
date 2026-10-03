import { useEffect, useRef, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, useInView, useReducedMotion } from 'framer-motion';

// Five separate "tabs" start scattered and tilted, then snap into one
// dashboard when the section scrolls into view. The toggle lets the
// visitor replay the before/after themselves.
const TILES = [
  { id: 'code', title: 'Coding practice', x: 36, y: 56, w: 200, h: 120, from: { x: 14, y: 150, r: -6 } },
  { id: 'apt', title: 'Aptitude tests', x: 244, y: 56, w: 240, h: 120, from: { x: 240, y: 176, r: 5 } },
  { id: 'streak', title: 'Streak', x: 36, y: 184, w: 140, h: 120, from: { x: 350, y: 14, r: 9 } },
  { id: 'company', title: 'Company prep', x: 184, y: 184, w: 150, h: 120, from: { x: 150, y: 20, r: -8 } },
  { id: 'progress', title: 'Progress', x: 342, y: 184, w: 142, h: 120, from: { x: 196, y: 120, r: 4 } },
];

const QUESTION_MARKS = [
  { x: 128, y: 110, s: 26 },
  { x: 410, y: 150, s: 30 },
  { x: 300, y: 318, s: 22 },
];

function TileBody({ id, w, h, t }) {
  const muted = alpha(t.palette.text.secondary, 0.4);
  const ok = t.palette.success.main;
  const primary = t.palette.primary.main;

  if (id === 'code') {
    return (
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx="18" cy={48 + i * 22} r="5" fill={ok} />
            <rect x="30" y={44 + i * 22} width={90 + ((i * 37) % 60)} height="8" rx="4" fill={muted} />
          </g>
        ))}
      </g>
    );
  }
  if (id === 'apt') {
    return (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect
              x="12"
              y={38 + i * 20}
              width={w - 24}
              height="15"
              rx="6"
              fill={i === 2 ? alpha(ok, 0.2) : 'none'}
              stroke={i === 2 ? ok : muted}
              strokeWidth="1"
            />
            <rect x="22" y={43 + i * 20} width={50 + i * 14} height="5" rx="2.5" fill={muted} />
          </g>
        ))}
      </g>
    );
  }
  if (id === 'streak') {
    return (
      <g>
        <text x="14" y="76" fontSize="34" fontWeight="800" fill={t.palette.warning.main} fontFamily="Inter, sans-serif">
          7
        </text>
        <text x="40" y="76" fontSize="11" fill={t.palette.text.secondary} fontFamily="Inter, sans-serif">
          days
        </text>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <circle key={i} cx={18 + i * 17} cy="98" r="5" fill={i < 5 ? t.palette.warning.main : muted} />
        ))}
      </g>
    );
  }
  if (id === 'company') {
    return (
      <g>
        {['TC', 'IN', 'WI'].map((c, i) => (
          <g key={c}>
            <rect x="14" y={38 + i * 26} width="24" height="20" rx="6" fill="none" stroke={primary} strokeWidth="1.5" />
            <text x="26" y={52 + i * 26} textAnchor="middle" fontSize="9" fontWeight="800" fill={primary} fontFamily="Inter, sans-serif">
              {c}
            </text>
            <rect x="46" y={44 + i * 26} width={60 + i * 12} height="8" rx="4" fill={muted} />
          </g>
        ))}
      </g>
    );
  }
  return (
    <g>
      <circle cx={w / 2} cy={h / 2 + 12} r="30" fill="none" stroke={muted} strokeWidth="8" />
      <circle
        cx={w / 2}
        cy={h / 2 + 12}
        r="30"
        fill="none"
        stroke={ok}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="188.5"
        strokeDashoffset="56"
        transform={`rotate(-90 ${w / 2} ${h / 2 + 12})`}
      />
    </g>
  );
}

export default function ChaosToOrder() {
  const t = useTheme();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const [unified, setUnified] = useState(false);

  useEffect(() => {
    if (!inView) return undefined;
    const id = setTimeout(() => setUnified(true), reduce ? 0 : 1300);
    return () => clearTimeout(id);
  }, [inView, reduce]);

  const spring = reduce ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 15 };

  return (
    <Box ref={ref}>
      <Box
        sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha(t.palette.primary.main, 0.04),
          p: { xs: 1, sm: 2 },
        }}
      >
        <svg
          viewBox="0 0 520 340"
          width="100%"
          role="img"
          aria-label="Five scattered study tabs snapping together into one JeetCode dashboard"
          style={{ display: 'block' }}
        >
          <motion.rect
            x="18"
            y="14"
            width="484"
            height="312"
            rx="18"
            fill={t.palette.background.paper}
            stroke={alpha(t.palette.primary.main, 0.55)}
            strokeWidth="1.5"
            animate={{ opacity: unified ? 1 : 0 }}
            transition={{ duration: reduce ? 0 : 0.5 }}
          />
          <motion.g animate={{ opacity: unified ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.5 }}>
            {['error', 'warning', 'success'].map((c, i) => (
              <circle key={c} cx={36 + i * 14} cy="34" r="4" fill={t.palette[c].main} />
            ))}
            <text x="98" y="38" fontSize="11" fill={t.palette.text.secondary} fontFamily="JetBrains Mono, monospace">
              jeetcode / dashboard
            </text>
          </motion.g>

          {TILES.map((tile) => (
            <motion.g
              key={tile.id}
              initial={false}
              animate={{
                x: unified ? tile.x : tile.from.x,
                y: unified ? tile.y : tile.from.y,
                rotate: unified ? 0 : tile.from.r,
              }}
              transition={spring}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <rect
                width={tile.w}
                height={tile.h}
                rx="12"
                fill={t.palette.background.paper}
                stroke={alpha(t.palette.text.secondary, unified ? 0.3 : 0.55)}
                strokeWidth="1.2"
                style={{ filter: unified ? 'none' : `drop-shadow(0 6px 8px ${alpha('#0F172A', 0.18)})` }}
              />
              <text x="14" y="24" fontSize="12" fontWeight="700" fill={t.palette.text.primary} fontFamily="Inter, sans-serif">
                {tile.title}
              </text>
              <TileBody id={tile.id} w={tile.w} h={tile.h} t={t} />
            </motion.g>
          ))}

          {QUESTION_MARKS.map((q) => (
            <motion.text
              key={`${q.x}-${q.y}`}
              x={q.x}
              y={q.y}
              fontSize={q.s}
              fontWeight="800"
              fill={t.palette.error.main}
              fontFamily="Inter, sans-serif"
              animate={{ opacity: unified ? 0 : 0.85 }}
              transition={{ duration: reduce ? 0 : 0.35 }}
            >
              ?
            </motion.text>
          ))}
        </svg>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={unified ? 'one' : 'many'}
          onChange={(_, v) => v && setUnified(v === 'one')}
          aria-label="Compare scattered prep with JeetCode"
        >
          <ToggleButton value="many" sx={{ px: 2, textTransform: 'none', fontWeight: 700 }}>
            Scattered
          </ToggleButton>
          <ToggleButton value="one" sx={{ px: 2, textTransform: 'none', fontWeight: 700 }}>
            In JeetCode
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" aria-live="polite">
          {unified ? 'One place. Every round. A clear next step.' : 'Five tabs and a mental checklist.'}
        </Typography>
      </Box>
    </Box>
  );
}
