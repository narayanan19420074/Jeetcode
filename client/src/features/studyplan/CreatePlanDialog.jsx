import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Typography, Chip, Box,
  ToggleButton, ToggleButtonGroup, Alert, MenuItem,
} from '@mui/material';
import { studyPlanApi } from '../../api/studyPlanApi';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';
import { localDateInputValue } from './planUtils';

// Notion-style starter templates — they just pre-fill the form.
const TEMPLATES = [
  { label: '7-day mixed sprint', values: { title: '7-day mixed sprint', durationDays: 7, problemsPerDay: 2, aptitudePerDay: 5, difficulties: ['Easy', 'Medium'] } },
  { label: '30-day DSA starter', values: { title: '30-day DSA starter', durationDays: 30, problemsPerDay: 2, aptitudePerDay: 0, difficulties: ['Easy', 'Medium'] } },
  { label: '14-day aptitude boost', values: { title: '14-day aptitude boost', durationDays: 14, problemsPerDay: 0, aptitudePerDay: 10, difficulties: [] } },
];

const initial = () => ({
  title: '', description: '', startDate: localDateInputValue(), durationDays: 14,
  problemsPerDay: 2, aptitudePerDay: 0, difficulties: [], tagsText: '', aptitudePatternSlugs: [], customText: '',
});

// "3: Revise recursion notes" per line -> [{ day: 3, title: '...' }]
function parseCustomTasks(text) {
  const tasks = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(?:day\s*)?(\d{1,2})\s*[:\-–]\s*(.+)$/i);
    if (!m) return { error: `Couldn't read "${line}" — use the format  3: Revise recursion notes` };
    tasks.push({ day: Number(m[1]), title: m[2].trim() });
  }
  return { tasks };
}

export default function CreatePlanDialog({ open, onClose, onCreated }) {
  const [f, setF] = useState(initial);
  const [patterns, setPatterns] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setF(initial());
    setError('');
    aptitudeApi
      .listPatterns()
      .then(({ data }) => setPatterns(data.data?.items || []))
      .catch(() => setPatterns([]));
  }, [open]);

  const set = (patch) => setF((prev) => ({ ...prev, ...patch }));
  const num = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));

  const submit = async () => {
    setError('');
    const custom = parseCustomTasks(f.customText);
    if (custom.error) return setError(custom.error);
    setSaving(true);
    try {
      const { data } = await studyPlanApi.create({
        title: f.title.trim(),
        description: f.description.trim(),
        startDate: f.startDate,
        durationDays: f.durationDays,
        problemsPerDay: f.problemsPerDay,
        aptitudePerDay: f.aptitudePerDay,
        difficulties: f.difficulties,
        tags: f.tagsText.split(',').map((t) => t.trim()).filter(Boolean),
        aptitudePatternSlugs: f.aptitudePatternSlugs,
        customTasks: custom.tasks,
      });
      onCreated(data.data.id);
    } catch (err) {
      const fieldErrors = err?.response?.data?.details;
      setError(fieldErrors ? Object.values(fieldErrors).flat().join(' · ') : extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>New study plan</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Start from a template</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 1 }}>
              {TEMPLATES.map((t) => (
                <Chip key={t.label} label={t.label} clickable variant="outlined" onClick={() => set(t.values)} />
              ))}
            </Stack>
          </Box>

          <TextField label="Plan name" value={f.title} onChange={(e) => set({ title: e.target.value })} inputProps={{ maxLength: 100 }} required fullWidth />
          <TextField label="Description (optional)" value={f.description} onChange={(e) => set({ description: e.target.value })} inputProps={{ maxLength: 300 }} fullWidth />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Start date" type="date" value={f.startDate} onChange={(e) => set({ startDate: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Duration (days)" type="number" value={f.durationDays} onChange={(e) => set({ durationDays: num(e.target.value, 1, 90) })} inputProps={{ min: 1, max: 90 }} fullWidth />
          </Stack>

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Coding problems</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
            <TextField label="Problems per day" type="number" value={f.problemsPerDay} onChange={(e) => set({ problemsPerDay: num(e.target.value, 0, 10) })} inputProps={{ min: 0, max: 10 }} sx={{ minWidth: 160 }} />
            <ToggleButtonGroup size="small" value={f.difficulties} onChange={(_, v) => set({ difficulties: v })}>
              {['Easy', 'Medium', 'Hard'].map((d) => <ToggleButton key={d} value={d} sx={{ px: 2 }}>{d}</ToggleButton>)}
            </ToggleButtonGroup>
          </Stack>
          <TextField label="Topics (optional, comma separated)" placeholder="array, dp, graph" value={f.tagsText} onChange={(e) => set({ tagsText: e.target.value })} fullWidth />

          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Aptitude</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Questions per day" type="number" value={f.aptitudePerDay} onChange={(e) => set({ aptitudePerDay: num(e.target.value, 0, 10) })} inputProps={{ min: 0, max: 10 }} sx={{ minWidth: 160 }} />
            <TextField
              select fullWidth label="Patterns (empty = all)" value={f.aptitudePatternSlugs}
              onChange={(e) => set({ aptitudePatternSlugs: e.target.value })}
              slotProps={{ select: { multiple: true } }} disabled={f.aptitudePerDay === 0}
            >
              {patterns.map((p) => <MenuItem key={p.slug} value={p.slug}>{p.title}</MenuItem>)}
            </TextField>
          </Stack>

          <TextField
            label="Your own tasks (optional)" multiline minRows={3} value={f.customText}
            onChange={(e) => set({ customText: e.target.value })}
            placeholder={'1: Revise arrays notes\n3: Watch recursion video'}
            helperText="One per line — day number, colon, task. You tick these yourself."
            fullWidth
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={submit} disabled={saving || !f.title.trim()} sx={{ fontWeight: 700 }}>
          {saving ? 'Creating…' : 'Create plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
