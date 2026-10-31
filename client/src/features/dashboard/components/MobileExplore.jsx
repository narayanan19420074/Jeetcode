import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { problemsApi } from '../../../api/problemsApi';
import CompanyAvatar from '../../../components/CompanyAvatar';
import NqtExploreCard from './NqtExploreCard';
import { tint } from '../dashboardUtils';
import { LIB_TRACKING, LibraryFont, PageHeader, libBackBtnSx, libSectionTitleSx } from './libraryStyle';

// Phone Explore screen in the Library look (same tokens as the phone home): 16px gutter, 18px section titles,
// 32px between sections, 12px between a title and its content, 48px tiles and logos, 34px chips, divider-separated rows.
// There is no top navigation bar on phones here; the back arrow returns to the dashboard.

const MAX_TAGS = 30;
const MAX_COMPANIES = 18;

const hideScrollbar = { scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };
const bleed = { mx: -2, overflowX: 'auto', ...hideScrollbar };

// Card colours are the dashboard category-card colours: pastel card, same-hue icon (tinted in dark mode).
const TOOLS = [
  { to: '/aptitude', title: 'Aptitude practice', text: 'Learn a pattern, practice it, then take a timed test.', icon: CalculateRoundedIcon, color: '#F09A2E', bg: '#FFF2E3' },
  { to: '/visualizer', title: 'Algorithm visualizer', text: 'Watch sorting, searching and graph algorithms step by step.', icon: BarChartRoundedIcon, color: '#3F8CE8', bg: '#EDF2F9' },
  { to: '/prep', title: 'Prep by company', text: 'See the exam pattern and track your readiness.', icon: BusinessRoundedIcon, color: '#22A06B', bg: '#EAF6EE' },
];

function Section({ title, children }) {
  return (
    <Stack spacing={1.5}>
      <Typography component="h2" sx={libSectionTitleSx}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

function ToolRow({ to, title, text, icon: Icon, color, bg }) {
  return (
    <ButtonBase
      component={RouterLink}
      to={to}
      sx={(t) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '12px',
        width: '100%',
        p: '12px',
        borderRadius: '16px',
        border: '1.5px solid var(--lib-border)',
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'var(--lib-text)',
        bgcolor: t.palette.mode === 'dark' ? tint(color, 16) : bg,
      })}
    >
      <Icon aria-hidden sx={{ fontSize: 28, flex: 'none', color }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, lineHeight: '24px', fontWeight: 500, letterSpacing: LIB_TRACKING }}>{title}</Typography>
        <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{text}</Typography>
      </Box>
      <ChevronRightRoundedIcon aria-hidden sx={{ fontSize: 24, flex: 'none', color: 'var(--lib-muted)' }} />
    </ButtonBase>
  );
}

// Company rows flow into columns of three, 236px wide, so the next column peeks in from the right (as on the home screen).
function Companies({ companies, onBrowse }) {
  return (
    <Box sx={bleed}>
      <Box sx={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(3, auto)', gridAutoColumns: 236, columnGap: '16px', px: 2, width: 'max-content' }}>
        {companies.map(({ company, count }) => (
          <ButtonBase
            key={company}
            onClick={() => onBrowse({ companies: [company] })}
            aria-label={`Browse ${company} questions`}
            sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '12px', mb: '5px', textAlign: 'left', fontFamily: 'inherit', color: 'var(--lib-text)' }}
          >
            <CompanyAvatar name={company} size={48} />
            <Box sx={{ flex: 1, minWidth: 0, pb: '4px', borderBottom: '1px solid var(--lib-divider)' }}>
              <Typography noWrap sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{company}</Typography>
              <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
                {count.toLocaleString('en-IN')} {count === 1 ? 'Question' : 'Questions'}
              </Typography>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Box>
  );
}

// Topic chips flow into three rows that scroll sideways together.
function Topics({ tags, onBrowse }) {
  const rows = [[], [], []];
  tags.forEach((t, i) => rows[i % 3].push(t));
  return (
    <Box sx={bleed}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2, width: 'max-content' }}>
        {rows.map((row, r) => (
          <Box key={r} sx={{ display: 'flex', gap: 1 }}>
            {row.map(({ tag, count }) => (
              <ButtonBase
                key={tag}
                onClick={() => onBrowse({ tags: [tag] })}
                aria-label={`Browse ${tag} questions`}
                sx={{ height: 34, px: '14px', gap: 0.75, borderRadius: 999, fontFamily: 'inherit', bgcolor: 'var(--lib-chip)', color: 'var(--lib-chip-text)', fontSize: 15, letterSpacing: LIB_TRACKING, whiteSpace: 'nowrap' }}
              >
                {tag}
                <Box component="span" sx={{ fontSize: 13, opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</Box>
              </ButtonBase>
            ))}
          </Box>
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

export default function MobileExplore({ onBrowse }) {
  // null = still loading, [] = nothing to show (the section is hidden)
  const [tags, setTags] = useState(null);
  const [companies, setCompanies] = useState(null);

  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setTags(data.data.items.slice(0, MAX_TAGS))).catch(() => setTags([]));
    problemsApi.getCompanies().then(({ data }) => setCompanies(data.data.items.slice(0, MAX_COMPANIES))).catch(() => setCompanies([]));
  }, []);

  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
        <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <PageHeader icon={ExploreRoundedIcon} title="Explore" subtitle="Practice tools and shortcuts" />

        <Stack spacing={4} sx={{ mt: 4 }}>
          <Box sx={{ '& a': { mb: 0 }, '&:empty': { display: 'none' } }}>
            <NqtExploreCard hideForNewUser />
          </Box>

          <Section title="Practice tools">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {TOOLS.map((tool) => (
                <ToolRow key={tool.to} {...tool} />
              ))}
            </Box>
          </Section>

          {(companies === null || companies.length > 0) && (
            <Section title="Companies">
              {companies === null ? <Skeleton variant="rounded" height={168} sx={{ borderRadius: '12px' }} /> : <Companies companies={companies} onBrowse={onBrowse} />}
            </Section>
          )}

          {(tags === null || tags.length > 0) && (
            <Section title="Topics">{tags === null ? <ChipSkeleton /> : <Topics tags={tags} onBrowse={onBrowse} />}</Section>
          )}
        </Stack>
      </Box>
    </LibraryFont>
  );
}
