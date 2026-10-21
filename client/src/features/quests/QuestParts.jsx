import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box, Button, ButtonBase, Dialog, Typography, alpha } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { Confetti, CountUp } from '../aptitude/components/MotionBits';
import { DIFF_COLOR, formatCountdown, msUntilUtcMidnight, surface } from '../dashboard/dashboardUtils';
import { AMBER, GOLD, GOLD_LIGHT, INK, formatDate, levelInfo, resetTimeLabel, weekdayOf } from './questUtils';

const shine = keyframes`0% { transform: translateX(-120%) skewX(-18deg); } 60%, 100% { transform: translateX(260%) skewX(-18deg); }`;
const glow = keyframes`0%, 100% { box-shadow: 0 0 0 0 rgba(245,179,1,.55); } 50% { box-shadow: 0 0 0 9px rgba(245,179,1,0); }`;
const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); }`;

const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD_LIGHT} 0%, ${GOLD} 55%, ${AMBER} 100%)`;
const isPro = (m) => m.reward.type === 'pro';
const RewardIcon = ({ quest, ...rest }) => (isPro(quest) ? <DiamondRoundedIcon {...rest} /> : <MilitaryTechRoundedIcon {...rest} />);

// ---------------------------------------------------------------- claim button
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
        minHeight: size === 'large' ? 50 : 40,
        boxShadow: '0 8px 20px -8px rgba(217,119,6,.7)',
        animation: reduce ? 'none' : `${glow} 2s infinite`,
        '&:hover': { filter: 'brightness(1.06)' },
        '&.Mui-disabled': { color: alpha(INK, 0.6), background: GOLD_GRADIENT, opacity: 0.7 },
        '&::after': reduce
          ? undefined
          : { content: '""', position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent)', animation: `${shine} 2.8s infinite` },
      }}
    >
      {busy ? 'Claiming…' : children}
    </Button>
  );
}

// ------------------------------------------------------------------------ hero
function Countdown() {
  const [ms, setMs] = useState(msUntilUtcMidnight());
  useEffect(() => {
    const t = setInterval(() => setMs(msUntilUtcMidnight()), 1000);
    return () => clearInterval(t);
  }, []);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCountdown(ms)}</span>;
}

function LevelRing({ info, size = 104 }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
        <defs>
          <linearGradient id="qLvl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={GOLD_LIGHT} />
            <stop offset="1" stopColor={AMBER} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.14)" strokeWidth="7" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#qLvl)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - Math.max(info.pct, 2) / 100) }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <Box>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,.7)', lineHeight: 1 }}>LEVEL</Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.05, color: GOLD_LIGHT }}>{info.level}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

const Stat = ({ icon: Icon, value, label, color }) => (
  <Box sx={{ flex: 1, minWidth: 0, borderRadius: '14px', px: { xs: 1, sm: 1.75 }, py: 1.1, bgcolor: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 } }}>
    <Icon sx={{ color, fontSize: { xs: 22, sm: 26 }, flexShrink: 0 }} />
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.1rem', sm: '1.3rem' }, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
        <CountUp value={value} />
      </Typography>
      <Typography noWrap sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,.65)', letterSpacing: '0.04em' }}>{label}</Typography>
    </Box>
  </Box>
);

const SPARKS = [
  { l: '8%', t: '14%', s: 14, d: 0 },
  { l: '88%', t: '10%', s: 18, d: 0.6 },
  { l: '72%', t: '62%', s: 11, d: 1.2 },
  { l: '30%', t: '84%', s: 12, d: 0.3 },
  { l: '94%', t: '78%', s: 15, d: 0.9 },
  { l: '52%', t: '8%', s: 10, d: 1.5 },
];

export function QuestHero({ state, isAuthenticated, onCheckIn, onLogin }) {
  const reduce = useReducedMotion();
  const info = levelInfo(state.xp);
  const today = state.checkedInToday;
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        borderRadius: '22px',
        p: { xs: 2, sm: 3 },
        background: 'radial-gradient(120% 90% at 100% 0%, rgba(245,179,1,.28) 0%, transparent 55%), radial-gradient(90% 90% at 0% 100%, rgba(20,184,166,.22) 0%, transparent 60%), linear-gradient(140deg, #0A1230 0%, #11224F 55%, #0E3447 100%)',
        boxShadow: '0 24px 48px -28px rgba(10,18,48,.9), inset 0 1px 0 rgba(255,255,255,.12)',
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {SPARKS.map((p) => (
          <motion.span
            key={p.l + p.t}
            style={{ position: 'absolute', left: p.l, top: p.t, width: p.s, height: p.s, color: GOLD_LIGHT, display: 'block' }}
            animate={reduce ? undefined : { opacity: [0.15, 0.8, 0.15], scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: p.d, ease: 'easeInOut' }}
          >
            <StarRoundedIcon sx={{ width: '100%', height: '100%' }} />
          </motion.span>
        ))}
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Typography component="h1" sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.22em', color: GOLD_LIGHT, mb: 1.5 }}>QUEST HUB</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.75, sm: 2.5 } }}>
          <LevelRing info={info} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.45rem', sm: '1.85rem' }, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{info.rank}</Typography>
            <Typography sx={{ mt: 0.5, fontSize: '0.84rem', color: 'rgba(255,255,255,.75)' }}>
              {info.max ? 'Max level. Legendary.' : `${info.toNext} XP to ${info.level + 1 > 10 ? 'max' : `Level ${info.level + 1}`}`}
            </Typography>
            <Box sx={{ mt: 1.1, height: 9, borderRadius: 99, bgcolor: 'rgba(255,255,255,.14)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(info.pct, 3)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: 99, background: GOLD_GRADIENT }}
              />
            </Box>
            <Typography sx={{ mt: 0.6, fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,.6)', fontVariantNumeric: 'tabular-nums' }}>{state.xp.toLocaleString()} XP earned</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1.25 }, mt: 2.25 }}>
          <Stat icon={LocalFireDepartmentRoundedIcon} value={state.streakDays} label="DAY STREAK" color="#FB923C" />
          <Stat icon={TaskAltRoundedIcon} value={state.activeDays} label="CHECK-INS" color="#34D399" />
          <Stat icon={BoltRoundedIcon} value={state.xp} label="TOTAL XP" color={GOLD} />
        </Box>

        <Box sx={{ mt: 2, borderRadius: '16px', p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 180 }}>
            <Typography sx={{ fontWeight: 800 }}>{!isAuthenticated ? 'Start your first check-in' : today ? 'Checked in today ✓' : 'Today’s check-in'}</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,.72)', mt: 0.25 }}>
              {!isAuthenticated
                ? 'Log in and solve one problem a day to earn rewards.'
                : today
                  ? <>Next check-in opens in <Countdown /> (resets {resetTimeLabel()})</>
                  : <>Get one problem Accepted before <Countdown /> to add a stamp.</>}
            </Typography>
          </Box>
          {!isAuthenticated ? (
            <Button variant="contained" disableElevation onClick={onLogin} sx={{ fontWeight: 800, borderRadius: '99px', color: INK, bgcolor: GOLD, '&:hover': { bgcolor: GOLD_LIGHT } }}>
              Log in
            </Button>
          ) : !today ? (
            <Button variant="contained" disableElevation startIcon={<PlayArrowRoundedIcon />} onClick={onCheckIn} sx={{ fontWeight: 800, borderRadius: '99px', color: INK, bgcolor: GOLD, minHeight: 42, '&:hover': { bgcolor: GOLD_LIGHT } }}>
              Solve now
            </Button>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

// ------------------------------------------------------------------ prize card
export function PrizeCard({ state, goal, busy, onClaim }) {
  const reduce = useReducedMotion();
  const pct = Math.min((goal.value / goal.target) * 100, 100);
  const left = Math.max(goal.target - state.activeDays, 0);
  const blocked = goal.claimable && state.proBlock;
  const blockText = state.proBlock === 'lifetime' ? 'You already have lifetime Pro, so there is nothing to add.' : 'Your paid Pro plan is active. Claim after it ends so no days are wasted.';
  const allDone = goal.claimed;

  return (
    <Box sx={{ p: '2px', borderRadius: '22px', background: GOLD_GRADIENT, boxShadow: '0 22px 40px -26px rgba(217,119,6,.85)' }}>
      <Box
        sx={(t) => ({
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '20px',
          p: { xs: 2, sm: 2.75 },
          bgcolor: t.palette.background.paper,
          backgroundImage: 'linear-gradient(135deg, rgba(245,179,1,.16), rgba(217,119,6,.05) 60%, transparent)',
        })}
      >
        <Box sx={{ display: 'flex', gap: { xs: 1.75, sm: 2.5 }, alignItems: 'center' }}>
          <Box
            sx={{
              width: { xs: 66, sm: 84 },
              height: { xs: 66, sm: 84 },
              borderRadius: '24px',
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              color: INK,
              background: GOLD_GRADIENT,
              boxShadow: '0 14px 26px -10px rgba(217,119,6,.8), inset 0 2px 0 rgba(255,255,255,.55)',
              animation: reduce ? 'none' : `${float} 3s ease-in-out infinite`,
            }}
          >
            <DiamondRoundedIcon sx={{ fontSize: { xs: 36, sm: 46 } }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.16em', color: AMBER }}>GRAND REWARD</Typography>
            <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.15rem', sm: '1.5rem' }, lineHeight: 1.2, letterSpacing: '-0.015em' }}>
              {goal.target} check-ins = {goal.reward.label} free
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {allDone
                ? 'Claimed. Enjoy every Pro problem.'
                : goal.claimable
                  ? 'You did it. Your reward is ready.'
                  : `Solve one problem a day. ${left} more ${left === 1 ? 'day' : 'days'} to go, and misses never reset you.`}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2.25 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', fontVariantNumeric: 'tabular-nums' }}>
              {goal.value}
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.9rem' }}> / {goal.target} days</Box>
            </Typography>
            <Typography sx={{ fontWeight: 800, color: AMBER, fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct)}%</Typography>
          </Box>
          <Box sx={(t) => ({ height: 14, borderRadius: 99, bgcolor: alpha(t.palette.text.primary, 0.1), overflow: 'hidden' })}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct, goal.value > 0 ? 4 : 0)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: 99, background: GOLD_GRADIENT }}
            />
          </Box>
        </Box>

        {goal.claimable && (
          <Box sx={{ mt: 2 }}>
            <ClaimButton size="large" fullWidth busy={busy === goal.id} onClick={() => onClaim(goal)}>
              {`Claim ${goal.reward.label}`}
            </ClaimButton>
            {blocked && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, textAlign: 'center' }}>{blockText}</Typography>
            )}
          </Box>
        )}
        {allDone && state.proExpiresAt && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontWeight: 700, color: AMBER }}>Pro active until {formatDate(state.proExpiresAt)}</Typography>
        )}
      </Box>
    </Box>
  );
}

// ------------------------------------------------------------------ stamp card
export function StampCard({ state, goal }) {
  const reduce = useReducedMotion();
  const total = goal.target;
  const marks = new Map(state.milestones.filter((m) => m.target <= total).map((m) => [m.target, m]));
  const next = state.checkedInToday ? -1 : state.activeDays + 1;

  return (
    <Box sx={[surface, { p: { xs: 1.75, sm: 2.5 } }]}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 1.75 }}>
        <Typography sx={{ fontWeight: 900, fontSize: '1.05rem' }}>Your {total}-day stamp card</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>One stamp per day you solve</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: { xs: 0.6, sm: 0.9 } }}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const done = n <= state.activeDays;
          const mark = marks.get(n);
          const isNext = n === next;
          return (
            <motion.div
              key={n}
              initial={reduce ? false : { scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: Math.min(i * 0.012, 0.7), type: 'spring', stiffness: 380, damping: 18 }}
              title={mark ? `Day ${n}: ${mark.reward.label}` : `Day ${n}`}
            >
              <Box
                sx={(t) => ({
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: { xs: '0.58rem', sm: '0.7rem' },
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  color: done ? INK : t.palette.text.disabled,
                  background: done ? GOLD_GRADIENT : mark ? alpha(GOLD, 0.14) : alpha(t.palette.text.primary, 0.06),
                  border: done ? 'none' : mark ? `1.5px dashed ${AMBER}` : `1px solid ${t.palette.divider}`,
                  boxShadow: done ? 'inset 0 1.5px 0 rgba(255,255,255,.6), 0 3px 8px -3px rgba(217,119,6,.7)' : 'none',
                  animation: isNext && !reduce ? `${glow} 2s infinite` : 'none',
                  outline: isNext ? `2px solid ${GOLD}` : 'none',
                  outlineOffset: 1,
                })}
              >
                {mark ? (
                  <RewardIcon quest={mark} sx={{ fontSize: { xs: 13, sm: 18 }, color: done ? INK : AMBER }} />
                ) : done ? (
                  <CheckRoundedIcon sx={{ fontSize: { xs: 12, sm: 16 } }} />
                ) : (
                  n
                )}
              </Box>
            </motion.div>
          );
        })}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mr: 0.5 }}>Last 14 days</Typography>
        {state.recent.map((d) => (
          <Box key={d.date} title={d.date} sx={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
            <Box
              sx={(t) => ({
                height: 8,
                borderRadius: 4,
                background: d.done ? GOLD_GRADIENT : alpha(t.palette.text.primary, 0.1),
              })}
            />
            <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, mt: 0.4, color: 'text.disabled', lineHeight: 1 }}>{weekdayOf(d.date)}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------- reward track
export function RewardTrack({ milestones, activeDays, busy, onClaim }) {
  const ref = useRef(null);
  const focusIdx = Math.max(0, milestones.findIndex((m) => !m.claimed));

  useEffect(() => {
    const el = ref.current;
    const card = el?.children[focusIdx];
    if (el && card) el.scrollLeft = Math.max(0, card.offsetLeft - el.clientWidth / 2 + card.clientWidth / 2);
  }, [focusIdx]);

  return (
    <Box ref={ref} className="autohide-scroll" sx={{ display: 'flex', gap: 1.25, overflowX: 'auto', scrollSnapType: 'x proximity', pb: 1.25, mx: { xs: -1.5, sm: 0 }, px: { xs: 1.5, sm: 0 } }}>
      {milestones.map((m) => {
        const pro = isPro(m);
        const locked = !m.claimable && !m.claimed;
        const left = m.target - activeDays;
        return (
          <Box
            key={m.id}
            sx={[
              surface,
              (t) => ({
                scrollSnapAlign: 'center',
                flex: '0 0 auto',
                width: { xs: 148, sm: 160 },
                p: 1.5,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                borderColor: m.claimable ? GOLD : pro && !m.claimed ? alpha(GOLD, 0.55) : t.palette.divider,
                background: m.claimable ? `linear-gradient(180deg, ${alpha(GOLD, 0.2)}, transparent 70%)` : pro && !m.claimed ? `linear-gradient(180deg, ${alpha(GOLD, 0.08)}, transparent 70%)` : undefined,
              }),
            ]}
          >
            <Box
              sx={(t) => ({
                width: 54,
                height: 54,
                borderRadius: '18px',
                display: 'grid',
                placeItems: 'center',
                color: locked ? t.palette.text.disabled : INK,
                background: locked ? alpha(t.palette.text.primary, 0.07) : GOLD_GRADIENT,
                boxShadow: locked ? 'none' : '0 10px 18px -8px rgba(217,119,6,.8), inset 0 2px 0 rgba(255,255,255,.55)',
              })}
            >
              {m.claimed ? <CheckRoundedIcon sx={{ fontSize: 30 }} /> : locked ? <LockRoundedIcon sx={{ fontSize: 24 }} /> : <RewardIcon quest={m} sx={{ fontSize: 30 }} />}
            </Box>
            <Typography sx={{ fontWeight: 900, fontSize: '0.78rem', color: AMBER, letterSpacing: '0.04em' }}>DAY {m.target}</Typography>
            <Typography sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: '0.9rem' }}>{m.reward.label}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>+{m.xp} XP</Typography>
            <Box sx={{ mt: 'auto', pt: 0.5, width: '100%' }}>
              {m.claimable ? (
                <ClaimButton size="small" fullWidth busy={busy === m.id} onClick={() => onClaim(m)}>Claim</ClaimButton>
              ) : m.claimed ? (
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>Claimed</Typography>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{left} {left === 1 ? 'day' : 'days'} to go</Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ----------------------------------------------------------------- quest cards
const GROUP_ICON = { Streaks: LocalFireDepartmentRoundedIcon, 'Problems solved': TaskAltRoundedIcon, 'By difficulty': BoltRoundedIcon };

export function QuestCard({ quest, busy, onClaim, onPick }) {
  const Icon = GROUP_ICON[quest.group] || StarRoundedIcon;
  const color = quest.difficulty ? DIFF_COLOR[quest.difficulty] : quest.group === 'Streaks' ? '#F97316' : '#3B82F6';
  const pct = Math.min((quest.value / quest.target) * 100, 100);
  return (
    <Box sx={[surface, (t) => ({ p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25, borderColor: quest.claimable ? GOLD : t.palette.divider })]}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '15px',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            color: quest.claimed ? INK : color,
            background: quest.claimed ? GOLD_GRADIENT : `color-mix(in srgb, ${color} 14%, transparent)`,
          }}
        >
          {quest.claimed ? <CheckRoundedIcon /> : <Icon />}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }} noWrap>{quest.title}</Typography>
          <Typography variant="caption" color="text.secondary">{quest.desc}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
          {quest.value}
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600 }}>/{quest.target}</Box>
        </Typography>
      </Box>

      <Box sx={(t) => ({ height: 8, borderRadius: 99, bgcolor: alpha(t.palette.text.primary, 0.09), overflow: 'hidden' })}>
        <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: quest.claimed || quest.claimable ? GOLD_GRADIENT : color, transition: 'width .6s ease' }} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 40 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <MilitaryTechRoundedIcon sx={{ fontSize: 20, color: quest.claimed ? 'text.disabled' : AMBER, flexShrink: 0 }} />
          <Typography variant="caption" noWrap sx={{ fontWeight: 700, color: 'text.secondary' }}>+{quest.xp} XP · {quest.reward.label}</Typography>
        </Box>
        {quest.claimable ? (
          <ClaimButton size="small" busy={busy === quest.id} onClick={() => onClaim(quest)}>Claim</ClaimButton>
        ) : quest.claimed ? (
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>Claimed</Typography>
        ) : (
          <ButtonBase onClick={() => onPick(quest.difficulty)} sx={{ borderRadius: 2, px: 1, py: 0.5, fontWeight: 800, fontSize: '0.8rem', color: 'primary.main', fontFamily: 'inherit' }}>
            {quest.difficulty ? `Pick a ${quest.difficulty}` : 'Pick a problem'}
          </ButtonBase>
        )}
      </Box>
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
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '24px', overflow: 'hidden', textAlign: 'center', backgroundImage: 'none' } } }}
      >
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
              {pro && reward.proUntil ? `Pro is active until ${formatDate(reward.proUntil)}. Every company-tagged problem is open.` : 'Added to your collection.'}
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1.75, px: 1.5, py: 0.5, borderRadius: 99, bgcolor: alpha(GOLD, 0.16), color: AMBER, fontWeight: 900 }}>
              <BoltRoundedIcon sx={{ fontSize: 18 }} /> +{reward.xp} XP
            </Box>
            <Button fullWidth size="large" onClick={onClose} sx={{ mt: 3, fontWeight: 900, color: INK, background: GOLD_GRADIENT, borderRadius: '99px', minHeight: 48 }}>
              Awesome
            </Button>
          </Box>
        )}
      </Dialog>
    </>
  );
}
