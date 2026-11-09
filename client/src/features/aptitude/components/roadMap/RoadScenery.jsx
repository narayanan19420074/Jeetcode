import { motion, useReducedMotion } from 'framer-motion';
import { Box, alpha, useTheme } from '@mui/material';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import { LIB_TRACKING, useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, Z_INDEX } from '../../../../app/design/designTokens';
import { PHONE_STATE } from './roadGeometry';

// The road itself: track, travelled stretch (animated draw) and lane marker.
export function RoadTrack({ W, H, compact, fullD, walkD, trackW }) {
  const theme = useTheme();
  const reduce = useReducedMotion();
  const pal = useLibraryPalette();
  const dark = theme.palette.mode === 'dark';
  const { primary, success, text } = theme.palette;
  return (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="roadLit" x1="0" y1={compact ? 1 : 0} x2="0" y2={compact ? 0 : 1}>
                <stop offset="0%" stopColor={success.main} />
                <stop offset="100%" stopColor={primary.main} />
              </linearGradient>
              <filter id="roadGlow" x="-20%" y="-5%" width="140%" height="110%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            {compact ? (
              <>
                {/* phone road: flat, in the page's cream tones; the travelled part is solid green */}
                <path d={fullD} fill="none" stroke={pal.divider} strokeWidth={trackW + 4} strokeLinecap="round" />
                <path d={fullD} fill="none" stroke={pal.chip} strokeWidth={trackW} strokeLinecap="round" />
                <motion.path d={walkD} fill="none" stroke={PHONE_STATE.completed.fg} strokeWidth={trackW - 4} strokeLinecap="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }} />
                <path d={fullD} fill="none" stroke={alpha(pal.muted, 0.5)} strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" style={{ animation: reduce ? 'none' : 'roadFlow 1.2s linear infinite' }} />
              </>
            ) : (
              <>
                {/* track */}
                <path d={fullD} fill="none" stroke={alpha(text.secondary, dark ? 0.2 : 0.22)} strokeWidth={trackW + 8} strokeLinecap="round" />
                <path d={fullD} fill="none" stroke={dark ? COLOR_PALETTE.slate[900] : COLOR_PALETTE.slate[100]} strokeWidth={trackW} strokeLinecap="round" />
                {/* travelled stretch */}
                <motion.path d={walkD} fill="none" stroke="url(#roadLit)" strokeOpacity="0.35" strokeWidth={trackW + 10} strokeLinecap="round" filter="url(#roadGlow)" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.6, delay: 0.9, ease: 'easeInOut' }} />
                <motion.path d={walkD} fill="none" stroke="url(#roadLit)" strokeWidth={trackW - 6} strokeLinecap="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.6, delay: 0.9, ease: 'easeInOut' }} />
                {/* lane marker */}
                <path d={fullD} fill="none" stroke={alpha(text.secondary, 0.55)} strokeWidth="1.5" strokeDasharray="2 10" strokeLinecap="round" style={{ animation: reduce ? 'none' : 'roadFlow 1.2s linear infinite' }} />
              </>
            )}
            <style>{`@keyframes roadFlow { to { stroke-dashoffset: -24; } }`}</style>
          </svg>
  );
}

// START flag at the foot of the road.
export function RoadStartFlag({ W, startY, compact }) {
  const pal = useLibraryPalette();
  return (
          <Box sx={{ position: 'absolute', left: W * 0.14, top: startY, transform: 'translate(-50%, -50%)', zIndex: Z_INDEX.overlap }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              sx={
                compact
                  ? { display: 'flex', alignItems: 'center', gap: 0.5, height: 30, px: 1.5, borderRadius: RADII_PX.pill, bgcolor: pal.player, color: pal.text, fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING }
                  : { display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: RADII_PX.control, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.caption, letterSpacing: '0.1em', boxShadow: (t) => `0 6px 16px ${alpha(t.palette.primary.main, 0.4)}` }
              }
            >
              <FlagRoundedIcon sx={{ fontSize: compact ? FONT_SIZES.title : FONT_SIZES.body }} /> {compact ? 'Start' : 'START'}
            </Box>
          </Box>
  );
}
