import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, IconButton, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import { APT_COLOR, PersonAvatar, cardSx, dayLabel, mono, timeAgo } from './friendsUi';
import { useSelector } from 'react-redux';

const LANG = { javascript: 'JS', python: 'Python', cpp: 'C++' };

function Chip({ color, children }) {
  return (
    <Box component="span" sx={{ px: 0.9, py: 0.1, borderRadius: 999, fontSize: 11.5, fontWeight: 700, bgcolor: tint(color, 16), color }}>
      {children}
    </Box>
  );
}

function Item({ e, online, onOpenProblem }) {
  const isApt = e.type === 'aptitude';
  const accent = isApt ? APT_COLOR : DIFF_COLOR[e.problem.difficulty];
  return (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="flex-start"
      sx={(t) => ({ ...cardSx(t, { glowColor: `color-mix(in srgb, ${accent} 30%, transparent)` }), px: { xs: 1.25, sm: 2 }, py: 1.25, '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: accent } })}
    >
      <PersonAvatar person={e.user} size={40} online={online} gradient={[accent, `color-mix(in srgb, ${accent} 40%, #fff)`]} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
          <b>{e.user.name}</b>{' '}
          {isApt ? (
            <>answered <b style={{ color: APT_COLOR }}>{e.count}</b> aptitude question{e.count === 1 ? '' : 's'} correctly</>
          ) : (
            <>solved{' '}
              <Box component="a" role="link" tabIndex={0} onClick={() => onOpenProblem(e.problem.slug)} onKeyDown={(k) => k.key === 'Enter' && onOpenProblem(e.problem.slug)} sx={{ fontWeight: 800, color: accent, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                {e.problem.title}
              </Box>
            </>
          )}
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
          {isApt ? <Chip color={APT_COLOR}>Aptitude</Chip> : <Chip color={accent}>{e.problem.difficulty}</Chip>}
          {!isApt && e.language && <Chip color="#64748B">{LANG[e.language] || e.language}</Chip>}
          {!isApt && e.runtimeMs != null && <Typography variant="caption" color="text.secondary" sx={mono}>{e.runtimeMs} ms</Typography>}
          <Typography variant="caption" color="text.secondary">· {timeAgo(e.at)}</Typography>
        </Stack>
      </Box>
      <Box sx={{ pt: 0.25, color: accent }}>{isApt ? <PsychologyRoundedIcon /> : <CheckCircleRoundedIcon />}</Box>
    </Stack>
  );
}

// "What did my friends solve?" — newest first, grouped by day.
export default function ActivityFeed() {
  const navigate = useNavigate();
  const online = useSelector((s) => s.friends.online);
  const hasFriends = useSelector((s) => s.friends.friends.length > 0);
  const [items, setItems] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (before) => {
    setBusy(true);
    try {
      const { data } = await friendsApi.activity(before);
      setItems((prev) => (before ? [...(prev || []), ...data.data.items] : data.data.items));
      setHasMore(data.data.hasMore);
      setError('');
    } catch (err) {
      setError(extractErrorMessage(err));
      setItems((prev) => prev || []);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!hasFriends) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 5, px: 2, color: 'text.secondary', textAlign: 'center' }}>
        <TimelineRoundedIcon sx={{ fontSize: 36 }} />
        <Typography variant="body2">Add friends to see what they solve here.</Typography>
      </Stack>
    );
  }

  let lastDay = '';
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, pt: 1, pb: 0.25 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Last 30 days</Typography>
        <Tooltip title="Refresh"><span><IconButton size="small" aria-label="Refresh activity" onClick={() => load()} disabled={busy}><RefreshRoundedIcon fontSize="small" /></IconButton></span></Tooltip>
      </Stack>
      {error && <Alert severity="error" sx={{ mx: 1.25, mb: 1 }} action={<Button color="inherit" onClick={() => load()}>Retry</Button>}>{error}</Alert>}
      {items === null && [0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={68} sx={{ mx: 1, mb: 0.85, borderRadius: '16px' }} />)}
      {items && items.length === 0 && !error && (
        <Stack alignItems="center" spacing={1} sx={{ py: 5, px: 2, color: 'text.secondary', textAlign: 'center' }}>
          <TimelineRoundedIcon sx={{ fontSize: 36 }} />
          <Typography variant="body2">Quiet for now — nobody has solved anything lately.<br />Be the first and set the pace!</Typography>
        </Stack>
      )}
      {items?.map((e) => {
        const day = dayLabel(e.at);
        const head = day !== lastDay;
        lastDay = day;
        return (
          <Box key={e.id}>
            {head && <Typography variant="caption" sx={{ display: 'block', px: 2, pt: 1.25, pb: 0.75, fontWeight: 800, color: 'text.secondary', letterSpacing: 0.4, textTransform: 'uppercase' }}>{day}</Typography>}
            <Item e={e} online={Boolean(online[e.user.userId])} onOpenProblem={(slug) => navigate(`/workspace/${slug}`)} />
          </Box>
        );
      })}
      {hasMore && (
        <Box sx={{ textAlign: 'center', py: 1.5 }}>
          <Button onClick={() => load(items[items.length - 1].at)} disabled={busy} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
            {busy ? 'Loading…' : 'Show more'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
