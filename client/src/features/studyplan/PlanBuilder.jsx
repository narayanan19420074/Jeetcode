import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Badge, Box, Button, Chip, CircularProgress, IconButton, InputAdornment, MenuItem, Skeleton, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { problemsApi } from '../../api/problemsApi';
import { aptitudeApi } from '../../api/aptitudeApi';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import MonthCalendar from './MonthCalendar';
import { DiffTag, addDays, fmtDay, keyToDate, localKey } from './planUtils';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const itemKey = (type, id) => `${type}:${id}`;
const PAGE = 20;
const DAY_MS = 86400000;
// Both panels scroll inside themselves, so the page itself never grows.
const panelHeight = { xs: 'min(60dvh, 500px)', md: 'calc(100dvh - 250px)' };
const compactField = { '& .MuiInputBase-root': { height: 34, fontSize: 13 } };

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// Spread the questions from today up to the finish date: first one today, last one on the finish date.
function schedule(items, today, end) {
  const days = Math.max(1, Math.round((keyToDate(end) - keyToDate(today)) / DAY_MS) + 1);
  const n = items.length;
  return items.map((it, i) => ({ ...it, date: addDays(today, n === 1 ? days - 1 : Math.round((i * (days - 1)) / (n - 1))) }));
}

// Search, difficulty, topic, hide-solved. Scrolls inside its own box and loads more as you reach the bottom.
function QuestionPicker({ items, added, onToggle }) {
  const [source, setSource] = useState('problem');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tag, setTag] = useState('');
  const [pattern, setPattern] = useState('');
  const [hideSolved, setHideSolved] = useState(false);
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [tags, setTags] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const q = useDebounced(search);
  const busy = useRef(false);

  useEffect(() => {
    problemsApi.getTags().then(({ data }) => setTags(data.data?.items || data.data || [])).catch(() => {});
    aptitudeApi
      .listPatterns()
      .then(({ data }) => {
        const list = data.data?.items || [];
        setPatterns(list);
        if (list[0]) setPattern(list[0].slug);
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
        const { items: list, pagination } = data.data;
        return {
          items: list.map((r) => ({
            type: 'problem', id: r._id, title: r.title, difficulty: r.difficulty, solved: r.solvedByMe, locked: r.locked,
            meta: (r.tags || []).slice(0, 2).join(' · '),
          })),
          more: p < pagination.totalPages,
        };
      }
      const { data } = await aptitudeApi.listPracticeQuestions(pattern, {
        page: p, limit: PAGE, search: q || undefined, difficulty: difficulty ? difficulty.toLowerCase() : undefined,
        status: hideSolved ? 'unsolved' : undefined,
      });
      const { items: list, total } = data.data;
      return {
        items: list.map((r) => ({
          type: 'aptitude', id: r._id, title: r.title, difficulty: cap(r.difficulty), solved: r.status === 'solved', meta: r.subPattern || '',
        })),
        more: p * PAGE < total,
      };
    },
    [source, pattern, q, difficulty, tag, hideSolved]
  );

  // Back to page 1 whenever a filter changes.
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
    if (busy.current || loading || !hasMore) return;
    busy.current = true;
    setLoading(true);
    try {
      const res = await fetchPage(page + 1);
      setRows((prev) => [...prev, ...res.items]);
      setHasMore(res.more);
      setPage((p) => p + 1);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  const onScroll = (e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) loadMore();
  };

  const shown = selectedOnly ? items : rows;

  return (
    <Box sx={[surface, { p: 1.25, display: 'flex', flexDirection: 'column', gap: 1, height: panelHeight, minHeight: 0 }]}>
      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
        <ToggleButtonGroup size="small" exclusive value={source} onChange={(_, v) => v && (setSource(v), setRows([]), setSelectedOnly(false))}>
          <ToggleButton value="problem" aria-label="Coding questions" sx={{ px: 1, height: 34 }}><Tooltip title="Coding"><CodeRoundedIcon fontSize="small" /></Tooltip></ToggleButton>
          <ToggleButton value="aptitude" aria-label="Aptitude questions" sx={{ px: 1, height: 34 }}><Tooltip title="Aptitude"><CalculateRoundedIcon fontSize="small" /></Tooltip></ToggleButton>
        </ToggleButtonGroup>
        <TextField
          size="small" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth sx={compactField}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
        />
        <Tooltip title={selectedOnly ? 'Show all' : 'Show selected only'}>
          <ToggleButton size="small" value="sel" selected={selectedOnly} onChange={() => setSelectedOnly((v) => !v)} aria-label="Show selected only" sx={{ px: 1, height: 34 }}>
            <Badge color="primary" badgeContent={items.length} max={99}><PlaylistAddCheckRoundedIcon fontSize="small" /></Badge>
          </ToggleButton>
        </Tooltip>
      </Box>

      {!selectedOnly && (
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
          <TextField select size="small" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={[compactField, { minWidth: 104 }]} slotProps={{ select: { displayEmpty: true } }}>
            <MenuItem value="">Any level</MenuItem>
            {['Easy', 'Medium', 'Hard'].map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
          {source === 'problem' ? (
            <TextField select size="small" value={tag} onChange={(e) => setTag(e.target.value)} sx={[compactField, { flex: 1, minWidth: 0 }]} slotProps={{ select: { displayEmpty: true } }}>
              <MenuItem value="">All topics</MenuItem>
              {tags.map((t) => <MenuItem key={t.tag} value={t.tag}>{t.tag} ({t.count})</MenuItem>)}
            </TextField>
          ) : (
            <TextField select size="small" value={pattern} onChange={(e) => setPattern(e.target.value)} sx={[compactField, { flex: 1, minWidth: 0 }]}>
              {patterns.map((p) => <MenuItem key={p.slug} value={p.slug}>{p.title}</MenuItem>)}
            </TextField>
          )}
          <Tooltip title="Hide solved">
            <ToggleButton size="small" value="hide" selected={hideSolved} onChange={() => setHideSolved((v) => !v)} aria-label="Hide solved" sx={{ px: 1, height: 34 }}>
              <VisibilityOffRoundedIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}

      <Box role="list" onScroll={onScroll} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin', mx: -0.5, px: 0.5 }}>
        {shown.map((r) => {
          const entry = added.get(itemKey(r.type, r.id));
          return (
            <Box
              key={itemKey(r.type, r.id)} role="listitem"
              sx={(t) => ({
                display: 'flex', alignItems: 'center', gap: 1, px: 0.75, py: 0.55, borderRadius: '8px',
                bgcolor: entry ? `${t.palette.primary.main}14` : 'transparent', '&:hover': { bgcolor: entry ? undefined : t.palette.action.hover },
              })}
            >
              <IconButton
                size="small" disabled={r.locked} onClick={() => onToggle(r)} aria-label={entry ? 'Remove from plan' : 'Add to plan'}
                sx={(t) => ({
                  width: 26, height: 26, border: `1.5px solid ${entry ? t.palette.primary.main : t.palette.divider}`,
                  bgcolor: entry ? t.palette.primary.main : 'transparent', color: entry ? t.palette.primary.contrastText : 'text.secondary',
                  '&:hover': { bgcolor: entry ? t.palette.primary.dark : t.palette.action.hover },
                })}
              >
                {r.locked ? <LockRoundedIcon sx={{ fontSize: 13 }} /> : entry ? <CheckRoundedIcon sx={{ fontSize: 15 }} /> : <AddRoundedIcon sx={{ fontSize: 15 }} />}
              </IconButton>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: 1.3 }}>{r.title}</Typography>
                {r.meta && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.2 }}>{r.meta}</Typography>}
              </Box>
              {r.solved && <Tooltip title="You solved this"><CheckRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} /></Tooltip>}
              <DiffTag difficulty={r.difficulty} />
            </Box>
          );
        })}
        {loading && !selectedOnly && (rows.length === 0
          ? [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={38} sx={{ borderRadius: '8px' }} />)
          : <Box sx={{ textAlign: 'center', py: 1 }}><CircularProgress size={16} /></Box>)}
        {!loading && shown.length === 0 && !error && (
          <Typography color="text.secondary" variant="body2" sx={{ py: 3, textAlign: 'center' }}>{selectedOnly ? 'Nothing selected yet.' : 'No questions match.'}</Typography>
        )}
      </Box>
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
  const [endDate, setEndDate] = useState(() => {
    const e = plan?.summary?.endDate;
    return e && e >= today ? e : addDays(today, 7);
  });
  const [cursor, setCursor] = useState(() => {
    const d = keyToDate(endDate);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });
  const [panel, setPanel] = useState('questions'); // phones show one panel at a time
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const added = useMemo(() => new Map(items.map((i) => [itemKey(i.type, i.id), i])), [items]);

  const toggle = (row) => {
    const k = itemKey(row.type, row.id);
    setItems((prev) =>
      prev.some((i) => itemKey(i.type, i.id) === k)
        ? prev.filter((i) => itemKey(i.type, i.id) !== k)
        : [...prev, { type: row.type, id: row.id, date: endDate, title: row.title, difficulty: row.difficulty }]
    );
  };

  const pickDate = (key) => {
    setEndDate(key);
    const d = keyToDate(key);
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };

  const days = Math.max(1, Math.round((keyToDate(endDate) - keyToDate(today)) / DAY_MS) + 1);
  const perDay = items.length ? Math.ceil(items.length / days) : 0;

  const save = async () => {
    setError('');
    setSaving(true);
    try {
      // Editing without touching the questions or the date keeps the existing schedule as it is.
      const origKeys = plan ? plan.items.map((i) => itemKey(i.type, i.type === 'problem' ? i.problemId : i.aptitudeQuestionId)) : [];
      const same = plan && endDate === plan.summary.endDate && origKeys.length === items.length && origKeys.every((k) => added.has(k));
      const planned = same ? items : schedule(items, today, endDate);
      const payload = { title: title.trim(), items: planned.map(({ type, id, date }) => ({ type, id, date })) };
      const { data } = plan ? await studyPlanApi.save(plan.id, payload) : await studyPlanApi.create(payload);
      onSaved(data.data.id);
    } catch (err) {
      const details = err?.response?.data?.details;
      setError(details ? Object.values(details).flat().join(' · ') : extractErrorMessage(err));
      setSaving(false);
    }
  };

  const datePanel = (
    <Box sx={[surface, { p: 1.5, display: { xs: panel === 'date' ? 'block' : 'none', md: 'block' } }]}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
        <EventRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>Finish by <Box component="span" sx={{ color: 'primary.main' }}>{fmtDay(endDate)}</Box></Typography>
      </Box>
      <MonthCalendar cursor={cursor} onCursor={setCursor} selected={endDate} onSelect={pickDate} today={today} min={today} />
      <Box sx={{ display: 'flex', gap: 0.75, mt: 1.25 }}>
        {[['1 week', 7], ['2 weeks', 14], ['1 month', 30]].map(([label, n]) => (
          <Chip key={label} size="small" label={label} clickable onClick={() => pickDate(addDays(today, n))} variant={endDate === addDays(today, n) ? 'filled' : 'outlined'} color={endDate === addDays(today, n) ? 'primary' : 'default'} sx={{ fontWeight: 600 }} />
        ))}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <IconButton onClick={onCancel} aria-label="Back" edge="start"><ArrowBackRoundedIcon /></IconButton>
        <TextField
          variant="standard" placeholder="Plan name" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus={!plan}
          slotProps={{ htmlInput: { maxLength: 100, 'aria-label': 'Plan name' } }} fullWidth
          sx={{ '& input': { fontSize: 18, fontWeight: 700 } }}
        />
      </Box>

      <ToggleButtonGroup
        size="small" exclusive value={panel} onChange={(_, v) => v && setPanel(v)} fullWidth
        sx={{ display: { xs: 'flex', md: 'none' }, mb: 1 }}
      >
        <ToggleButton value="questions" sx={{ gap: 0.75, textTransform: 'none', fontWeight: 700 }}><ListAltRoundedIcon fontSize="small" />Questions · {items.length}</ToggleButton>
        <ToggleButton value="date" sx={{ gap: 0.75, textTransform: 'none', fontWeight: 700 }}><EventRoundedIcon fontSize="small" />{fmtDay(endDate, { weekday: undefined })}</ToggleButton>
      </ToggleButtonGroup>

      <Box sx={{ display: 'grid', gap: 1.5, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.5fr) minmax(280px,1fr)' } }}>
        <Box sx={{ display: { xs: panel === 'questions' ? 'block' : 'none', md: 'block' }, minWidth: 0 }}>
          <QuestionPicker items={items} added={added} onToggle={toggle} />
        </Box>
        {datePanel}
      </Box>

      <Box
        sx={(t) => ({
          position: 'sticky', bottom: 8, mt: 1.5, px: 1.5, py: 1, display: 'flex', alignItems: 'center', gap: 1.5,
          borderRadius: '12px', border: `1px solid ${t.palette.divider}`, bgcolor: t.palette.background.paper, boxShadow: '0 10px 26px -14px rgba(2,6,23,0.4)', zIndex: 2,
        })}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{items.length} question{items.length === 1 ? '' : 's'} · by {fmtDay(endDate, { weekday: undefined })}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {error ? <Box component="span" sx={{ color: 'error.main' }}>{error}</Box> : items.length ? `${days} day${days === 1 ? '' : 's'} · about ${perDay}/day` : 'Pick questions to begin'}
          </Typography>
        </Box>
        <Button onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={save} disabled={saving || !title.trim() || items.length === 0} sx={{ fontWeight: 700, px: 3 }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Box>
    </Box>
  );
}
