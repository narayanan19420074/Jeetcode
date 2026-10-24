import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Container, LinearProgress, Paper, Stack, Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import CheckoutDialog from './CheckoutDialog';
import { Coins, ItemArt } from './storeUtils';

const KIND_LABEL = { practice: 'Practice', read: 'Read', visual: 'Visual' };

export default function CoursePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(false);

  const load = useCallback(() => {
    storeApi.course(slug).then(({ data: d }) => setData(d.data)).catch((err) => setError(extractErrorMessage(err)));
  }, [slug]);
  useEffect(() => { load(); }, [load, isAuthenticated]);

  const toggle = async (key, done) => {
    // optimistic: tick right away, roll back on failure
    const prev = data;
    setData((d) => ({ ...d, progress: { ...d.progress, done: done ? [...d.progress.done, key] : d.progress.done.filter((k) => k !== key) } }));
    try {
      const { data: res } = await storeApi.markLesson(slug, key, done);
      setData((d) => ({ ...d, progress: res.data.progress }));
    } catch (err) {
      setData(prev);
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    }
  };

  if (error) return <Container sx={{ py: 6 }}><Alert severity="error">{error}</Alert><Button component={RouterLink} to="/store" sx={{ mt: 2 }}>Back to store</Button></Container>;
  if (!data) return <Box sx={{ display: 'grid', placeItems: 'center', height: '50vh' }}><CircularProgress /></Box>;

  const { course, owned, progress } = data;
  const doneSet = new Set(progress?.done || []);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Button component={RouterLink} to={owned ? '/store/orders?tab=library' : '/store?cat=courses'} startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>
        {owned ? 'My courses' : 'Courses'}
      </Button>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
          <Box sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}><ItemArt art={course.art} accent={course.accent} height={150} /></Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{course.name}</Typography>
            <Stack direction="row" spacing={1} sx={{ my: 1 }} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={course.level} />
              <Chip size="small" label={`${course.lessonCount} lessons`} />
              <Chip size="small" label={`${Math.round(course.minutes / 60)} hours`} />
            </Stack>
            <Typography color="text.secondary">{course.desc}</Typography>

            {owned ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{progress.doneCount}/{progress.lessonCount} done · {progress.percent}%</Typography>
                <LinearProgress variant="determinate" value={progress.percent} sx={{ height: 8, borderRadius: 4, mt: 0.5 }} />
                {progress.percent === 100 && <Alert severity="success" sx={{ mt: 1.5 }}>Course complete. Nice work!</Alert>}
              </Box>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <Coins value={course.price} size={24} />
                <Button
                  variant="contained" disableElevation sx={{ fontWeight: 800 }}
                  onClick={() => (isAuthenticated ? setBuying(true) : navigate('/login', { state: { from: `/store/course/${slug}` } }))}
                >
                  {isAuthenticated ? 'Redeem course' : 'Sign in to redeem'}
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>

      {course.modules.map((m, mi) => (
        <Paper key={m.id} variant="outlined" sx={{ borderRadius: 3, mb: 1.5, overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.25, bgcolor: 'action.hover' }}>
            <Typography sx={{ fontWeight: 800 }}>Module {mi + 1} · {m.title}</Typography>
          </Box>
          {m.lessons.map((l) => (
            <Stack key={l.key} direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 1, borderTop: 1, borderColor: 'divider' }}>
              {owned ? (
                <Checkbox checked={doneSet.has(l.key)} onChange={(e) => toggle(l.key, e.target.checked)} inputProps={{ 'aria-label': `Mark ${l.title} done` }} />
              ) : <LockRoundedIcon sx={{ mx: 1.25, fontSize: 20, color: 'text.disabled' }} />}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, textDecoration: owned && doneSet.has(l.key) ? 'line-through' : 'none', color: owned && doneSet.has(l.key) ? 'text.secondary' : 'text.primary' }}>{l.title}</Typography>
                <Typography variant="caption" color="text.secondary">{KIND_LABEL[l.kind] || 'Lesson'} · {l.minutes} min</Typography>
              </Box>
              {owned && l.href && (
                <Button component={RouterLink} to={l.href} size="small" endIcon={<OpenInNewRoundedIcon fontSize="small" />} sx={{ fontWeight: 700 }}>Open</Button>
              )}
            </Stack>
          ))}
        </Paper>
      ))}

      <CheckoutDialog
        item={course} balance={user?.coins ?? 0} open={buying} onClose={() => setBuying(false)}
        onDone={() => { setBuying(false); enqueueSnackbar(`${course.name} unlocked!`, { variant: 'success' }); load(); }}
      />
    </Container>
  );
}
