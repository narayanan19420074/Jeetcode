import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Alert, Avatar, Box, ButtonBase, Button, Collapse, InputAdornment, Pagination, Skeleton, Stack, Tab, Tabs, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { leaderboardApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, surface } from '../dashboard/dashboardUtils';
import { CountUp, Rise } from '../studyplan/motion';
import { TIERS, tierFor } from './tiers';

const LIMIT = 25;
const MEDAL = { 1: '#F59E0B', 2: '#94A3B8', 3: '#B45309' };
const PERIODS = [['all', 'All time'], ['week', 'This week'], ['month', 'This month']];
const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };
const GRID = { xs: '44px minmax(0,1fr) 84px', sm: '64px minmax(0,1fr) 150px 64px 64px 88px', md: '64px minmax(0,1fr) 170px 64px 70px 96px' };

function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

function TierBadge({ tier, small }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4, color: tier.color, fontWeight: 700, fontSize: small ? 12 : 14 }}>
      <WorkspacePremiumRoundedIcon sx={{ fontSize: small ? 16 : 20 }} />{tier.name}
    </Box>
  );
}

function Movement({ row }) {
  if (row.isNew) return <Typography component="span" sx={{ fontSize: 10, fontWeight: 800, color: 'info.main' }}>NEW</Typography>;
  if (!row.movement) return <Box component="span" sx={{ color: 'text.disabled', fontSize: 12 }}>–</Box>;
  const up = row.movement > 0;
  const Icon = up ? ArrowDropUpRoundedIcon : ArrowDropDownRoundedIcon;
  return (
    <Tooltip title={`${up ? 'Up' : 'Down'} ${Math.abs(row.movement)} since last week`}>
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: up ? 'success.main' : 'error.main', fontSize: 12, fontWeight: 700, ...mono }}>
        <Icon sx={{ fontSize: 20, mx: -0.5 }} />{Math.abs(row.movement)}
      </Box>
    </Tooltip>
  );
}

function Stat({ index, label, children, sub }) {
  return (
    <Rise index={index}>
      <Box sx={[surface, { p: 2, height: '100%' }]}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>{label.toUpperCase()}</Typography>
        <Typography sx={[{ fontSize: 26, fontWeight: 700, lineHeight: 1.25 }, mono]}>{children}</Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </Box>
    </Rise>
  );
}

function MyPosition({ me, total, scope, neighbors, onJump }) {
  const reduce = useReducedMotion();
  const { tier, next, progress, toNext } = tierFor(me.score);
  return (
    <Rise>
      <Box sx={[surface, { p: 2.5 }]}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>YOUR RANK</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography sx={[{ fontSize: 44, fontWeight: 700, lineHeight: 1 }, mono]}>#<CountUp value={me.rank} /></Typography>
              <Movement row={me} />
            </Box>
            <Typography variant="caption" color="text.secondary">of {total.toLocaleString()} {scope === 'friends' ? 'in your circle' : 'learners'}</Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
              <TierBadge tier={tier} />
              <Typography sx={[{ fontWeight: 700 }, mono]}><CountUp value={me.score} /> pts</Typography>
            </Box>
            <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
              <motion.div initial={reduce ? false : { width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.9, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 4, background: tier.color }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {next ? `${toNext.toLocaleString()} pts to ${next.name}` : 'Top tier reached'}
              {neighbors?.above ? ` · ${neighbors.above.gap + 1} pts to pass @${neighbors.above.handle}` : ''}
              {neighbors?.below ? ` · ${neighbors.below.gap} pts ahead of @${neighbors.below.handle}` : ''}
            </Typography>
          </Box>

          <Button size="small" variant="outlined" startIcon={<MyLocationRoundedIcon />} onClick={onJump} sx={{ fontWeight: 700 }}>Find me</Button>
        </Box>
      </Box>
    </Rise>
  );
}

function Podium({ podium }) {
  const reduce = useReducedMotion();
  const slots = [{ row: podium[1], place: 2, lift: 14 }, { row: podium[0], place: 1, lift: 0 }, { row: podium[2], place: 3, lift: 26 }];
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: { xs: 1, sm: 2 }, alignItems: 'start' }}>
      {slots.map(({ row, place, lift }) => {
        if (!row) return <Box key={place} />;
        const { tier } = tierFor(row.score);
        return (
          <motion.div key={place} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: lift }} transition={{ duration: 0.45, delay: place === 1 ? 0.05 : place === 2 ? 0.15 : 0.25, ease: 'easeOut' }}>
            <Box sx={[surface, { p: { xs: 1.25, sm: 2 }, textAlign: 'center', borderTop: `3px solid ${MEDAL[place]}` }]}>
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar src={row.avatarUrl || undefined} sx={{ width: place === 1 ? 64 : 52, height: place === 1 ? 64 : 52, fontSize: 22, fontWeight: 700, border: `2px solid ${MEDAL[place]}` }}>{row.name?.[0]?.toUpperCase()}</Avatar>
                <Box sx={{ position: 'absolute', right: -6, bottom: -4, width: 22, height: 22, borderRadius: '50%', bgcolor: MEDAL[place], color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>{place}</Box>
              </Box>
              <Typography noWrap sx={{ fontWeight: 700, mt: 1, fontSize: 14 }}>{row.name}</Typography>
              <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block' }}>@{row.handle}</Typography>
              <Typography sx={[{ fontWeight: 700, fontSize: 20, mt: 0.5 }, mono]}><CountUp value={row.score} /></Typography>
              <TierBadge tier={tier} small />
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
}

const METRICS = [['score', 'Score'], ['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard'], ['aptitude', 'Aptitude'], ['streak', 'Streak']];

// Inline detail (no popup): breakdown for this learner, plus a head-to-head against you.
function RowDetail({ row, me }) {
  const reduce = useReducedMotion();
  const max = Math.max(1, row.easy, row.medium, row.hard, row.aptitude);
  const bars = [['Easy', row.easy, DIFF_COLOR.Easy], ['Medium', row.medium, DIFF_COLOR.Medium], ['Hard', row.hard, DIFF_COLOR.Hard], ['Aptitude', row.aptitude, '#8B5CF6']];
  const versus = me && me.userId !== row.userId;
  return (
    <Box sx={(t) => ({ px: 2, py: 1.5, bgcolor: t.palette.action.hover, display: 'grid', gap: 3, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: versus ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr)' } })}>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.4 }} color="text.secondary">SOLVED BY DIFFICULTY</Typography>
        {bars.map(([label, v, color]) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
            <Typography variant="caption" sx={{ width: 62 }}>{label}</Typography>
            <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'divider', overflow: 'hidden' }}>
              <motion.div initial={reduce ? false : { width: 0 }} animate={{ width: `${(v / max) * 100}%` }} transition={{ duration: 0.5 }} style={{ height: '100%', background: color, borderRadius: 3 }} />
            </Box>
            <Typography variant="caption" sx={[{ width: 30, textAlign: 'right', fontWeight: 700 }, mono]}>{v}</Typography>
          </Box>
        ))}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {row.recent} solved in the last 7 days{row.company ? ` · ${row.company}` : ''}
        </Typography>
      </Box>

      {versus && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.4 }} color="text.secondary">YOU VS @{row.handle.toUpperCase()}</Typography>
          {METRICS.map(([k, label]) => {
            const a = me[k] ?? 0;
            const b = row[k] ?? 0;
            return (
              <Box key={k} sx={{ display: 'grid', gridTemplateColumns: '1fr 70px 1fr', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" sx={[{ textAlign: 'right', fontWeight: a > b ? 800 : 500, color: a > b ? 'success.main' : 'text.primary' }, mono]}>{a.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>{label}</Typography>
                <Typography variant="caption" sx={[{ fontWeight: b > a ? 800 : 500, color: b > a ? 'error.main' : 'text.primary' }, mono]}>{b.toLocaleString()}</Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default function LeaderboardView({ isAuthenticated }) {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState('all');
  const [scope, setScope] = useState('global');
  const [track, setTrack] = useState('overall');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const q = useDebounced(search);
  const jumping = useRef(false);

  useEffect(() => { setPage(1); }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    leaderboardApi
      .get({ period, scope, track, q: q || undefined, page, limit: LIMIT })
      .then(({ data: res }) => { if (!cancelled) { setData(res.data); setError(''); } })
      .catch((err) => { if (!cancelled) setError(extractErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [period, scope, track, q, page]);

  // "Find me": jump to my page, then bring my row into view.
  useEffect(() => {
    if (jumping.current && data && !loading) {
      jumping.current = false;
      document.getElementById('lb-me')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  }, [data, loading, reduce]);

  const jumpToMe = () => {
    if (!data?.me) return;
    jumping.current = true;
    setSearch('');
    setPage(Math.max(1, Math.ceil(data.me.rank / LIMIT)));
  };

  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;
  const myTier = useMemo(() => (data?.me ? tierFor(data.me.score).tier.key : null), [data?.me]);
  const points = data?.points || { easy: 10, medium: 20, hard: 40, aptitude: 5 };
  const searching = Boolean(q);

  const change = (setter) => (_, v) => { if (v) { setter(v); setPage(1); setOpen(null); } };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Leaderboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Easy {points.easy} · Medium {points.medium} · Hard {points.hard} · Aptitude {points.aptitude} points. Each question counts once.
        </Typography>
      </Box>

      <Box sx={[surface, { px: 2, pt: 0.5, pb: 1.5 }]}>
        <Tabs value={period} onChange={change(setPeriod)} sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 700 } }}>
          {PERIODS.map(([v, l]) => <Tab key={v} value={v} label={l} />)}
        </Tabs>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mt: 1 }}>
          <ToggleButtonGroup size="small" exclusive value={track} onChange={change(setTrack)}>
            {[['overall', 'Overall'], ['coding', 'Coding'], ['aptitude', 'Aptitude']].map(([v, l]) => <ToggleButton key={v} value={v} sx={{ px: 1.75, fontWeight: 600 }}>{l}</ToggleButton>)}
          </ToggleButtonGroup>
          <ToggleButtonGroup size="small" exclusive value={scope} onChange={change(setScope)}>
            <ToggleButton value="global" sx={{ px: 1.75, fontWeight: 600 }}>Global</ToggleButton>
            <ToggleButton value="friends" disabled={!isAuthenticated} sx={{ px: 1.75, fontWeight: 600 }}>Friends</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            size="small" placeholder="Search name or @handle" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ml: { sm: 'auto' }, minWidth: { xs: '100%', sm: 240 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }, htmlInput: { 'aria-label': 'Search learners' } }}
          />
        </Box>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {isAuthenticated && data?.me && <MyPosition key={`${period}${scope}${track}`} me={data.me} total={data.stats.learners} scope={scope} neighbors={data.neighbors} onJump={jumpToMe} />}
      {isAuthenticated && data && !data.me && (
        <Box sx={[surface, { p: 2 }]}><Typography color="text.secondary">Solve a question {period === 'all' ? '' : 'in this period '}to enter the leaderboard.</Typography></Box>
      )}

      {data?.stats ? (
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', md: 'repeat(4, minmax(0,1fr))' } }}>
          <Stat index={0} label="Learners ranked"><CountUp value={data.stats.learners} /></Stat>
          <Stat index={1} label="Questions solved"><CountUp value={data.stats.solved} /></Stat>
          <Stat index={2} label="Top score"><CountUp value={data.stats.topScore} /></Stat>
          <Stat index={3} label="Your standing" sub={data.stats.topPercent ? 'of all ranked learners' : undefined}>{data.stats.topPercent ? <>Top <CountUp value={data.stats.topPercent} />%</> : '—'}</Stat>
        </Box>
      ) : loading && <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' } }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={84} sx={{ borderRadius: '14px' }} />)}</Box>}

      {data && data.podium.length > 0 && !searching && page === 1 && <Podium key={`${period}${scope}${track}`} podium={data.podium} />}

      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: 'repeat(3, minmax(0,1fr))', md: 'repeat(6, minmax(0,1fr))' } }}>
        {TIERS.map((t, i) => (
          <Rise key={t.key} index={i}>
            <Box sx={[surface, { p: 1.25, textAlign: 'center', borderColor: myTier === t.key ? t.color : undefined }]}>
              <WorkspacePremiumRoundedIcon sx={{ color: t.color, fontSize: 26 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{t.name}</Typography>
              <Typography variant="caption" color="text.secondary" sx={mono}>{t.min.toLocaleString()}+</Typography>
            </Box>
          </Rise>
        ))}
      </Box>

      {/* Ranking table */}
      <Box sx={[surface, { overflow: 'hidden' }]}>
        <Box sx={(t) => ({ display: 'grid', gridTemplateColumns: GRID, gap: 1, px: 2, py: 1, borderBottom: `1px solid ${t.palette.divider}`, color: 'text.secondary' })}>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>RANK</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800 }}>LEARNER</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>E · M · H · APT</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>7 DAYS</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, textAlign: 'center', display: { xs: 'none', sm: 'block' } }}>STREAK</Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, textAlign: 'right' }}>SCORE</Typography>
        </Box>

        <Box sx={{ opacity: loading && data ? 0.5 : 1, transition: 'opacity .2s' }}>
          {!data && loading && [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} height={56} sx={{ mx: 2 }} />)}
          {data?.rows.map((r, i) => {
            const isMe = data.me?.userId === r.userId;
            const { tier } = tierFor(r.score);
            const expanded = open === r.userId;
            return (
              <motion.div key={r.userId} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.025, duration: 0.2 }}>
                <ButtonBase
                  id={isMe ? 'lb-me' : undefined} onClick={() => setOpen(expanded ? null : r.userId)} aria-expanded={expanded}
                  sx={(t) => ({
                    width: '100%', display: 'grid', gridTemplateColumns: GRID, gap: 1, alignItems: 'center', textAlign: 'left', px: 2, py: 1, fontFamily: 'inherit',
                    borderBottom: `1px solid ${t.palette.divider}`, bgcolor: isMe ? `${t.palette.primary.main}14` : 'transparent', boxShadow: isMe ? `inset 3px 0 0 ${t.palette.primary.main}` : 'none',
                    '&:hover': { bgcolor: isMe ? undefined : t.palette.action.hover },
                  })}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    {MEDAL[r.rank] ? <EmojiEventsRoundedIcon sx={{ color: MEDAL[r.rank], fontSize: 20 }} /> : <Typography sx={[{ fontWeight: 700, minWidth: 22 }, mono]}>{r.rank}</Typography>}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}><Movement row={r} /></Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                    <Avatar src={r.avatarUrl || undefined} sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 700 }}>{r.name?.[0]?.toUpperCase()}</Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" noWrap sx={{ fontWeight: 700, lineHeight: 1.25 }}>{r.name}{isMe ? ' (you)' : ''}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>@{r.handle} · <Box component="span" sx={{ color: tier.color, fontWeight: 700 }}>{tier.name}</Box></Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', display: { xs: 'none', sm: 'flex' } }}>
                    {[[r.easy, DIFF_COLOR.Easy], [r.medium, DIFF_COLOR.Medium], [r.hard, DIFF_COLOR.Hard], [r.aptitude, '#8B5CF6']].map(([v, c], k) => (
                      <Typography key={k} component="span" sx={[{ minWidth: 28, textAlign: 'center', fontSize: 12, fontWeight: 700, py: 0.1, borderRadius: 999, color: c, bgcolor: `${c}1A` }, mono]}>{v}</Typography>
                    ))}
                  </Stack>
                  <Typography variant="caption" sx={[{ textAlign: 'center', fontWeight: 700, color: r.recent ? 'success.main' : 'text.disabled', display: { xs: 'none', sm: 'block' } }, mono]}>{r.recent ? `+${r.recent}` : '0'}</Typography>
                  <Box sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', alignItems: 'center', gap: 0.25 }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16, color: r.streak ? 'warning.main' : 'text.disabled' }} />
                    <Typography variant="caption" sx={[{ fontWeight: 700 }, mono]}>{r.streak}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
                    <Typography sx={[{ fontWeight: 700 }, mono]}>{r.score.toLocaleString()}</Typography>
                    <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: 'text.disabled', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                  </Box>
                </ButtonBase>
                <Collapse in={expanded} unmountOnExit><RowDetail row={r} me={data.me} /></Collapse>
              </motion.div>
            );
          })}
          {data && data.rows.length === 0 && (
            <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
              {searching ? `No learner matches "${q}".` : scope === 'friends' ? 'Join a friend’s study plan and they will show up here.' : 'No one has scored in this period yet. Be the first.'}
            </Typography>
          )}
        </Box>
      </Box>

      {pages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center' }}><Pagination count={pages} page={page} onChange={(_, v) => { setPage(v); setOpen(null); }} /></Box>}
      {data?.updatedAt && <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>Updated {new Date(data.updatedAt).toLocaleTimeString()} · refreshes every few minutes · rank change compares with last week</Typography>}
    </Stack>
  );
}
