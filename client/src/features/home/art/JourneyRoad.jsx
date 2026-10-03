import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion';
import { DISPLAY_FONT } from '../anim';

// The road draws itself as the visitor scrolls, and a marker runs along it.
// Nodes light up as the marker passes them. Desktop only: on phones the
// same four steps stack as cards.
const ROAD = 'M20 150 C 140 150 160 70 280 70 S 430 165 540 150 S 700 60 780 82 S 900 150 980 92';
const NODE_AT = [0.1, 0.37, 0.63, 0.89];

export default function JourneyRoad({ steps }) {
  const t = useTheme();
  const sectionRef = useRef(null);
  const pathRef = useRef(null);
  const [pts, setPts] = useState([]);
  const [active, setActive] = useState(-1);
  const x = useMotionValue(20);
  const y = useMotionValue(150);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 78%', 'end 60%'],
  });

  useEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    setPts(NODE_AT.map((f) => p.getPointAtLength(len * f)));
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const p = pathRef.current;
    if (!p) return;
    const pt = p.getPointAtLength(p.getTotalLength() * Math.min(Math.max(v, 0), 1));
    x.set(pt.x);
    y.set(pt.y);
    let a = -1;
    NODE_AT.forEach((n, i) => {
      if (v >= n - 0.04) a = i;
    });
    setActive((prev) => (prev === a ? prev : a));
  });

  return (
    <Box ref={sectionRef}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <svg viewBox="0 0 1000 220" width="100%" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
          <path
            ref={pathRef}
            d={ROAD}
            fill="none"
            stroke={alpha(t.palette.text.secondary, 0.4)}
            strokeWidth="3"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
          <motion.path
            d={ROAD}
            fill="none"
            stroke={t.palette.primary.main}
            strokeWidth="5"
            strokeLinecap="round"
            style={{ pathLength: scrollYProgress }}
          />
          <motion.circle
            cx={x}
            cy={y}
            r={9}
            fill={t.palette.warning.main}
            stroke={t.palette.background.paper}
            strokeWidth="3"
          />
          {pts.map((p, i) => {
            const on = i <= active;
            return (
              <g key={i}>
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={22}
                  fill={on ? t.palette.primary.main : t.palette.background.paper}
                  stroke={t.palette.primary.main}
                  strokeWidth="3"
                  animate={{ scale: on ? 1.12 : 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  fontSize="17"
                  fontWeight="800"
                  fill={on ? '#fff' : t.palette.text.primary}
                  fontFamily="Inter, sans-serif"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: { xs: 2, md: 3 },
          mt: { xs: 0, md: 1 },
        }}
      >
        {steps.map((s, i) => (
          <Box
            key={s.title}
            sx={{
              opacity: i <= active ? 1 : 0.55,
              transform: i <= active ? 'none' : 'translateY(6px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              pl: { xs: 2, md: 0 },
              textAlign: { xs: 'left', md: 'center' },
              borderLeft: { xs: '3px solid', md: 'none' },
              borderColor: i <= active ? 'primary.main' : 'divider',
            }}
          >
            <Typography
              sx={{ display: { xs: 'block', md: 'none' }, fontWeight: 800, color: 'primary.main', fontSize: '0.8rem' }}
            >
              Step {i + 1}
            </Typography>
            <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: '1.15rem', mb: 0.5 }}>
              {s.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '34ch', mx: { md: 'auto' } }}>
              {s.body}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
