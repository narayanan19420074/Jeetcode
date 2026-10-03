import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import ProgressRing from '../../../components/ProgressRing';
import { problemsApi } from '../../../api/problemsApi';
import { prepApi } from '../../../api/prepApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { DIFF_COLOR, surface } from '../dashboardUtils';
import { NameDialog } from './ListDialogs';

const GOLD_A = '#FCD34D';
const GOLD_B = '#D97706';

const ViewHeader = ({ title, subtitle, trailing }) => (
  <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2.5 }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography component="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.6rem' }, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 560 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {trailing}
  </Stack>
);

// -------------------------------------------------------------------- quests
// Quests are computed from numbers the backend already tracks (solved counts,
// streaks, today's activity). Nothing extra is stored, and progress can never
// drift from the real stats.

function buildQuests(user, checkedIn) {
  const easy = user?.easySolved ?? 0;
  const medium = user?.mediumSolved ?? 0;
  const hard = user?.hardSolved ?? 0;
  const total = easy + medium + hard;
  const bestStreak = Math.max(user?.longestStreak ?? 0, user?.streakDays ?? 0);

  return [
    {
      group: 'Today',
      items: [{ id: 'checkin', title: 'Check in today', desc: 'Submit one solution before the day ends.', value: checkedIn ? 1 : 0, target: 1, difficulty: null }],
    },
    {
      group: 'Streaks',
      items: [3, 7, 30].map((n) => ({ id: `streak-${n}`, title: `${n}-day streak`, desc: `Be active ${n} days in a row.`, value: bestStreak, target: n, difficulty: null })),
    },
    {
      group: 'Problems solved',
      items: [5, 25, 100].map((n) => ({ id: `solved-${n}`, title: `Solve ${n} problems`, desc: `Get ${n} problems to Accepted.`, value: total, target: n, difficulty: null })),
    },
    {
      group: 'By difficulty',
      items: [
        { id: 'easy-10', title: 'Ten easy wins', desc: 'Solve 10 Easy problems.', value: easy, target: 10, difficulty: 'Easy' },
        { id: 'medium-10', title: 'Medium rare', desc: 'Solve 10 Medium problems.', value: medium, target: 10, difficulty: 'Medium' },
        { id: 'hard-3', title: 'Into the deep end', desc: 'Solve 3 Hard problems.', value: hard, target: 3, difficulty: 'Hard' },
      ],
    },
  ];
}

export function QuestsView({ user, isAuthenticated, checkedIn, onPick }) {
  const groups = useMemo(() => buildQuests(user, checkedIn), [user, checkedIn]);
  const all = groups.flatMap((g) => g.items);
  const doneCount = all.filter((q) => q.value >= q.target).length;

  return (
    <Box>
      <ViewHeader
        title="Quests"
        subtitle="Goals that track your real activity. Finish them in any order."
        trailing={
          <Chip
            icon={<EmojiEventsRoundedIcon />}
            label={`${doneCount} of ${all.length} done`}
            sx={{ fontWeight: 700, '& .MuiChip-icon': { color: GOLD_B } }}
          />
        }
      />
      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: '12px' }}>
          Log in to track quests. Progress below is empty until you do.
        </Alert>
      )}
      <Stack spacing={3}>
        {groups.map((g) => (
          <Box key={g.group}>
            <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.25 }}>
              {g.group}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
              {g.items.map((q) => {
                const done = q.value >= q.target;
                const pct = Math.min((q.value / q.target) * 100, 100);
                return (
                  <Box key={q.id} sx={[surface, { p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }]}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '50%',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: done ? `linear-gradient(135deg, ${GOLD_A}, ${GOLD_B})` : 'transparent',
                          border: done ? 'none' : '2px dashed',
                          borderColor: 'divider',
                          color: done ? '#3B1D00' : 'text.disabled',
                        }}
                      >
                        {done ? <CheckRoundedIcon fontSize="small" /> : <EmojiEventsRoundedIcon fontSize="small" />}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }} noWrap>
                          {q.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {q.desc}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                        {Math.min(q.value, q.target)}
                        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                          /{q.target}
                        </Box>
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
                        '& .MuiLinearProgress-bar': { borderRadius: 3, background: done ? `linear-gradient(90deg, ${GOLD_A}, ${GOLD_B})` : q.difficulty ? DIFF_COLOR[q.difficulty] : '#3B82F6' },
                      }}
                    />
                    {!done && (
                      <Button size="small" variant="text" onClick={() => onPick(q.difficulty)} sx={{ alignSelf: 'flex-start', fontWeight: 700, px: 0.5 }}>
                        {q.difficulty ? `Pick a ${q.difficulty} problem` : 'Pick a problem'}
                      </Button>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ------------------------------------------------------------------- explore

const TOOLS = [
  {
    to: '/aptitude',
    title: 'Aptitude practice',
    text: 'Learn a pattern, practice it, then take a timed test.',
    icon: CalculateRoundedIcon,
    gradient: 'linear-gradient(135deg,#7C3AED,#4C1D95)',
  },
  {
    to: '/visualizer',
    title: 'Algorithm visualizer',
    text: 'Watch sorting, searching and graph algorithms run step by step.',
    icon: BarChartRoundedIcon,
    gradient: 'linear-gradient(135deg,#0891B2,#155E75)',
  },
  {
    to: '/prep',
    title: 'Prep by company',
    text: 'See the exam pattern and track your readiness for each drive.',
    icon: BusinessRoundedIcon,
    gradient: 'linear-gradient(135deg,#047857,#0E7490)',
  },
];

export function ExploreView({ onBrowse }) {
  const [tags, setTags] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setTags(data.data.items.slice(0, 18))).catch(() => {});
    problemsApi.getCompanies().then(({ data }) => setCompanies(data.data.items.slice(0, 14))).catch(() => {});
  }, []);

  const chip = (label, count, onClick) => (
    <ButtonBase
      key={label}
      onClick={onClick}
      sx={(t) => ({
        gap: 0.75,
        px: 1.5,
        py: 0.75,
        borderRadius: 999,
        fontFamily: 'inherit',
        border: `1px solid ${t.palette.divider}`,
        '&:hover': { borderColor: t.palette.primary.main, bgcolor: alpha(t.palette.primary.main, 0.08) },
        '&.Mui-focusVisible': { outline: `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </Typography>
    </ButtonBase>
  );

  return (
    <Box>
      <ViewHeader title="Explore" subtitle="Everything beyond the problem list: practice tools and shortcuts into the library." />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, mb: 3.5 }}>
        {TOOLS.map(({ to, title, text, icon: Icon, gradient }) => (
          <Box
            key={to}
            component={RouterLink}
            to={to}
            sx={{
              position: 'relative',
              overflow: 'hidden',
              minHeight: 150,
              p: 2.25,
              borderRadius: '14px',
              color: '#fff',
              textDecoration: 'none',
              background: gradient,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow: '0 14px 28px -18px rgba(2,6,23,0.8), inset 0 1px 0 rgba(255,255,255,0.18)',
              '&:hover': { filter: 'brightness(1.08)' },
              '&:focus-visible': { outline: '3px solid #fff', outlineOffset: -4 },
            }}
          >
            <Icon sx={{ position: 'absolute', top: 14, right: 14, fontSize: 34, opacity: 0.9 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>{title}</Typography>
            <Typography sx={{ mt: 0.5, fontSize: '0.8rem', lineHeight: 1.4, color: 'rgba(255,255,255,0.86)' }}>{text}</Typography>
          </Box>
        ))}
      </Box>

      {companies.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.25 }}>
            Browse by company
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{companies.map((c) => chip(c.company, c.count, () => onBrowse({ companies: [c.company] })))}</Box>
        </Box>
      )}

      {tags.length > 0 && (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 800, mb: 1.25 }}>
            Browse by topic
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{tags.map((t) => chip(t.tag, t.count, () => onBrowse({ tags: [t.tag] })))}</Box>
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------- study plan

const readinessColor = (pct) => {
  if (pct === null || pct === undefined || pct === 0) return '#3B82F6';
  if (pct < 40) return '#EF4444';
  if (pct < 70) return '#F59E0B';
  return '#10B981';
};

export function StudyPlanView() {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    setItems(null);
    prepApi
      .listCompanies()
      .then(({ data }) => setItems(data?.data?.items ?? []))
      .catch((err) => setError(extractErrorMessage(err)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(() => (items ? [...items].sort((a, b) => (b.readiness ?? -1) - (a.readiness ?? -1)) : []), [items]);

  return (
    <Box>
      <ViewHeader title="Study Plan" subtitle="Pick a company and follow its exam pattern. Your readiness updates as you practice." />

      {error && (
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={load}>
              Try again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!error && items === null && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={150} sx={{ borderRadius: '14px' }} />
          ))}
        </Box>
      )}

      {items && items.length === 0 && (
        <Typography color="text.secondary">No study plans have been published yet.</Typography>
      )}

      {items && items.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
          {sorted.map((c) => {
            const started = (c.readiness ?? 0) > 0;
            const accent = readinessColor(c.readiness);
            return (
              <Box
                key={c.slug}
                sx={[
                  surface,
                  (t) => ({
                    p: 2.25,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    background: started ? `linear-gradient(120deg, ${alpha(accent, t.palette.mode === 'dark' ? 0.14 : 0.08)}, transparent 65%), ${t.palette.background.paper}` : t.palette.background.paper,
                  }),
                ]}
              >
                <ProgressRing value={c.readiness ?? 0} max={100} color={accent} size={84} strokeWidth={8} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.02rem' }} noWrap>
                      {c.name}
                    </Typography>
                    {started && <Chip size="small" label="In progress" sx={{ height: 20, color: accent, bgcolor: alpha(accent, 0.14) }} />}
                  </Stack>
                  {c.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}
                    >
                      {c.description}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Button size="small" variant={started ? 'contained' : 'outlined'} disableElevation onClick={() => navigate(`/prep/${c.slug}`)} sx={{ fontWeight: 700 }}>
                      {started ? 'Continue' : 'Start plan'}
                    </Button>
                    {c.examDurationMinutes && (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                        <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption">{c.examDurationMinutes} min exam</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

// --------------------------------------------------------------------- lists

export function ListView({ list, onRemove, onRename, onDelete, onBrowse }) {
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isFavorite = list.id === 'favorite';

  const shuffle = () => {
    if (!list.items.length) return;
    const pick = list.items[Math.floor(Math.random() * list.items.length)];
    navigate(`/workspace/${pick.slug}`);
  };

  return (
    <Box>
      <ViewHeader
        title={list.name}
        subtitle={`${list.items.length} ${list.items.length === 1 ? 'problem' : 'problems'}. Lists are saved on this device.`}
        trailing={
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Tooltip title="Open a random problem from this list">
              <span>
                <IconButton onClick={shuffle} disabled={!list.items.length} aria-label="Open a random problem from this list">
                  <ShuffleRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {!isFavorite && (
              <>
                <Tooltip title="Rename list">
                  <IconButton onClick={() => setRenaming(true)} aria-label="Rename list">
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete list">
                  <IconButton onClick={() => setConfirmDelete(true)} aria-label="Delete list">
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Stack>
        }
      />

      {list.items.length === 0 ? (
        <Box sx={[surface, { py: 7, px: 3, textAlign: 'center' }]}>
          <Box sx={{ display: 'inline-flex', mb: 1.5, color: isFavorite ? 'warning.main' : 'text.disabled' }}>
            {isFavorite ? <StarRoundedIcon sx={{ fontSize: 38 }} /> : <ListAltRoundedIcon sx={{ fontSize: 38 }} />}
          </Box>
          <Typography sx={{ fontWeight: 800 }}>This list is empty</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            Tap the star on any problem in the Library to save it here.
          </Typography>
          <Button variant="contained" disableElevation onClick={() => onBrowse()} sx={{ fontWeight: 700 }}>
            Browse problems
          </Button>
        </Box>
      ) : (
        <Box sx={[surface, { overflow: 'hidden' }]}>
          {list.items.map((p, i) => (
            <Box
              key={p._id}
              sx={(t) => ({
                display: 'flex',
                alignItems: 'center',
                borderBottom: `1px solid ${t.palette.divider}`,
                '&:last-of-type': { borderBottom: 'none' },
                '&:hover': { bgcolor: alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.09 : 0.05) },
              })}
            >
              <Box
                component={RouterLink}
                to={`/workspace/${p.slug}`}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2.25,
                  py: 1.35,
                  color: 'inherit',
                  textDecoration: 'none',
                  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2, borderRadius: '8px' },
                }}
              >
                <Typography variant="body2" noWrap sx={{ fontWeight: 600, fontSize: '0.9rem', minWidth: 0 }}>
                  <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                    {i + 1}.
                  </Box>{' '}
                  {p.title}
                </Typography>
                {p.locked && <LockRoundedIcon sx={{ fontSize: 15, color: 'warning.main', flexShrink: 0 }} />}
                <Box sx={{ flex: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: DIFF_COLOR[p.difficulty] || 'text.secondary', flexShrink: 0 }}>
                  {p.difficulty}
                </Typography>
              </Box>
              <Tooltip title="Remove from list">
                <IconButton size="small" onClick={() => onRemove(p)} aria-label={`Remove ${p.title} from this list`} sx={{ mr: 1 }}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}

      <NameDialog
        open={renaming}
        title="Rename list"
        initial={list.name}
        confirmLabel="Save"
        onClose={() => setRenaming(false)}
        onConfirm={(name) => onRename(name)}
      />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete “{list.name}”?</DialogTitle>
        <DialogContent>
          <DialogContentText>The list and its {list.items.length} saved problems will be removed from this device. The problems themselves stay in the Library.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setConfirmDelete(false)}>
            Keep list
          </Button>
          <Button
            color="error"
            variant="contained"
            disableElevation
            onClick={() => {
              setConfirmDelete(false);
              onDelete();
            }}
          >
            Delete list
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
