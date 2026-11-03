import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Alert, Avatar, Badge, Box, Button, ButtonBase, Collapse, IconButton, InputBase, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { DIFF_COLOR } from '../dashboard/dashboardUtils';
import { tierFor } from './tiers';
import { MEDAL, Mix, YouChip, CountUp, activeLabel, bob, calm, glow, grad, mono, spin, twinkle } from './lbShared';
import { ACCENT, AVATAR_FRAMES, lbTokens } from './lbTheme';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS } from '../../app/design/designTokens';

const GOLD = COLOR_PALETTE.amber[400];
const TRACKS = [['overall', 'Overall', StarsRoundedIcon], ['coding', 'Coding', CodeRoundedIcon], ['aptitude', 'Aptitude', PsychologyRoundedIcon]];
// Names + icons used by common leaderboards: infinity for all-time, week and month calendars.
const PERIODS = [
  ['all', 'All-time', 'All-time ranking', AllInclusiveRoundedIcon],
  ['week', 'Weekly', 'This week', DateRangeRoundedIcon],
  ['month', 'Monthly', 'This month', CalendarMonthRoundedIcon],
];
const SPARKS = [[8, 18, 0], [20, 64, 0.6], [34, 12, 1.2], [66, 16, 0.3], [82, 58, 0.9], [92, 22, 1.5]];

// ---------- small neumorphic controls ----------

function Tile({ T, size = 42, children }) {
  return (
    <Box sx={{ width: size, height: size, flexShrink: 0, borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: T.soft, boxShadow: T.raised, color: COLOR_PALETTE.amber[500] }}>
      {children}
    </Box>
  );
}

// Globe = everyone, people = friends. The coloured thumb slides between the two.
function ScopeSwitch({ T, value, onChange, friendsOk }) {
  const options = [['global', 'Everyone', PublicRoundedIcon], ['friends', 'Friends', PeopleAltRoundedIcon]];
  const idx = value === 'friends' ? 1 : 0;
  return (
    <Box role="group" aria-label="Show" sx={{ position: 'relative', display: 'inline-grid', gridTemplateColumns: 'repeat(2, 40px)', p: '4px', borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed, flexShrink: 0 }}>
      <Box
        aria-hidden
        sx={{ position: 'absolute', top: 4, left: 4, width: 40, height: 36, borderRadius: 99, background: ACCENT, boxShadow: `0 8px 16px -6px ${withAlpha(COLOR_PALETTE.indigo[500], 0.8)}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.3)}`, transform: `translateX(${idx * 40}px)`, transition: 'transform .25s cubic-bezier(.4,0,.2,1)', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}
      />
      {options.map(([v, label, Icon]) => {
        const on = value === v;
        const disabled = v === 'friends' && !friendsOk;
        return (
          <Tooltip key={v} title={disabled ? 'Friends (log in first)' : label}>
            <Box component="span" sx={{ display: 'flex' }}>
              <ButtonBase
                disabled={disabled} onClick={() => onChange(v)} aria-pressed={on} aria-label={label}
                sx={{ position: 'relative', zIndex: 1, width: 40, height: 36, borderRadius: 99, color: on ? COLOR_PALETTE.white : T.muted, opacity: disabled ? 0.4 : 1, transition: 'color .2s' }}
              >
                <Icon sx={{ fontSize: FONT_SIZES.heading }} />
              </ButtonBase>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

// Small icons: the picked one lifts up and shows its name.
function PeriodSwitch({ T, value, onChange, iconOnly }) {
  return (
    <Box role="group" aria-label="Period" sx={{ display: 'inline-flex', gap: 0.25, p: '4px', borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed, flexShrink: 0 }}>
      {PERIODS.map(([v, label, title, Icon]) => {
        const on = value === v;
        return (
          <Tooltip key={v} title={title}>
            <ButtonBase
              onClick={() => onChange(v)} aria-pressed={on} aria-label={title}
              sx={{ gap: 0.5, height: 34, minWidth: 34, px: on && !iconOnly ? 1.4 : 1, borderRadius: 99, fontFamily: 'inherit', fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: on ? T.icon : T.muted, bgcolor: on ? T.soft : 'transparent', boxShadow: on ? T.raised : 'none', transition: 'box-shadow .2s, color .2s' }}
            >
              <Icon sx={{ fontSize: FONT_SIZES.subheading }} />{on && !iconOnly && label}
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function TrackTabs({ T, value, onChange, iconOnly }) {
  return (
    <Box role="tablist" aria-label="Leaderboard track" sx={{ display: 'flex', gap: 0.9, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, py: '6px', px: '4px', mx: '-4px' }}>
      {TRACKS.map(([v, label, Icon]) => {
        const on = value === v;
        return (
          <Tooltip key={v} title={label}>
            <ButtonBase
              role="tab" aria-selected={on} aria-label={label} onClick={() => onChange(v)}
              sx={{ flexShrink: 0, gap: 0.6, height: 38, px: iconOnly && !on ? 1.25 : 1.75, borderRadius: 99, fontFamily: 'inherit', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: on ? COLOR_PALETTE.white : T.muted, background: on ? ACCENT : T.soft, boxShadow: on ? `0 10px 20px -8px ${withAlpha(COLOR_PALETTE.indigo[500], 0.85)}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.3)}` : T.raised, transition: 'transform .15s', '&:active': { transform: 'scale(0.96)' } }}
            >
              <Icon sx={{ fontSize: FONT_SIZES.subheading }} />{(!iconOnly || on) && label}
            </ButtonBase>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function SearchBox({ T, value, onChange, placeholder, width = '100%' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, height: 40, width, flexShrink: 0, borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed }}>
      <SearchRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: T.muted }} />
      <InputBase
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputProps={{ 'aria-label': 'Search players' }}
        sx={{ flex: 1, minWidth: 0, fontSize: FONT_SIZES.body, color: T.ink, '& input::placeholder': { color: T.muted, opacity: 1 } }}
      />
      {value && (
        <IconButton size="small" aria-label="Clear search" onClick={() => onChange('')} sx={{ p: 0.25, color: T.muted }}>
          <CloseRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />
        </IconButton>
      )}
    </Box>
  );
}

function SoftButton({ T, children, ...rest }) {
  return (
    <Button size="small" disableElevation sx={{ borderRadius: 99, px: 2, fontWeight: FONT_WEIGHTS.bold, textTransform: 'none', color: T.icon, bgcolor: T.soft, boxShadow: T.raised, '&:hover': { bgcolor: T.soft, boxShadow: T.pressed } }} {...rest}>{children}</Button>
  );
}

// ---------- row pieces ----------

function RankTile({ rank, T }) {
  const m = MEDAL[rank];
  if (m) {
    return <Box sx={[{ width: 34, height: 34, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, color: m.text, background: grad(m), boxShadow: `0 6px 14px -4px ${m.glow}` }, mono]}>{rank}</Box>;
  }
  return <Box sx={[{ width: 34, height: 34, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, color: T.muted, bgcolor: T.soft, boxShadow: T.pressed }, mono]}>{rank}</Box>;
}

// Rank change vs last week (all-time, everyone board only; the server sends null otherwise).
function Move({ row }) {
  if (row.isNew) return <Box component="span" sx={{ px: 0.7, borderRadius: 99, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.custom.black1B1200, bgcolor: GOLD, flexShrink: 0 }}>new</Box>;
  const m = row.movement;
  if (m === null || m === undefined || m === 0) return null;
  const up = m > 0;
  const Icon = up ? ArrowDropUpRoundedIcon : ArrowDropDownRoundedIcon;
  return (
    <Box component="span" aria-label={`${up ? 'Up' : 'Down'} ${Math.abs(m)} since last week`} sx={[{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, color: up ? COLOR_PALETTE.green[600] : COLOR_PALETTE.red[600], fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold }, mono]}>
      <Icon sx={{ fontSize: FONT_SIZES.heading, mx: -0.6 }} />{Math.abs(m)}
    </Box>
  );
}

function Streak({ value, T }) {
  const on = value > 0;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg, color: on ? COLOR_PALETTE.orange[500] : T.muted, opacity: on ? 1 : 0.5 }} />
      <Typography component="span" sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.caption, color: on ? T.ink : T.muted }, mono]}>{value}d</Typography>
    </Box>
  );
}

function TierDot({ tier }) {
  return (
    <Tooltip title={tier.name}>
      <Box component="span" aria-label={tier.name} sx={{ display: 'inline-grid', placeItems: 'center', width: 20, height: 20, borderRadius: '50%', flexShrink: 0, bgcolor: `color-mix(in srgb, ${tier.color} 22%, transparent)`, color: tier.color }}>
        <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.body }} />
      </Box>
    </Tooltip>
  );
}

// Per-track numbers: coding shows Easy / Medium / Hard, the others show how many were solved.
function Stats({ row, track, T }) {
  const num = (n, color, label) => (
    <Tooltip title={label}>
      <Typography component="span" sx={[{ minWidth: 22, textAlign: 'right', fontSize: FONT_SIZES.caption, fontWeight: n > 0 ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium, color: n > 0 ? color : T.muted }, mono]}>{n}</Typography>
    </Tooltip>
  );
  if (track === 'coding') {
    return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>{num(row.easy, DIFF_COLOR.Easy, 'Easy solved')}{num(row.medium, DIFF_COLOR.Medium, 'Medium solved')}{num(row.hard, DIFF_COLOR.Hard, 'Hard solved')}</Box>;
  }
  const Icon = track === 'aptitude' ? PsychologyRoundedIcon : CodeRoundedIcon;
  return (
    <Tooltip title="Questions solved">
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, color: T.muted, flexShrink: 0 }}>
        <Icon sx={{ fontSize: FONT_SIZES.bodyLg }} />
        <Typography component="span" sx={[{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: T.ink }, mono]}>{row.solved}</Typography>
      </Box>
    </Tooltip>
  );
}

function PlayerRow({ row, index, T, isMe, selected, onPick, wide, track, reduce, you = false }) {
  const medal = MEDAL[row.rank];
  const { tier } = tierFor(row.score);
  const live = activeLabel(row.lastActive).live;
  const frame = medal ? grad(medal) : AVATAR_FRAMES[row.rank % AVATAR_FRAMES.length];
  const body = (
    <ButtonBase
      onClick={(e) => onPick(e, row)} aria-current={selected ? 'true' : undefined}
      sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, textAlign: 'left', fontFamily: 'inherit', color: T.ink, px: { xs: 1.1, sm: 1.5 }, py: you ? 1 : 1.1 }}
    >
      <RankTile rank={row.rank} T={T} />
      <Badge variant="dot" overlap="circular" invisible={!live} color="success" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Box sx={{ p: '3px', borderRadius: '50%', background: frame, flexShrink: 0 }}>
          <Box sx={{ p: '2px', borderRadius: '50%', bgcolor: T.frameInner }}>
            <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: 36, height: 36, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: T.avatarFg, bgcolor: T.avatarBg }}>{row.name?.[0]?.toUpperCase()}</Avatar>
          </Box>
        </Box>
      </Badge>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <Typography noWrap sx={{ minWidth: 0, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, lineHeight: 1.3 }}>{row.name}</Typography>
          {isMe && <YouChip />}
          <Move row={row} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, minWidth: 0 }}>
          <TierDot tier={tier} />
          <Typography noWrap variant="caption" sx={{ minWidth: 0, color: T.muted }}>@{row.handle}</Typography>
          <Streak value={row.streak} T={T} />
        </Box>
      </Box>
      {wide && <Stats row={row} track={track} T={T} />}
      {wide && (
        <Tooltip title="Solved in the last 7 days">
          <Typography component="span" sx={[{ width: 34, flexShrink: 0, textAlign: 'right', fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: row.recent > 0 ? COLOR_PALETTE.green[600] : T.muted }, mono]}>{row.recent > 0 ? `+${row.recent}` : '–'}</Typography>
        </Tooltip>
      )}
      <Box sx={{ textAlign: 'right', minWidth: 62, flexShrink: 0 }}>
        <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: you ? FONT_SIZES.heading : FONT_SIZES.subheading, lineHeight: 1.1, ...(medal ? { background: grad(medal), WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : {}) }, mono]}>
          {you ? <CountUp value={row.score} /> : row.score.toLocaleString()}
        </Typography>
        <Typography variant="caption" sx={{ color: T.muted, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.micro, letterSpacing: 0.5 }}>PTS</Typography>
      </Box>
    </ButtonBase>
  );

  if (you) return body;
  return (
    <motion.div
      id={isMe ? 'lb-me' : undefined}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : Math.min(index, 10) * 0.03, ease: 'easeOut' }}
    >
      <Box
        sx={(t) => ({
          position: 'relative', overflow: 'hidden', borderRadius: '18px',
          background: isMe ? `linear-gradient(100deg, ${withAlpha(COLOR_PALETTE.amber[400], 0.22)}, transparent 65%), ${T.soft}` : T.soft,
          boxShadow: selected ? T.pressed : T.raised,
          outline: selected ? `2px solid ${alpha(t.palette.primary.main, 0.55)}` : 'none', outlineOffset: -2,
          transition: 'box-shadow .18s, transform .18s', '&:hover': { transform: 'translateY(-1px)' },
          '&::before': medal ? { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: grad(medal) } : undefined,
        })}
      >
        {body}
      </Box>
    </motion.div>
  );
}

function SkelRow({ T, i }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.2, borderRadius: '18px', bgcolor: T.soft, boxShadow: T.raised }}>
      <Skeleton variant="rounded" width={34} height={34} sx={{ borderRadius: '12px' }} />
      <Skeleton variant="circular" width={42} height={42} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width={`${40 + ((i * 17) % 35)}%`} />
        <Skeleton variant="text" width={90} />
      </Box>
      <Skeleton variant="text" width={46} />
    </Box>
  );
}

// ---------- the leader ----------

function Champion({ row, isMe, selected, onPick, tight, wide, reduce }) {
  const { tier } = tierFor(row.score);
  const m = MEDAL[1];
  const av = tight ? 56 : 72;
  const shadow = `0 22px 44px -22px ${withAlpha(COLOR_PALETTE.indigo[950], 0.85)}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.22)}`;
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <ButtonBase
        onClick={(e) => onPick(e, row)} aria-label={`${row.name}, top player, ${row.score} points`}
        sx={{ position: 'relative', overflow: 'hidden', display: 'block', width: '100%', textAlign: 'left', fontFamily: 'inherit', color: COLOR_PALETTE.white, borderRadius: '24px', p: { xs: 1, sm: 1.25 }, background: `radial-gradient(120% 140% at 0% 0%, ${COLOR_PALETTE.indigo[500]} 0%, ${COLOR_PALETTE.indigo[600]} 45%, ${COLOR_PALETTE.indigo[900]} 100%)`, boxShadow: selected ? `0 0 0 2px ${GOLD}, ${shadow}` : shadow }}
      >
        <Box aria-hidden sx={{ position: 'absolute', right: -40, top: -60, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(COLOR_PALETTE.amber[400], 0.34)}, transparent 68%)`, animation: `${glow} 3.2s ease-in-out infinite`, ...calm }} />
        <Box aria-hidden sx={{ position: 'absolute', left: -50, bottom: -80, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(COLOR_PALETTE.pink[500], 0.26)}, transparent 70%)` }} />
        {SPARKS.map(([x, y, d]) => (
          <Box key={`${x}-${y}`} aria-hidden sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 4, height: 4, borderRadius: '50%', bgcolor: COLOR_PALETTE.white, animation: `${twinkle} 2.6s ease-in-out ${d}s infinite`, ...calm }} />
        ))}

        {/* glass plate */}
        <Box sx={{ position: 'relative', borderRadius: '18px', p: { xs: 1.25, sm: 1.75 }, bgcolor: withAlpha(COLOR_PALETTE.white, 0.10), border: `1px solid ${withAlpha(COLOR_PALETTE.white, 0.22)}`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: `inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.25)}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: wide ? 'nowrap' : 'wrap' }}>
            <Box sx={{ position: 'relative', flexShrink: 0, display: 'grid', placeItems: 'center', mx: 0.75 }}>
              <Box aria-hidden sx={{ position: 'absolute', width: av + 22, height: av + 22, borderRadius: '50%', background: `conic-gradient(from 0deg, ${m.a}, transparent 30%, ${m.b} 55%, transparent 80%, ${m.a})`, filter: 'blur(6px)', opacity: 0.85, animation: `${spin} 6s linear infinite`, ...calm }} />
              <Box sx={{ position: 'relative', p: '3.5px', borderRadius: '50%', background: grad(m), boxShadow: `0 8px 26px -6px ${m.glow}` }}>
                <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: av, height: av, fontSize: av * 0.38, fontWeight: FONT_WEIGHTS.bold, border: `3px solid ${COLOR_PALETTE.indigo[900]}`, bgcolor: COLOR_PALETTE.indigo[700], color: COLOR_PALETTE.white }}>{row.name?.[0]?.toUpperCase()}</Avatar>
              </Box>
              <EmojiEventsRoundedIcon aria-hidden sx={{ position: 'absolute', top: -14, right: -14, fontSize: tight ? FONT_SIZES.display : FONT_SIZES.displayLg, color: COLOR_PALETTE.amber[200], filter: `drop-shadow(0 0 10px ${withAlpha(COLOR_PALETTE.amber[400], 0.9)})`, animation: `${bob} 2.2s ease-in-out infinite`, ...calm }} />
            </Box>

            <Box sx={{ minWidth: 0, flex: '1 1 150px' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.15, mb: 0.5, borderRadius: 99, bgcolor: withAlpha(COLOR_PALETTE.amber[400], 0.2), color: COLOR_PALETTE.amber[200], fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.6 }}>TOP PLAYER</Box>
              <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: FONT_SIZES.subheading, sm: tight ? FONT_SIZES.heading : FONT_SIZES.display }, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{row.name}{isMe && <YouChip />}</Typography>
              <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, opacity: 0.78 }}>@{row.handle}{row.company ? `, ${row.company}` : ''}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.6, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.8, borderRadius: 99, bgcolor: withAlpha(COLOR_PALETTE.white, 0.16), fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.7 }}>
                  <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.body, color: COLOR_PALETTE.amber[200] }} />{tier.name}
                </Box>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg, color: GOLD }} />
                  <Typography component="span" sx={[{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold }, mono]}>{row.streak}d</Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ flexShrink: 0, textAlign: wide ? 'right' : 'left', ml: wide ? 'auto' : 0 }}>
              <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: FONT_SIZES.displayLg, sm: tight ? FONT_SIZES.displayLg : FONT_SIZES.hero }, lineHeight: 1.05, color: COLOR_PALETTE.amber[200] }, mono]}>
                <CountUp value={row.score} /><Box component="span" sx={{ fontSize: FONT_SIZES.caption, ml: 0.5, color: COLOR_PALETTE.white, opacity: 0.85 }}>pts</Box>
              </Typography>
              <Typography sx={{ fontSize: FONT_SIZES.caption, opacity: 0.78 }}>{row.recent > 0 ? `+${row.recent} this week` : `${row.solved} solved`}</Typography>
            </Box>
          </Box>
          <Mix row={row} onDark sx={{ mt: 1.4 }} />
        </Box>
      </ButtonBase>
    </motion.div>
  );
}

function EmptyChampion({ T, tight }) {
  return (
    <Box sx={{ py: tight ? 2 : 3, px: 2, textAlign: 'center', borderRadius: '24px', bgcolor: T.soft, boxShadow: T.pressed }}>
      <EmojiEventsRoundedIcon sx={{ fontSize: tight ? FONT_SIZES.hero : FONT_SIZES.heroLg, color: COLOR_PALETTE.amber[500] }} />
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, color: T.ink }}>No top player yet</Typography>
      <Typography sx={{ fontSize: FONT_SIZES.caption, color: T.muted }}>Solve a question to take the #1 spot.</Typography>
    </Box>
  );
}

// ---------- the card ----------

export default function EmpireCard({
  track, period, scope, onTrack, onPeriod, onScope, isAuthenticated, meta, rows, champion, listRows, loading, firstLoad, error, q,
  search, setSearch, reload, me, meInList, selectedId, onPick, scroller, sentinel, hasMore, askMore, scrollToMe, showEveryone, boardW, boardH,
}) {
  const T = lbTokens(useTheme().palette.mode);
  const reduce = useReducedMotion();
  const [searchOpen, setSearchOpen] = useState(false);
  const roomy = boardW >= 700; // search sits in the title row
  const wide = boardW >= 540; // rows show their numbers
  const iconOnly = boardW < 640;
  const tight = boardH < 700;
  const trackName = TRACKS.find(([v]) => v === track)?.[1];
  const periodName = PERIODS.find(([v]) => v === period)?.[1];
  const count = scope === 'friends' ? meta?.stats?.learners : meta?.totalUsers;
  const countText = count === undefined || count === null ? null : `${count.toLocaleString()} ${scope === 'friends' ? 'on this board' : 'players'}`;
  const refresh = (
    <Tooltip title="Refresh">
      <IconButton onClick={reload} aria-label="Refresh leaderboard" sx={{ width: 40, height: 40, flexShrink: 0, color: T.icon, bgcolor: T.soft, boxShadow: T.raised, '&:hover': { bgcolor: T.soft, boxShadow: T.pressed } }}>
        <RefreshRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
      </IconButton>
    </Tooltip>
  );
  const showChampionEmpty = !firstLoad && !q && !champion && rows.length > 0;

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minWidth: 0, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '28px', p: { xs: 1.5, sm: 2.25 }, background: T.panel, border: T.border, boxShadow: T.panelShadow }}>
      <Box aria-hidden sx={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${T.blobWarm}, transparent 70%)`, pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${T.blobAccent}, transparent 70%)`, pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* title row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>
          <Tile T={T} size={roomy ? 46 : 40}><EmojiEventsRoundedIcon /></Tile>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="h2" noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: { xs: FONT_SIZES.subheading, sm: FONT_SIZES.heading }, color: T.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Leaderboard</Typography>
            {roomy && (meta ? (
              <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, color: T.muted, mt: 0.2 }}>{trackName}, {periodName}{countText ? `, ${countText}` : ''}</Typography>
            ) : <Skeleton width={190} />)}
          </Box>
          {roomy && <SearchBox T={T} value={search} onChange={setSearch} placeholder="Search name or @handle" width={230} />}
          <ScopeSwitch T={T} value={scope} onChange={onScope} friendsOk={isAuthenticated} />
          {roomy && refresh}
          {!roomy && (
            <Tooltip title="Search">
              <IconButton onClick={() => { if (searchOpen) setSearch(''); setSearchOpen((o) => !o); }} aria-label="Search players" sx={{ width: 40, height: 40, flexShrink: 0, color: T.icon, bgcolor: T.soft, boxShadow: searchOpen ? T.pressed : T.raised }}>
                {searchOpen ? <CloseRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} /> : <SearchRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {!roomy && (
          <Collapse in={searchOpen} timeout={200} sx={{ flexShrink: 0 }}>
            <Box sx={{ pt: 1.25, px: '4px' }}><SearchBox T={T} value={search} onChange={setSearch} placeholder="Search name or @handle" /></Box>
          </Collapse>
        )}

        {/* track + period */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25, mt: 0.75, flexShrink: 0 }}>
          <TrackTabs T={T} value={track} onChange={onTrack} iconOnly={iconOnly} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <PeriodSwitch T={T} value={period} onChange={onPeriod} iconOnly={iconOnly} />
            {!roomy && refresh}
          </Box>
        </Box>

        {/* leader + everyone else: the only part that scrolls */}
        <Box
          ref={scroller} className="autohide-scroll"
          onScroll={(e) => { const el = e.currentTarget; if (el.scrollHeight - el.scrollTop - el.clientHeight < 240) askMore(); }}
          sx={{ flex: 1, minHeight: 0, mt: 0.75, mx: '-6px', px: '6px', py: '6px', overflowY: firstLoad ? 'hidden' : 'auto', overflowX: 'hidden', overscrollBehavior: 'contain' }}
        >
          <Box sx={{ display: 'grid', gap: { xs: 1, sm: 1.1 } }}>
            {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>Retry</Button>}>{error}</Alert>}

            {firstLoad && <Skeleton variant="rounded" height={tight ? 128 : 156} sx={{ borderRadius: '24px' }} />}
            {champion && <Champion row={champion} isMe={me?.userId === champion.userId} selected={selectedId === champion.userId} onPick={onPick} tight={tight} wide={wide} reduce={reduce} />}
            {showChampionEmpty && <EmptyChampion T={T} tight={tight} />}

            {firstLoad && Array.from({ length: 7 }, (_, i) => <SkelRow key={i} T={T} i={i} />)}
            {listRows.map((r, i) => (
              <PlayerRow
                key={r.userId} row={r} index={i} T={T} isMe={me?.userId === r.userId} selected={selectedId === r.userId}
                onPick={onPick} wide={wide} track={track} reduce={reduce}
              />
            ))}

            {!loading && rows.length === 0 && !error && (
              <Box sx={{ py: 5, px: 3, textAlign: 'center', borderRadius: '24px', bgcolor: T.soft, boxShadow: T.pressed }}>
                <EmojiEventsRoundedIcon sx={{ fontSize: FONT_SIZES.heroLg, color: COLOR_PALETTE.amber[500], opacity: 0.7 }} />
                <Typography sx={{ mt: 0.5, fontWeight: FONT_WEIGHTS.bold, color: T.ink }}>
                  {q ? `No player matches "${q}".` : scope === 'friends' ? 'No friends on this board yet.' : 'No one has scored in this period yet.'}
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  {q && <SoftButton T={T} onClick={() => setSearch('')}>Clear search</SoftButton>}
                  {!q && scope === 'friends' && <SoftButton T={T} onClick={showEveryone}>Show everyone</SoftButton>}
                  {!q && period !== 'all' && <SoftButton T={T} onClick={() => onPeriod('all')}>Show all-time</SoftButton>}
                </Box>
              </Box>
            )}

            {hasMore && <Box ref={sentinel} sx={{ height: 1 }} />}
            {loading && rows.length > 0 && Array.from({ length: 2 }, (_, i) => <SkelRow key={`m${i}`} T={T} i={i} />)}
          </Box>
        </Box>

        {/* my own position stays pinned under the list */}
        {me && (
          <Box sx={{ flexShrink: 0, mt: 1, p: '2px', borderRadius: '22px', background: `linear-gradient(135deg, ${GOLD}, ${ACCENT})`, boxShadow: `0 14px 28px -16px ${withAlpha(COLOR_PALETTE.indigo[500], 0.8)}` }}>
            <Box sx={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', bgcolor: T.soft, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <PlayerRow row={me} T={T} isMe you selected={false} onPick={onPick} wide={wide} track={track} reduce={reduce} />
              </Box>
              {meInList && (
                <Tooltip title="Find me in the list">
                  <IconButton onClick={scrollToMe} aria-label="Scroll to my row" sx={{ mr: 1, width: 36, height: 36, flexShrink: 0, color: T.icon, bgcolor: T.soft, boxShadow: T.raised, '&:hover': { bgcolor: T.soft, boxShadow: T.pressed } }}>
                    <MyLocationRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        )}
        {isAuthenticated && meta && !meta.me && !loading && (
          <Typography sx={{ flexShrink: 0, mt: 1, px: 1, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: T.muted }}>
            Solve a question{period === 'all' ? '' : ' in this period'} to enter the leaderboard.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
