import { useEffect, useRef, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { Box, alpha } from '@mui/material';
import Alien3D from '../Alien3D';
import { LIB_ACCENT, LIB_TRACKING } from '../../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, Z_INDEX } from '../../../../app/design/designTokens';
import { NODE } from './roadGeometry';

// Walker: follows the road from START to the current level (or perches beside it on phones).
export default function RoadWalker({ d, kind, size, onGo, node = NODE, perch = 0, phone = false }) {
  const reduce = useReducedMotion();
  const pathRef = useRef(null);
  const [pos, setPos] = useState(null);
  const [walking, setWalking] = useState(false);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !d) return undefined;
    const total = path.getTotalLength();
    const stop = Math.max(0, total - node / 2 - 30); // stand on the road just before the node
    const at = (l) => {
      const p = path.getPointAtLength(l);
      const q = path.getPointAtLength(Math.min(total, l + 4));
      return { x: p.x, y: p.y, lean: Math.max(-12, Math.min(12, (q.x - p.x) * 5)) };
    };
    if (perch) {
      // Phone: no long walk. The alien stands beside the current level.
      const end = path.getPointAtLength(total);
      setPos({ x: end.x + perch * (node / 2 + (phone ? 60 : 30)), y: end.y + (phone ? 40 : 22), lean: 0 });
      setWalking(false);
      return undefined;
    }
    if (reduce || stop < 2) {
      setPos({ ...at(stop), lean: 0 });
      setWalking(false);
      return undefined;
    }
    setPos(at(0));
    setWalking(true);
    const controls = animate(0, stop, {
      duration: Math.min(8, Math.max(2.4, stop / 120)),
      ease: 'easeInOut',
      delay: run === 0 ? 0.9 : 0.15,
      onUpdate: (l) => setPos(at(l)),
      onComplete: () => {
        setPos((p) => (p ? { ...p, lean: 0 } : p));
        setWalking(false);
      },
    });
    return () => controls.stop();
  }, [d, run, reduce, perch, node]);

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <path ref={pathRef} d={d} />
      </svg>
      {pos && (
        <Box
          onClick={() => !walking && setRun((r) => r + 1)}
          title={walking ? undefined : 'Click to walk again'}
          sx={{ position: 'absolute', left: pos.x, top: pos.y, transform: 'translate(-50%, -84%)', zIndex: Z_INDEX.marker, cursor: walking ? 'default' : 'pointer' }}
        >
          {!walking && (
            <Box
              component={motion.button}
              type="button"
              initial={{ opacity: 0, y: 6, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                onGo();
              }}
              sx={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                ml: -6.5,
                width: 104,
                mb: 0.5,
                ...(phone
                  ? { height: 32, borderRadius: RADII_PX.pill, bgcolor: LIB_ACCENT, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING, boxShadow: 'none' }
                  : { py: 0.5, borderRadius: RADII_PX.control, bgcolor: 'primary.main', fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, boxShadow: (t) => `0 8px 20px ${alpha(t.palette.primary.main, 0.45)}` }),
                border: 0,
                color: COLOR_PALETTE.white,
                fontFamily: 'inherit',
                cursor: 'pointer',
                '&:after': { content: '""', position: 'absolute', left: '50%', bottom: -5, ml: -0.625, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: (t) => `6px solid ${phone ? LIB_ACCENT : t.palette.primary.main}` },
              }}
            >
              Start level
            </Box>
          )}
          <Alien3D kind={kind} size={size} walking={walking} heading={pos.lean / 12} brand={phone} />
        </Box>
      )}
    </>
  );
}
