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
import { AMBER, GOLD, GOLD_LIGHT, INK, VIBRANT, formatDate, levelInfo, questBadge, resetTimeLabel } from './questUtils';

const shine = keyframes`0% { transform: translateX(-120%) skewX(-18deg); } 60%, 100% { transform: translateX(260%) skewX(-18deg); }`;
const glow = keyframes`0%, 100% { box-shadow: 0 0 0 0 rgba(245,179,1,.55); } 50% { box-shadow: 0 0 0 9px rgba(245,179,1,0); }`;

const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 55%, ${AMBER} 100%)`;
const XP_GRADIENT = 'linear-gradient(90deg,#7C4DFF,#E040FB 55%,#FF9A00)';
const isPro = (q) => q.reward.type === 'pro';

// Raised card used by the bottom row.
export const cardSx = (T) => ({ borderRadius: '24px', bgcolor: T.soft, boxShadow: T.raised, border: T.border, minWidth: 0 });

// A vibrant square badge with a coloured glow underneath and a lit top edge.
export function BadgeTile({ colors, size = 40, radius = 13, children }) {
  return (
    <Box
      sx={{
        width: size, height: size, borderRadius: `${radius}px`, flexShrink: 0, display: 'grid', placeItems: 'center', color: '#fff',
        background: colors.bg, boxShadow: `0 10px 18px -8px ${colors.glow}, inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -3px 0 rgba(0,0,0,0.12)`,
      }}
    >
      {children}
    </Box>
  );
}

export const GemTile = ({ size = 40 }) => (
  <BadgeTile colors={VIBRANT.diamond} size={size} radius={Math.round(size * 0.32)}>
    <DiamondRoundedIcon sx={{ fontSize: size * 0.58 }} />
  </BadgeTile>
);

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
        whiteSpace: 'nowrap',
        minHeight: size === 'large' ? 48 : 36,
        boxShadow: '0 8px 20px -8px rgba(217,119,6,.7)',
        animation: reduce ? 'none' : `${glow} 2s infinite`,
        '&:hover': { filter: 'brightness(1.06)' },
        '&:active': { transform: 'scale(0.98)' },
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
// Title, level, XP and streak in one glass strip.
export function QuestHeader({ state, T }) {
  const info = levelInfo(state.xp);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2.25 }, px: { xs: 1.75, sm: 2.5 }, py: 1.25, borderRadius: '24px', background: T.panel, border: T.border, boxShadow: T.panelShadow }}>
      <Typography component="h1" sx={{ fontWeight: 900, fontSize: { xs: 18, md: 22 }, letterSpacing: '-0.02em', color: T.ink, flexShrink: 0 }}>Quests</Typography>

      <BadgeTile colors={VIBRANT.violet} size={46} radius={15}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.46rem', fontWeight: 900, letterSpacing: '0.12em', lineHeight: 1, color: 'inherit' }}>LEVEL</Typography>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, lineHeight: 1.05, color: 'inherit' }}>{info.level}</Typography>
        </Box>
      </BadgeTile>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Typography noWrap sx={{ fontWeight: 900, color: T.ink }}>{info.rank}</Typography>
          <Typography noWrap sx={{ fontSize: '0.76rem', fontWeight: 700, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>
            {state.xp} XP{info.max ? '' : ` · ${info.toNext} to level ${info.level + 1}`}
          </Typography>
        </Box>
        <Box sx={{ mt: 0.7, height: 10, borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed, overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(info.pct, 4)}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 99, background: XP_GRADIENT }} />
        </Box>
      </Box>

      <Box title="Day streak" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, pl: 0.6, pr: 1.5, py: 0.6, borderRadius: 99, bgcolor: T.soft, boxShadow: T.raised }}>
        <BadgeTile colors={VIBRANT.fire} size={30} radius={15}>
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 19 }} />
        </BadgeTile>
        <Typography sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: T.ink }}>{state.streakDays}</Typography>
      </Box>
    </Box>
  );
}

// ------------------------------------------------------------------ grand reward
// The big prize, its progress bar with milestone stops, and today's check-in.
export function GrandReward({ state, goal, busy, onClaim, isAuthenticated, onCheckIn, onLogin, T }) {
  const pct = Math.min((goal.value / goal.target) * 100, 100);
  const left = Math.max(goal.target - state.activeDays, 0);
  const marks = state.milestones.filter((m) => m.target <= goal.target);
  const blockText = state.proBlock === 'lifetime' ? 'You already have lifetime Pro, so there is nothing to add.' : 'Your paid Pro plan is active. Claim after it ends so no days are wasted.';
  const today = state.checkedInToday;

  return (
    <Box sx={[cardSx(T), { p: { xs: 1.75, sm: 2 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.25 }]}>
      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
        <GemTile size={42} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '0.64rem', fontWeight: 900, letterSpacing: '0.16em', color: AMBER }}>GRAND REWARD</Typography>
          <Typography noWrap sx={{ fontWeight: 900, fontSize: '1.05rem', lineHeight: 1.2, letterSpacing: '-0.015em', color: T.ink }}>
            {goal.target} check-ins = {goal.reward.label} free
          </Typography>
        </Box>
      </Box>

      {/* progress bar with the milestone stops on it */}
      <Box sx={{ px: '14px', pb: 2.25 }}>
        <Box sx={{ position: 'relative', height: 12 }}>
          <Box sx={{ position: 'absolute', inset: 0, borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed, overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(pct, goal.value > 0 ? 3 : 0)}%` }} transition={{ duration: 1, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 99, background: XP_GRADIENT }} />
          </Box>
          {marks.map((m) => {
            const reached = state.activeDays >= m.target;
            const colors = questBadge(m);
            return (
              <Box key={m.id} title={`Day ${m.target}: ${m.reward.label}`} sx={{ position: 'absolute', top: '50%', left: `${(m.target / goal.target) * 100}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {reached ? (
                  <BadgeTile colors={colors} size={26} radius={13}>
                    <CheckRoundedIcon sx={{ fontSize: 16 }} />
                  </BadgeTile>
                ) : (
                  <Box sx={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: T.soft, boxShadow: T.raised, color: T.muted }}>
                    {isPro(m) ? <DiamondRoundedIcon sx={{ fontSize: 14 }} /> : <MilitaryTechRoundedIcon sx={{ fontSize: 15 }} />}
                  </Box>
                )}
                <Typography sx={{ position: 'absolute', top: 30, fontSize: '0.68rem', fontWeight: 800, color: reached ? AMBER : T.muted, fontVariantNumeric: 'tabular-nums' }}>{m.target}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: '0.84rem', fontWeight: 800, color: T.ink }}>
            {goal.value} / {goal.target} days{goal.claimed ? ' · claimed' : goal.claimable ? '' : ` · ${left} to go`}
          </Typography>
          <Typography noWrap variant="caption" sx={{ display: 'block', color: T.muted }}>
            {goal.claimable && state.proBlock
              ? blockText
              : goal.claimed && state.proExpiresAt
                ? `Pro active until ${formatDate(state.proExpiresAt)}`
                : !isAuthenticated
                  ? 'Log in and solve 1 problem a day.'
                  : today
                    ? <>Checked in today · next in <Countdown /> (resets {resetTimeLabel()})</>
                    : <>Get 1 problem Accepted · <Countdown /> left today</>}
          </Typography>
        </Box>
        {goal.claimable ? (
          <ClaimButton busy={busy === goal.id} onClick={() => onClaim(goal)}>{`Claim ${goal.reward.label}`}</ClaimButton>
        ) : !isAuthenticated ? (
          <Button variant="contained" disableElevation onClick={onLogin} sx={{ fontWeight: 800, borderRadius: '99px', whiteSpace: 'nowrap' }}>Log in</Button>
        ) : !today ? (
          <Button variant="contained" disableElevation startIcon={<PlayArrowRoundedIcon />} onClick={onCheckIn} sx={{ fontWeight: 800, borderRadius: '99px', minHeight: 40, whiteSpace: 'nowrap' }}>Solve now</Button>
        ) : (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.5, borderRadius: 99, color: '#fff', fontWeight: 800, fontSize: 13, background: VIBRANT.lime.bg, boxShadow: `0 8px 16px -8px ${VIBRANT.lime.glow}`, whiteSpace: 'nowrap' }}>
            <CheckRoundedIcon sx={{ fontSize: 16 }} /> Done today
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ------------------------------------------------------------------- next up row
export function QuestRow({ quest, busy, onClaim, onPick, T }) {
  const pct = Math.min((quest.value / quest.target) * 100, 100);
  const Icon = isPro(quest) ? DiamondRoundedIcon : MilitaryTechRoundedIcon;
  const colors = questBadge(quest);
  return (
    <Box sx={{ py: 0.7, display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <BadgeTile colors={colors} size={40}>
        <Icon sx={{ fontSize: 22 }} />
      </BadgeTile>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.88rem', color: T.ink }}>{quest.title}</Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', fontVariantNumeric: 'tabular-nums', flexShrink: 0, color: T.ink }}>{quest.value}/{quest.target}</Typography>
        </Box>
        <Box sx={{ mt: 0.5, height: 7, borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed, overflow: 'hidden' }}>
          <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: colors.bg, transition: 'width .6s ease' }} />
        </Box>
        <Typography noWrap variant="caption" sx={{ color: T.muted }}>+{quest.xp} XP · {quest.reward.label}</Typography>
      </Box>
      {quest.claimable ? (
        <ClaimButton size="small" busy={busy === quest.id} onClick={() => onClaim(quest)}>Claim</ClaimButton>
      ) : (
        <ButtonBase onClick={() => onPick(quest.difficulty)} sx={{ borderRadius: 99, px: 1.4, py: 0.6, fontWeight: 800, fontSize: '0.78rem', color: T.icon, bgcolor: T.soft, boxShadow: T.raised, fontFamily: 'inherit', flexShrink: 0, '&:active': { boxShadow: T.pressed } }}>
          Solve
        </ButtonBase>
      )}
    </Box>
  );
}

// -------------------------------------------------------------- reward dialog
export function RewardDialog({ reward, onClose, T }) {
  const open = Boolean(reward);
  const pro = reward?.reward?.type === 'pro';
  const colors = pro ? VIBRANT.diamond : VIBRANT.gold;
  const chip = (bg, fg, children) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: 99, bgcolor: bg, color: fg, fontWeight: 900 }}>{children}</Box>
  );
  return (
    <>
      {open && <Confetti key={reward.claimed} pieces={90} />}
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: '28px', overflow: 'hidden', textAlign: 'center', backgroundImage: T.panel, border: T.border } } }}>
        {reward && (
          <Box sx={{ px: 3, pt: 4, pb: 3 }}>
            <motion.div initial={{ scale: 0.3, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <BadgeTile colors={colors} size={96} radius={30}>
                  {pro ? <DiamondRoundedIcon sx={{ fontSize: 54 }} /> : <MilitaryTechRoundedIcon sx={{ fontSize: 54 }} />}
                </BadgeTile>
              </Box>
            </motion.div>
            <Typography sx={{ mt: 2.5, fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.2em', color: AMBER }}>REWARD UNLOCKED</Typography>
            <Typography sx={{ mt: 0.5, fontWeight: 900, fontSize: '1.6rem', lineHeight: 1.2, letterSpacing: '-0.02em', color: T.ink }}>{reward.reward.label}</Typography>
            <Typography sx={{ mt: 1, color: T.muted }}>
              {pro && reward.proUntil ? `Pro is active until ${formatDate(reward.proUntil)}.` : 'Added to your collection.'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1.75 }}>
              {chip(alpha(GOLD, 0.18), AMBER, <><BoltRoundedIcon sx={{ fontSize: 18 }} /> +{reward.xp} XP</>)}
              {reward.coins > 0 && chip(alpha('#22D3EE', 0.18), T.dark ? '#67E8F9' : '#0E7490', <><DiamondRoundedIcon sx={{ fontSize: 17 }} /> +{reward.coins}</>)}
            </Box>
            <Button fullWidth size="large" onClick={onClose} sx={{ mt: 3, fontWeight: 900, color: INK, background: GOLD_GRADIENT, borderRadius: '99px', minHeight: 48 }}>Awesome</Button>
          </Box>
        )}
      </Dialog>
    </>
  );
}
