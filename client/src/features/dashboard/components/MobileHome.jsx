import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import { problemsApi } from '../../../api/problemsApi';
import CompanyAvatar from '../../../components/CompanyAvatar';
import { fetchPatterns } from '../../aptitude/aptitudeSlice';
import { fmtDate, useContest } from '../../contest/contestUtils';
import { CATEGORY_GROUPS, DIFF_COLOR, tint } from '../dashboardUtils';
import PromoCarousel from './PromoCarousel';
import NqtExploreCard from './NqtExploreCard';

// Phone home screen: every section is a swipeable row; the page itself only scrolls vertically.

const MAX_TAGS = 30;
const MAX_COMPANIES = 18;
const MAX_LEVELS = 12;

const scrollRow = {
  display: 'flex',
  gap: 1.25,
  overflowX: 'auto',
  mx: -1.75,
  px: 1.75,
  pb: 0.5,
  scrollSnapType: 'x proximity',
  scrollPaddingLeft: '14px',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

// Each home section has its own accent colour and icon, so Practice, Aptitude, Topics and
// Companies are easy to tell apart at a glance.
const ACCENT = { practice: '#6366F1', aptitude: '#F97316', topics: '#A855F7', companies: '#14B8A6' };

const TAG_COLOR = Object.fromEntries(CATEGORY_GROUPS.flatMap((g) => g.tags.map((t) => [t, g.color])));

function SectionPanel({ accent, icon: Icon, title, sub, to, children }) {
  return (
    <Box
      component="section"
      aria-label={title}
      sx={(t) => ({
        borderRadius: '26px',
        p: 1.75,
        background: `linear-gradient(160deg, ${tint(accent, t.palette.mode === 'dark' ? 20 : 15)} 0%, ${tint(accent, 4)} 62%, transparent 100%)`,
        border: `1px solid ${tint(accent, 24)}`,
      })}
    >
      <Box
        component={RouterLink}
        to={to}
        aria-label={`Open ${title}`}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.75, color: 'inherit', textDecoration: 'none' }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '15px',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            color: '#fff',
            background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`,
            boxShadow: `0 8px 18px -8px ${accent}`,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          <Typography noWrap variant="caption" color="text.secondary">
            {sub}
          </Typography>
        </Box>
        <ChevronRightRoundedIcon sx={{ color: 'text.secondary' }} />
      </Box>
      {children}
    </Box>
  );
}

// Large tile used by the Practice and Aptitude rows. `progress` (0 to 1) draws a thin bar.
function Tile({ to, color, icon: Icon, label, sub, progress, badge, width = 'min(44vw, 188px)', dim = false }) {
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={(t) => ({
        flex: '0 0 auto',
        width,
        minHeight: 138,
        p: 1.75,
        borderRadius: '20px',
        scrollSnapAlign: 'start',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: t.palette.text.primary,
        opacity: dim ? 0.78 : 1,
        bgcolor: t.palette.background.paper,
        backgroundImage: `linear-gradient(150deg, ${tint(color, t.palette.mode === 'dark' ? 22 : 14)}, transparent 70%)`,
        border: `1px solid ${tint(color, 30)}`,
        boxShadow: t.palette.mode === 'dark' ? 'none' : '0 10px 22px -16px rgba(15,23,42,0.35)',
      })}
    >
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ width: 42, height: 42, borderRadius: '14px', display: 'grid', placeItems: 'center', bgcolor: tint(color, 20), color }}>
          <Icon sx={{ fontSize: 24 }} />
        </Box>
        {badge && (
          <Typography sx={{ px: 1, py: 0.25, borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, color, bgcolor: tint(color, 16) }}>{badge}</Typography>
        )}
      </Box>
      <Box sx={{ minWidth: 0, width: '100%', mt: 1.5 }}>
        <Typography
          sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {label}
        </Typography>
        {sub && (
          <Typography noWrap variant="body2" color="text.secondary" sx={{ mt: 0.4, fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
            {sub}
          </Typography>
        )}
        {progress != null && (
          <Box sx={{ mt: 1, height: 5, borderRadius: 99, bgcolor: tint(color, 20), overflow: 'hidden' }}>
            <Box sx={{ width: `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`, height: '100%', borderRadius: 99, bgcolor: color }} />
          </Box>
        )}
      </Box>
    </ButtonBase>
  );
}

// Phone-only banner colours: deeper, richer gradients (the wide-screen cards keep their own).
const BANNER_GRADIENT = {
  contest: 'linear-gradient(135deg,#F97316,#9A3412)',
  daily: 'linear-gradient(135deg,#7C3AED,#2E1065)',
  prep: 'linear-gradient(135deg,#0D9488,#134E4A)',
  pro: 'linear-gradient(135deg,#F59E0B,#78350F)',
  aptitude: 'linear-gradient(135deg,#DB2777,#4C1D95)',
  visualizer: 'linear-gradient(135deg,#2563EB,#1E1B4B)',
};

const problemsUrl = (key, value) => `/problems?${new URLSearchParams({ [key]: value }).toString()}`;

export default function MobileHome({ cards, progress, isAuthenticated, nqtDismissed, onDismissNqt }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { contest } = useContest();
  const { patterns, patternsStatus } = useSelector((s) => s.aptitude);
  const [tags, setTags] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setTags(data.data.items.slice(0, MAX_TAGS))).catch(() => {});
    problemsApi.getCompanies().then(({ data }) => setCompanies(data.data.items.slice(0, MAX_COMPANIES))).catch(() => {});
  }, []);

  useEffect(() => {
    if (patternsStatus === 'idle') dispatch(fetchPatterns());
  }, [dispatch, patternsStatus]);

  const banners = useMemo(() => {
    const styled = cards.map((c) => ({ ...c, gradient: BANNER_GRADIENT[c.key] || c.gradient }));
    if (!contest) return styled;
    const upcoming = contest.status === 'upcoming';
    return [
      {
        key: 'contest',
        title: contest.title,
        text: upcoming ? `Starts ${fmtDate(contest.startsAt)}` : 'View the contest details and standings.',
        cta: 'View contest',
        to: '/dashboard?view=contest',
        icon: EmojiEventsRoundedIcon,
        gradient: BANNER_GRADIENT.contest,
      },
      ...styled,
    ];
  }, [contest, cards]);

  const total = progress?.total || { Easy: 0, Medium: 0, Hard: 0 };
  const solved = progress?.solved || { Easy: 0, Medium: 0, Hard: 0 };
  const totalAll = total.Easy + total.Medium + total.Hard;
  const solvedAll = solved.Easy + solved.Medium + solved.Hard;

  const levels = patterns.slice(0, MAX_LEVELS);

  return (
    <Stack spacing={3}>
      <PromoCarousel cards={banners} />

      {!nqtDismissed && (
        <Box sx={{ '& a': { mb: 0 } }}>
          <NqtExploreCard onDismiss={onDismissNqt} />
        </Box>
      )}

      <SectionPanel accent={ACCENT.practice} icon={CodeRoundedIcon} title="Practice" sub="Coding problems by difficulty" to="/problems">
        <Box sx={scrollRow}>
          <Tile to="/problems" color="#6366F1" icon={LibraryBooksRoundedIcon} label="All problems" sub={progress ? `${solvedAll}/${totalAll} solved` : undefined} progress={progress && totalAll ? solvedAll / totalAll : undefined} />
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <Tile
              key={d}
              to={problemsUrl('difficulty', d)}
              color={DIFF_COLOR[d]}
              icon={CheckCircleOutlineRoundedIcon}
              label={d}
              sub={progress ? `${solved[d]}/${total[d]} solved` : undefined}
              progress={progress && total[d] ? solved[d] / total[d] : undefined}
            />
          ))}
          <Tile to="/dashboard?view=list&list=favorite" color="#F59E0B" icon={StarRoundedIcon} label="Favorites" sub="Saved problems" />
        </Box>
      </SectionPanel>

      {levels.length > 0 && (
        <SectionPanel accent={ACCENT.aptitude} icon={CalculateRoundedIcon} title="Aptitude" sub="Learn, practice and take timed tests" to="/aptitude">
          <Box sx={scrollRow}>
            {levels.map((p, i) => {
              const best = Math.round(p.progress?.bestScore ?? 0);
              const cleared = best >= p.passPercentage;
              const unlocked = Boolean(p.progress?.unlocked);
              const sub = cleared ? 'Cleared' : unlocked ? (best ? `Best ${best}%` : 'Ready to start') : 'Locked';
              return (
                <Tile
                  key={p.slug}
                  to={`/aptitude/${p.slug}`}
                  color={cleared ? '#10B981' : ACCENT.aptitude}
                  icon={unlocked || cleared ? CalculateRoundedIcon : LockRoundedIcon}
                  label={p.title}
                  sub={sub}
                  badge={`Level ${i + 1}`}
                  progress={unlocked || cleared ? best / 100 : undefined}
                  dim={!unlocked && !cleared}
                  width="min(58vw, 232px)"
                />
              );
            })}
          </Box>
        </SectionPanel>
      )}

      {tags.length > 0 && (
        <SectionPanel accent={ACCENT.topics} icon={SellRoundedIcon} title="Topics" sub="Browse problems by topic" to="/problems">
          <Box sx={scrollRow}>
            <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(3, auto)', gridAutoFlow: 'column', gridAutoColumns: 'max-content', gap: 1.1, justifyItems: 'start' }}>
              {tags.map(({ tag }) => {
                const c = TAG_COLOR[tag] || ACCENT.topics;
                return (
                  <ButtonBase
                    key={tag}
                    onClick={() => navigate(problemsUrl('tag', tag))}
                    sx={(t) => ({
                      px: 2,
                      py: 1.25,
                      gap: 1,
                      borderRadius: 999,
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap',
                      color: t.palette.text.primary,
                      bgcolor: t.palette.background.paper,
                      border: `1px solid ${tint(c, 34)}`,
                    })}
                  >
                    <Box aria-hidden sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: c }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{tag}</Typography>
                  </ButtonBase>
                );
              })}
            </Box>
          </Box>
        </SectionPanel>
      )}

      {companies.length > 0 && (
        <SectionPanel accent={ACCENT.companies} icon={BusinessRoundedIcon} title="Companies" sub="Questions asked by each company" to="/prep">
          <Box sx={scrollRow}>
            <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(2, auto)', gridAutoFlow: 'column', gridAutoColumns: 'min(68vw, 260px)', gap: 1.25 }}>
              {companies.map(({ company, count }) => (
                <ButtonBase
                  key={company}
                  onClick={() => navigate(problemsUrl('company', company))}
                  sx={(t) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    color: 'text.primary',
                    minWidth: 0,
                    borderRadius: '20px',
                    scrollSnapAlign: 'start',
                    bgcolor: t.palette.background.paper,
                    border: `1px solid ${tint(ACCENT.companies, 28)}`,
                  })}
                >
                  <CompanyAvatar name={company} size={54} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {company}
                    </Typography>
                    <Typography noWrap variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', fontVariantNumeric: 'tabular-nums' }}>
                      {count.toLocaleString('en-IN')} {count === 1 ? 'Question' : 'Questions'}
                    </Typography>
                  </Box>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        </SectionPanel>
      )}
    </Stack>
  );
}
