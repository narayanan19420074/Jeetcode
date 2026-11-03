import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert, Box, Button, Skeleton, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { friendsApi } from '../../api/friendsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import { APT_COLOR, PersonAvatar, dayLabel, mono, timeAgo } from './friendsUi';
import { EmptyNote, Reveal, SectionLabel } from './friendsKit';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../app/design/designTokens';

const LANG = { javascript: 'JS', python: 'Python', cpp: 'C++', java: 'Java' };

function Chip({ color, children }) {
  return (
    <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, bgcolor: tint(color, 16), color }}>
      {children}
    </Box>
  );
}

function Item({ e, online, onOpenProblem }) {
  const isApt = e.type === 'aptitude';
  const accent = isApt ? APT_COLOR : DIFF_COLOR[e.problem.difficulty];
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', mx: 1, px: 1.5, py: 1 }}>
      <PersonAvatar person={e.user} size={40} online={online} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: 1.45 }}>
          <b>{e.user.name}</b>{' '}
          {isApt ? (
            <>answered <b style={{ color: APT_COLOR }}>{e.count}</b> aptitude question{e.count === 1 ? '' : 's'} correctly</>
          ) : (
            <>solved{' '}
              <Box component="a" role="link" tabIndex={0} onClick={() => onOpenProblem(e.problem.slug)} onKeyDown={(k) => k.key === 'Enter' && onOpenProblem(e.problem.slug)} sx={{ fontWeight: FONT_WEIGHTS.bold, color: accent, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                {e.problem.title}
              </Box>
            </>
          )}
        </Typography>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
          {isApt ? <Chip color={APT_COLOR}>Aptitude</Chip> : <Chip color={accent}>{e.problem.difficulty}</Chip>}
          {!isApt && e.language && <Chip color={COLOR_PALETTE.slate[500]}>{LANG[e.language] || e.language}</Chip>}
          {!isApt && e.runtimeMs != null && <Typography sx={{ fontSize: FONT_SIZES.caption, color: 'text.secondary', ...mono }}>{e.runtimeMs} ms</Typography>}
          <Typography sx={{ fontSize: FONT_SIZES.caption, color: 'text.disabled' }}>{timeAgo(e.at)}</Typography>
        </Stack>
      </Box>
      <Box sx={{ pt: 0.5, color: accent, '& svg': { fontSize: FONT_SIZES.subheading } }}>{isApt ? <PsychologyRoundedIcon /> : <CheckCircleRoundedIcon />}</Box>
    </Stack>
  );
}

// "What did my friends solve?" newest first, grouped by day.
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

  useEffect(() => { load(); }, [load]);

  if (!hasFriends) return <EmptyNote icon={<TimelineRoundedIcon />} title="No activity yet">Add friends to see what they solve here.</EmptyNote>;

  let lastDay = '';
  return (
    <Box>
      {error && <Alert severity="error" sx={{ mx: 1.5, my: 1 }} action={<Button color="inherit" onClick={() => load()}>Retry</Button>}>{error}</Alert>}
      {items === null && [0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={60} sx={{ mx: 2, my: 1.5, borderRadius: RADII_PX.card }} />)}
      {items && items.length === 0 && !error && <EmptyNote icon={<TimelineRoundedIcon />} title="Quiet for now">Nobody has solved anything in the last 30 days. Be the first.</EmptyNote>}
      {items?.map((e, i) => {
        const day = dayLabel(e.at);
        const head = day !== lastDay;
        lastDay = day;
        return (
          <Reveal key={e.id} index={i}>
            {head && <SectionLabel>{day}</SectionLabel>}
            <Item e={e} online={Boolean(online[e.user.userId])} onOpenProblem={(slug) => navigate(`/workspace/${slug}`)} />
          </Reveal>
        );
      })}
      {hasMore && (
        <Box sx={{ textAlign: 'center', py: 1.5 }}>
          <Button onClick={() => load(items[items.length - 1].at)} disabled={busy} size="small" sx={{ textTransform: 'none', fontWeight: FONT_WEIGHTS.semibold }}>{busy ? 'Loading…' : 'Show more'}</Button>
        </Box>
      )}
    </Box>
  );
}
