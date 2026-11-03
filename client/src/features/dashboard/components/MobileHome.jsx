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
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

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
  contest: `linear-gradient(135deg,${COLOR_PALETTE.custom.orangeF7A33B},${COLOR_PALETTE.orange[600]})`,
  daily: `linear-gradient(135deg,${COLOR_PALETTE.custom.purple7E3FA8},${COLOR_PALETTE.custom.purple4A1F8C})`,
  prep: `linear-gradient(135deg,${COLOR_PALETTE.teal[600]},${COLOR_PALETTE.teal[900]})`,
  pro: `linear-gradient(135deg,${COLOR_PALETTE.amber[500]},${COLOR_PALETTE.amber[900]})`,
  aptitude: `linear-gradient(135deg,${COLOR_PALETTE.pink[600]},${COLOR_PALETTE.violet[900]})`,
  visualizer: `linear-gradient(135deg,${COLOR_PALETTE.blue[600]},${COLOR_PALETTE.indigo[950]})`,
};

const problemsUrl = (key, value) => `/problems?${new URLSearchParams({ [key]: value }).toString()}`;

const CATEGORIES = [
  { key: 'all', label: 'All Topics', to: '/problems' },
  { key: 'Easy', label: 'Easy', to: problemsUrl('difficulty', 'Easy'), color: COLOR_PALETTE.custom.emerald22A06B, bg: COLOR_PALETTE.green[50], Icon: SignalCellularAlt1BarRoundedIcon },
  { key: 'Medium', label: 'Medium', to: problemsUrl('difficulty', 'Medium'), color: COLOR_PALETTE.custom.amberF09A2E, bg: COLOR_PALETTE.orange[50], Icon: SignalCellularAlt2BarRoundedIcon },
  { key: 'Hard', label: 'Hard', to: problemsUrl('difficulty', 'Hard'), color: COLOR_PALETTE.custom.redEF5B5B, bg: COLOR_PALETTE.rose[50], Icon: SignalCellularAltRoundedIcon },
  { key: 'lists', label: 'Favorites', to: '/dashboard?view=list&list=favorite', color: COLOR_PALETTE.custom.blue3F8CE8, bg: COLOR_PALETTE.blue[50], Icon: StarRoundedIcon },
];

function SectionHeading({ to, children }) {
  const pal = useLibraryPalette();
  return (
    <Box component={RouterLink} to={to} sx={{ display: 'flex', alignSelf: 'flex-start', alignItems: 'center', gap: 0.5, color: pal.text, textDecoration: 'none' }}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold }}>
        {children}
      </Typography>
      <ChevronRightRoundedIcon aria-hidden sx={{ fontSize: FONT_SIZES.display, color: pal.muted }} />
    </Box>
  );
}

function Banners({ cards }) {
  const [index, setIndex] = useState(0);
  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / (e.currentTarget.clientWidth + 12)))}
        sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', scrollSnapType: 'x mandatory', ...hideScrollbar }}
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
              borderRadius: RADII_PX.card,
              textAlign: 'left',
              display: 'block',
              color: COLOR_PALETTE.white,
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
                border: `6px solid ${withAlpha(COLOR_PALETTE.white, 0.55)}`,
                background: `linear-gradient(160deg, ${withAlpha(COLOR_PALETTE.white, 0.25)}, ${withAlpha(COLOR_PALETTE.white, 0.05)})`,
              }}
            >
              <Icon sx={{ fontSize: 'clamp(36px, 12vw, 56px)', color: COLOR_PALETTE.white }} />
            </Box>
            <Typography
              component="span"
              sx={{ position: 'absolute', left: 16, right: '38%', bottom: 14, fontSize: FONT_SIZES.displayLg, lineHeight: '33px', fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {title}
            </Typography>
          </ButtonBase>
        ))}
      </Box>
      {cards.length > 1 && (
        <Box aria-hidden sx={{ position: 'absolute', right: 14, bottom: 10, display: 'flex', gap: 0.5, pointerEvents: 'none' }}>
          {cards.map((b, i) => (
            <Box key={b.key} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: COLOR_PALETTE.white, opacity: i === index ? 0.95 : 0.4 }} />
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
        p: 1.5,
        borderRadius: RADII_PX.card,
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
            ? `linear-gradient(135deg, ${withAlpha(COLOR_PALETTE.custom.violetB58AF2, 0.22)}, ${withAlpha(COLOR_PALETTE.custom.redF28C7A, 0.16)})`
            : `linear-gradient(125deg, ${COLOR_PALETTE.rose[100]} 0%, ${COLOR_PALETTE.purple[100]} 50%, ${COLOR_PALETTE.pink[100]} 100%)`
          : t.palette.mode === 'dark'
            ? tint(color, 16)
            : bg,
      })}
    >
      {all ? (
        <Box aria-hidden sx={{ width: 30, height: 28, borderRadius: RADII_PX.control, display: 'grid', placeItems: 'center', background: `linear-gradient(160deg, ${COLOR_PALETTE.custom.violetB58AF2}, ${COLOR_PALETTE.custom.redF28C7A})` }}>
          <CodeRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: COLOR_PALETTE.white }} />
        </Box>
      ) : (
        <Icon aria-hidden sx={{ fontSize: FONT_SIZES.displayLg, color }} />
      )}
      <Typography component="span" sx={{ maxWidth: '100%', fontSize: FONT_SIZES.bodyLg, lineHeight: '19px', letterSpacing: TRACKING, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
                sx={{ height: 34, px: 2, borderRadius: RADII_PX.pill, bgcolor: pal.chip, color: pal.chipText, fontSize: FONT_SIZES.bodyLg, letterSpacing: TRACKING, whiteSpace: 'nowrap' }}
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
      <Box sx={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(3, auto)', gridAutoColumns: 236, columnGap: 2, px: bleedPad, width: 'max-content' }}>
        {companies.map(({ company, count }) => (
          <ButtonBase
            key={company}
            component={RouterLink}
            to={problemsUrl('company', company)}
            sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: 1.5, mb: 0.5, textAlign: 'left', color: pal.text }}
          >
            <CompanyAvatar name={company} size={48} />
            <Box sx={{ flex: 1, minWidth: 0, pb: 0.5, borderBottom: `1px solid ${pal.divider}` }}>
              <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: TRACKING }}>
                {company}
              </Typography>
              <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: TRACKING, color: pal.muted }}>
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
            <Skeleton key={w} variant="rounded" width={w} height={34} sx={{ borderRadius: RADII_PX.pill }} />
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
          <Box sx={{ '& a': { mb: 0 }, '&:empty': { display: 'none' } }}>
            <NqtExploreCard onDismiss={onDismissNqt} hideForNewUser />
          </Box>
        )}

        <Stack spacing={1.5}>
          <SectionHeading to="/problems">Category</SectionHeading>
          <Box sx={bleed}>
            <Box sx={{ display: 'flex', gap: 1.5, px: bleedPad, width: 'max-content' }}>
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
              <Box sx={{ display: 'flex', gap: 1.5, px: bleedPad, width: 'max-content' }}>
                {levels.map((p) => {
                  const best = Math.round(p.progress?.bestScore ?? 0);
                  const cleared = best >= p.passPercentage;
                  const unlocked = Boolean(p.progress?.unlocked);
                  return (
                    <CategoryCard
                      key={p.slug}
                      to={`/aptitude/${p.slug}`}
                      label={p.title}
                      color={cleared ? COLOR_PALETTE.custom.emerald22A06B : COLOR_PALETTE.custom.amberF09A2E}
                      bg={cleared ? COLOR_PALETTE.green[50] : COLOR_PALETTE.orange[50]}
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
            {companies === null ? <Skeleton variant="rounded" height={168} sx={{ borderRadius: RADII_PX.card }} /> : <Companies companies={companies} />}
          </Stack>
        ) : null}
      </Stack>
    </LibraryFont>
  );
}
