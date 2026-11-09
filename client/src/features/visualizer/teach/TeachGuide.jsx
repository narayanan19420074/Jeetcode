import { createPortal } from 'react-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { COLOR_PALETTE, withAlpha, MEDIA_QUERIES, Z_INDEX, MOTION } from '../../../app/design/designTokens';
import GuideAgent from './guide/GuideAgent';
import GuideControls from './guide/GuideControls';
import { GuideSpotlight, GuideTapRipple } from './guide/GuideSpotlight';
import { useTourEngine } from './guide/useTourEngine';
import { useSpotlightRect, useAgentBox, computeAgentPlace, useAgentTravel } from './guide/useStageGeometry';

// Blip's guided tour of the Algorithm Visualizer.
//
// This component is the "engine + stage": it wires the tour engine (guide/useTourEngine)
// to the floating mascot, the speech bubble, the spotlight and the control pill.
// *What* Blip says lives in teachScript.js / lessons.js. The page it teaches is
// reached only through the `page` hooks object (see VisualizerPage.jsx).
export default function TeachGuide({ page, onClose }) {
  const theme = useTheme();
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const compact = useMediaQuery(MEDIA_QUERIES.belowSm);
  const dark = theme.palette.mode === 'dark';

  const engine = useTourEngine({ page, onClose, compact });
  const rect = useSpotlightRect(engine.target);
  const { agentRef, size, vp } = useAgentBox();

  const place = computeAgentPlace({ compact, rect, size, vp });
  const flip = compact ? false : place.x + size.w / 2 > vp.w / 2; // Blip on the right, bubble on the left
  const { travelling, heading } = useAgentTravel(place, reduce);
  const accent = COLOR_PALETTE.emerald[400];

  return createPortal(
    <>
      {/* Blocks clicks so the learner cannot disturb the demo; dims the page
          when Blip is just talking (no spotlight). */}
      <Box
        aria-hidden
        onClick={(e) => e.stopPropagation()}
        sx={{ position: 'fixed', inset: 0, zIndex: Z_INDEX.tourBackdrop, bgcolor: rect ? 'transparent' : withAlpha(COLOR_PALETTE.slate[950], 0.38), transition: `background-color ${MOTION.slow}ms` }}
      />
      <GuideSpotlight rect={rect} reduce={reduce} accent={accent} />
      {engine.tap && <GuideTapRipple tap={engine.tap} accent={accent} />}
      <GuideAgent
        agentRef={agentRef}
        place={place}
        flip={flip}
        compact={compact}
        reduce={reduce}
        dark={dark}
        accent={accent}
        travelling={travelling}
        heading={heading}
        talking={engine.talking}
        caption={engine.caption}
      />
      <GuideControls
        compact={compact}
        dark={dark}
        accent={accent}
        finished={engine.finished}
        paused={engine.paused}
        muted={engine.muted}
        onTogglePause={engine.togglePause}
        onSkip={engine.skip}
        onToggleMute={engine.toggleMute}
        onEnd={engine.end}
      />
    </>,
    document.body,
  );
}
