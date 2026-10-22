import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box, Button, ButtonBase, Dialog, Typography, alpha } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Confetti } from '../aptitude/components/MotionBits';
import { formatCountdown, msUntilUtcMidnight } from '../dashboard/dashboardUtils';
import { AMBER, GOLD, GOLD_LIGHT, INK, formatDate, levelInfo, resetTimeLabel } from './questUtils';

const shine = keyframes`0% { transform: translateX(-120%) skewX(-18deg); } 60%, 100% { transform: translateX(260%) skewX(-18deg); }`;
const glow = keyframes`0%, 100% { box-shadow: 0 0 0 0 rgba(245,179,1,.55); } 50% { box-shadow: 0 0 0 9px rgba(245,179,1,0); }`;

const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 55%, ${AMBER} 100%)`;
const isPro = (q) => q.reward.type === 'pro';

export function ClaimButton({ children = 'Claim', busy, onClick, size = 'medium', fullWidth }) {
  const reduce = useReducedMotion();
  return (
    <Button
      onClick={onClick}
      disabled={busy}
      fullWidth={fullWidth}
      size={size}
      startIcon={<CardGiftcardRoundedIcon />}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        fontWeight: 900,
        color: INK,
        background: GOLD_GRADIENT,
        borderRadius: '99px',
        px: 2.5,
        minHeight: size === 'large' ? 48 : 36,
        boxShadow: '0 8px 20px -8px rgba(217,119,6,.7)',
        animation: reduce ? 'none' : `${glow} 2s infinite`,
        '&:hover': { filter: 'brightness(1.06)' },
        '&.Mui-disabled': { color: alpha(INK, 0.6), background: GOLD_GRADIENT, opacity: 0.7 },
        '&::after': reduce ? undefined : { content: '""', position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent)', animation: `${shine} 2.8s infinite` },
      }}
    >
      {busy ? 'Claiming…' : children}
    </Button>
  );
}

function Countdown() {
  const [ms, setMs] = useState(msUntilUtcMidnight());
  useEffect(() => {
    const t = setInterval(() => setMs(msUntilUtcMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCountdown(ms)}</span>;
}

// ---------------------------------------------------------------- top strip
// Level / XP / streak band. Sits at the top edge of the single quests card, so it has no radius or shadow of its own.
export function QuestHeader({ state }) {
  const info = levelInfo(state.xp);
  return (
    <Box
      sx={{
        color: '#fff',
        px: { xs: 1.75, sm: 2.5 },
        py: { xs: 1.1, md: 1.4 },
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        background: 'radial-gradient(120% 140% at 100% 0%, rgba(245,179,1,.25) 0%, transparent 55%), linear-gradient(140deg, #0A1230 0%, #11224F 60%, #0E3447 100%)',
      }}
    >
      <Box sx={{ width: 46, height: 46, borderRadius: '14px', flexShrink: 0, display: 'grid', placeItems: 'center', color: INK, background: GOLD_GRADIENT, textAlign: 'center' }}>
        <Box>
          <Typography component="h1" sx={{ fontSize: '0.48rem', fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1 }}>LEVEL</Typography>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1.05 }}>{info.level}</Typography>
        </Box>
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Typography noWrap sx={{ fontWeight: 900 }}>{info.rank}</Typography>
          <Typography noWrap sx={{ fontSize: '0.74rem', fontWeight: 700, color: 'rgba(255,255,255,.7)', fontVariantNumeric: 'tabular-nums' }}>
            {state.xp} XP{info.max ? '' : ` · ${info.toNext} to level ${info.level + 1}`}
          </Typography>
        </Box>
        <Box sx={{ mt: 0.75, height: 7, borderRadius: 99, bgcolor: 'rgba(255,255,255,.16)', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(info.pct, 3)}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 99, background: GOLD_GRADIENT }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0, px: 1.1, py: 0.6, borderRadius: 99, bgcolor: 'rgba(255,255,255,.1)' }} title="Day streak">
        <LocalFireDepartmentRoundedIcon sx={{ color: '#FB923C', fontSize: 22 }} />
        <Typography sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{state.streakDays}</Typography>
      </Box>
    </Box>
  );
}

// ------------------------------------------------------------------ prize panel
// Left half of the quests card: the grand reward, its progress bar with milestone stops, and today's check-in.
export function PrizeCard({ state, goal, busy, onClaim, isAuthenticated, onCheckIn, onLogin }) {
  const pct = Math.min((goal.value / goal.target) * 100, 100);
  const left = Math.max(goal.target - state.activeDays, 0);
  const marks = state.milestones.filter((m) => m.target <= goal.target);
  const blockText = state.proBlock === 'lifetime' ? 'You already have lifetime Pro, so there is nothing to add.' : 'Your paid Pro plan is active. Claim after it ends so no days are wasted.';
  const today = state.checkedInToday;

  return (
    <Box
      sx={{
        height: '100%',
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
        backgroundImage: 'linear-gradient(135deg, rgba(245,179,1,.16), rgba(217,119,6,.04) 60%, transparent)',
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box sx={{ width: 50, height: 50, borderRadius: '16px', flexShrink: 0, display: 'grid', placeItems: 'center', color: INK, background: GOLD_GRADIENT, boxShadow: '0 12px 22px -10px rgba(217,119,6,.8), inset 0 2px 0 rgba(255,255,255,.55)' }}>
            <DiamondRoundedIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: '0.64rem', fontWeight: 900, letterSpacing: '0.16em', color: AMBER }}>GRAND REWARD</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.05rem', sm: '1.25rem' }, lineHeight: 1.2, letterSpacing: '-0.015em' }}>
              {goal.target} check-ins = {goal.reward.label} free
            </Typography>
          </Box>
        </Box>

        {/* progress bar with the milestone stops on it */}
        <Box sx={{ mt: 2.25, px: '14px' }}>
          <Box sx={{ position: 'relative', height: 12 }}>
            <Box sx={(t) => ({ position: 'absolute', inset: 0, borderRadius: 99, bgcolor: alpha(t.palette.text.primary, 0.1), overflow: 'hidden' })}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(pct, goal.value > 0 ? 3 : 0)}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 99, background: GOLD_GRADIENT }} />
            </Box>
            {marks.map((m) => {
              const reached = state.activeDays >= m.target;
              return (
                <Box key={m.id} title={`Day ${m.target}: ${m.reward.label}`} sx={{ position: 'absolute', top: '50%', left: `${(m.target / goal.target) * 100}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={(t) => ({ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', color: reached ? INK : AMBER, background: reached ? GOLD_GRADIENT : t.palette.background.paper, border: reached ? 'none' : `2px solid ${alpha(GOLD, 0.7)}` })}>
                    {reached ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : isPro(m) ? <DiamondRoundedIcon sx={{ fontSize: 14 }} /> : <MilitaryTechRoundedIcon sx={{ fontSize: 15 }} />}
                  </Box>
                  <Typography sx={{ position: 'absolute', top: 30, fontSize: '0.68rem', fontWeight: 800, color: reached ? AMBER : 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>{m.target}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Typography sx={{ mt: 3.5, fontSize: '0.86rem', fontWeight: 700, textAlign: 'center' }} color="text.secondary">
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 900 }}>{goal.value}</Box> / {goal.target} days
          {goal.claimed ? ' · claimed' : goal.claimable ? '' : ` · ${left} to go, missed days never reset you`}
        </Typography>

        {goal.claimable ? (
          <Box sx={{ mt: 1.5 }}>
            <ClaimButton size="large" fullWidth busy={busy === goal.id} onClick={() => onClaim(goal)}>{`Claim ${goal.reward.label}`}</ClaimButton>
            {state.proBlock && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, textAlign: 'center' }}>{blockText}</Typography>}
          </Box>
        ) : goal.claimed && state.proExpiresAt ? (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', fontWeight: 800, color: AMBER }}>Pro active until {formatDate(state.proExpiresAt)}</Typography>
        ) : null}
      </Box>

      <Box sx={(t) => ({ pt: 1.75, borderTop: `1px solid ${t.palette.divider}`, display: 'flex', alignItems: 'center', gap: 1.5 })}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>{!isAuthenticated ? 'Start your first check-in' : today ? 'Checked in today ✓' : 'Today’s check-in'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {!isAuthenticated ? 'Log in and solve 1 problem a day.' : today ? <>Next in <Countdown /> · resets {resetTimeLabel()}</> : <>Get 1 problem Accepted · <Countdown /> left</>}
          </Typography>
        </Box>
        {!isAuthenticated ? (
          <Button variant="contained" disableElevation onClick={onLogin} sx={{ fontWeight: 800, borderRadius: '99px' }}>Log in</Button>
        ) : !today ? (
          <Button variant="contained" disableElevation startIcon={<PlayArrowRoundedIcon />} onClick={onCheckIn} sx={{ fontWeight: 800, borderRadius: '99px', minHeight: 40 }}>Solve now</Button>
        ) : null}
      </Box>
    </Box>
  );
}

// ------------------------------------------------------------------- next up row
// Flat row (hairline divider, no card of its own): the quests card already frames the list.
export function QuestRow({ quest, busy, onClaim, onPick }) {
  const pct = Math.min((quest.value / quest.target) * 100, 100);
  const Icon = isPro(quest) ? DiamondRoundedIcon : MilitaryTechRoundedIcon;
  return (
    <Box
      sx={(t) => ({
        py: 1.25,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: `1px solid ${t.palette.divider}`,
        '&:last-of-type': { borderBottom: 'none' },
      })}
    >
      <Box sx={{ width: 38, height: 38, borderRadius: '12px', flexShrink: 0, display: 'grid', placeItems: 'center', color: quest.claimable ? INK : AMBER, background: quest.claimable ? GOLD_GRADIENT : alpha(GOLD, 0.14) }}>
        <Icon sx={{ fontSize: 22 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{quest.title}</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{quest.value}/{quest.target}</Typography>
        </Box>
        <Box sx={(t) => ({ mt: 0.6, height: 6, borderRadius: 99, bgcolor: alpha(t.palette.text.primary, 0.09), overflow: 'hidden' })}>
          <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: GOLD_GRADIENT, transition: 'width .6s ease' }} />
        </Box>
        <Typography noWrap variant="caption" color="text.secondary">+{quest.xp} XP · {quest.reward.label}</Typography>
      </Box>
      {quest.claimable ? (
        <ClaimButton size="small" busy={busy === quest.id} onClick={() => onClaim(quest)}>Claim</ClaimButton>
      ) : (
        <ButtonBase onClick={() => onPick(quest.difficulty)} sx={{ borderRadius: 2, px: 1, py: 0.5, fontWeight: 800, fontSize: '0.78rem', color: 'primary.main', fontFamily: 'inherit', flexShrink: 0 }}>
          Solve
        </ButtonBase>
      )}
    </Box>
  );
}

// -------------------------------------------------------------- reward dialog
export function RewardDialog({ reward, onClose }) {
  const open = Boolean(reward);
  const pro = reward?.reward?.type === 'pro';
  return (
    <>
      {open && <Confetti key={reward.claimed} pieces={90} />}
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '24px', overflow: 'hidden', textAlign: 'center', backgroundImage: 'none' } } }}>
        {reward && (
          <Box sx={{ px: 3, pt: 4, pb: 3 }}>
            <motion.div initial={{ scale: 0.3, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
              <Box sx={{ width: 96, height: 96, mx: 'auto', borderRadius: '30px', display: 'grid', placeItems: 'center', color: INK, background: GOLD_GRADIENT, boxShadow: '0 20px 36px -12px rgba(217,119,6,.85), inset 0 3px 0 rgba(255,255,255,.55)' }}>
                {pro ? <DiamondRoundedIcon sx={{ fontSize: 54 }} /> : <MilitaryTechRoundedIcon sx={{ fontSize: 54 }} />}
              </Box>
            </motion.div>
            <Typography sx={{ mt: 2.5, fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.2em', color: AMBER }}>REWARD UNLOCKED</Typography>
            <Typography sx={{ mt: 0.5, fontWeight: 900, fontSize: '1.6rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{reward.reward.label}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {pro && reward.proUntil ? `Pro is active until ${formatDate(reward.proUntil)}.` : 'Added to your collection.'}
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1.75, px: 1.5, py: 0.5, borderRadius: 99, bgcolor: alpha(GOLD, 0.16), color: AMBER, fontWeight: 900 }}>
              <BoltRoundedIcon sx={{ fontSize: 18 }} /> +{reward.xp} XP
            </Box>
            <Button fullWidth size="large" onClick={onClose} sx={{ mt: 3, fontWeight: 900, color: INK, background: GOLD_GRADIENT, borderRadius: '99px', minHeight: 48 }}>Awesome</Button>
          </Box>
        )}
      </Dialog>
    </>
  );
}
