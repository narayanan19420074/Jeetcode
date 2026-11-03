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
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../app/design/designTokens';

// Side panel of the leaderboard. Same neumorphic panel as the board (EmpireCard). In the middle sits a
// "mirror frame": raised bezel + pressed lip around a vivid glass pane. The pane shows only what matters
// at a glance (who, rank, points, streak, solved, next tier) and never scrolls.

const GOLD = COLOR_PALETTE.amber[400];
const WHITE_SOFT = withAlpha(COLOR_PALETTE.white, 0.92);
const SHADOW_TXT = `0 1px 3px ${withAlpha(COLOR_PALETTE.custom.indigo140A3C, 0.45)}`;

// Vivid colour per tier. The glass cards on top are tinted dark so white text reads on every one.
const TIER_GRAD = {
  bronze: `linear-gradient(145deg,${COLOR_PALETTE.orange[400]} 0%,${COLOR_PALETTE.custom.redFF5E62} 55%,${COLOR_PALETTE.custom.pinkFF3D81} 100%)`,
  silver: `linear-gradient(145deg,${COLOR_PALETTE.sky[400]} 0%,${COLOR_PALETTE.indigo[500]} 60%,${COLOR_PALETTE.violet[500]} 100%)`,
  gold: `linear-gradient(145deg,${COLOR_PALETTE.amber[400]} 0%,${COLOR_PALETTE.orange[500]} 55%,${COLOR_PALETTE.red[500]} 100%)`,
  platinum: `linear-gradient(145deg,${COLOR_PALETTE.cyan[400]} 0%,${COLOR_PALETTE.blue[500]} 55%,${COLOR_PALETTE.indigo[500]} 100%)`,
  diamond: `linear-gradient(145deg,${COLOR_PALETTE.indigo[400]} 0%,${COLOR_PALETTE.purple[500]} 55%,${COLOR_PALETTE.pink[500]} 100%)`,
  legend: `linear-gradient(145deg,${COLOR_PALETTE.rose[500]} 0%,${COLOR_PALETTE.custom.purpleD946EF} 55%,${COLOR_PALETTE.violet[600]} 100%)`,
};
const IDLE_GRAD = `linear-gradient(145deg,${COLOR_PALETTE.indigo[400]} 0%,${COLOR_PALETTE.indigo[500]} 55%,${COLOR_PALETTE.indigo[700]} 100%)`;
const DIFF = { easy: COLOR_PALETTE.green[400], medium: COLOR_PALETTE.yellow[300], hard: COLOR_PALETTE.rose[400] };
const TRACKS = [['overall', 'Overall', StarsRoundedIcon], ['coding', 'Coding', CodeRoundedIcon], ['aptitude', 'Aptitude', PsychologyRoundedIcon]];

// Frosted glass, tinted dark so the text stays readable on any colour behind it.
const glass = {
  borderRadius: RADII_PX.card, bgcolor: withAlpha(COLOR_PALETTE.custom.indigo180E48, 0.30), border: `1px solid ${withAlpha(COLOR_PALETTE.white, 0.38)}`,
  backdropFilter: 'blur(16px) saturate(160%)', WebkitBackdropFilter: 'blur(16px) saturate(160%)',
  boxShadow: `inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.4)}, 0 12px 24px -14px ${withAlpha(COLOR_PALETTE.custom.indigo140A3C, 0.6)}`,
};
const cap = { fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.8, textTransform: 'uppercase', color: WHITE_SOFT, textShadow: SHADOW_TXT };

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
    <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 1, borderRadius: RADII_PX.card, bgcolor: withAlpha(COLOR_PALETTE.custom.indigo140A3C, 0.35) }}>
      <Icon sx={{ fontSize: FONT_SIZES.subheading, color }} />
      <Typography sx={{ flex: 1, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, textShadow: SHADOW_TXT }}>{label}</Typography>
      <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.title, lineHeight: 1 }, mono]}>{n}</Typography>
    </Box>
  );
  return (
    <Box sx={[glass, { p: 1.5, display: 'grid', gap: 1 }]}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={cap}>{title}</Typography>
        <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.hero, lineHeight: 1, textShadow: SHADOW_TXT }, mono]}>{big.toLocaleString()}</Typography>
      </Box>
      {track === 'overall' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {chip(CodeRoundedIcon, 'Coding', coding, COLOR_PALETTE.sky[300])}
          {chip(PsychologyRoundedIcon, 'Aptitude', apt, COLOR_PALETTE.purple[200])}
        </Box>
      )}
      {track === 'coding' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1 }}>
          {diff.map(([l, n, pts, color]) => (
            <Box key={l} sx={{ py: 0.5, textAlign: 'center', borderRadius: RADII_PX.card, bgcolor: withAlpha(COLOR_PALETTE.custom.indigo140A3C, 0.35), minWidth: 0 }}>
              <Typography sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: 1.15, color }, mono]}>{n}</Typography>
              <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, textShadow: SHADOW_TXT }}>{l}</Typography>
              <Typography noWrap sx={[{ fontSize: FONT_SIZES.micro, color: WHITE_SOFT }, mono]}>{n * pts} pts</Typography>
            </Box>
          ))}
        </Box>
      )}
      {track === 'aptitude' && (
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, textShadow: SHADOW_TXT }}>
          {(apt * points.aptitude).toLocaleString()} pts from aptitude
        </Typography>
      )}
    </Box>
  );
}

// The mirror: raised bezel, pressed lip, vivid pane with a soft gloss. No scrolling inside.
function MirrorFrame({ T, paneGrad, children }) {
  return (
    <Box sx={{ flex: '1 1 auto', minHeight: 0, display: 'flex', p: 1, borderRadius: RADII_PX.card, bgcolor: T.soft, boxShadow: T.raised }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', p: 0.5, borderRadius: RADII_PX.card, bgcolor: T.soft, boxShadow: T.pressed }}>
        <Box sx={{ position: 'relative', flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', borderRadius: RADII_PX.card, background: paneGrad, boxShadow: `inset 0 0 0 1px ${withAlpha(COLOR_PALETTE.white, 0.3)}`, color: COLOR_PALETTE.white }}>
          <Box aria-hidden sx={{ position: 'absolute', top: -60, left: -30, width: 240, height: 170, borderRadius: '50%', background: `radial-gradient(ellipse, ${withAlpha(COLOR_PALETTE.white, 0.34)}, transparent 70%)`, pointerEvents: 'none' }} />
          <Box aria-hidden sx={{ position: 'absolute', right: -50, bottom: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(COLOR_PALETTE.white, 0.22)}, transparent 70%)`, pointerEvents: 'none' }} />
          <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1, p: 1.5 }}>{children}</Box>
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AvatarRing src={row.avatarUrl} name={row.name} size={54} a={medal ? medal.a : COLOR_PALETTE.white} b={medal ? medal.b : GOLD} ring={3} inner={withAlpha(COLOR_PALETTE.white, 0.9)} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, lineHeight: 1.25, textShadow: SHADOW_TXT }}>{row.name}{isMe && <YouChip />}</Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.body, color: WHITE_SOFT, textShadow: SHADOW_TXT }}>@{row.handle}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.custom.indigo140A3C, 0.38), fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.7 }}>
              <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.body, color: COLOR_PALETTE.amber[200] }} />{tier.name}
            </Box>
            {isMe && topPercent && learners > 0 && (
              <Tooltip title={`Top ${topPercent}% of ${learners.toLocaleString()} ranked players`}>
                <Box sx={{ px: 1, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.7, color: COLOR_PALETTE.amber[950], bgcolor: COLOR_PALETTE.amber[200] }}>Top {topPercent}%</Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1 }}>
        <GlassStat label="Rank">
          <Typography noWrap sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.display, lineHeight: 1.3, ...(medal ? { background: grad(medal), WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : { textShadow: SHADOW_TXT }) }, mono]}>#{row.rank}</Typography>
        </GlassStat>
        <GlassStat label="Points">
          <Typography noWrap sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.display, lineHeight: 1.3, color: COLOR_PALETTE.yellow[200], textShadow: SHADOW_TXT }, mono]}>{loading ? row.score.toLocaleString() : <CountUp value={row.score} />}</Typography>
        </GlassStat>
        <GlassStat label="Streak">
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.display, color: row.streak > 0 ? COLOR_PALETTE.orange[300] : WHITE_SOFT }} />
          <Typography noWrap sx={[{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.display, lineHeight: 1.3, textShadow: SHADOW_TXT }, mono]}>{row.streak}</Typography>
        </GlassStat>
      </Box>

      <SolvedCard row={row} track={track} points={points} />

      <Box sx={[glass, { px: 1.5, py: 1 }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, textShadow: SHADOW_TXT }}>{next ? `Next: ${next.name}` : 'Top tier'}</Typography>
          <Typography noWrap sx={[{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.yellow[200], textShadow: SHADOW_TXT }, mono]}>{next ? `${toNext.toLocaleString()} pts` : 'Reached'}</Typography>
        </Box>
        <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progress to next tier" sx={{ height: 10, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.custom.indigo140A3C, 0.4), overflow: 'hidden' }}>
          <Box sx={{ width: `${Math.max(progress, 4)}%`, height: '100%', borderRadius: RADII_PX.pill, background: `linear-gradient(90deg,${COLOR_PALETTE.yellow[200]},${COLOR_PALETTE.amber[400]})`, transition: 'width .6s ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
        </Box>
      </Box>
    </>
  );
}

// ---------- neumorphic pieces under the mirror ----------

function SoftTile({ T, children }) {
  return <Box sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: RADII_PX.card, display: 'grid', placeItems: 'center', bgcolor: T.soft, boxShadow: T.raised, color: COLOR_PALETTE.amber[500] }}>{children}</Box>;
}

// Overall / Coding / Aptitude. The raised, coloured thumb marks the one in use.
function TrackSwitch({ T, value, onChange }) {
  return (
    <Box role="tablist" aria-label="Leaderboard track" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0.5, p: 0.5, borderRadius: RADII_PX.pill, bgcolor: T.soft, boxShadow: T.pressed }}>
      {TRACKS.map(([v, label, Icon]) => {
        const on = value === v;
        return (
          <ButtonBase
            key={v} role="tab" aria-selected={on} onClick={() => onChange(v)}
            sx={{ gap: 0.5, height: 34, minWidth: 0, borderRadius: RADII_PX.pill, fontFamily: 'inherit', fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: on ? COLOR_PALETTE.white : T.muted, background: on ? ACCENT : 'transparent', boxShadow: on ? `0 8px 16px -6px ${withAlpha(COLOR_PALETTE.indigo[500], 0.85)}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.3)}` : 'none', transition: 'color .2s', '&:active': { transform: 'scale(0.97)' } }}
          >
            <Icon sx={{ fontSize: FONT_SIZES.title }} />{label}
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
    <Box sx={{ flexShrink: 0, display: 'grid', gap: 1.5, p: 1.5, borderRadius: RADII_PX.card, bgcolor: T.soft, boxShadow: T.raised }}>
      {head && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SoftTile T={T}><Icon /></SoftTile>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap title={head} sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, lineHeight: 1.3, color: T.ink }}>{head}</Typography>
            <Typography noWrap title={sub} sx={{ fontSize: FONT_SIZES.caption, color: T.muted }}>{sub}</Typography>
          </Box>
        </Box>
      )}
      <TrackSwitch T={T} value={track} onChange={onTrack} />
    </Box>
  );
}

function LoginCard({ T }) {
  return (
    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: RADII_PX.card, bgcolor: T.soft, boxShadow: T.raised }}>
      <SoftTile T={T}><EmojiEventsRoundedIcon /></SoftTile>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, color: T.ink }}>See where you stand</Typography>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, color: T.muted }}>Log in to get your rank.</Typography>
      </Box>
      <Button component={RouterLink} to="/login" size="small" disableElevation startIcon={<BoltRoundedIcon />} sx={{ borderRadius: RADII_PX.pill, px: 2, color: COLOR_PALETTE.white, background: ACCENT, fontWeight: FONT_WEIGHTS.bold, textTransform: 'none', boxShadow: `0 8px 16px -6px ${withAlpha(COLOR_PALETTE.indigo[500], 0.85)}` }}>Log in</Button>
    </Box>
  );
}

// Six tier icons in a pressed groove, the current one raised.
function TierStrip({ T, currentKey }) {
  return (
    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: RADII_PX.pill, bgcolor: T.soft, boxShadow: T.pressed }}>
      {TIERS.map((t) => {
        const on = t.key === currentKey;
        return (
          <Tooltip key={t.key} title={`${t.name}, ${t.min.toLocaleString()}+ pts`}>
            <Box
              role="img" aria-label={`${t.name} tier, ${t.min} points`} tabIndex={0}
              sx={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', color: on ? COLOR_PALETTE.white : t.color, background: on ? `linear-gradient(135deg, ${t.color}, color-mix(in srgb, ${t.color} 55%, ${COLOR_PALETTE.black}))` : T.soft, boxShadow: on ? `${T.raised}, 0 6px 14px -4px ${t.color}` : 'none', opacity: on ? 1 : 0.75 }}
            >
              <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
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
    <Box sx={{ position: 'relative', overflow: 'hidden', minWidth: 0, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, borderRadius: RADII_PX.card, p: 2, background: T.panel, border: T.border, boxShadow: T.panelShadow }}>
      <Box aria-hidden sx={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${T.blobWarm}, transparent 70%)`, pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${T.blobAccent}, transparent 70%)`, pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {!isAuthenticated && <LoginCard T={T} />}

        <MirrorFrame T={T} paneGrad={row ? TIER_GRAD[tierKey] : IDLE_GRAD}>
          {row ? (
            <PlayerFace row={row} track={track} points={points} isMe={isMe} learners={learners} topPercent={topPercent} loading={loading} />
          ) : (
            <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', p: 2 }}>
              {loading ? <Skeleton variant="rounded" width="100%" height={220} sx={{ bgcolor: withAlpha(COLOR_PALETTE.white, 0.3), borderRadius: RADII_PX.card }} /> : (
                <Box>
                  <TagRoundedIcon sx={{ fontSize: FONT_SIZES.hero, color: COLOR_PALETTE.yellow[200] }} />
                  <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, textShadow: SHADOW_TXT }}>No player picked</Typography>
                  <Typography sx={{ fontSize: FONT_SIZES.body, color: WHITE_SOFT, textShadow: SHADOW_TXT }}>Tap a player on the board.</Typography>
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
