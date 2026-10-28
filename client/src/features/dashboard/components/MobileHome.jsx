import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Stack, Typography, alpha } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import { problemsApi } from '../../../api/problemsApi';
import CompanyAvatar from '../../../components/CompanyAvatar';
import { fetchPatterns } from '../../aptitude/aptitudeSlice';
import { fmtDate, useContest } from '../../contest/contestUtils';
import { DIFF_COLOR, tint } from '../dashboardUtils';
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
  mx: -1.5,
  px: 1.5,
  pb: 0.5,
  scrollSnapType: 'x proximity',
  scrollPaddingLeft: '12px',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

function SectionHeader({ title, to }) {
  const inner = (
    <>
      <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
        {title}
      </Typography>
      {to && <ChevronRightRoundedIcon sx={{ color: 'text.secondary' }} />}
    </>
  );
  const sx = { display: 'inline-flex', alignItems: 'center', gap: 0.25, mb: 1.25, color: 'inherit', textDecoration: 'none' };
  return to ? (
    <Box component={RouterLink} to={to} sx={sx} aria-label={`Open ${title}`}>
      {inner}
    </Box>
  ) : (
    <Box sx={sx}>{inner}</Box>
  );
}

// Square-ish tile used by the Practice and Aptitude rows.
function Tile({ to, color, icon: Icon, label, sub, width = 148 }) {
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={(t) => ({
        flex: '0 0 auto',
        width,
        height: 108,
        p: 1.5,
        borderRadius: '18px',
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: t.palette.text.primary,
        bgcolor: tint(color, t.palette.mode === 'dark' ? 20 : 14),
        border: `1px solid ${tint(color, 28)}`,
      })}
    >
      <Icon sx={{ fontSize: 28, color }} />
      <Box sx={{ minWidth: 0, width: '100%' }}>
        <Typography
          sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {label}
        </Typography>
        {sub && (
          <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, fontVariantNumeric: 'tabular-nums' }}>
            {sub}
          </Typography>
        )}
      </Box>
    </ButtonBase>
  );
}

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
    if (!contest) return cards;
    const upcoming = contest.status === 'upcoming';
    return [
      {
        key: 'contest',
        title: contest.title,
        text: upcoming ? `Starts ${fmtDate(contest.startsAt)}` : 'View the contest details and standings.',
        cta: 'View contest',
        to: '/dashboard?view=contest',
        icon: EmojiEventsRoundedIcon,
        gradient: 'linear-gradient(135deg,#F59E0B,#C2410C)',
      },
      ...cards,
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

      <Box component="section" aria-label="Practice">
        <SectionHeader title="Practice" to="/problems" />
        <Box sx={scrollRow}>
          <Tile to="/problems" color="#6366F1" icon={LibraryBooksRoundedIcon} label="All problems" sub={progress ? `${solvedAll}/${totalAll} solved` : undefined} />
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <Tile
              key={d}
              to={problemsUrl('difficulty', d)}
              color={DIFF_COLOR[d]}
              icon={CheckCircleOutlineRoundedIcon}
              label={d}
              sub={progress ? `${solved[d]}/${total[d]} solved` : undefined}
            />
          ))}
          <Tile to="/dashboard?view=list&list=favorite" color="#F59E0B" icon={StarRoundedIcon} label="Favorites" sub="Saved problems" />
        </Box>
      </Box>

      {levels.length > 0 && (
        <Box component="section" aria-label="Aptitude">
          <SectionHeader title="Aptitude" to="/aptitude" />
          <Box sx={scrollRow}>
            {levels.map((p, i) => {
              const cleared = (p.progress?.bestScore ?? 0) >= p.passPercentage;
              const unlocked = Boolean(p.progress?.unlocked);
              const sub = cleared ? 'Cleared' : unlocked ? (p.progress?.bestScore ? `Best ${Math.round(p.progress.bestScore)}%` : 'Ready to start') : 'Locked';
              return (
                <Tile
                  key={p.slug}
                  to={`/aptitude/${p.slug}`}
                  color={cleared ? '#10B981' : '#8B5CF6'}
                  icon={unlocked || cleared ? CalculateRoundedIcon : LockRoundedIcon}
                  label={p.title}
                  sub={`Level ${i + 1} · ${sub}`}
                  width={164}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {tags.length > 0 && (
        <Box component="section" aria-label="Topics">
          <SectionHeader title="Topics" to="/problems" />
          <Box sx={scrollRow}>
            <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(3, auto)', gridAutoFlow: 'column', gridAutoColumns: 'max-content', gap: 1, justifyItems: 'start' }}>
              {tags.map(({ tag }) => (
                <ButtonBase
                  key={tag}
                  onClick={() => navigate(problemsUrl('tag', tag))}
                  sx={(t) => ({
                    px: 2,
                    py: 1.1,
                    borderRadius: 999,
                    fontFamily: 'inherit',
                    whiteSpace: 'nowrap',
                    color: t.palette.text.secondary,
                    bgcolor: t.palette.action.hover,
                  })}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{tag}</Typography>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {companies.length > 0 && (
        <Box component="section" aria-label="Companies">
          <SectionHeader title="Companies" to="/prep" />
          <Box sx={scrollRow}>
            <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(3, auto)', gridAutoFlow: 'column', gridAutoColumns: 'min(46vw, 220px)', columnGap: 2.5, rowGap: 0 }}>
              {companies.map(({ company, count }) => (
                <ButtonBase
                  key={company}
                  onClick={() => navigate(problemsUrl('company', company))}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75, justifyContent: 'flex-start', textAlign: 'left', fontFamily: 'inherit', color: 'text.primary', minWidth: 0 }}
                >
                  <CompanyAvatar name={company} size={48} />
                  <Box sx={(t) => ({ flex: 1, minWidth: 0, py: 0.75, borderBottom: `1px solid ${alpha(t.palette.divider, 1)}` })}>
                    <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      {company}
                    </Typography>
                    <Typography noWrap variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {count.toLocaleString('en-IN')} {count === 1 ? 'Question' : 'Questions'}
                    </Typography>
                  </Box>
                </ButtonBase>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Stack>
  );
}
