import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, ButtonBase, CircularProgress, IconButton, InputAdornment, MenuItem, Skeleton, Stack, Switch,
  FormControlLabel, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { problemsApi } from '../../api/problemsApi';
import { aptitudeApi } from '../../api/aptitudeApi';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import MonthCalendar from './MonthCalendar';
import { DiffTag, addDays, fmtDay, fmtRange, keyToDate, localKey, relDay } from './planUtils';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const itemKey = (type, id) => `${type}:${id}`;
const PAGE = 20;

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// LeetCode-style question picker: search, difficulty, topic, hide-solved, load more.
function QuestionPicker({ added, selectedDate, onToggle }) {
  const [source, setSource] = useState('problem');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tag, setTag] = useState('');
  const [pattern, setPattern] = useState('');
  const [hideSolved, setHideSolved] = useState(false);
  const [tags, setTags] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const q = useDebounced(search);

  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setTags(data.data?.items || data.data || [])).catch(() => {});
    aptitudeApi
      .listPatterns()
      .then(({ data }) => {
        const items = data.data?.items || [];
        setPatterns(items);
        if (items[0]) setPattern(items[0].slug);
      })
      .catch(() => {});
  }, []);

  const fetchPage = useCallback(
    async (p) => {
      if (source === 'aptitude' && !pattern) return { items: [], more: false };
      if (source === 'problem') {
        const { data } = await problemsApi.list({
          page: p, limit: PAGE, sort: 'difficulty-asc',
          search: q || undefined, difficulty: difficulty || undefined, tag: tag ? [tag] : undefined,
          status: hideSolved ? 'unsolved' : undefined,
        });
        const { items, pagination } = data.data;
        return {
          items: items.map((r) => ({
            type: 'problem', id: r._id, title: r.title, difficulty: r.difficulty, solved: r.solvedByMe, locked: r.locked,
            meta: (r.tags || []).slice(0, 2).join(' · '), slug: r.slug,
          })),
          more: p < pagination.totalPages,
        };
      }
      const { data } = await aptitudeApi.listPracticeQuestions(pattern, {
        page: p, limit: PAGE, search: q || undefined, difficulty: difficulty ? difficulty.toLowerCase() : undefined,
        status: hideSolved ? 'unsolved' : undefined,
      });
      const { items, total } = data.data;
      return {
        items: items
          .map((r) => ({
            type: 'aptitude', id: r._id, title: r.title, difficulty: cap(r.difficulty), solved: r.status === 'solved',
            meta: r.subPattern || '', patternSlug: pattern,
          })),
        more: p * PAGE < total,
      };
    },
    [source, pattern, q, difficulty, tag, hideSolved]
  );

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPage(1)
      .then((res) => {
        if (cancelled) return;
        setRows(res.items);
        setHasMore(res.more);
        setPage(1);
      })
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [fetchPage]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await fetchPage(page + 1);
      setRows((prev) => [...prev, ...res.items]);
      setHasMore(res.more);
      setPage((p) => p + 1);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={[surface, { p: 2 }]}>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
        <ToggleButtonGroup size="small" exclusive value={source} onChange={(_, v) => v && (setSource(v), setRows([]))}>
          <ToggleButton value="problem" sx={{ px: 1.75, fontWeight: 700 }}>Coding</ToggleButton>
          <ToggleButton value="aptitude" sx={{ px: 1.75, fontWeight: 700 }}>Aptitude</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1, minWidth: 150 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
        />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
        <ToggleButtonGroup size="small" exclusive value={difficulty} onChange={(_, v) => setDifficulty(v ?? '')}>
          {['Easy', 'Medium', 'Hard'].map((d) => <ToggleButton key={d} value={d} sx={{ px: 1.4, textTransform: 'none', fontWeight: 600 }}>{d}</ToggleButton>)}
        </ToggleButtonGroup>
        {source === 'problem' ? (
          <TextField select size="small" value={tag} onChange={(e) => setTag(e.target.value)} sx={{ minWidth: 150 }} slotProps={{ select: { displayEmpty: true } }}>
            <MenuItem value="">All topics</MenuItem>
            {tags.map((t) => <MenuItem key={t.tag} value={t.tag}>{t.tag} ({t.count})</MenuItem>)}
          </TextField>
        ) : (
          <TextField select size="small" value={pattern} onChange={(e) => setPattern(e.target.value)} sx={{ minWidth: 170 }}>
            {patterns.map((p) => <MenuItem key={p.slug} value={p.slug}>{p.title}</MenuItem>)}
          </TextField>
        )}
        <FormControlLabel
          control={<Switch size="small" checked={hideSolved} onChange={(e) => setHideSolved(e.target.checked)} />}
          label={<Typography variant="body2">Hide solved</Typography>}
          sx={{ ml: 'auto', mr: 0 }}
        />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}

      <Box role="list" sx={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((r) => {
          const k = itemKey(r.type, r.id);
          const entry = added.get(k);
          return (
            <Box
              key={k} role="listitem"
              sx={(t) => ({
                display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: 0.9, borderRadius: '10px',
                bgcolor: entry ? `${t.palette.primary.main}14` : 'transparent', '&:hover': { bgcolor: entry ? undefined : t.palette.action.hover },
              })}
            >
              <Tooltip title={r.locked ? 'Pro question' : entry ? 'Remove from plan' : `Add to ${fmtDay(selectedDate)}`}>
                <span>
                  <IconButton
                    size="small" disabled={r.locked} onClick={() => onToggle(r)} aria-label={entry ? 'Remove from plan' : 'Add to plan'}
                    sx={(t) => ({
                      width: 28, height: 28, border: `1.5px solid ${entry ? t.palette.primary.main : t.palette.divider}`,
                      bgcolor: entry ? t.palette.primary.main : 'transparent', color: entry ? '#fff' : 'text.secondary',
                      '&:hover': { bgcolor: entry ? t.palette.primary.dark : t.palette.action.hover },
                    })}
                  >
                    {r.locked ? <LockRoundedIcon sx={{ fontSize: 14 }} /> : entry ? <CheckRoundedIcon sx={{ fontSize: 16 }} /> : <AddRoundedIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </span>
              </Tooltip>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{r.title}</Typography>
                {r.meta && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{r.meta}</Typography>}
              </Box>
              {r.solved && <Tooltip title="You solved this"><CheckRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} /></Tooltip>}
              {entry && <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', whiteSpace: 'nowrap' }}>{fmtDay(entry.date, { weekday: undefined })}</Typography>}
              <DiffTag difficulty={r.difficulty} />
            </Box>
          );
        })}
        {loading && rows.length === 0 && [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={44} sx={{ borderRadius: '10px' }} />)}
        {!loading && rows.length === 0 && !error && (
          <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>No questions match these filters.</Typography>
        )}
      </Box>

      {hasMore && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Button size="small" onClick={loadMore} disabled={loading} startIcon={loading ? <CircularProgress size={14} /> : null}>Load more</Button>
        </Box>
      )}
    </Box>
  );
}


// Quick fill: pick topic + difficulty + pace and the schedule fills itself (LeetCode-style study plan in one click).
function QuickFill({ selectedDate, onFill }) {
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [perDay, setPerDay] = useState(2);
  const [days, setDays] = useState(7);
  const [skipSolved, setSkipSolved] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setTags(data.data?.items || data.data || [])).catch(() => {});
  }, []);

  const run = async () => {
    setBusy(true);
    setMsg('');
    try {
      const need = Math.min(100, perDay * days);
      const { data } = await problemsApi.list({
        page: 1, limit: need, sort: 'difficulty-asc', difficulty: difficulty || undefined,
        tag: tag ? [tag] : undefined, status: skipSolved ? 'unsolved' : undefined,
      });
      const rows = data.data.items.filter((r) => !r.locked).map((r) => ({ type: 'problem', id: r._id, title: r.title, difficulty: r.difficulty }));
      const added = onFill(rows, perDay);
      setMsg(added ? `Added ${added} question${added === 1 ? '' : 's'} starting ${fmtDay(selectedDate)}.` : 'No new questions matched.');
    } catch (err) {
      setMsg(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={[surface, { p: 2 }]}>
      <Typography sx={{ fontWeight: 700 }}>Quick fill</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Let the schedule build itself, then adjust anything below.</Typography>
      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', sm: 'repeat(4, minmax(0,1fr))' }, alignItems: 'center' }}>
        <TextField select size="small" label="Topic" value={tag} onChange={(e) => setTag(e.target.value)}>
          <MenuItem value="">Any</MenuItem>
          {tags.map((t) => <MenuItem key={t.tag} value={t.tag}>{t.tag}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <MenuItem value="">Any</MenuItem>
          {['Easy', 'Medium', 'Hard'].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </TextField>
        <TextField size="small" type="number" label="Per day" value={perDay} onChange={(e) => setPerDay(Math.max(1, Math.min(10, Number(e.target.value) || 1)))} slotProps={{ htmlInput: { min: 1, max: 10 } }} />
        <TextField size="small" type="number" label="Days" value={days} onChange={(e) => setDays(Math.max(1, Math.min(60, Number(e.target.value) || 1)))} slotProps={{ htmlInput: { min: 1, max: 60 } }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
        <FormControlLabel control={<Switch size="small" checked={skipSolved} onChange={(e) => setSkipSolved(e.target.checked)} />} label={<Typography variant="body2">Skip questions I solved</Typography>} />
        <Button variant="outlined" size="small" onClick={run} disabled={busy} startIcon={busy ? <CircularProgress size={14} /> : null} sx={{ fontWeight: 700, ml: 'auto' }}>Fill from {fmtDay(selectedDate, { weekday: undefined })}</Button>
      </Box>
      {msg && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>{msg}</Typography>}
    </Box>
  );
}

// items: [{ type, id, date, title, difficulty }] — the plan being built.
export default function PlanBuilder({ plan, onSaved, onCancel }) {
  const today = localKey();
  const [title, setTitle] = useState(plan?.title || '');
  const [items, setItems] = useState(() =>
    (plan?.items || []).map((i) => ({
      type: i.type, id: i.type === 'problem' ? i.problemId : i.aptitudeQuestionId, date: i.date, title: i.title, difficulty: i.difficulty,
    }))
  );
  const [selected, setSelected] = useState(plan?.summary?.startDate && plan.summary.startDate > today ? plan.summary.startDate : today);
  const [cursor, setCursor] = useState(() => {
    const d = keyToDate(selected);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });
  const [perDay, setPerDay] = useState(2);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const added = useMemo(() => new Map(items.map((i) => [itemKey(i.type, i.id), i])), [items]);

  const toggle = (row) => {
    const k = itemKey(row.type, row.id);
    setItems((prev) =>
      prev.some((i) => itemKey(i.type, i.id) === k)
        ? prev.filter((i) => itemKey(i.type, i.id) !== k)
        : [...prev, { type: row.type, id: row.id, date: selected, title: row.title, difficulty: row.difficulty }]
    );
  };

  const moveTo = (it, date) => setItems((prev) => prev.map((i) => (i === it ? { ...i, date } : i)));
  const remove = (it) => setItems((prev) => prev.filter((i) => i !== it));

  // Returns how many questions were added.
  const fill = (rows, perDay) => {
    const have = new Set(items.map((i) => itemKey(i.type, i.id)));
    const fresh = rows.filter((r) => !have.has(itemKey(r.type, r.id))).slice(0, Math.max(0, 200 - items.length));
    setItems((prev) => [...prev, ...fresh.map((r, i) => ({ ...r, date: addDays(selected, Math.floor(i / Math.max(1, perDay))) }))]);
    return fresh.length;
  };

  // Re-assign dates: `perDay` questions per day, starting on the selected date.
  const spread = () =>
    setItems((prev) => {
      const ordered = [...prev].sort((a, b) => a.date.localeCompare(b.date));
      return ordered.map((it, i) => ({ ...it, date: addDays(selected, Math.floor(i / Math.max(1, perDay))) }));
    });

  const byDate = useMemo(() => {
    const m = new Map();
    items.forEach((i) => m.set(i.date, [...(m.get(i.date) || []), i]));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const marks = useMemo(() => Object.fromEntries(byDate.map(([d, list]) => [d, { count: list.length, state: 'scheduled' }])), [byDate]);
  const first = byDate[0]?.[0];
  const last = byDate[byDate.length - 1]?.[0];

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      const payload = { title: title.trim(), items: items.map(({ type, id, date }) => ({ type, id, date })) };
      const { data } = plan ? await studyPlanApi.save(plan.id, payload) : await studyPlanApi.create(payload);
      onSaved(data.data.id);
    } catch (err) {
      const details = err?.response?.data?.details;
      setError(details ? Object.values(details).flat().join(' · ') : extractErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={onCancel} aria-label="Back"><ArrowBackRoundedIcon /></IconButton>
        <TextField
          variant="standard" placeholder="Name your plan, e.g. Arrays in 2 weeks" value={title} onChange={(e) => setTitle(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 100, 'aria-label': 'Plan name' } }} fullWidth
          sx={{ '& input': { fontSize: 22, fontWeight: 800 } }}
        />
      </Box>

      <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.15fr) minmax(0,1fr)' } }}>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <QuickFill selectedDate={selected} onFill={fill} />
          <QuestionPicker added={added} selectedDate={selected} onToggle={toggle} />
        </Stack>

        <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 84 } }}>
          <Box sx={[surface, { p: 2 }]}>
            <MonthCalendar cursor={cursor} onCursor={setCursor} selected={selected} onSelect={setSelected} today={today} marks={marks} />
            <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 600 }}>
              New questions go to <Box component="span" sx={{ color: 'primary.main' }}>{relDay(selected, today)}</Box>
            </Typography>
            <Typography variant="caption" color="text.secondary">Pick a date, then add questions from the list.</Typography>
          </Box>

          <Box sx={[surface, { p: 2 }]}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontWeight: 800, flex: 1 }}>Schedule</Typography>
              {items.length > 1 && (
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                  <TextField
                    size="small" type="number" value={perDay} onChange={(e) => setPerDay(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                    slotProps={{ htmlInput: { min: 1, max: 20, 'aria-label': 'Questions per day' }, input: { endAdornment: <InputAdornment position="end">/day</InputAdornment> } }}
                    sx={{ width: 96 }}
                  />
                  <Tooltip title={`Spread all questions from ${fmtDay(selected)}`}><Button size="small" onClick={spread} sx={{ fontWeight: 700 }}>Spread</Button></Tooltip>
                </Stack>
              )}
            </Box>

            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Nothing yet. Add questions from the list on the left.</Typography>
            ) : (
              <Box sx={{ maxHeight: 340, overflowY: 'auto', pr: 0.5 }}>
                {byDate.map(([date, list]) => (
                  <Box key={date} sx={{ mb: 1.25 }}>
                    <ButtonBase onClick={() => { setSelected(date); const d = keyToDate(date); setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() }); }} sx={{ display: 'block', textAlign: 'left', mb: 0.25 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: date === selected ? 'primary.main' : 'text.secondary', letterSpacing: 0.4 }}>
                        {relDay(date, today).toUpperCase()} · {list.length}
                      </Typography>
                    </ButtonBase>
                    {list.map((it) => (
                      <Box key={itemKey(it.type, it.id)} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.25 }}>
                        <Typography variant="body2" noWrap sx={{ flex: 1, fontWeight: 500 }}>{it.title}</Typography>
                        <DiffTag difficulty={it.difficulty} />
                        {it.date !== selected && (
                          <Tooltip title={`Move to ${fmtDay(selected)}`}>
                            <IconButton size="small" onClick={() => moveTo(it, selected)} aria-label="Move to selected date"><EventAvailableRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
                          </Tooltip>
                        )}
                        <IconButton size="small" onClick={() => remove(it)} aria-label={`Remove ${it.title}`}><CloseRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      <Box
        sx={(t) => ({
          position: 'sticky', bottom: 12, mt: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
          borderRadius: '14px', border: `1px solid ${t.palette.divider}`, bgcolor: t.palette.background.paper, boxShadow: '0 12px 30px -12px rgba(2,6,23,0.35)', zIndex: 2,
        })}
      >
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>{items.length} question{items.length === 1 ? '' : 's'} · {byDate.length} day{byDate.length === 1 ? '' : 's'}</Typography>
          <Typography variant="caption" color="text.secondary">{fmtRange(first, last)}</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}
        <Button onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={save} disabled={saving || !title.trim() || items.length === 0} sx={{ fontWeight: 700, px: 3 }}>
          {saving ? 'Saving…' : plan ? 'Save changes' : 'Save plan'}
        </Button>
      </Box>
    </Box>
  );
}
