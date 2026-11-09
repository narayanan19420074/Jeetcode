import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, IconButton, LinearProgress, Paper, Stack, Typography, alpha } from '@mui/material';
import { COLOR_PALETTE, EASING, FONTS, FONT_SIZES, FONT_WEIGHTS, MOTION, RADII_PX } from '../../../app/design/designTokens';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CircleIcon from '@mui/icons-material/Circle';
import { motion } from 'framer-motion';
import { MAIN_NAV_HEIGHT_PX } from './learnConstants';

/* ================================================================
 *  Top bar
 * ================================================================ */
export function LearnTopBar({ topic, active, completedCount, total, progressPct, onBack }) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (t) => t.zIndex.appBar,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.5,
        px: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 1400, mx: 'auto' }}>
        <IconButton size="small" onClick={onBack}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Stack spacing={0} sx={{ minWidth: 0, flexShrink: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>
            {topic.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {active?.sectionTitle} · {active?.title}
          </Typography>
        </Stack>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: { xs: 140, sm: 220 } }}>
          <LinearProgress
            variant="determinate"
            value={progressPct}
            sx={{
              flexGrow: 1,
              height: 6,
              borderRadius: RADII_PX.pill,
              '& .MuiLinearProgress-bar': { transition: `transform ${MOTION.progress}ms ${EASING.decelerate}` },
            }}
          />
          <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, fontFamily: FONTS.mono, color: 'text.secondary' }}>
            {completedCount} / {total}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

/* ================================================================
 *  Sidebar with sliding active indicator (layoutId)
 * ================================================================ */
export function LearnSidebar({ sections, activeId, completedIds, onSelect }) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: RADII_PX.card,
        overflow: 'hidden',
        position: 'sticky',
        top: MAIN_NAV_HEIGHT_PX + 24,
        maxHeight: `calc(100vh - ${MAIN_NAV_HEIGHT_PX + 48}px)`,
        overflowY: 'auto',
      }}
    >
      {sections.map((sec, secIdx) => (
        <Box key={sec.id}>
          <Typography
            variant="overline"
            sx={{
              display: 'block',
              fontWeight: FONT_WEIGHTS.bold,
              px: 2,
              pt: secIdx === 0 ? 2 : 2.5,
              pb: 0.5,
              color: 'text.secondary',
              letterSpacing: '0.08em',
              fontSize: FONT_SIZES.micro,
            }}
          >
            {sec.title}
          </Typography>
          <Stack spacing={0} sx={{ pb: 1 }}>
            {sec.subsections.map((sub) => {
              const isActive = sub.id === activeId;
              const isDone = completedIds.includes(sub.id);
              return (
                <Box
                  key={sub.id}
                  onClick={() => onSelect(sub.id)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    py: 1,
                    pl: 1.5,
                    pr: 1.5,
                    bgcolor: isActive ? (t) => alpha(t.palette.primary.main, 0.06) : 'transparent',
                    '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.05) },
                    transition: `background-color ${MOTION.standard}ms`,
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeLessonIndicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: COLOR_PALETTE.blue[500],
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  )}
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                    {isDone ? (
                      <CheckRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg, color: 'success.main', flexShrink: 0 }} />
                    ) : (
                      <CircleIcon
                        sx={{
                          fontSize: FONT_SIZES.dot,
                          color: isActive ? 'primary.main' : 'text.disabled',
                          flexShrink: 0,
                          ml: 0.5,
                          mr: 0.5,
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: FONT_SIZES.body,
                        fontWeight: isActive ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium,
                        color: isActive ? 'text.primary' : 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sub.title}
                    </Typography>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Paper>
  );
}
