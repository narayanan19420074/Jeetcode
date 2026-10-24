import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, ButtonBase, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import { tierFor, TIERS } from './tiers';
import { AvatarRing, CountUp, MEDAL, YouChip, grad, mono } from './lbShared';
import { ACCENT, lbTokens } from './lbTheme';

// Side panel of the leaderboard. Same neumorphic panel as the board (EmpireCard). In the middle sits a
// "mirror frame": raised bezel + pressed lip around a vivid glass pane. The pane shows only what matters
// at a glance (who, rank, points, streak, solved, next tier) and never scrolls.

const GOLD = '#FBBF24';
const WHITE_SOFT = 'rgba(255,255,255,0.92)';
const SHADOW_TXT = '0 1px 3px rgba(20,10,60,0.45)';

// Vivid colour per tier. The glass cards on top are tinted dark so white text reads on every one.
const TIER_GRAD = {
  bronze: 'linear-gradient(145deg,#FF9A3C 0%,#FF5E62 55%,#FF3D81 100%)',
  silver: 'linear-gradient(145deg,#38BDF8 0%,#6366F1 60%,#8B5CF6 100%)',
  gold: 'linear-gradient(145deg,#FBBF24 0%,#F97316 55%,#EF4444 100%)',
  platinum: 'linear-gradient(145deg,#22D3EE 0%,#3B82F6 55%,#6366F1 100%)',
  diamond: 'linear-gradient(145deg,#818CF8 0%,#A855F7 55%,#EC4899 100%)',
  legend: 'linear-gradient(145deg,#F43F5E 0%,#D946EF 55%,#7C3AED 100%)',
};
const IDLE_GRAD = 'linear-gradient(145deg,#8B5CF6 0%,#6366F1 55%,#22D3EE 100%)';
const DIFF = { easy: '#4ADE80', medium: '#FDE047', hard: '#FB7185' };
const TRACKS = [['overall', 'Overall', StarsRoundedIcon], ['coding', 'Coding', CodeRoundedIcon], ['aptitude', 'Aptitude', PsychologyRoundedIcon]];

// Frosted glass, tinted dark so the text stays readable on any colour behind it.
const glass = {
  borderRadius: '16px', bgcolor: 'rgba(24,14,72,0.30)', border: '1px solid rgba(255,255,255,0.38)',
  backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 12px 24px -14px rgba(20,10,60,0.6)',
};
const cap = { fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: WHITE_SOFT, textShadow: SHADOW_TXT };

function GlassStat({ label, children }) {
  return (
    <Box sx={[glass, { py: 1, px: 0.5, textAlign: 'center', minWidth: 0 }]}>
      <Typography sx={cap}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

// The solved card changes with the track, so it only ever shows one story.
function SolvedCard({ row, track, points }) {
  const coding = row.easy + row.medium + row.hard;
  const apt = row.aptitude;
  const big = track === 'coding' ? coding : track === 'aptitude' ? apt : coding + apt;
  const title = track === 'coding' ? 'Coding solved' : track === 'aptitude' ? 'Aptitude solved' : 'Total solved';
  const diff = [['Easy', row.easy, points.easy, DIFF.easy], ['Medium', row.medium, points.medium, DIFF.medium], ['Hard', row.hard, points.hard, DIFF.hard]];
  const chip = (Icon, label, n, color) => (
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75, py: 0.7, px: 1, borderRadius: '12px', bgcolor: 'rgba(20,10,60,0.35)' }}>
      <Icon sx={{ fontSize: 18, color }} />
      <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 700, textShadow: SHADOW_TXT }}>{label}</Typography>
      <Typography sx={[{ fontWeight: 900, fontSize: 16, lineHeight: 1 }, mono]}>{n}</Typography>
    </Box>
  );
  return (
    <Box sx={[glass, { p: 1.5, display: 'grid', gap: 1.1 }]}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={cap}>{title}</Typography>
        <Typography sx={[{ fontWeight: 900, fontSize: 30, lineHeight: 1, textShadow: SHADOW_TXT }, mono]}>{big.toLocaleString()}</Typography>
      </Box>
      {track === 'overall' && (
        <Box sx={{ display: 'flex', gap: 0.9 }}>
          {chip(CodeRoundedIcon, 'Coding', coding, '#7DD3FC')}
          {chip(PsychologyRoundedIcon, 'Aptitude', apt, '#E9D5FF')}
        </Box>
      )}
      {track === 'coding' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0.9 }}>
          {diff.map(([l, n, pts, color]) => (
            <Box key={l} sx={{ py: 0.7, textAlign: 'center', borderRadius: '12px', bgcolor: 'rgba(20,10,60,0.35)', minWidth: 0 }}>
              <Typography sx={[{ fontWeight: 900, fontSize: 20, lineHeight: 1.15, color }, mono]}>{n}</Typography>
              <Typography noWrap sx={{ fontSize: 11.5, fontWeight: 700, textShadow: SHADOW_TXT }}>{l}</Typography>
              <Typography noWrap sx={[{ fontSize: 10.5, color: WHITE_SOFT }, mono]}>{n * pts} pts</Typography>
            </Box>
          ))}
        </Box>
      )}
      {track === 'aptitude' && (
        <Typography sx={{ fontSize: 13, fontWeight: 700, textShadow: SHADOW_TXT }}>
          {(apt * points.aptitude).toLocaleString()} pts from aptitude
        </Typography>
      )}
    </Box>
  );
}

// The mirror: raised bezel, pressed lip, vivid pane with a soft gloss. No scrolling inside.
function MirrorFrame({ T, paneGrad, children }) {
  return (
    <Box sx={{ flex: '1 1 auto', minHeight: 0, display: 'flex', p: '9px', borderRadius: '28px', bgcolor: T.soft, boxShadow: T.raised }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', p: '5px', borderRadius: '21px', bgcolor: T.soft, boxShadow: T.pressed }}>
        <Box sx={{ position: 'relative', flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', borderRadius: '17px', background: paneGrad, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)', color: '#fff' }}>
          <Box aria-hidden sx={{ position: 'absolute', top: -60, left: -30, width: 240, height: 170, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.34), transparent 70%)', pointerEvents: 'none' }} />
          <Box aria-hidden sx={{ position: 'absolute', right: -50, bottom: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 70%)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.1, p: 1.5 }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}

function PlayerFace({ row, track, points, isMe, learners, topPercent, loading }) {
  const { tier, next, progress, toNext } = tierFor(row.score);
  const medal = MEDAL[row.rank];
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <AvatarRing src={row.avatarUrl} name={row.name} size={54} a={medal ? medal.a : '#fff'} b={medal ? medal.b : GOLD} ring={3} inner="rgba(255,255,255,0.9)" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 900, fontSize: 18, lineHeight: 1.25, textShadow: SHADOW_TXT }}>{row.name}{isMe && <YouChip />}</Typography>
          <Typography noWrap sx={{ fontSize: 13, color: WHITE_SOFT, textShadow: SHADOW_TXT }}>@{row.handle}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.9, borderRadius: 99, bgcolor: 'rgba(20,10,60,0.38)', fontSize: 11.5, fontWeight: 800, lineHeight: 1.7 }}>
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 14, color: '#FDE68A' }} />{tier.name}
            </Box>
            {isMe && topPercent && learners > 0 && (
              <Tooltip title={`Top ${topPercent}% of ${learners.toLocaleString()} ranked players`}>
                <Box sx={{ px: 0.9, borderRadius: 99, fontSize: 11.5, fontWeight: 800, lineHeight: 1.7, color: '#451A03', bgcolor: '#FDE68A' }}>Top {topPercent}%</Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1 }}>
        <GlassStat label="Rank">
          <Typography noWrap sx={[{ fontWeight: 900, fontSize: 24, lineHeight: 1.3, ...(medal ? { background: grad(medal), WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : { textShadow: SHADOW_TXT }) }, mono]}>#{row.rank}</Typography>
        </GlassStat>
        <GlassStat label="Points">
          <Typography noWrap sx={[{ fontWeight: 900, fontSize: 24, lineHeight: 1.3, color: '#FEF08A', textShadow: SHADOW_TXT }, mono]}>{loading ? row.score.toLocaleString() : <CountUp value={row.score} />}</Typography>
        </GlassStat>
        <GlassStat label="Streak">
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 22, color: row.streak > 0 ? '#FDBA74' : WHITE_SOFT }} />
          <Typography noWrap sx={[{ fontWeight: 900, fontSize: 24, lineHeight: 1.3, textShadow: SHADOW_TXT }, mono]}>{row.streak}</Typography>
        </GlassStat>
      </Box>

      <SolvedCard row={row} track={track} points={points} />

      <Box sx={[glass, { px: 1.5, py: 1.1 }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.7 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, textShadow: SHADOW_TXT }}>{next ? `Next: ${next.name}` : 'Top tier'}</Typography>
          <Typography noWrap sx={[{ fontSize: 12.5, fontWeight: 800, color: '#FEF08A', textShadow: SHADOW_TXT }, mono]}>{next ? `${toNext.toLocaleString()} pts` : 'Reached'}</Typography>
        </Box>
        <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progress to next tier" sx={{ height: 10, borderRadius: 99, bgcolor: 'rgba(20,10,60,0.4)', overflow: 'hidden' }}>
          <Box sx={{ width: `${Math.max(progress, 4)}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#FEF08A,#FBBF24)', transition: 'width .6s ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
        </Box>
      </Box>
    </>
  );
}

// ---------- neumorphic pieces under the mirror ----------

function SoftTile({ T, children }) {
  return <Box sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: T.soft, boxShadow: T.raised, color: '#F59E0B' }}>{children}</Box>;
}

// Overall / Coding / Aptitude. The raised, coloured thumb marks the one in use.
function TrackSwitch({ T, value, onChange }) {
  return (
    <Box role="tablist" aria-label="Leaderboard track" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '4px', p: '4px', borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed }}>
      {TRACKS.map(([v, label, Icon]) => {
        const on = value === v;
        return (
          <ButtonBase
            key={v} role="tab" aria-selected={on} onClick={() => onChange(v)}
            sx={{ gap: 0.4, height: 34, minWidth: 0, borderRadius: 99, fontFamily: 'inherit', fontSize: 12, fontWeight: 800, color: on ? '#fff' : T.muted, background: on ? ACCENT : 'transparent', boxShadow: on ? '0 8px 16px -6px rgba(99,102,241,0.85), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none', transition: 'color .2s', '&:active': { transform: 'scale(0.97)' } }}
          >
            <Icon sx={{ fontSize: 16 }} />{label}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// "You lead this board" / "12 pts to catch Asha", with the track switch right under it.
function FocusCard({ T, me, neighbors, ranked, isAuthenticated, period, points, track, onTrack }) {
  let head = null;
  let sub = null;
  let Icon = TrendingUpRoundedIcon;
  if (me && neighbors) {
    const { above } = neighbors;
    head = above ? `${above.gap.toLocaleString()} pts to catch ${above.name}` : me.rank === 1 ? 'You lead this board' : 'Keep solving';
    sub = above ? `About ${Math.ceil(above.gap / points.medium)} Medium questions` : 'Solve more to stay ahead.';
    if (!above) Icon = EmojiEventsRoundedIcon;
  } else if (isAuthenticated && !ranked) {
    head = 'Not ranked yet';
    sub = `Solve a question${period === 'all' ? '' : ' in this period'} to enter.`;
    Icon = BoltRoundedIcon;
  }
  return (
    <Box sx={{ flexShrink: 0, display: 'grid', gap: 1.25, p: 1.5, borderRadius: '22px', bgcolor: T.soft, boxShadow: T.raised }}>
      {head && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <SoftTile T={T}><Icon /></SoftTile>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap title={head} sx={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, color: T.ink }}>{head}</Typography>
            <Typography noWrap title={sub} sx={{ fontSize: 12, color: T.muted }}>{sub}</Typography>
          </Box>
        </Box>
      )}
      <TrackSwitch T={T} value={track} onChange={onTrack} />
    </Box>
  );
}

function LoginCard({ T }) {
  return (
    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.25, p: 1.25, borderRadius: '22px', bgcolor: T.soft, boxShadow: T.raised }}>
      <SoftTile T={T}><EmojiEventsRoundedIcon /></SoftTile>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 800, fontSize: 14, color: T.ink }}>See where you stand</Typography>
        <Typography noWrap sx={{ fontSize: 12, color: T.muted }}>Log in to get your rank.</Typography>
      </Box>
      <Button component={RouterLink} to="/login" size="small" disableElevation startIcon={<BoltRoundedIcon />} sx={{ borderRadius: 99, px: 1.75, color: '#fff', background: ACCENT, fontWeight: 800, textTransform: 'none', boxShadow: '0 8px 16px -6px rgba(99,102,241,0.85)' }}>Log in</Button>
    </Box>
  );
}

// Six tier icons in a pressed groove, the current one raised.
function TierStrip({ T, currentKey }) {
  return (
    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '6px', borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed }}>
      {TIERS.map((t) => {
        const on = t.key === currentKey;
        return (
          <Tooltip key={t.key} title={`${t.name}, ${t.min.toLocaleString()}+ pts`}>
            <Box
              role="img" aria-label={`${t.name} tier, ${t.min} points`} tabIndex={0}
              sx={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', color: on ? '#fff' : t.color, background: on ? `linear-gradient(135deg, ${t.color}, color-mix(in srgb, ${t.color} 55%, #000))` : T.soft, boxShadow: on ? `${T.raised}, 0 6px 14px -4px ${t.color}` : 'none', opacity: on ? 1 : 0.75 }}
            >
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

export default function LeaderboardPanel({ row, me, isAuthenticated, meta, period, track, onTrack, points, learners, topPercent, loading, short }) {
  const T = lbTokens(useTheme().palette.mode);
  const isMe = Boolean(me && row && row.userId === me.userId);
  const tierKey = row ? tierFor(row.score).tier.key : null;
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minWidth: 0, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.25, borderRadius: '28px', p: 2, background: T.panel, border: T.border, boxShadow: T.panelShadow }}>
      <Box aria-hidden sx={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.35), transparent 70%)', pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.28), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {!isAuthenticated && <LoginCard T={T} />}

        <MirrorFrame T={T} paneGrad={row ? TIER_GRAD[tierKey] : IDLE_GRAD}>
          {row ? (
            <PlayerFace row={row} track={track} points={points} isMe={isMe} learners={learners} topPercent={topPercent} loading={loading} />
          ) : (
            <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', p: 2 }}>
              {loading ? <Skeleton variant="rounded" width="100%" height={220} sx={{ bgcolor: 'rgba(255,255,255,0.3)', borderRadius: '16px' }} /> : (
                <Box>
                  <TagRoundedIcon sx={{ fontSize: 34, color: '#FEF08A' }} />
                  <Typography sx={{ fontWeight: 800, textShadow: SHADOW_TXT }}>No player picked</Typography>
                  <Typography sx={{ fontSize: 13, color: WHITE_SOFT, textShadow: SHADOW_TXT }}>Tap a player on the board.</Typography>
                </Box>
              )}
            </Box>
          )}
        </MirrorFrame>

        <FocusCard
          T={T} me={me} neighbors={meta?.neighbors} ranked={Boolean(meta?.me) || loading} isAuthenticated={isAuthenticated}
          period={period} points={points} track={track} onTrack={onTrack}
        />
        {!short && <TierStrip T={T} currentKey={tierKey} />}
      </Box>
    </Box>
  );
}
