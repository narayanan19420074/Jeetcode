import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { prepApi } from '../../../api/prepApi';
import CompanyAvatar from '../../../components/CompanyAvatar';
import { getBrandLogo } from '../../../components/brandLogos';
import TcsBuddy from '../../prep/TcsBuddy';
import { FORMS, RANKS, levelFor, formFor } from '../../prep/questLogic';
import { TCS_NQT_APPLY_BY, daysUntil, examCountdown, formatExamDate, pickExamDate } from '../../prep/examDate';
import { COLOR_PALETTE, withAlpha } from '../../../app/design/designTokens';

const AMBER = COLOR_PALETTE.amber[400];

// Featured card: the TCS NQT hub. Built to be tapped: the TCS buddy talks to you, there is a level
// + XP bar to fill, a live countdown, and one warm (amber) button on a cool (indigo) card.
// When `onDismiss` is passed, a close button is shown so the card can be hidden.
// When `hideForNewUser` is set, the card renders nothing until the user has started the track.
export default function NqtExploreCard({ onDismiss, hideForNewUser = false }) {
  const reduce = useReducedMotion();
  const [track, setTrack] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    prepApi
      .listCompanies()
      .then(({ data }) => setTrack((data.data.items || []).find((c) => c.slug === 'tcs-nqt') || null))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const examDate = pickExamDate(track?.examDate);
  const countdown = examCountdown(examDate);
  const days = daysUntil(examDate);
  const applyDays = daysUntil(TCS_NQT_APPLY_BY);
  const showApplyBy = !countdown.over && applyDays >= 0 && days > applyDays;

  const readiness = Math.max(0, Math.min(100, Math.round(track?.readiness ?? 0)));
  const started = readiness > 0;
  if (hideForNewUser && (!loaded || !started)) return null;
  const level = levelFor(readiness);
  const tier = FORMS.findIndex((f) => f.kind === formFor(readiness).kind);
  const levelPct = level >= 10 ? 100 : Math.round(((readiness - (level - 1) * 10) / 10) * 100);
  const brand = getBrandLogo('TCS NQT');

  const dayWord = (n) => `${n} day${n === 1 ? '' : 's'}`;
  let message;
  if (countdown.over) message = 'Next date is coming soon. Keep your streak warm!';
  else if (days <= 3) message = days === 0 ? 'Exam day! You have got this.' : `Only ${dayWord(days)} left! Quick revision time.`;
  else if (days <= 7) message = 'Final week! Let us fix your weak spots.';
  else if (!started) message = `Hi, I am your TCS buddy! ${dayWord(days)} to go. Let us earn your first XP.`;
  else if (readiness >= 90) message = 'You look exam-ready. Stay sharp!';
  else message = `Level ${level} unlocked! ${100 - levelPct}% more to reach level ${Math.min(10, level + 1)}.`;

  const bigNumber = countdown.over ? 'Soon' : days === 0 ? 'Today' : String(days);
  const bigLabel = countdown.over || days === 0 ? '' : days === 1 ? 'day left' : 'days left';
  const urgent = !countdown.over && days <= 7;

  const glow = reduce ? undefined : { boxShadow: [`0 0 0 0 ${withAlpha(COLOR_PALETTE.amber[400], 0.55)}`, `0 0 0 12px ${withAlpha(COLOR_PALETTE.amber[400], 0)}`] };

  const card = (
    <Box
      component={RouterLink}
      to="/prep/tcs-nqt"
      aria-label={`TCS NQT: ${countdown.over ? 'next date soon' : `${dayWord(days)} left`}, level ${level}. Open your quest.`}
      sx={{
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
        mb: 1.5,
        p: { xs: 2, sm: 2.5 },
        borderRadius: '16px',
        color: COLOR_PALETTE.white,
        textDecoration: 'none',
        background: `linear-gradient(135deg,${COLOR_PALETTE.indigo[950]} 0%,${COLOR_PALETTE.indigo[800]} 55%,${COLOR_PALETTE.violet[700]} 100%)`,
        boxShadow: `0 14px 28px -16px ${withAlpha(COLOR_PALETTE.slate[950], 0.85)}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.18)}`,
        transition: 'transform .18s ease, box-shadow .18s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 18px 32px -16px ${withAlpha(COLOR_PALETTE.slate[950], 0.9)}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.22)}` },
        '&:active': { transform: 'scale(0.99)' },
        '&:focus-visible': { outline: `3px solid ${COLOR_PALETTE.white}`, outlineOffset: -4 },
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(COLOR_PALETTE.amber[400], 0.26)}, transparent 70%)`, pointerEvents: 'none' }} />

      {/* title + countdown */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.2 }}>TCS NQT</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, color: withAlpha(COLOR_PALETTE.white, 0.88) }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatExamDate(examDate)}</Typography>
          </Box>
          {showApplyBy && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.75, px: 1, py: 0.25, borderRadius: 99, bgcolor: withAlpha(COLOR_PALETTE.amber[400], 0.18), color: COLOR_PALETTE.amber[200] }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Apply by {formatExamDate(TCS_NQT_APPLY_BY).replace(/ \d{4}$/, '')}</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flexShrink: 0, minWidth: 84, mt: onDismiss ? 2.5 : 0, px: 1.5, py: 0.9, borderRadius: '14px', textAlign: 'center', bgcolor: urgent ? withAlpha(COLOR_PALETTE.amber[400], 0.2) : withAlpha(COLOR_PALETTE.white, 0.14), border: urgent ? `1px solid ${withAlpha(COLOR_PALETTE.amber[400], 0.6)}` : '1px solid transparent' }}>
          <Typography sx={{ fontWeight: 900, fontSize: countdown.over || days === 0 ? '1.25rem' : '1.9rem', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: urgent ? COLOR_PALETTE.amber[200] : COLOR_PALETTE.white }}>{bigNumber}</Typography>
          {bigLabel && <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, mt: 0.4, color: withAlpha(COLOR_PALETTE.white, 0.85) }}>{bigLabel}</Typography>}
        </Box>
      </Box>

      {/* the buddy talks */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1, mt: 1.25 }}>
        <Box sx={{ flexShrink: 0, width: 100, display: 'grid', placeItems: 'center' }}>
          {brand ? <TcsBuddy path={brand.path} color={brand.color} tier={Math.max(0, tier)} size={96} /> : <CompanyAvatar name="TCS NQT" logoUrl={track?.logoUrl} size={56} />}
        </Box>
        <Box sx={{ position: 'relative', px: 1.5, py: 1.1, borderRadius: '16px 16px 16px 4px', bgcolor: withAlpha(COLOR_PALETTE.white, 0.14), fontSize: '0.84rem', lineHeight: 1.45, fontWeight: 600 }}>
          {message}
        </Box>
      </Box>

      {/* level + XP */}
      <Box sx={{ position: 'relative', mt: 1.25 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: COLOR_PALETTE.amber[200] }}>
            Level {level} · {RANKS[level - 1]}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: withAlpha(COLOR_PALETTE.white, 0.8), fontVariantNumeric: 'tabular-nums' }}>{readiness}% ready</Typography>
        </Box>
        <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={levelPct} aria-label="Progress to next level" sx={{ height: 10, borderRadius: 99, bgcolor: withAlpha(COLOR_PALETTE.white, 0.18), overflow: 'hidden' }}>
          <motion.div initial={{ width: reduce ? `${Math.max(levelPct, 4)}%` : 0 }} animate={{ width: `${Math.max(levelPct, 4)}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${AMBER}, ${COLOR_PALETTE.amber[500]})` }} />
        </Box>
      </Box>

      {/* the one warm button */}
      <Box sx={{ position: 'relative', mt: 1.75 }}>
        <motion.div animate={glow} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} style={{ borderRadius: 14 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, height: 48, borderRadius: '14px', bgcolor: AMBER, color: COLOR_PALETTE.custom.black1B1200, fontWeight: 800, fontSize: '0.95rem' }}>
            <BoltRoundedIcon sx={{ fontSize: 20 }} />
            {started ? 'Continue your quest' : 'Start your first quest'}
            <Box component="span" sx={{ px: 0.9, py: 0.15, borderRadius: 99, bgcolor: withAlpha(COLOR_PALETTE.custom.black1B1200, 0.14), fontSize: '0.72rem', fontWeight: 800 }}>+XP</Box>
            <motion.span animate={reduce ? undefined : { x: [0, 4, 0] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ display: 'inline-flex' }}>
              <ArrowForwardRoundedIcon sx={{ fontSize: 20 }} />
            </motion.span>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );

  if (!onDismiss) return card;

  return (
    <Box sx={{ position: 'relative', mb: 1.5, '& > a': { mb: 0 } }}>
      {card}
      <IconButton
        size="small"
        onClick={onDismiss}
        aria-label="Dismiss TCS NQT card"
        sx={{ position: 'absolute', top: 6, right: 6, color: withAlpha(COLOR_PALETTE.white, 0.85), bgcolor: withAlpha(COLOR_PALETTE.white, 0.12), '&:hover': { bgcolor: withAlpha(COLOR_PALETTE.white, 0.22) } }}
      >
        <CloseRoundedIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}
