import { Suspense, lazy } from 'react';
import { keyframes } from '@emotion/react';
import { Box, Paper, Typography } from '@mui/material';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES, RADII_PX, Z_INDEX, MOTION, EASING } from '../../../../app/design/designTokens';
import { BLIP, BUBBLE_W, MARGIN } from './guideConstants';

const Alien3D = lazy(() => import('../../../aptitude/components/Alien3D'));

const rise = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to { opacity: 1; transform: none; }
`;

// Blip (the mascot) plus his speech bubble; flips sides so the bubble never leaves the viewport.
export default function GuideAgent({ agentRef, place, flip, compact, reduce, dark, accent, travelling, heading, talking, caption }) {
  const fly = reduce ? 'none' : `transform 0.85s ${EASING.overshootLarge}`;
  const hasText = caption.sentences.length > 0;
  return (
    <Box
      ref={agentRef}
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: Z_INDEX.tourCard,
        transform: `translate(${Math.round(place.x)}px, ${Math.round(place.y)}px)`,
        transition: fly,
        willChange: 'transform',
        display: 'flex',
        flexDirection: flip ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 0.5,
        width: compact ? `calc(100vw - ${MARGIN * 2}px)` : 'auto',
        pointerEvents: 'none',
      }}
    >
      <Box sx={{ width: BLIP, height: BLIP, flexShrink: 0, filter: `drop-shadow(0 10px 18px ${withAlpha(COLOR_PALETTE.black, 0.35)})` }}>
        <Suspense fallback={<Box sx={{ width: BLIP, height: BLIP }} />}>
          <Alien3D kind="blip" size={BLIP} walking={travelling} heading={heading} wave={false} talking={talking} />
        </Suspense>
      </Box>

      {hasText && (
        <Paper
          key={caption.text}
          role="status"
          elevation={0}
          sx={{
            position: 'relative',
            width: compact ? 'auto' : BUBBLE_W,
            flex: compact ? 1 : 'none',
            mb: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: RADII_PX.card,
            bgcolor: dark ? COLOR_PALETTE.slate[900] : COLOR_PALETTE.white,
            color: 'text.primary',
            border: `1.5px solid ${accent}`,
            boxShadow: dark ? `0 14px 40px ${withAlpha(COLOR_PALETTE.black, 0.55)}` : `0 14px 40px ${withAlpha(COLOR_PALETTE.slate[900], 0.22)}`,
            animation: reduce ? 'none' : `${rise} 0.28s ease-out`,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 22,
              [flip ? 'right' : 'left']: -7,
              width: 12,
              height: 12,
              bgcolor: dark ? COLOR_PALETTE.slate[900] : COLOR_PALETTE.white,
              borderLeft: flip ? 'none' : `1.5px solid ${accent}`,
              borderBottom: flip ? 'none' : `1.5px solid ${accent}`,
              borderRight: flip ? `1.5px solid ${accent}` : 'none',
              borderTop: flip ? `1.5px solid ${accent}` : 'none',
              transform: flip ? 'rotate(225deg) skew(10deg, 10deg)' : 'rotate(45deg) skew(10deg, 10deg)',
            },
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', fontWeight: FONT_WEIGHTS.bold, letterSpacing: '0.08em', color: dark ? accent : COLOR_PALETTE.emerald[700], mb: 0.5 }}>
            BLIP
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.5, fontSize: FONT_SIZES.bodyLg }}>
            {caption.sentences.map((s, i) => (
              <Box
                key={`${i}-${s}`}
                component="span"
                sx={{
                  opacity: i === caption.idx ? 1 : i < caption.idx ? 0.62 : 0.58,
                  fontWeight: i === caption.idx ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
                  transition: `opacity ${MOTION.standard}ms`,
                }}
              >
                {s}{' '}
              </Box>
            ))}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
