import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Dialog, DialogContent, IconButton, LinearProgress, Stack, Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { Coins, ItemArt } from './storeUtils';

const KIND_LABEL = { practice: 'Practice', read: 'Read', visual: 'Visual' };

// Course syllabus + progress in a dialog, so the whole store stays on one page.
export default function CoursePanel({ slug, signedIn, onClose, onBuy, onProgress }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!slug) return;
    setData(null);
    setError(null);
    storeApi.course(slug).then(({ data: d }) => setData(d.data)).catch((err) => setError(extractErrorMessage(err)));
  }, [slug]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (key, done) => {
    const prev = data;
    setData((d) => ({ ...d, progress: { ...d.progress, done: done ? [...d.progress.done, key] : d.progress.done.filter((k) => k !== key) } }));
    try {
      const { data: res } = await storeApi.markLesson(slug, key, done);
      setData((d) => ({ ...d, progress: res.data.progress }));
      onProgress?.();
    } catch (err) {
      setData(prev);
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    }
  };

  const course = data?.course;
  const owned = data?.owned;
  const progress = data?.progress;
  const doneSet = new Set(progress?.done || []);

  return (
    <Dialog open={Boolean(slug)} onClose={onClose} fullScreen={fullScreen} fullWidth maxWidth="md" scroll="paper">
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography sx={{ flex: 1, fontWeight: 800 }} noWrap>{course?.name || 'Course'}</Typography>
        <IconButton onClick={onClose} aria-label="Close"><CloseRoundedIcon /></IconButton>
      </Box>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {error && <Alert severity="error">{error}</Alert>}
        {!data && !error && <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>}
        {course && (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mb: 3 }}>
              <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}><ItemArt art={course.art} accent={course.accent} height={130} /></Box>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
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
                    <Button variant="contained" disableElevation sx={{ fontWeight: 800 }} onClick={() => onBuy(course)}>
                      {signedIn ? 'Redeem course' : 'Sign in to redeem'}
                    </Button>
                  </Stack>
                )}
              </Box>
            </Stack>

            {course.modules.map((m, mi) => (
              <Box key={m.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 3, mb: 1.5, overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 1.25, bgcolor: 'action.hover' }}>
                  <Typography sx={{ fontWeight: 800 }}>Module {mi + 1} · {m.title}</Typography>
                </Box>
                {m.lessons.map((l) => (
                  <Stack key={l.key} direction="row" alignItems="center" spacing={1} sx={{ px: 1.5, py: 0.75, borderTop: 1, borderColor: 'divider' }}>
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
              </Box>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
