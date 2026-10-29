import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, Skeleton, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SignalCellularAlt1BarRoundedIcon from '@mui/icons-material/SignalCellularAlt1BarRounded';
import SignalCellularAlt2BarRoundedIcon from '@mui/icons-material/SignalCellularAlt2BarRounded';
import SignalCellularAltRoundedIcon from '@mui/icons-material/SignalCellularAltRounded';
import { problemsApi } from '../../../api/problemsApi';
import CompanyAvatar from '../../../components/CompanyAvatar';
import { fetchPatterns } from '../../aptitude/aptitudeSlice';
import { fmtDate, useContest } from '../../contest/contestUtils';
import { tint } from '../dashboardUtils';
import NqtExploreCard from './NqtExploreCard';
import { LibraryFont, useLibraryPalette } from './libraryStyle';

// Phone home screen in the Library layout: swipeable banners, category cards, topic chips and company rows.
// Sizes: 16px page gutter, 2:1 banners, 115x80 category cards, 34px chips, 48px company logos, 58px company rows.

const GUTTER = 2; // 16px
const MAX_TAGS = 30;
const MAX_COMPANIES = 18;
const MAX_LEVELS = 12;
const TRACKING = '0.03em';

const hideScrollbar = { scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };
// Rows bleed to the screen edges: the page already has its own side padding, so cancel it here.
const bleed = { mx: { xs: -2, sm: -3 }, overflowX: 'auto', ...hideScrollbar };
const bleedPad = { xs: 2, sm: 3 };

// Phone-only banner colours.
const BANNER_GRADIENT = {
  contest: 'linear-gradient(135deg,#F7A33B,#E8590C)',
  daily: 'linear-gradient(135deg,#7E3FA8,#4A1F8C)',
  prep: 'linear-gradient(135deg,#0D9488,#134E4A)',
  pro: 'linear-gradient(135deg,#F59E0B,#78350F)',
  aptitude: 'linear-gradient(135deg,#DB2777,#4C1D95)',
  visualizer: 'linear-gradient(135deg,#2563EB,#1E1B4B)',
};

const problemsUrl = (key, value) => `/problems?${new URLSearchParams({ [key]: value }).toString()}`;

const CATEGORIES = [
  { key: 'all', label: 'All Topics', to: '/problems' },
  { key: 'Easy', label: 'Easy', to: problemsUrl('difficulty', 'Easy'), color: '#22A06B', bg: '#EAF6EE', Icon: SignalCellularAlt1BarRoundedIcon },
  { key: 'Medium', label: 'Medium', to: problemsUrl('difficulty', 'Medium'), color: '#F09A2E', bg: '#FFF2E3', Icon: SignalCellularAlt2BarRoundedIcon },
  { key: 'Hard', label: 'Hard', to: problemsUrl('difficulty', 'Hard'), color: '#EF5B5B', bg: '#FDECEB', Icon: SignalCellularAltRoundedIcon },
  { key: 'lists', label: 'Favorites', to: '/dashboard?view=list&list=favorite', color: '#3F8CE8', bg: '#EDF2F9', Icon: StarRoundedIcon },
];

function SectionHeading({ to, children }) {
  const pal = useLibraryPalette();
  return (
    <Box component={RouterLink} to={to} sx={{ display: 'flex', alignSelf: 'flex-start', alignItems: 'center', gap: 0.5, color: pal.text, textDecoration: 'none' }}>
      <Typography component="h2" sx={{ fontSize: 18, lineHeight: '24px', fontWeight: 700 }}>
        {children}
      </Typography>
      <ChevronRightRoundedIcon aria-hidden sx={{ fontSize: 22, color: pal.muted }} />
    </Box>
  );
}

function Banners({ cards }) {
  const [index, setIndex] = useState(0);
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / (e.currentTarget.clientWidth + 12)))}
        sx={{ display: 'flex', gap: '12px', overflowX: 'auto', scrollSnapType: 'x mandatory', ...hideScrollbar }}
      >
        {cards.map(({ key, title, to, icon: Icon, gradient }) => (
          <ButtonBase
            key={key}
            component={RouterLink}
            to={to}
            aria-label={title}
            sx={{
              flex: '0 0 100%',
              scrollSnapAlign: 'start',
              position: 'relative',
              overflow: 'hidden',
              aspectRatio: '2 / 1',
              borderRadius: '20px',
              textAlign: 'left',
              display: 'block',
              color: '#fff',
              background: gradient,
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: '7%',
                top: '14%',
                width: '30%',
                aspectRatio: '1',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                border: '6px solid rgba(255,255,255,0.55)',
                background: 'linear-gradient(160deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
              }}
            >
              <Icon sx={{ fontSize: 'clamp(36px, 12vw, 56px)', color: '#fff' }} />
            </Box>
            <Typography
              component="span"
              sx={{ position: 'absolute', left: 16, right: '38%', bottom: 14, fontSize: 28, lineHeight: '33px', fontWeight: 700, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {title}
            </Typography>
          </ButtonBase>
        ))}
      </Box>
      {cards.length > 1 && (
        <Box aria-hidden sx={{ position: 'absolute', right: 14, bottom: 10, display: 'flex', gap: '5px', pointerEvents: 'none' }}>
          {cards.map((b, i) => (
            <Box key={b.key} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fff', opacity: i === index ? 0.95 : 0.4 }} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// Square card: icon on top, label at the bottom.
function CategoryCard({ to, label, color, bg, icon: Icon, all = false, dim = false }) {
  const pal = useLibraryPalette();
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={(t) => ({
        flex: 'none',
        width: 115,
        height: 80,
        p: '12px',
        borderRadius: '16px',
        border: `1.5px solid ${pal.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        textAlign: 'left',
        color: pal.text,
        opacity: dim ? 0.7 : 1,
        background: all
          ? t.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(181,138,242,0.22), rgba(242,140,122,0.16))'
            : 'linear-gradient(125deg, #F6DCE3 0%, #EEE3F6 50%, #F8DDEB 100%)'
          : t.palette.mode === 'dark'
            ? tint(color, 16)
            : bg,
      })}
    >
      {all ? (
        <Box aria-hidden sx={{ width: 30, height: 28, borderRadius: '9px', display: 'grid', placeItems: 'center', background: 'linear-gradient(160deg, #B58AF2, #F28C7A)' }}>
          <CodeRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
        </Box>
      ) : (
        <Icon aria-hidden sx={{ fontSize: 28, color }} />
      )}
      <Typography component="span" sx={{ maxWidth: '100%', fontSize: 15, lineHeight: '19px', letterSpacing: TRACKING, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {label}
      </Typography>
    </ButtonBase>
  );
}

// Topic chips flow into three rows that scroll sideways together.
function Knowledge({ tags }) {
  const pal = useLibraryPalette();
  const rows = useMemo(() => {
    const out = [[], [], []];
    tags.forEach((t, i) => out[i % 3].push(t));
    return out;
  }, [tags]);
  return (
    <Box sx={bleed}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: bleedPad, width: 'max-content' }}>
        {rows.map((row, r) => (
          <Box key={r} sx={{ display: 'flex', gap: 1 }}>
            {row.map(({ tag }) => (
              <ButtonBase
                key={tag}
                component={RouterLink}
                to={problemsUrl('tag', tag)}
                sx={{ height: 34, px: '14px', borderRadius: 999, bgcolor: pal.chip, color: pal.chipText, fontSize: 15, letterSpacing: TRACKING, whiteSpace: 'nowrap' }}
              >
                {tag}
              </ButtonBase>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Company rows flow into columns of three, 236px wide, so the next column peeks in from the right.
function Companies({ companies }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={bleed}>
      <Box sx={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(3, auto)', gridAutoColumns: 236, columnGap: '16px', px: bleedPad, width: 'max-content' }}>
        {companies.map(({ company, count }) => (
          <ButtonBase
            key={company}
            component={RouterLink}
            to={problemsUrl('company', company)}
            sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '12px', mb: '5px', textAlign: 'left', color: pal.text }}
          >
            <CompanyAvatar name={company} size={48} />
            <Box sx={{ flex: 1, minWidth: 0, pb: '4px', borderBottom: `1px solid ${pal.divider}` }}>
              <Typography noWrap sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: TRACKING }}>
                {company}
              </Typography>
              <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: TRACKING, color: pal.muted }}>
                {count.toLocaleString('en-IN')} {count === 1 ? 'Question' : 'Questions'}
              </Typography>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}

function ChipSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {[0, 1, 2].map((r) => (
        <Box key={r} sx={{ display: 'flex', gap: 1 }}>
          {[70, 110, 84, 130].map((w) => (
            <Skeleton key={w} variant="rounded" width={w} height={34} sx={{ borderRadius: 999 }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default function MobileHome({ cards, nqtDismissed, onDismissNqt }) {
  const dispatch = useDispatch();
  const { contest } = useContest();
  const { patterns, patternsStatus } = useSelector((s) => s.aptitude);
  const [tags, setTags] = useState(null);
  const [companies, setCompanies] = useState(null);

  useEffect(() => {
    problemsApi
      .getTags()
      .then(({ data }) => setTags(data.data.items.slice(0, MAX_TAGS)))
      .catch(() => setTags([]));
    problemsApi
      .getCompanies()
      .then(({ data }) => setCompanies(data.data.items.slice(0, MAX_COMPANIES)))
      .catch(() => setCompanies([]));
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
        to: '/dashboard?view=contest',
        icon: EmojiEventsRoundedIcon,
        gradient: BANNER_GRADIENT.contest,
      },
      ...styled,
    ];
  }, [contest, cards]);

  const levels = patterns.slice(0, MAX_LEVELS);

  return (
    <LibraryFont>
      <Stack spacing={4}>
        <Banners cards={banners} />

        {!nqtDismissed && (
          <Box sx={{ '& a': { mb: 0 } }}>
            <NqtExploreCard onDismiss={onDismissNqt} />
          </Box>
        )}

        <Stack spacing={1.5}>
          <SectionHeading to="/problems">Category</SectionHeading>
          <Box sx={bleed}>
            <Box sx={{ display: 'flex', gap: '11px', px: bleedPad, width: 'max-content' }}>
              {CATEGORIES.map(({ key, icon, Icon, ...c }) => (
                <CategoryCard key={key} {...c} icon={Icon} all={key === 'all'} />
              ))}
            </Box>
          </Box>
        </Stack>

        {levels.length > 0 && (
          <Stack spacing={1.5}>
            <SectionHeading to="/aptitude">Aptitude</SectionHeading>
            <Box sx={bleed}>
              <Box sx={{ display: 'flex', gap: '11px', px: bleedPad, width: 'max-content' }}>
                {levels.map((p) => {
                  const best = Math.round(p.progress?.bestScore ?? 0);
                  const cleared = best >= p.passPercentage;
                  const unlocked = Boolean(p.progress?.unlocked);
                  return (
                    <CategoryCard
                      key={p.slug}
                      to={`/aptitude/${p.slug}`}
                      label={p.title}
                      color={cleared ? '#22A06B' : '#F09A2E'}
                      bg={cleared ? '#EAF6EE' : '#FFF2E3'}
                      icon={cleared ? CheckRoundedIcon : unlocked ? CalculateRoundedIcon : LockRoundedIcon}
                      dim={!unlocked && !cleared}
                    />
                  );
                })}
              </Box>
            </Box>
          </Stack>
        )}

        {tags === null || tags.length > 0 ? (
          <Stack spacing={1.5}>
            <SectionHeading to="/problems">Knowledge</SectionHeading>
            {tags === null ? <ChipSkeleton /> : <Knowledge tags={tags} />}
          </Stack>
        ) : null}

        {companies === null || companies.length > 0 ? (
          <Stack spacing={1.5}>
            <SectionHeading to="/prep">Companies</SectionHeading>
            {companies === null ? <Skeleton variant="rounded" height={168} sx={{ borderRadius: '12px' }} /> : <Companies companies={companies} />}
          </Stack>
        ) : null}
      </Stack>
    </LibraryFont>
  );
}
