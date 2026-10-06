import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Typography, CircularProgress, Alert, Chip, alpha } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import { fetchPatterns } from './aptitudeSlice';

// ---------------------------------------------------------------------------
// Signature: a winding "level map" path (candy-crush / Duolingo-path style)
// through the patterns, in fixed reading order top -> bottom. Geometry is
// fully formulaic (no manual per-node positioning):
//   x(i) = 50 + AMPLITUDE * sin(i * PI/2)   -> smooth 4-step S-curve, in
//                                              viewBox-percentage units so
//                                              it stays correct at any width
//   y(i) = TOP_PAD + ROW_HEIGHT * i + ROW_HEIGHT/2
//
// v2: the road now opens with a horizontal stub from a "START" marker
// (top-left) that curves down into level 1 — same visual grammar Duolingo's
// path uses (a clear entry point before the path starts winding), rather
// than dropping the user straight into node 1. Level cards are now glowing
// panels (blue glow pulses for the current/next level, matching the design
// system's primary color) instead of bare text, and the current node gets
// a subtle idle bob on top of its pulse ring — an explicit "tap me" invite,
// the same trick Duolingo's path uses to draw the eye to what's next.
// ---------------------------------------------------------------------------

const ROW_HEIGHT = 156;
const AMPLITUDE = 30; // % from center; keeps nodes within a 20%-80% band
const NODE_SIZE = 64;
const TOP_PAD = 90; // room for the horizontal start stub above node 0

function buildPath(points) {
  if (points.length === 0) return '';

  const startX = 14;
  const startY = TOP_PAD / 2;
  const first = points[0];

  // Horizontal stub from the START marker, then a smooth curve down into
  // level 1 — this is the "start horizontal, then head down" opening.
  let d = `M ${startX} ${startY} L ${first.x - 10} ${startY} C ${first.x} ${startY}, ${first.x} ${
    first.y - ROW_HEIGHT / 2
  }, ${first.x} ${first.y}`;

  for (let i = 1; i < points.length; i += 1) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const c0y = p0.y + ROW_HEIGHT / 2;
    const c1y = p1.y - ROW_HEIGHT / 2;
    d += ` C ${p0.x} ${c0y}, ${p1.x} ${c1y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function LevelNode({ pattern, index, status, x, y, isLast, onClick }) {
  const labelOnRight = x <= 50;
  const passed = pattern.progress.bestScore >= pattern.passPercentage;

  const nodeColors = {
    locked: { bg: 'background.paper', border: 'divider', icon: 'text.disabled' },
    current: { bg: 'primary.main', border: 'primary.main', icon: 'primary.contrastText' },
    completed: { bg: 'success.main', border: 'success.main', icon: 'success.contrastText' },
  };
  const c = nodeColors[status];

  return (
    <Box
      sx={{
        position: 'absolute',
        top: y,
        left: `${x}%`,
        transform: 'translate(-50%, -50%)',
        animation: 'nodeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        animationDelay: `${index * 90}ms`,
        '@keyframes nodeIn': {
          from: { opacity: 0, transform: 'translate(-50%, -50%) scale(0.4)' },
          to: { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
        },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      {/* Node button */}
      <Box
        onClick={onClick}
        role="button"
        aria-disabled={status === 'locked'}
        sx={{
          position: 'relative',
          width: NODE_SIZE,
          height: NODE_SIZE,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: c.bg,
          border: '3px solid',
          borderColor: c.border,
          boxShadow: status === 'locked' ? 'none' : 3,
          cursor: status === 'locked' ? 'not-allowed' : 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          animation: status === 'current' ? 'nodeBob 2.4s ease-in-out infinite' : 'none',
          '@keyframes nodeBob': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' },
          },
          '&:hover': status !== 'locked' ? { transform: 'scale(1.08)', boxShadow: 6 } : undefined,
          '&:active': status !== 'locked' ? { transform: 'scale(0.97)' } : undefined,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        }}
      >
        {/* Pulsing invite ring for the current/next level */}
        {status === 'current' && (
          <Box
            sx={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: 'primary.main',
              animation: 'pulseRing 1.8s ease-out infinite',
              '@keyframes pulseRing': {
                '0%': { transform: 'scale(1)', opacity: 0.7 },
                '100%': { transform: 'scale(1.45)', opacity: 0 },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.4 },
            }}
          />
        )}

        {status === 'locked' && <LockRoundedIcon fontSize="small" sx={{ color: c.icon }} />}
        {status === 'completed' && isLast && <EmojiEventsRoundedIcon sx={{ color: c.icon }} />}
        {status === 'completed' && !isLast && <CheckRoundedIcon sx={{ color: c.icon }} />}
        {status === 'current' && (
          <Typography sx={{ color: c.icon, fontWeight: 700, fontFamily: 'monospace' }}>{index + 1}</Typography>
        )}
      </Box>

      {/* Label card — glowing panel instead of bare text */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: { xs: 148, sm: 196 },
          ...(labelOnRight ? { left: NODE_SIZE / 2 + 16 } : { right: NODE_SIZE / 2 + 16 }),
        }}
      >
        {/* Blurred glow sitting behind the card — blue for current, soft
            green for completed, nothing for locked. Pulses only for the
            level the user should tap next, so the eye is drawn there. */}
        {status !== 'locked' && (
          <Box
            sx={{
              position: 'absolute',
              inset: -6,
              borderRadius: 3,
              bgcolor: status === 'current' ? alpha('#3b82f6', 0.35) : alpha('#22c55e', 0.22),
              filter: 'blur(14px)',
              animation: status === 'current' ? 'glowPulse 2.4s ease-in-out infinite' : 'none',
              '@keyframes glowPulse': {
                '0%, 100%': { opacity: 0.55 },
                '50%': { opacity: 0.95 },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.5 },
            }}
          />
        )}

        <Box
          sx={{
            position: 'relative',
            px: 1.5,
            py: 1,
            borderRadius: 2,
            textAlign: labelOnRight ? 'left' : 'right',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: status === 'current' ? 'primary.main' : status === 'completed' ? 'success.main' : 'divider',
            boxShadow: status === 'locked' ? 'none' : 2,
          }}
        >
          <Typography
            variant="overline"
            sx={{ display: 'block', lineHeight: 1.2, color: status === 'locked' ? 'text.disabled' : 'primary.main' }}
          >
            Level {index + 1}
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: status === 'locked' ? 'text.disabled' : 'text.primary', mb: 0.25 }}
          >
            {pattern.title}
          </Typography>
          {status === 'locked' ? (
            <Typography variant="caption" color="text.disabled">
              Locked
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              {passed ? `Best ${pattern.progress.bestScore}%` : `Pass ${pattern.passPercentage}%+`} · {pattern.totalQuestions}q
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function AptitudePatternsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { patterns, patternsStatus, error } = useSelector((s) => s.aptitude);

  useEffect(() => {
    dispatch(fetchPatterns());
  }, [dispatch]);

  const points = useMemo(
    () =>
      patterns.map((_, i) => ({
        x: 50 + AMPLITUDE * Math.sin((i * Math.PI) / 2),
        y: TOP_PAD + ROW_HEIGHT * i + ROW_HEIGHT / 2,
      })),
    [patterns]
  );

  const currentIndex = useMemo(() => {
    if (patterns.length === 0) return 0;
    const idx = patterns.findIndex((p) => p.progress.unlocked && p.progress.bestScore < p.passPercentage);
    return idx === -1 ? patterns.length - 1 : idx;
  }, [patterns]);

  const progressPct = patterns.length > 1 ? (currentIndex / (patterns.length - 1)) * 100 : 100;
  const totalHeight = TOP_PAD + ROW_HEIGHT * patterns.length;
  const pathD = buildPath(points);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
        Your path to placement
      </Typography>
      {/* Theme already defines h5 as fontWeight:600 — don't override with a
          hardcoded weight here, or this page's heading drifts from every
          other h5 in the app (Dashboard, Problems, etc). */}
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        TCS NQT Aptitude
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Clear each level in Test mode to unlock the next.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {patternsStatus === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: totalHeight, mx: 'auto' }}>
          <Box
            component="svg"
            viewBox={`0 0 100 ${totalHeight}`}
            preserveAspectRatio="none"
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
          >
            {/* Base track — full length, muted */}
            <path
              d={pathD}
              pathLength="100"
              fill="none"
              stroke={alpha('#94a3b8', 0.35)}
              strokeWidth={4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* Progress fill — draws in on mount, then sits at current level */}
            <path
              d={pathD}
              pathLength="100"
              fill="none"
              stroke="url(#aptitudeProgressGradient)"
              strokeWidth={4}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              strokeDasharray={`${progressPct} ${100 - progressPct}`}
              style={{ animation: 'drawPath 1.1s ease-out both' }}
            />
            <defs>
              <linearGradient id="aptitudeProgressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <style>
              {`
                @keyframes drawPath {
                  from { stroke-dasharray: 0 100; }
                }
                @media (prefers-reduced-motion: reduce) {
                  path { animation: none !important; }
                }
              `}
            </style>
          </Box>

          {/* START marker — sits at the head of the horizontal stub */}
          <Chip
            icon={<FlagRoundedIcon sx={{ fontSize: 16 }} />}
            label="START"
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: TOP_PAD / 2,
              left: '14%',
              transform: 'translate(-50%, -50%)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              boxShadow: 2,
              animation: 'startBob 2.2s ease-in-out infinite',
              '@keyframes startBob': {
                '0%, 100%': { transform: 'translate(-50%, -50%)' },
                '50%': { transform: 'translate(-50%, calc(-50% - 4px))' },
              },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            }}
          />

          {patterns.map((pattern, index) => {
            const passed = pattern.progress.bestScore >= pattern.passPercentage;
            const status = !pattern.progress.unlocked ? 'locked' : passed ? 'completed' : 'current';

            return (
              <LevelNode
                key={pattern._id}
                pattern={pattern}
                index={index}
                status={status}
                x={points[index].x}
                y={points[index].y}
                isLast={index === patterns.length - 1}
                onClick={() => status !== 'locked' && navigate(`/aptitude/${pattern.slug}`)}
              />
            );
          })}
        </Box>
      )}
    </Container>
  );
}
