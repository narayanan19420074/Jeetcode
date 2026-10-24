import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import { DIFF_COLOR } from '../dashboard/dashboardUtils';
import { PLAN_THEMES } from '../studyplan/planUtils';
import { TIERS, tierFor } from './tiers';
import { AvatarRing, CountUp, MEDAL, Mix, YouChip, activeLabel, calm, glow, grad, mono, sweep } from './lbShared';
import { ACCENT, lbTokens } from './lbTheme';

// The side panel of the leaderboard. Same neumorphic panel as the board (EmpireCard), with a
// "mirror frame" in the middle: a raised bezel + pressed lip around a glass pane that shows everything
// about the player you tapped (rank, points, streak, coding and aptitude solved, tier).

const themeGrad = (name) => (PLAN_THEMES.find((t) => t.name === name) || PLAN_THEMES[0]).gradient;
const TOP_GRAD = {
  1: 'linear-gradient(135deg,#78350F 0%,#B45309 50%,#F59E0B 100%)',
  2: 'linear-gradient(135deg,#0F172A 0%,#334155 55%,#64748B 100%)',
  3: 'linear-gradient(135deg,#431407 0%,#9A3412 55%,#EA580C 100%)',
};
// The mirror's colour follows the tier of the player it shows.
const TIER_GRAD = { bronze: TOP_GRAD[3], silver: TOP_GRAD[2], gold: TOP_GRAD[1], platinum: themeGrad('teal'), diamond: themeGrad('indigo'), legend: themeGrad('plum') };
const IDLE_GRAD = themeGrad('indigo');
const GOLD = '#FBBF24';
const SOFT = 'rgba(255,255,255,0.78)';

// Frosted glass card that sits on the coloured mirror.
const glass = {
  borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.28)',
  backdropFilter: 'blur(14px) saturate(150%)', WebkitBackdropFilter: 'blur(14px) saturate(150%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 10px 22px -14px rgba(0,0,0,0.55)',
};
const cap = { fontSize: 10.5, fontWeight: 800, letterSpacing: 0.7, textTransform: 'uppercase', color: SOFT };

function GlassStat({ label, children }) {
  return (
    <Box sx={[glass, { py: 1, px: 0.5, textAlign: 'center', minWidth: 0 }]}>
      <Typography sx={cap}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

// One line of the "Solved" card: icon, name, count.
function SolveLine({ Icon, color, label, count, pts }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 28, height: 28, flexShrink: 0, borderRadius: '9px', display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.16)', color }}>
        <Icon sx={{ fontSize: 17 }} />
      </Box>
      <Typography sx={{ flex: 1, fontWeight: 800, fontSize: 13.5 }}>{label}</Typography>
      <Typography sx={[{ fontWeight: 900, fontSize: 17, lineHeight: 1 }, mono]}>{count}</Typography>
      <Typography sx={[{ width: 56, textAlign: 'right', fontSize: 11, color: SOFT }, mono]}>{pts.toLocaleString()} pts</Typography>
    </Box>
  );
}

// The mirror itself: raised bezel, pressed lip, glass pane with a glare across it.
function MirrorFrame({ T, grad: paneGrad, children }) {
  return (
    <Box sx={{ flex: '1 1 auto', minHeight: 0, display: 'flex', p: '9px', borderRadius: '28px', bgcolor: T.soft, boxShadow: T.raised }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', p: '5px', borderRadius: '21px', bgcolor: T.soft, boxShadow: T.pressed }}>
        <Box sx={{ position: 'relative', flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', borderRadius: '17px', background: paneGrad, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 16px 34px -18px rgba(255,255,255,0.4)', color: '#fff' }}>
          <Box aria-hidden sx={{ position: 'absolute', right: -40, top: -40, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.42), transparent 70%)', animation: `${glow} 3.4s ease-in-out infinite`, ...calm }} />
          <Box aria-hidden sx={{ position: 'absolute', left: -50, bottom: -60, width: 210, height: 210, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.38), transparent 70%)' }} />
          <Box aria-hidden sx={{ position: 'absolute', left: '30%', top: '38%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)' }} />
          {/* mirror glare */}
          <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(115deg, rgba(255,255,255,0) 26%, rgba(255,255,255,0.2) 36%, rgba(255,255,255,0.04) 44%, rgba(255,255,255,0) 50%)' }} />
          <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <Box sx={{ position: 'absolute', top: 0, bottom: 0, width: '22%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)', animation: `${sweep} 7s ease-in-out infinite`, ...calm }} />
          </Box>
          <Box className="autohide-scroll" sx={{ position: 'relative', height: '100%', overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain' }}>
            <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.1, p: 1.5 }}>{children}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function PlayerFace({ row, points, isMe, learners, topPercent, loading }) {
  const { tier, next, progress, toNext } = tierFor(row.score);
  const medal = MEDAL[row.rank];
  const st = activeLabel(row.lastActive);
  const stColor = st.live ? '#A7F3D0' : st.color === 'warning.main' ? '#FDE68A' : 'rgba(255,255,255,0.65)';
  const coding = row.easy + row.medium + row.hard;
  const total = coding + row.aptitude;
  const diff = [
    ['Easy', row.easy, points.easy, DIFF_COLOR.Easy],
    ['Medium', row.medium, points.medium, DIFF_COLOR.Medium],
    ['Hard', row.hard, points.hard, DIFF_COLOR.Hard],
  ];
  return (
    <>
      {/* who */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <AvatarRing src={row.avatarUrl} name={row.name} size={52} a={medal ? medal.a : GOLD} b={medal ? medal.b : '#F59E0B'} ring={3} inner="rgba(30,27,75,0.9)" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 900, fontSize: 17, lineHeight: 1.25 }}>{row.name}{isMe && <YouChip />}</Typography>
          <Typography noWrap sx={{ fontSize: 12.5, color: SOFT }}>@{row.handle}{row.company ? `, ${row.company}` : ''}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, px: 0.8, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.18)', fontSize: 11, fontWeight: 800, lineHeight: 1.7 }}>
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 13, color: '#FDE68A' }} />{tier.name}
            </Box>
            {isMe && topPercent && learners > 0 && (
              <Tooltip title={`Top ${topPercent}% of ${learners.toLocaleString()} ranked players`}>
                <Box sx={{ px: 0.8, borderRadius: 99, fontSize: 11, fontWeight: 800, lineHeight: 1.7, color: '#FDE68A', bgcolor: 'rgba(251,191,36,0.18)', border: '1px solid rgba(251,191,36,0.5)' }}>Top {topPercent}%</Box>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      {/* rank / points / streak */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1 }}>
        <GlassStat label="Rank">
          <Typography noWrap sx={[{ fontWeight: 900, fontSize: 21, lineHeight: 1.25, ...(medal ? { background: grad(medal), WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : {}) }, mono]}>#{row.rank}</Typography>
        </GlassStat>
        <GlassStat label="Points">
          <Typography noWrap sx={[{ fontWeight: 900, fontSize: 21, lineHeight: 1.25, color: '#FDE68A' }, mono]}>{loading ? row.score.toLocaleString() : <CountUp value={row.score} />}</Typography>
        </GlassStat>
        <GlassStat label="Streak">
          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20, color: row.streak > 0 ? '#FB923C' : SOFT }} />
          <Typography noWrap sx={[{ fontWeight: 900, fontSize: 21, lineHeight: 1.25 }, mono]}>{row.streak}<Box component="span" sx={{ fontSize: 11, ml: 0.25, color: SOFT }}>d</Box></Typography>
        </GlassStat>
      </Box>

      {/* solved */}
      <Box sx={[glass, { p: 1.4, display: 'grid', gap: 1 }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <TaskAltRoundedIcon sx={{ fontSize: 18, color: '#A7F3D0' }} />
          <Typography sx={[cap, { flex: 1 }]}>Questions solved</Typography>
          <Typography sx={[{ fontWeight: 900, fontSize: 22, lineHeight: 1 }, mono]}>{total.toLocaleString()}</Typography>
        </Box>
        <Box sx={{ height: '1px', bgcolor: 'rgba(255,255,255,0.16)' }} />
        <SolveLine Icon={CodeRoundedIcon} color="#7DD3FC" label="Coding" count={coding} pts={row.easy * points.easy + row.medium * points.medium + row.hard * points.hard} />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 0.75 }}>
          {diff.map(([l, n, pts, color]) => (
            <Box key={l} sx={{ py: 0.6, textAlign: 'center', minWidth: 0, borderRadius: '11px', bgcolor: 'rgba(15,12,50,0.28)', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3), inset -1px -1px 3px rgba(255,255,255,0.1)' }}>
              <Typography sx={[{ fontWeight: 900, fontSize: 16, lineHeight: 1.2, color }, mono]}>{n}</Typography>
              <Typography noWrap sx={{ fontSize: 10.5, fontWeight: 700, color: SOFT }}>{l} <Box component="span" sx={{ opacity: 0.75 }}>{pts}p</Box></Typography>
            </Box>
          ))}
        </Box>
        <SolveLine Icon={PsychologyRoundedIcon} color="#C4B5FD" label="Aptitude" count={row.aptitude} pts={row.aptitude * points.aptitude} />
        <Mix row={row} onDark />
      </Box>

      {/* tier */}
      <Box sx={[glass, { p: 1.4 }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.7 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#FDE68A', fontWeight: 800, fontSize: 13 }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />{tier.name}
          </Box>
          <Typography noWrap sx={{ fontSize: 11.5, fontWeight: 700, color: SOFT }}>{next ? `${toNext.toLocaleString()} pts to ${next.name}` : 'Top tier reached'}</Typography>
        </Box>
        <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progress to next tier" sx={{ height: 9, borderRadius: 99, bgcolor: 'rgba(15,12,50,0.32)', overflow: 'hidden', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.35)' }}>
          <Box sx={{ width: `${Math.max(progress, 4)}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${GOLD}, #F59E0B)`, transition: 'width .6s ease', '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }} />
        </Box>
      </Box>

      {/* this week + activity */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, px: 0.5 }}>
        <Typography noWrap sx={{ fontSize: 12, fontWeight: 700, color: row.recent > 0 ? '#A7F3D0' : SOFT }}>{row.recent > 0 ? `+${row.recent} solved in 7 days` : 'Nothing solved in 7 days'}</Typography>
        <Typography noWrap sx={{ fontSize: 12, fontWeight: 800, color: stColor }}>{st.text}</Typography>
      </Box>
    </>
  );
}

// ---------- neumorphic cards under the mirror ----------

function SoftTile({ T, children }) {
  return <Box sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: T.soft, boxShadow: T.raised, color: '#F59E0B' }}>{children}</Box>;
}

function SoftNote({ T, Icon, title, text, action }) {
  return (
    <Box sx={{ flexShrink: 0, p: 1.5, borderRadius: '22px', bgcolor: T.soft, boxShadow: T.raised }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <SoftTile T={T}><Icon /></SoftTile>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: 14, color: T.ink }}>{title}</Typography>
          <Typography sx={{ fontSize: 12, color: T.muted, lineHeight: 1.35 }}>{text}</Typography>
        </Box>
      </Box>
      {action && <Box sx={{ mt: 1.25 }}>{action}</Box>}
    </Box>
  );
}

// "12 pts to catch Asha": only for the logged-in player.
function NextTarget({ T, me, neighbors, points }) {
  const { above, below } = neighbors;
  const solves = above ? Math.ceil(above.gap / points.medium) : 0;
  const head = above ? `${above.gap.toLocaleString()} pts to catch ${above.name}` : me.rank === 1 ? 'You lead this board' : 'Keep solving';
  const sub = above ? `They are #${above.rank}. About ${solves} Medium ${solves === 1 ? 'question' : 'questions'}.` : 'Solve more to stay ahead.';
  return (
    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5, borderRadius: '22px', bgcolor: T.soft, boxShadow: T.raised }}>
      <SoftTile T={T}>{above ? <TrendingUpRoundedIcon /> : <EmojiEventsRoundedIcon />}</SoftTile>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap title={head} sx={{ fontWeight: 800, fontSize: 13.5, lineHeight: 1.3, color: T.ink }}>{head}</Typography>
        <Typography noWrap title={sub} sx={{ fontSize: 12, color: T.muted }}>{sub}</Typography>
        {below && <Typography noWrap sx={{ fontSize: 12, color: T.muted }}>{below.gap.toLocaleString()} pts ahead of {below.name}</Typography>}
      </Box>
    </Box>
  );
}

// Six tier icons in a pressed groove, the current one raised. Hover for the points needed.
function TierStrip({ T, currentKey }) {
  return (
    <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '6px', borderRadius: 99, bgcolor: T.soft, boxShadow: T.pressed }}>
      {TIERS.map((t) => {
        const on = t.key === currentKey;
        return (
          <Tooltip key={t.key} title={`${t.name}, ${t.min.toLocaleString()}+ pts`}>
            <Box
              role="img" aria-label={`${t.name} tier, ${t.min} points`} tabIndex={0}
              sx={{ width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', color: on ? '#fff' : t.color, background: on ? `linear-gradient(135deg, ${t.color}, color-mix(in srgb, ${t.color} 55%, #000))` : T.soft, boxShadow: on ? `${T.raised}, 0 6px 14px -4px ${t.color}` : 'none', opacity: on ? 1 : 0.7, transition: 'box-shadow .2s' }}
            >
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

export default function LeaderboardPanel({ row, me, isAuthenticated, meta, period, points, learners, topPercent, loading, short }) {
  const T = lbTokens(useTheme().palette.mode);
  const isMe = Boolean(me && row && row.userId === me.userId);
  const tierKey = row ? tierFor(row.score).tier.key : null;
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minWidth: 0, minHeight: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.25, borderRadius: '28px', p: 2, background: T.panel, border: T.border, boxShadow: T.panelShadow }}>
      <Box aria-hidden sx={{ position: 'absolute', top: -70, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(244,114,182,0.35), transparent 70%)', pointerEvents: 'none' }} />
      <Box aria-hidden sx={{ position: 'absolute', bottom: -80, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.28), transparent 70%)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
        <SoftTile T={T}><StarsRoundedIcon /></SoftTile>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h3" noWrap sx={{ fontWeight: 900, fontSize: 17, lineHeight: 1.2, color: T.ink }}>Player card</Typography>
          <Typography noWrap sx={{ fontSize: 12, color: T.muted }}>Tap anyone on the board</Typography>
        </Box>
      </Box>

      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {!isAuthenticated && (
          <SoftNote
            T={T} Icon={EmojiEventsRoundedIcon} title="See where you stand" text="Log in to get your rank and follow friends."
            action={<Button component={RouterLink} to="/login" fullWidth startIcon={<BoltRoundedIcon />} disableElevation sx={{ height: 40, borderRadius: 99, color: '#fff', background: ACCENT, fontWeight: 800, textTransform: 'none', boxShadow: '0 10px 20px -8px rgba(99,102,241,0.85)' }}>Log in</Button>}
          />
        )}

        <MirrorFrame T={T} grad={row ? TIER_GRAD[tierKey] : IDLE_GRAD}>
          {row ? (
            <PlayerFace row={row} points={points} isMe={isMe} learners={learners} topPercent={topPercent} loading={loading} />
          ) : (
            <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', p: 2 }}>
              {loading ? <Skeleton variant="rounded" width="100%" height={220} sx={{ bgcolor: 'rgba(255,255,255,0.18)', borderRadius: '16px' }} /> : (
                <Box>
                  <TagRoundedIcon sx={{ fontSize: 34, color: GOLD }} />
                  <Typography sx={{ fontWeight: 800 }}>No player picked</Typography>
                  <Typography sx={{ fontSize: 12.5, color: SOFT }}>Tap a player on the board to see how they are doing.</Typography>
                </Box>
              )}
            </Box>
          )}
        </MirrorFrame>

        {me && meta?.neighbors
          ? <NextTarget T={T} me={me} neighbors={meta.neighbors} points={points} />
          : isAuthenticated && meta && !meta.me && !loading && (
            <SoftNote T={T} Icon={BoltRoundedIcon} title="Not ranked yet" text={`Solve a question${period === 'all' ? '' : ' in this period'} to enter the leaderboard.`} />
          )}
        {!short && <TierStrip T={T} currentKey={tierKey} />}
      </Box>
    </Box>
  );
}
