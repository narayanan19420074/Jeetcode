import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { motion } from 'framer-motion';
import { MONO_FONT } from '../anim';

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.28, delayChildren: 0.15 } } };
const itemVariants = { hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } };
const viewport = { once: true, amount: 0.4 };

// --- Coding: test cases tick over one by one, then the verdict lands.
export function CodingVisual() {
  const t = useTheme();
  const rows = [
    ['Case 1', '[2, 7, 11, 15], target 9', '[0, 1]'],
    ['Case 2', '[3, 2, 4], target 6', '[1, 2]'],
    ['Case 3', '[3, 3], target 6', '[0, 1]'],
  ];
  return (
    <motion.div variants={listVariants} initial="hidden" whileInView="show" viewport={viewport}>
      <Box
        sx={{
          borderRadius: '12px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 1.75,
        }}
      >
        <Stack spacing={0.9}>
          {rows.map(([label, input, out]) => (
            <motion.div key={label} variants={itemVariants}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CheckCircleRoundedIcon sx={{ fontSize: 17, color: 'success.main' }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', minWidth: 48 }}>{label}</Typography>
                <Typography
                  noWrap
                  sx={{ fontFamily: MONO_FONT, fontSize: '0.7rem', color: 'text.secondary', flex: 1 }}
                >
                  {input} → {out}
                </Typography>
              </Stack>
            </motion.div>
          ))}
        </Stack>
        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.7 }, show: { opacity: 1, scale: 1 } }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          <Box
            sx={{
              mt: 1.5,
              display: 'inline-block',
              px: 1.4,
              py: 0.35,
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.78rem',
              color: 'success.main',
              bgcolor: alpha(t.palette.success.main, 0.14),
            }}
          >
            Accepted
          </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
}

// --- Aptitude: a timer that actually drains, plus the pattern chips.
const PATTERNS = ['Percentage', 'Time & Work', 'Profit & Loss', 'Probability', 'Ratio & Proportion', 'Mixture & Alligation'];

export function AptitudeVisual() {
  const t = useTheme();
  const c = t.palette.success.main;
  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="26" fill="none" stroke={alpha(c, 0.2)} strokeWidth="6" />
          <motion.circle
            cx="32"
            cy="32"
            r="26"
            fill="none"
            stroke={c}
            strokeWidth="6"
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
            initial={{ pathLength: 1 }}
            animate={{ pathLength: [1, 0.15] }}
            transition={{ duration: 8, ease: 'linear', repeat: Infinity, repeatType: 'loop' }}
          />
          <text x="32" y="36" textAnchor="middle" fontSize="11" fontWeight="800" fill={t.palette.text.primary} fontFamily="Inter, sans-serif">
            Timed
          </text>
        </svg>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 170 }}>
          Practice at your pace, then sit a test against the clock.
        </Typography>
      </Stack>

      <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" whileInView="show" viewport={viewport}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
          {PATTERNS.map((p) => (
            <motion.div key={p} variants={{ hidden: { opacity: 0, y: 10, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}>
              <Box
                sx={{
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '999px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: alpha(c, 0.55),
                  color: 'text.primary',
                  bgcolor: alpha(c, 0.08),
                }}
              >
                {p}
              </Box>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Stack>
  );
}

// --- Dashboard: activity heatmap fills in column by column, trend line draws.
const COLS = 18;
const ROWS = 6;
const CELL = 15;

export function ProgressVisual() {
  const t = useTheme();
  const ok = t.palette.success.main;
  const cells = [];
  for (let col = 0; col < COLS; col += 1) {
    for (let row = 0; row < ROWS; row += 1) {
      const noise = ((col * 37 + row * 91 + col * row * 13) % 7) / 6;
      const level = Math.min(1, noise * 0.7 + (col / COLS) * 0.45);
      cells.push({ col, row, level });
    }
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
      <Box sx={{ flex: 1, minWidth: 0, maxWidth: 520 }}>
        <svg
          viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
          width="100%"
          role="img"
          aria-label="Sample activity heatmap getting greener over time"
          style={{ display: 'block' }}
        >
          {cells.map(({ col, row, level }) => (
            <motion.rect
              key={`${col}-${row}`}
              x={col * CELL}
              y={row * CELL}
              width={CELL - 3}
              height={CELL - 3}
              rx="3"
              fill={level < 0.15 ? alpha(t.palette.text.secondary, 0.16) : ok}
              fillOpacity={level < 0.15 ? 1 : 0.2 + level * 0.8}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={viewport}
              transition={{ delay: col * 0.045 + row * 0.01, type: 'spring', stiffness: 260, damping: 18 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          ))}
        </svg>
        <Typography variant="caption" color="text.secondary">
          Sample activity, shown for illustration.
        </Typography>
      </Box>

      <Box sx={{ width: { xs: '100%', sm: 190 }, flexShrink: 0 }}>
        <Stack direction="row" spacing={0.6} sx={{ alignItems: 'center', mb: 0.5 }}>
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20, color: 'warning.main' }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>Streak</Typography>
        </Stack>
        <svg viewBox="0 0 260 80" width="100%" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
          <motion.path
            d="M0 70 C 30 66, 50 60, 80 52 S 130 44, 160 30 S 220 14, 260 8"
            fill="none"
            stroke={t.palette.primary.main}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={viewport}
            transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
          />
          <motion.circle
            cx="260"
            cy="8"
            r="6"
            fill={t.palette.primary.main}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={viewport}
            transition={{ delay: 1.8, type: 'spring', stiffness: 300, damping: 12 }}
          />
        </svg>
      </Box>
    </Stack>
  );
}
