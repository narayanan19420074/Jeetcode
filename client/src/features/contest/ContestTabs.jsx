import { useState } from 'react';
import { motion } from 'framer-motion';
import { keyframes } from '@mui/material/styles';
import { Alert, Box, ButtonBase, Button, Skeleton, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import { surface } from '../dashboard/dashboardUtils';
import { fmtDate, fmtDuration, fmtStart, inr, useCountdown } from './contestUtils';

const AMBER = '#FBBF24';
const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
const pad = (n) => String(n).padStart(2, '0');
// Same colour-story family as the study plan cards.
const EMBER = 'linear-gradient(135deg,#431407 0%,#9A3412 55%,#B45309 100%)';
const SLATE = 'linear-gradient(135deg,#0F172A 0%,#1E293B 55%,#334155 100%)';

function Chip({ icon: Icon, children }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.1, py: 0.4, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.14)', fontSize: 12.5, fontWeight: 700 }}>
      <Icon sx={{ fontSize: 15 }} />{children}
    </Box>
  );
}

// One contest, styled like a study plan card: gradient, glow, big date tile, prize bubble, amber button.
export function ContestTile({ contest, past, onOpen, ctaLabel }) {
  const { d, h, m, s } = useCountdown(contest.startsAt, contest.serverTime);
  const live = contest.status === 'live';
  const tile = past ? { big: 'Ended', label: '' } : live ? { big: 'Live', label: 'now' } : { big: String(Math.max(d, 1)), label: d <= 1 ? 'day to start' : 'days to start' };
  const cta = ctaLabel || (past ? 'View results' : contest.applied ? 'You are in' : live ? 'View contest' : 'View & apply');

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', color: '#fff', background: past ? SLATE : EMBER, boxShadow: '0 14px 28px -16px rgba(2,6,23,0.85), inset 0 1px 0 rgba(255,255,255,0.18)' }}>
      <Box aria-hidden sx={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.3), transparent 70%)', pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', left: -40, bottom: 10, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', p: { xs: 2, sm: 2.25 } }}>
        {/* title + date tile */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2, overflowWrap: 'anywhere' }}>{contest.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.6, color: 'rgba(255,255,255,0.88)' }}>
              <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{fmtStart(contest.startsAt)}</Typography>
            </Box>
          </Box>
          <Box sx={{ flexShrink: 0, minWidth: 84, px: 1.5, py: 0.9, borderRadius: '14px', textAlign: 'center', bgcolor: live ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.14)', border: live ? '1px solid rgba(251,191,36,0.6)' : '1px solid transparent' }}>
            <Typography sx={{ fontWeight: 900, fontSize: tile.big.length > 3 ? '1.25rem' : '1.9rem', lineHeight: tile.big.length > 3 ? 1.5 : 1, fontVariantNumeric: 'tabular-nums', color: live ? '#FDE68A' : '#fff' }}>{tile.big}</Typography>
            {tile.label && <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, mt: 0.4, color: 'rgba(255,255,255,0.85)' }}>{tile.label}</Typography>}
          </Box>
        </Box>

        {/* prize bubble */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 1.75 }}>
          <Box sx={{ width: 56, height: 56, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.16)', boxShadow: `0 0 0 3px rgba(251,191,36,0.55)` }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 30, color: '#FDE68A' }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1, px: 1.5, py: 1.1, borderRadius: '16px 16px 16px 4px', bgcolor: 'rgba(255,255,255,0.14)' }}>
            <Typography sx={[{ fontWeight: 900, fontSize: '1.35rem', lineHeight: 1.1, color: '#FDE68A' }, mono]}>{inr(contest.prizePool)}</Typography>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mt: 0.3, opacity: 0.92 }}>{contest.tagline}</Typography>
          </Box>
        </Box>

        {/* quick facts */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          <Chip icon={CodeRoundedIcon}>{contest.problemCount} {contest.difficulty}</Chip>
          <Chip icon={TimerRoundedIcon}>{fmtDuration(contest.durationMinutes)}</Chip>
          <Chip icon={GroupsRoundedIcon}>{contest.applicants.toLocaleString('en-IN')} applied</Chip>
        </Box>

        {/* countdown */}
        {!past && !live && (
          <Box role="timer" aria-label={`Starts in ${d} days ${h} hours ${m} minutes`} sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.75, mt: 1.5 }}>
            {[[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']].map(([v, label]) => (
              <Box key={label} sx={{ py: 0.7, borderRadius: '12px', textAlign: 'center', bgcolor: 'rgba(0,0,0,0.24)' }}>
                <Typography sx={[{ fontWeight: 900, fontSize: 20, lineHeight: 1.1 }, mono]}>{pad(v)}</Typography>
                <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', opacity: 0.8 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        )}

        <Button
          onClick={onOpen} disableElevation fullWidth
          startIcon={contest.applied && !past ? <CheckCircleRoundedIcon /> : <BoltRoundedIcon />} endIcon={<ArrowForwardRoundedIcon />}
          sx={{ mt: 1.75, height: 44, borderRadius: '14px', bgcolor: AMBER, color: '#1B1200', fontWeight: 800, fontSize: '0.92rem', '&:hover': { bgcolor: '#F5B50F' } }}
        >
          {cta}
        </Button>
      </Box>
    </Box>
  );
}

const pulse = keyframes`0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.65); } 100% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }`;
const STATUS = { live: ['Live', '#22C55E'], upcoming: ['Upcoming', AMBER], ended: ['Ended', '#94A3B8'] };
const istPart = (iso, opt) => new Date(iso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', ...opt });

function StatusPill({ status }) {
  const [label, c] = STATUS[status] || STATUS.ended;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1, py: 0.25, borderRadius: 99, fontSize: 11, fontWeight: 800, letterSpacing: 0.4, color: c, bgcolor: `color-mix(in srgb, ${c} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${c} 35%, transparent)` }}>
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c, ...(status === 'live' && { animation: `${pulse} 1.4s ease-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }) }} />
      {label}
    </Box>
  );
}

// Small contest card: date block, title, quick facts, status. Past cards open the winners podium.
export function ContestMini({ contest, past, selected, onOpen }) {
  const { d, h, m } = useCountdown(contest.startsAt, contest.serverTime);
  const status = past ? 'ended' : contest.status;
  const left = status === 'upcoming' ? (d > 0 ? `${d}d ${pad(h)}h left` : `${pad(h)}h ${pad(m)}m left`) : status === 'live' ? 'Join now' : 'View winners';
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
      <ButtonBase
        onClick={onOpen}
        sx={(t) => ({
          width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: '16px', fontFamily: 'inherit',
          border: `1px solid ${selected ? AMBER : t.palette.divider}`, bgcolor: t.palette.background.paper,
          boxShadow: selected ? '0 0 0 3px rgba(251,191,36,0.2)' : t.palette.mode === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.045)' : '0 1px 2px rgba(15,23,42,0.05)',
          transition: 'border-color .2s, box-shadow .2s', '&:hover': { borderColor: AMBER },
        })}
      >
        <Box sx={{ width: 52, height: 56, flexShrink: 0, borderRadius: '14px', display: 'grid', placeItems: 'center', alignContent: 'center', color: '#fff', background: past ? SLATE : EMBER, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)' }}>
          <Typography sx={[{ fontWeight: 900, fontSize: 21, lineHeight: 1 }, mono]}>{istPart(contest.startsAt, { day: '2-digit' })}</Typography>
          <Typography sx={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', opacity: 0.85, mt: 0.2 }}>{istPart(contest.startsAt, { month: 'short' })}</Typography>
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.25 }}>{contest.title}</Typography>
          <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
            {contest.problemCount} {contest.difficulty} · {fmtDuration(contest.durationMinutes)} · {inr(contest.prizePool)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.6 }}>
            <StatusPill status={status} />
            <Typography variant="caption" sx={[{ fontWeight: 700, color: status === 'ended' ? 'primary.main' : 'text.secondary' }, status === 'upcoming' && mono]}>{left}</Typography>
          </Box>
        </Box>

        {status === 'ended' ? <EmojiEventsRoundedIcon sx={{ color: AMBER, flexShrink: 0 }} /> : <ChevronRightRoundedIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />}
      </ButtonBase>
    </motion.div>
  );
}

// Side card: the contest that is running right now, or one compact "no contest" row.
export function LiveNow({ contest, onOpen }) {
  const live = contest && contest.status === 'live';
  const next = contest && contest.status === 'upcoming';
  if (contest === null) return <Skeleton variant="rounded" height={64} sx={{ borderRadius: '16px' }} />;
  if (live) {
    return (
      <Box sx={[surface, { p: { xs: 1.25, sm: 1.5 } }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 0.5, mb: 1 }}>
          <BoltRoundedIcon sx={{ fontSize: 19, color: '#22C55E' }} />
          <Typography sx={{ fontWeight: 800, fontSize: 14.5 }}>Happening now</Typography>
        </Box>
        <ContestMini contest={contest} onOpen={() => onOpen(contest)} />
      </Box>
    );
  }
  return (
    <Box sx={[surface, { px: 1.75, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }]}>
      <Box sx={(t) => ({ width: 38, height: 38, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', color: 'text.secondary', bgcolor: t.palette.action.hover })}>
        <EventBusyRoundedIcon sx={{ fontSize: 21 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.25 }}>No contest right now</Typography>
        {next && <Typography noWrap variant="caption" color="text.secondary">Next: {contest.title} on {fmtDate(contest.startsAt)}</Typography>}
      </Box>
    </Box>
  );
}

function EmptyPast() {
  return (
    <Box sx={(t) => ({ textAlign: 'center', px: 2.5, py: 4, borderRadius: '16px', border: `1.5px dashed ${t.palette.divider}` })}>
      <Box sx={{ width: 52, height: 52, mx: 'auto', mb: 1.25, borderRadius: '16px', display: 'grid', placeItems: 'center', background: SLATE, color: '#FDE68A', boxShadow: '0 10px 22px -12px rgba(2,6,23,0.8)' }}>
        <HistoryRoundedIcon sx={{ fontSize: 28 }} />
      </Box>
      <Typography sx={{ fontWeight: 800 }}>No past contests yet</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Finished contests and their winners will show up here.</Typography>
    </Box>
  );
}

const TABS = [['upcoming', 'Upcoming'], ['past', 'Past']];

// Two-tab list of small cards. `contest` is null while loading and false if it failed.
// Upcoming/live cards open the rules page (onOpen); past cards reveal the winners (onOpenPast).
export default function ContestTabs({ contest, onOpen, onOpenPast, pastSelected = false }) {
  const [tab, setTab] = useState('upcoming');
  const ready = Boolean(contest);
  const ended = ready && contest.status === 'ended';
  const lists = { upcoming: ready && !ended ? [contest] : [], past: ended ? [contest] : [] };

  return (
    <Box sx={[surface, { p: { xs: 1.25, sm: 1.5 } }]}>
      <Box role="tablist" aria-label="Contests" sx={(t) => ({ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', p: 0.5, borderRadius: '14px', bgcolor: t.palette.action.hover })}>
        {TABS.map(([key, label]) => {
          const on = tab === key;
          return (
            <ButtonBase
              key={key} role="tab" aria-selected={on} onClick={() => setTab(key)}
              sx={{ position: 'relative', height: 40, borderRadius: '11px', fontFamily: 'inherit', fontWeight: 800, fontSize: 14, gap: 0.75, color: on ? '#1B1200' : 'text.secondary', transition: 'color .2s' }}
            >
              {on && <motion.span layoutId="contest-tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} style={{ position: 'absolute', inset: 0, borderRadius: 11, background: AMBER, boxShadow: '0 6px 16px -8px rgba(245,158,11,0.9)' }} />}
              <Box component="span" sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                {label}
                <Box component="span" sx={{ minWidth: 20, px: 0.6, borderRadius: 99, fontSize: 11.5, lineHeight: '20px', textAlign: 'center', bgcolor: on ? 'rgba(27,18,0,0.16)' : 'action.selected' }}>{lists[key].length}</Box>
              </Box>
            </ButtonBase>
          );
        })}
      </Box>

      <Box role="tabpanel" sx={{ display: 'grid', gap: 1.1, mt: 1.25, alignContent: 'start' }}>
        {contest === null && <Skeleton variant="rounded" height={84} sx={{ borderRadius: '16px' }} />}
        {contest === false && <Alert severity="error">Could not load contests. Please try again in a moment.</Alert>}
        {ready && lists[tab].map((c) => (
          <motion.div key={`${tab}-${c.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <ContestMini contest={c} past={tab === 'past'} selected={tab === 'past' && pastSelected} onOpen={() => (tab === 'past' ? onOpenPast(c) : onOpen(c))} />
          </motion.div>
        ))}
        {ready && lists[tab].length === 0 && (tab === 'past' ? <EmptyPast /> : (
          <Box sx={(t) => ({ textAlign: 'center', px: 2.5, py: 4, borderRadius: '16px', border: `1.5px dashed ${t.palette.divider}` })}>
            <Typography sx={{ fontWeight: 800 }}>No upcoming contests</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>The next one will be announced here.</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
