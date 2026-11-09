import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Box, alpha, useTheme } from '@mui/material';
import LevelNode from './roadMap/LevelNode';
import PhoneLevelNode from './roadMap/PhoneLevelNode';
import RoadWalker from './roadMap/RoadWalker';
import { RoadStartFlag, RoadTrack } from './roadMap/RoadScenery';
import { DESKTOP, MOBILE, PHONE_ALIEN, labelRight, roadPath } from './roadMap/roadGeometry';
import { RADII_PX } from '../../../app/design/designTokens';

// Level map. Follows the app theme (dark / light) and the product palette:
// slate surfaces, blue = current, green = cleared. A slim road winds through
// the levels; the learner's alien walks it from START to the current level.
// Geometry is in real pixels (measured width) so nothing is stretched.
// Pieces live in ./roadMap (geometry, level nodes, road scenery, walker).

export default function RoadMap({ patterns, currentIndex, alienKind, onOpen, autoScroll = true, compact = false }) {
  const theme = useTheme();
  const reduce = useReducedMotion();
  const wrapRef = useRef(null);
  const [W, setW] = useState(0);
  const dark = theme.palette.mode === 'dark';
  const { primary, text } = theme.palette;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    setW(el.clientWidth);
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = compact || (W > 0 && W < 620);
  const below = W > 0 && W < 480;
  const g = narrow ? MOBILE : DESKTOP;
  const H = g.TOP + g.ROW * patterns.length + g.BOTTOM;

  const dir = compact ? -1 : 1;
  const startY = compact ? H - g.TOP / 2 : g.TOP / 2;

  const pts = useMemo(
    () =>
      patterns.map((_, i) => ({
        x: W * (0.5 + g.AMP * Math.sin(i * g.TURN)),
        y: compact ? H - g.TOP - g.ROW * i - g.ROW / 2 : g.TOP + g.ROW * i + g.ROW / 2,
      })),
    [patterns, W, g, H, compact]
  );
  const fullD = useMemo(() => (W ? roadPath(pts, W, g, startY, dir) : ''), [pts, W, g, startY, dir]);
  const walkD = useMemo(() => (W ? roadPath(pts.slice(0, currentIndex + 1), W, g, startY, dir) : ''), [pts, W, g, startY, dir, currentIndex]);
  const cleared = patterns.filter((p) => p.progress.bestScore >= p.passPercentage).length;
  const trackW = compact ? 14 : narrow ? 10 : 14;

  // Phone: open the map around the current level (like Candy Crush) instead of at the top.
  const scrolled = useRef(false);
  useEffect(() => {
    if (!autoScroll || !narrow || scrolled.current || !patterns.length || !wrapRef.current) return;
    scrolled.current = true;
    const y = compact ? pts[currentIndex]?.y ?? 0 : MOBILE.TOP + MOBILE.ROW * currentIndex;
    const top = wrapRef.current.getBoundingClientRect().top + window.scrollY + y - window.innerHeight * 0.45;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }, [narrow, compact, pts, patterns.length, currentIndex, reduce, autoScroll]);

  return (
    <Box
      ref={wrapRef}
      sx={{
        position: 'relative',
        height: H,
        borderRadius: compact ? 0 : narrow ? 0 : RADII_PX.card,
        overflow: 'hidden',
        // Phone map sits directly on the page background (no white card, no glow).
        bgcolor: compact ? 'transparent' : 'background.paper',
        ...(compact ? {} : { border: '1px solid', borderColor: 'divider' }),
        ...(narrow && !compact ? { borderLeft: 0, borderRight: 0 } : {}),
        backgroundImage: compact
          ? 'none'
          : `radial-gradient(${alpha(text.secondary, dark ? 0.22 : 0.28)} 1px, transparent 1px), radial-gradient(640px 320px at 50% 0%, ${alpha(primary.main, dark ? 0.16 : 0.08)}, transparent 70%)`,
        backgroundSize: compact ? '100% 100%' : '22px 22px, 100% 100%',
      }}
    >
      {W > 0 && (
        <>
          <RoadTrack W={W} H={H} compact={compact} fullD={fullD} walkD={walkD} trackW={trackW} />

          <RoadStartFlag W={W} startY={startY} compact={compact} />

          {patterns.map((pattern, i) => {
            const passed = pattern.progress.bestScore >= pattern.passPercentage;
            const status = !pattern.progress.unlocked ? 'locked' : passed ? 'completed' : 'current';
            if (compact) {
              return <PhoneLevelNode key={pattern._id} pattern={pattern} index={i} status={status} x={pts[i].x} y={pts[i].y} onClick={() => status !== 'locked' && onOpen(pattern)} />;
            }
            return (
              <LevelNode
                key={pattern._id}
                pattern={pattern}
                index={i}
                status={status}
                x={pts[i].x}
                y={pts[i].y}
                isLast={i === patterns.length - 1}
                labelOnRight={labelRight(pts, i, W)}
                narrow={narrow}
                below={below}
                onClick={() => status !== 'locked' && onOpen(pattern)}
              />
            );
          })}

          {patterns.length > 0 && <RoadWalker key={`${W}-${currentIndex}-${cleared}`} d={walkD} kind={alienKind} size={compact ? PHONE_ALIEN : narrow ? 56 : 136} phone={compact} node={g.NODE} perch={narrow ? (pts[currentIndex].x < W / 2 ? 1 : -1) : 0} onGo={() => onOpen(patterns[currentIndex])} />}
        </>
      )}
    </Box>
  );
}