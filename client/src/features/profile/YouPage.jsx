import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Chip, CircularProgress, Container, IconButton, Link, Paper, Stack, Tooltip, Typography, alpha } from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { problemsApi } from '../../api/problemsApi';
import { usersApi } from '../../api/usersApi';
import { submissionsApi } from '../../api/submissionsApi';
import SolvedCard from '../../components/SolvedCard';
import ActivityHeatmap from '../../components/ActivityHeatmap';
import ProBadge from '../../components/ProBadge';
import useProblemLists from '../dashboard/useProblemLists';
import { DIFF_COLOR, MONTHLY_BADGE_GOAL, STATUS_COLOR, utcKey } from '../dashboard/dashboardUtils';
import AchievementBadge from './AchievementBadge';

const initialsFromName = (name) =>
  (name || 'U').trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

const timeAgo = (iso) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

// Socials are stored as usernames; a pasted full link also works.
const socialUrl = (base, v) => (/^https?:\/\//i.test(v) ? v : `${base}${v.replace(/^@/, '')}`);

const cardSx = { p: 2, borderRadius: '20px' };

function SectionTitle({ children }) {
  return (
    <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', mb: 1.5 }}>{children}</Typography>
  );
}

function StatTile({ label, value, sub }) {
  return (
    <Paper variant="outlined" sx={{ ...cardSx, p: 1.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: '1.7rem', lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      {sub && (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

// One tappable row (lists and submissions share it).
function Row({ leading, title, subtitle, trailing, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        all: 'unset',
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        py: 1.25,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 0 },
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2, borderRadius: '12px' },
        '&:active': { bgcolor: 'action.hover' },
      }}
    >
      {leading}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
      </Box>
      {trailing ?? <ChevronRightRoundedIcon sx={{ color: 'text.disabled' }} />}
    </Box>
  );
}

export default function YouPage() {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const listsApi = useProblemLists(user?.id);

  const [totals, setTotals] = useState({ Easy: 0, Medium: 0, Hard: 0 });
  const [activity, setActivity] = useState([]);
  const [subs, setSubs] = useState({ items: [], page: 0, total: null, loading: true, error: false });
  const [tab, setTab] = useState('lists');

  useEffect(() => {
    problemsApi.getProgress().then(({ data }) => setTotals(data.data.total)).catch(() => {});
    usersApi.activity().then(({ data }) => setActivity(data.data)).catch(() => {});
    loadSubs(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubs = (page, replace = false) => {
    setSubs((s) => ({ ...s, loading: true, error: false }));
    submissionsApi
      .history({ page, limit: 15 })
      .then(({ data }) => {
        const { items, pagination } = data.data;
        setSubs((s) => ({
          items: replace ? items : [...s.items, ...items],
          page: pagination.page,
          total: pagination.total,
          loading: false,
          error: false,
        }));
      })
      .catch(() => setSubs((s) => ({ ...s, loading: false, error: true })));
  };

  const easy = user?.easySolved ?? 0;
  const medium = user?.mediumSolved ?? 0;
  const hard = user?.hardSolved ?? 0;
  const solved = user?.totalSolved ?? easy + medium + hard;
  const longest = user?.longestStreak ?? 0;

  const now = new Date();
  const monthPrefix = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const activeThisMonth = useMemo(() => activity.filter((a) => a.submissions > 0 && a.date.startsWith(monthPrefix)).length, [activity, monthPrefix]);
  const monthLabel = now.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
  const today = utcKey(now);
  const activeToday = activity.some((a) => a.date === today && a.submissions > 0);

  // Badges are worked out from the stats we already have — nothing extra is stored.
  const badges = [
    { key: 'month', top: monthLabel, value: `${Math.min(activeThisMonth, MONTHLY_BADGE_GOAL)}/${MONTHLY_BADGE_GOAL}`, caption: `${monthLabel} streak`, hint: `Be active on ${MONTHLY_BADGE_GOAL} days this month to earn it`, earned: activeThisMonth >= MONTHLY_BADGE_GOAL },
    ...[1, 10, 50, 100].map((n) => ({
      key: `solved-${n}`,
      top: 'SOLVED',
      value: n,
      caption: n === 1 ? 'First solve' : `${n} solved`,
      hint: solved >= n ? `Solved ${n} problem${n === 1 ? '' : 's'}` : `Solved ${solved}/${n} problems`,
      earned: solved >= n,
    })),
    ...[7, 30].map((n) => ({
      key: `streak-${n}`,
      top: 'STREAK',
      value: n,
      caption: `${n}-day streak`,
      hint: longest >= n ? `Reached a ${n}-day streak` : `Best streak so far: ${longest}/${n} days`,
      earned: longest >= n,
    })),
  ];
  const earnedCount = badges.filter((b) => b.earned).length;

  if (!user) return null;

  const socials = [
    { key: 'github', icon: GitHubIcon, base: 'https://github.com/', label: 'GitHub' },
    { key: 'linkedin', icon: LinkedInIcon, base: 'https://www.linkedin.com/in/', label: 'LinkedIn' },
    { key: 'x', icon: XIcon, base: 'https://x.com/', label: 'X' },
  ].filter((s) => user.socials?.[s.key]);

  return (
    <Container maxWidth="sm" sx={{ pt: { xs: 1, sm: 3 }, pb: 4 }}>
      <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 0.5 }}>
        <Tooltip title="Settings">
          <IconButton component={RouterLink} to="/settings" aria-label="Settings">
            <SettingsRoundedIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* identity */}
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
        <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: 84, height: 84, fontSize: '1.8rem', fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          {initialsFromName(user.name)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.2, wordBreak: 'break-word' }}>{user.name}</Typography>
            {user.isPro && <ProBadge />}
          </Stack>
          <Typography color="text.secondary">@{user.handle}</Typography>
          {user.bio && (
            <Typography variant="body2" sx={{ mt: 0.75 }}>
              {user.bio}
            </Typography>
          )}
        </Box>
      </Stack>

      {(user.location || user.company || user.website || socials.length > 0) && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
          {user.location && <Chip size="small" icon={<PlaceRoundedIcon />} label={user.location} />}
          {user.company && <Chip size="small" icon={<ApartmentRoundedIcon />} label={user.company} />}
          {user.website && (
            <Chip size="small" icon={<LinkRoundedIcon />} label="Website" component="a" href={socialUrl('https://', user.website)} target="_blank" rel="noopener noreferrer" clickable />
          )}
          {socials.map(({ key, icon: Icon, base, label }) => (
            <Tooltip key={key} title={label}>
              <IconButton size="small" component={Link} href={socialUrl(base, user.socials[key])} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <Icon fontSize="small" />
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      )}

      {/* progress */}
      <SolvedCard user={user} isAuthenticated totals={totals} activity={activity} />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
        <StatTile label="Submissions" value={subs.total ?? '–'} sub={activeToday ? 'Active today' : 'None yet today'} />
        <StatTile label="This month" value={`${activeThisMonth} days`} sub={`Goal ${MONTHLY_BADGE_GOAL} days`} />
      </Box>

      {/* the dashboard card hides its grid on phones, so show it here */}
      <Paper variant="outlined" sx={{ ...cardSx, mt: 1.5, display: { xs: 'block', md: 'none' } }}>
        <SectionTitle>Activity</SectionTitle>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ActivityHeatmap data={activity.length ? activity : Array.from({ length: 49 }, (_, i) => ({ day: i, submissions: 0 }))} />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
          Last 7 weeks · submissions per day
        </Typography>
      </Paper>

      {/* achievements */}
      <Paper variant="outlined" sx={{ ...cardSx, mt: 1.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <SectionTitle>Achievements</SectionTitle>
          <Typography variant="caption" color="text.secondary">
            {earnedCount}/{badges.length} earned
          </Typography>
        </Stack>
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, mx: -0.5, px: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {badges.map(({ key, ...b }) => (
            <AchievementBadge key={key} {...b} />
          ))}
        </Box>
      </Paper>

      {/* lists / submissions */}
      <Stack direction="row" spacing={1} sx={{ mt: 2.5, mb: 1 }}>
        {[
          { key: 'lists', label: 'My Lists' },
          { key: 'subs', label: 'Submissions' },
        ].map((t) => (
          <Chip
            key={t.key}
            label={t.label}
            onClick={() => setTab(t.key)}
            color={tab === t.key ? 'primary' : 'default'}
            variant={tab === t.key ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700, px: 0.5, height: 36, borderRadius: 99 }}
          />
        ))}
      </Stack>

      {tab === 'lists' && (
        <Box>
          {listsApi.lists.map((l) => (
            <Row
              key={l.id}
              onClick={() => navigate(`/dashboard?view=list&list=${l.id}`)}
              title={l.name}
              subtitle={`${l.items.length} ${l.items.length === 1 ? 'Question' : 'Questions'}`}
              leading={
                <Box
                  sx={(t) => ({
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: l.id === 'favorite' ? alpha('#F59E0B', 0.16) : alpha(t.palette.primary.main, 0.12),
                    color: l.id === 'favorite' ? '#F59E0B' : 'primary.main',
                  })}
                >
                  {l.id === 'favorite' ? <StarRoundedIcon /> : <FormatListBulletedRoundedIcon />}
                </Box>
              }
            />
          ))}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Star a problem to save it. Lists are kept on this device.
          </Typography>
        </Box>
      )}

      {tab === 'subs' && (
        <Box>
          {subs.items.filter((s) => s.problem?.slug).map((s) => (
            <Row
              key={s._id}
              onClick={() => navigate(`/workspace/${s.problem.slug}`)}
              title={s.problem.title}
              subtitle={
                <>
                  <Box component="span" sx={{ color: DIFF_COLOR[s.problem.difficulty], fontWeight: 700 }}>
                    {s.problem.difficulty}
                  </Box>
                  {` · ${timeAgo(s.createdAt)}`}
                </>
              }
              trailing={
                <Typography variant="caption" sx={{ fontWeight: 800, color: STATUS_COLOR[s.status] || 'text.secondary', textAlign: 'right', maxWidth: 96 }}>
                  {s.status}
                </Typography>
              }
            />
          ))}

          {subs.loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!subs.loading && subs.error && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Couldn’t load submissions.
              </Typography>
              <Button onClick={() => loadSubs(Math.max(1, subs.page + 1), subs.page === 0)}>Retry</Button>
            </Box>
          )}

          {!subs.loading && !subs.error && subs.items.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ fontWeight: 700 }}>No submissions yet</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Solve your first problem and it shows up here.
              </Typography>
              <Button component={RouterLink} to="/problems" variant="contained" disableElevation>
                Browse problems
              </Button>
            </Box>
          )}

          {!subs.loading && !subs.error && subs.total !== null && subs.items.length < subs.total && (
            <Box sx={{ textAlign: 'center', pt: 1.5 }}>
              <Button onClick={() => loadSubs(subs.page + 1)}>Load more</Button>
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
