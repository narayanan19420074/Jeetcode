import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, ButtonBase, Chip, CircularProgress, IconButton, Link, Stack, Typography, alpha } from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import BackToDashboard from '../../components/BackToDashboard';
import ActivityHeatmap from '../../components/ActivityHeatmap';
import ProBadge from '../../components/ProBadge';
import { DIFF_COLOR, MONTHLY_BADGE_GOAL, STATUS_COLOR, tint } from '../dashboard/dashboardUtils';
import AchievementBadge from './AchievementBadge';

// Phone layout of the You page. It follows the phone Problems and Dashboard pages (MobileProblems,
// MobileHome): same page padding, 44px icon buttons, centred header, 1.25rem section titles,
// divider-separated rows and the same type sizes. There is no top navigation bar on phones.

const ACCENT = '#6366F1';
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const EMPTY_HEATMAP = Array.from({ length: 49 }, (_, i) => ({ day: i, submissions: 0 }));

const scrollRow = {
  display: 'flex',
  gap: 1,
  overflowX: 'auto',
  mx: -1.75,
  px: 1.75,
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

function SectionTitle({ children, aside }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
        {children}
      </Typography>
      {aside && (
        <Typography variant="caption" color="text.secondary">
          {aside}
        </Typography>
      )}
    </Stack>
  );
}

// One tappable row. Lists and submissions share it (same look as the Problems rows).
function Row({ leading, title, subtitle, trailing, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 1.5,
        py: 1.5,
        pl: 0.5,
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      {leading}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.35 }}>
          {title}
        </Typography>
        <Typography noWrap variant="body2" color="text.secondary" sx={{ mt: 0.4, fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
          {subtitle}
        </Typography>
      </Box>
      {trailing ?? <ChevronRightRoundedIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />}
    </ButtonBase>
  );
}

export default function MobileYou({ user, initials, socials, socialUrl, totals, activity, subs, onLoadSubs, listsApi, badges, earnedCount, activeThisMonth, tab, onTab, timeAgo }) {
  const navigate = useNavigate();

  const solvedBy = { Easy: user.easySolved ?? 0, Medium: user.mediumSolved ?? 0, Hard: user.hardSolved ?? 0 };
  const totalAll = totals.Easy + totals.Medium + totals.Hard;
  const solvedAll = user.totalSolved ?? solvedBy.Easy + solvedBy.Medium + solvedBy.Hard;
  const hasMeta = user.location || user.company || user.website || socials.length > 0;

  return (
    <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      {/* Back + settings */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />
        <IconButton
          component={RouterLink}
          to="/settings"
          aria-label="Settings"
          sx={(t) => ({ width: 44, height: 44, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9), color: ACCENT })}
        >
          <SettingsRoundedIcon />
        </IconButton>
      </Stack>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Avatar
          src={user.avatarUrl || undefined}
          alt=""
          sx={{ width: 84, height: 84, mx: 'auto', fontSize: '1.8rem', fontWeight: 800, bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: `0 14px 26px -12px ${ACCENT}` }}
        >
          {initials}
        </Avatar>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', mt: 1.75 }}>
          <Typography component="h1" noWrap sx={{ fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em', minWidth: 0 }}>
            {user.name}
          </Typography>
          {user.isPro && <ProBadge />}
        </Stack>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          @{user.handle}
        </Typography>
        {user.bio && (
          <Typography variant="body2" sx={{ mt: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {user.bio}
          </Typography>
        )}
        {hasMeta && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center', justifyContent: 'center', mt: 1.5 }}>
            {user.location && <Chip size="small" icon={<PlaceRoundedIcon />} label={user.location} />}
            {user.company && <Chip size="small" icon={<ApartmentRoundedIcon />} label={user.company} />}
            {user.website && (
              <Chip size="small" icon={<LinkRoundedIcon />} label="Website" component="a" href={socialUrl('https://', user.website)} target="_blank" rel="noopener noreferrer" clickable />
            )}
            {socials.map(({ key, icon: Icon, base, label }) => (
              <IconButton key={key} component={Link} href={socialUrl(base, user.socials[key])} target="_blank" rel="noopener noreferrer" aria-label={label} sx={{ width: 40, height: 40 }}>
                <Icon fontSize="small" />
              </IconButton>
            ))}
          </Stack>
        )}
      </Box>

      {/* Progress */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2.5 }}>
        <Box
          role="progressbar"
          aria-label="Problems solved"
          aria-valuemin={0}
          aria-valuemax={totalAll}
          aria-valuenow={solvedAll}
          sx={{ flex: 1, maxWidth: 260, height: 8, borderRadius: 99, bgcolor: tint(ACCENT, 20), overflow: 'hidden' }}
        >
          <Box sx={{ width: `${totalAll ? Math.min((solvedAll / totalAll) * 100, 100) : 0}%`, height: '100%', borderRadius: 99, bgcolor: ACCENT, transition: 'width .5s' }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {solvedAll}
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            /{totalAll ? totalAll.toLocaleString('en-IN') : '–'}
          </Box>
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, mt: 2 }}>
        {DIFFICULTIES.map((d) => (
          <Box key={d} sx={{ p: 1.5, borderRadius: '20px', textAlign: 'center', bgcolor: tint(DIFF_COLOR[d], 14) }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: DIFF_COLOR[d] }}>{d}</Typography>
            <Typography sx={{ mt: 0.25, fontWeight: 800, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
              {solvedBy[d]}
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                /{totals[d]}
              </Box>
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Activity */}
      <Box sx={{ mt: 3.5 }}>
        <SectionTitle>Activity</SectionTitle>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <ActivityHeatmap data={activity.length ? activity : EMPTY_HEATMAP} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.82rem', mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
          {subs.total ?? '–'} submissions · {activeThisMonth}/{MONTHLY_BADGE_GOAL} active days this month
        </Typography>
      </Box>

      {/* Achievements */}
      <Box sx={{ mt: 3.5 }}>
        <SectionTitle aside={`${earnedCount}/${badges.length} earned`}>Achievements</SectionTitle>
        <Box sx={scrollRow}>
          {badges.map(({ key, ...b }) => (
            <AchievementBadge key={key} {...b} />
          ))}
        </Box>
      </Box>

      {/* Lists / submissions */}
      <Stack direction="row" spacing={1} sx={{ mt: 3.5, mb: 1.5 }}>
        {[
          { key: 'lists', label: 'My Lists' },
          { key: 'subs', label: 'Submissions' },
        ].map((t) => (
          <ButtonBase
            key={t.key}
            onClick={() => onTab(t.key)}
            aria-pressed={tab === t.key}
            sx={{
              height: 40,
              px: 2.25,
              borderRadius: 999,
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: tab === t.key ? '#fff' : 'text.primary',
              bgcolor: tab === t.key ? ACCENT : tint(ACCENT, 12),
            }}
          >
            {t.label}
          </ButtonBase>
        ))}
      </Stack>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        {tab === 'lists' && (
          <>
            {listsApi.lists.map((l) => (
              <Row
                key={l.id}
                onClick={() => navigate(`/dashboard?view=list&list=${l.id}`)}
                title={l.name}
                subtitle={`${l.items.length} ${l.items.length === 1 ? 'Question' : 'Questions'}`}
                leading={
                  <Box
                    sx={(t) => ({
                      width: 48,
                      height: 48,
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
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Star a problem to save it. Lists are kept on this device.
            </Typography>
          </>
        )}

        {tab === 'subs' && (
          <>
            {subs.items
              .filter((s) => s.problem?.slug)
              .map((s) => (
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
                    <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: STATUS_COLOR[s.status] || 'text.secondary', textAlign: 'right', maxWidth: 96 }}>
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
                <Button onClick={() => onLoadSubs(Math.max(1, subs.page + 1), subs.page === 0)} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                  Retry
                </Button>
              </Box>
            )}

            {!subs.loading && !subs.error && subs.items.length === 0 && (
              <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 800 }}>No submissions yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Solve your first problem and it shows up here.
                </Typography>
                <Button component={RouterLink} to="/problems" variant="outlined" sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                  Browse problems
                </Button>
              </Box>
            )}

            {!subs.loading && !subs.error && subs.total !== null && subs.items.length < subs.total && (
              <Box sx={{ textAlign: 'center', pt: 1.5 }}>
                <Button onClick={() => onLoadSubs(subs.page + 1)} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                  Load more
                </Button>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
