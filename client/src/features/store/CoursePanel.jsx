import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Checkbox, CircularProgress, Typography } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useSnackbar } from 'notistack';
import { storeApi } from '../../api/storeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { Bar, Eyebrow, FFButton, FFDialog, Notice, Tag } from '../quests/QuestParts';
import { FF } from '../quests/questUtils';
import { Coins, ItemArt } from './storeUtils';

const KIND_LABEL = { practice: 'Practice', read: 'Read', visual: 'Visual' };

// Course syllabus + progress in a dialog, so the whole store stays on one page.
export default function CoursePanel({ slug, signedIn, onClose, onBuy, onProgress }) {
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
    <FFDialog open={Boolean(slug)} onClose={onClose} title={course?.name || 'Course'} wide>
      {error && <Notice tone="error">{error}</Notice>}
      {!data && !error && <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>}
      {course && (
        <>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
            <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0, border: `1px solid ${FF.line}` }}><ItemArt art={course.art} accent={course.accent} height={130} image={course.image} /></Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                <Tag>{course.level}</Tag>
                <Tag>{course.lessonCount} lessons</Tag>
                <Tag>{Math.round(course.minutes / 60)} hours</Tag>
              </Box>
              <Typography sx={{ color: FF.muted, lineHeight: 1.6 }}>{course.desc}</Typography>
              {owned ? (
                <Box sx={{ mt: 2.5 }}>
                  <Typography sx={{ mb: 0.75, fontSize: 14, fontWeight: 800, color: FF.text }}>{progress.doneCount}/{progress.lessonCount} done · {progress.percent}%</Typography>
                  <Bar pct={progress.percent} height={9} color={progress.percent === 100 ? FF.green : FF.orange} />
                  {progress.percent === 100 && <Notice tone="success" sx={{ mt: 2 }}>Course complete. Nice work!</Notice>}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2.5, mt: 2.5 }}>
                  <Coins value={course.price} size={26} />
                  <FFButton onClick={() => onBuy(course)}>{signedIn ? 'Redeem course' : 'Sign in to redeem'}</FFButton>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gap: 2.5 }}>
            {course.modules.map((m, mi) => (
              <Box key={m.id} sx={{ border: `1px solid ${FF.line}` }}>
                <Box sx={{ px: 2.5, py: 1.75, bgcolor: FF.panelHi }}>
                  <Eyebrow sx={{ color: FF.orangeInk }}>Module {mi + 1}</Eyebrow>
                  <Typography sx={{ fontWeight: 800, color: FF.text }}>{m.title}</Typography>
                </Box>
                {m.lessons.map((l) => {
                  const done = owned && doneSet.has(l.key);
                  return (
                    <Box key={l.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderTop: `1px solid ${FF.line}` }}>
                      {owned ? (
                        <Checkbox checked={doneSet.has(l.key)} onChange={(e) => toggle(l.key, e.target.checked)} inputProps={{ 'aria-label': `Mark ${l.title} done` }} sx={{ color: FF.muted, '&.Mui-checked': { color: FF.green } }} />
                      ) : <LockRoundedIcon sx={{ mx: 1.5, fontSize: 20, color: FF.muted }} />}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, textDecoration: done ? 'line-through' : 'none', color: done ? FF.muted : FF.text }}>{l.title}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: FF.muted }}>{KIND_LABEL[l.kind] || 'Lesson'} · {l.minutes} min</Typography>
                      </Box>
                      {owned && l.href && (
                        <FFButton component={RouterLink} to={l.href} tone="dark" sx={{ minHeight: 36, px: 2 }}>Open <OpenInNewRoundedIcon sx={{ fontSize: 16 }} /></FFButton>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </>
      )}
    </FFDialog>
  );
}
