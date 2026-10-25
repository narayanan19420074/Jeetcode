import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Badge, Box, Button, ButtonBase, Chip, CircularProgress, IconButton, InputAdornment, MenuItem, Skeleton, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography, alpha,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
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
import { DiffTag, PLAN_RED, PLAN_THEMES, addDays, fmtDay, keyToDate, localKey } from './planUtils';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const itemKey = (type, id) => `${type}:${id}`;
const PAGE = 20;
const DAY_MS = 86400000;
// The question list scrolls inside its own box, so the page itself never grows.
const panelHeight = { xs: 'min(62dvh, 540px)', md: 'calc(100dvh - 400px)' };
const compactField = { '& .MuiInputBase-root': { height: 38, fontSize: 13.5 } };
const NAME_IDEAS = ['Interview prep', 'Aptitude sprint', 'DSA basics', 'Placement drive'];
const PRESETS = [['1 week', 7], ['2 weeks', 14], ['1 month', 30]];

// One colour per step: the same colour marks the step in the tracker, the heading and the controls inside it.
const STEPS = [
  { key: 'name', label: 'Name', color: PLAN_RED, Icon: EditRoundedIcon },
  { key: 'questions', label: 'Questions', color: PLAN_RED, Icon: ListAltRoundedIcon },
  { key: 'deadline', label: 'Deadline', color: PLAN_RED, Icon: EventRoundedIcon },
];

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

// ---------- step tracker ----------

function Stepper({ step, onGo, canGo }) {
  return (
    <Box role="tablist" aria-label="Plan steps" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
      {STEPS.map((st, i) => {
        const active = i === step;
        const done = i < step;
        const { Icon } = st;
        return (
          <Box
            key={st.key}
            sx={(t) => ({
              position: 'relative', display: 'flex', justifyContent: 'center',
              '&::before': i === 0 ? undefined : {
                content: '""', position: 'absolute', top: 19, left: 'calc(-50% + 26px)', right: 'calc(50% + 26px)', height: 3, borderRadius: 2,
                bgcolor: i <= step ? STEPS[i - 1].color : t.palette.divider, transition: 'background-color .3s',
              },
            })}
          >
            <ButtonBase
              role="tab" aria-selected={active} aria-label={`Step ${i + 1}: ${st.label}`} disabled={!canGo(i)} onClick={() => onGo(i)}
              sx={{ flexDirection: 'column', gap: 0.6, px: 1, py: 0.25, borderRadius: '12px', fontFamily: 'inherit', '&.Mui-disabled': { opacity: 0.7 } }}
            >
              <Box
                sx={(t) => ({
                  width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'all .25s',
                  bgcolor: active || done ? st.color : t.palette.action.hover,
                  color: active || done ? '#fff' : t.palette.text.secondary,
                  border: `2px solid ${active || done ? st.color : t.palette.divider}`,
                  boxShadow: active ? `0 0 0 5px ${alpha(st.color, 0.22)}` : 'none',
                  '& svg': { fontSize: 21 },
                })}
              >
                {done ? <CheckRoundedIcon /> : <Icon />}
              </Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: active ? 'text.primary' : 'text.secondary' }}>{st.label}</Typography>
            </ButtonBase>
          </Box>
        );
      })}
    </Box>
  );
}

// Heading shared by every step: small coloured "STEP n OF 3", the question, and one line of help.
function StepHead({ index, title, help, right }) {
  const st = STEPS[index];
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.8, color: st.color }}>STEP {index + 1} OF {STEPS.length}</Typography>
        <Typography component="h2" sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' }, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.3, mt: 0.25 }}>{title}</Typography>
        {help && <Typography color="text.secondary" sx={{ fontSize: 14, mt: 0.5 }}>{help}</Typography>}
      </Box>
      {right}
    </Box>
  );
}

// ---------- step 2: question picker ----------

// Search, difficulty, topic, hide-solved. Scrolls inside its own box and loads more as you reach the bottom.
function QuestionPicker({ items, added, onToggle }) {
  const accent = STEPS[1].color;
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
    <Box sx={(t) => ({ display: 'flex', flexDirection: 'column', gap: 1, height: panelHeight, minHeight: 380, border: `1px solid ${t.palette.divider}`, borderRadius: '14px', p: 1.25, bgcolor: alpha(t.palette.text.primary, 0.02) })}>
      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
        <ToggleButtonGroup size="small" exclusive value={source} onChange={(_, v) => v && (setSource(v), setRows([]), setSelectedOnly(false))}>
          <ToggleButton value="problem" aria-label="Coding questions" sx={{ px: 1.25, height: 38, gap: 0.5, fontWeight: 700, fontSize: 13 }}><CodeRoundedIcon fontSize="small" />Coding</ToggleButton>
          <ToggleButton value="aptitude" aria-label="Aptitude questions" sx={{ px: 1.25, height: 38, gap: 0.5, fontWeight: 700, fontSize: 13 }}><CalculateRoundedIcon fontSize="small" />Aptitude</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flex: 1 }} />
        <Tooltip title={selectedOnly ? 'Show all questions' : 'Show only my picks'}>
          <ToggleButton size="small" value="sel" selected={selectedOnly} onChange={() => setSelectedOnly((v) => !v)} aria-label="Show selected only" sx={{ px: 1.25, height: 38, gap: 0.75, fontWeight: 700, fontSize: 13 }}>
            <Badge color="primary" badgeContent={items.length} max={99}><PlaylistAddCheckRoundedIcon fontSize="small" /></Badge>
            <Box component="span" sx={{ pl: items.length ? 0.75 : 0 }}>Picks</Box>
          </ToggleButton>
        </Tooltip>
      </Box>

      {!selectedOnly && (
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} sx={[compactField, { flex: '1 1 100%' }]}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> } }}
          />
          <TextField select size="small" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} sx={[compactField, { minWidth: 112 }]} slotProps={{ select: { displayEmpty: true } }}>
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
          <Tooltip title="Hide questions I already solved">
            <ToggleButton size="small" value="hide" selected={hideSolved} onChange={() => setHideSolved((v) => !v)} aria-label="Hide solved" sx={{ px: 1.25, height: 38 }}>
              <VisibilityOffRoundedIcon fontSize="small" />
            </ToggleButton>
          </Tooltip>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ py: 0 }}>{error}</Alert>}

      <Box role="list" onScroll={onScroll} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin', mx: -0.5, px: 0.5 }}>
        {shown.map((r) => {
          const entry = added.get(itemKey(r.type, r.id));
          const on = Boolean(entry);
          return (
            <ButtonBase
              key={itemKey(r.type, r.id)} role="listitem" disabled={r.locked} onClick={() => onToggle(r)} aria-pressed={on}
              aria-label={`${on ? 'Remove' : 'Add'} ${r.title}`}
              sx={(t) => ({
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.25, px: 1, py: 0.9, mb: 0.5, minHeight: 54, textAlign: 'left',
                fontFamily: 'inherit', borderRadius: '12px', border: `1.5px solid ${on ? alpha(accent, 0.7) : 'transparent'}`,
                bgcolor: on ? alpha(accent, 0.12) : 'transparent', transition: 'background-color .15s, border-color .15s',
                '&:hover': { bgcolor: on ? alpha(accent, 0.16) : t.palette.action.hover },
              })}
            >
              <Box
                sx={(t) => ({
                  width: 30, height: 30, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', transition: 'all .15s',
                  border: `2px solid ${on ? accent : t.palette.divider}`, bgcolor: on ? accent : 'transparent', color: on ? '#fff' : t.palette.text.secondary,
                })}
              >
                {r.locked ? <LockRoundedIcon sx={{ fontSize: 14 }} /> : on ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : <AddRoundedIcon sx={{ fontSize: 18 }} />}
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 700, lineHeight: 1.3 }}>{r.title}</Typography>
                {r.meta && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.25 }}>{r.meta}</Typography>}
              </Box>
              {r.solved && <Tooltip title="You solved this"><CheckRoundedIcon sx={{ fontSize: 17, color: 'success.main' }} /></Tooltip>}
              <DiffTag difficulty={r.difficulty} />
            </ButtonBase>
          );
        })}
        {loading && !selectedOnly && (rows.length === 0
          ? [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={54} sx={{ borderRadius: '12px', transform: 'none' }} />)
          : <Box sx={{ textAlign: 'center', py: 1 }}><CircularProgress size={18} /></Box>)}
        {!loading && shown.length === 0 && !error && (
          <Typography color="text.secondary" variant="body2" sx={{ py: 4, textAlign: 'center' }}>{selectedOnly ? 'You have not picked anything yet.' : 'No questions match. Try another search.'}</Typography>
        )}
      </Box>
    </Box>
  );
}

// items: [{ type, id, date, title, difficulty }] — the plan being built.
export default function PlanBuilder({ plan, onSaved, onCancel }) {
  const today = localKey();
  const topRef = useRef(null);
  const [step, setStep] = useState(0);
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const added = useMemo(() => new Map(items.map((i) => [itemKey(i.type, i.id), i])), [items]);
  const valid = [title.trim().length > 0, items.length > 0, true];
  const canGo = (i) => i <= step || valid.slice(0, i).every(Boolean);
  const last = step === STEPS.length - 1;

  const goStep = (i) => {
    if (!canGo(i)) return;
    setError('');
    setStep(i);
  };

  // Each new step starts at the top, so the heading is always the first thing you see.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [step]);

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

  const next = () => (last ? save() : goStep(step + 1));
  const hint = !valid[step] ? (step === 0 ? 'Give your plan a name to continue' : 'Pick at least one question to continue') : '';

  // ---- step bodies
  const nameStep = (
    <Box sx={{ maxWidth: 620 }}>
      <StepHead index={0} title="What should we call this plan?" help="A short name you will recognise later." />
      <TextField
        fullWidth autoFocus={!plan} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. TCS NQT in 2 weeks"
        onKeyDown={(e) => { if (e.key === 'Enter' && valid[0]) next(); }}
        slotProps={{
          htmlInput: { maxLength: 100, 'aria-label': 'Plan name' },
          input: {
            startAdornment: <InputAdornment position="start"><EditRoundedIcon sx={{ color: STEPS[0].color }} /></InputAdornment>,
            sx: { height: 62, fontSize: { xs: 18, sm: 20 }, fontWeight: 700, borderRadius: '14px' },
          },
        }}
        sx={{ '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: STEPS[0].color, borderWidth: 2 } }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, textAlign: 'right' }}>{title.length}/100</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary', mt: 1.5, mb: 1 }}>Need an idea? Tap one</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {NAME_IDEAS.map((n) => (
          <Chip
            key={n} label={n} clickable onClick={() => setTitle(n)} variant={title === n ? 'filled' : 'outlined'}
            sx={{ height: 36, fontWeight: 700, fontSize: 13.5, borderRadius: '18px', ...(title === n ? { bgcolor: STEPS[0].color, color: '#fff', '&:hover': { bgcolor: STEPS[0].color } } : { borderColor: alpha(STEPS[0].color, 0.5) }) }}
          />
        ))}
      </Box>
    </Box>
  );

  const questionsStep = (
    <Box>
      <StepHead
        index={1} title="Pick your questions" help="Tap a question to add it. Tap again to remove."
        right={(
          <Box sx={{ flexShrink: 0, textAlign: 'center', px: 1.5, py: 0.75, borderRadius: '14px', bgcolor: alpha(STEPS[1].color, 0.14), border: `1.5px solid ${alpha(STEPS[1].color, 0.5)}` }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1, color: STEPS[1].color, fontVariantNumeric: 'tabular-nums' }}>{items.length}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary' }}>picked</Typography>
          </Box>
        )}
      />
      <QuestionPicker items={items} added={added} onToggle={toggle} />
    </Box>
  );

  const brand = PLAN_THEMES[0].gradient;
  const deadlineStep = (
    <Box>
      <StepHead index={2} title="When do you want to finish?" help="We spread your questions evenly until that day." />
      <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.15fr) minmax(0,1fr)' }, alignItems: 'start' }}>
        <Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1, mb: 2 }}>
            {PRESETS.map(([label, n]) => {
              const key = addDays(today, n);
              const on = endDate === key;
              return (
                <ButtonBase
                  key={label} onClick={() => pickDate(key)} aria-pressed={on}
                  sx={(t) => ({
                    flexDirection: 'column', gap: 0.25, py: 1.25, px: 0.5, borderRadius: '14px', fontFamily: 'inherit', transition: 'all .15s',
                    bgcolor: on ? STEPS[2].color : t.palette.action.hover, color: on ? '#FFFFFF' : t.palette.text.primary,
                    border: `1.5px solid ${on ? STEPS[2].color : 'transparent'}`, '&:active': { transform: 'scale(0.97)' },
                  })}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 15 }}>{label}</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: 12, opacity: on ? 0.85 : 0.7 }}>{fmtDay(key, { weekday: undefined })}</Typography>
                </ButtonBase>
              );
            })}
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary', mb: 1 }}>Or pick any date</Typography>
          <MonthCalendar cursor={cursor} onCursor={setCursor} selected={endDate} onSelect={pickDate} today={today} min={today} accent={STEPS[2].color} />
        </Box>

        {/* what you are about to save, in numbers */}
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: '18px', p: 2.25, color: '#fff', background: brand, boxShadow: '0 18px 32px -18px rgba(229,9,20,0.6)' }}>
          <Box aria-hidden sx={{ position: 'absolute', right: -40, top: -50, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.14), transparent 70%)' }} />
          <Box sx={{ position: 'relative' }}>
            <Typography sx={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 0.8, opacity: 0.85 }}>YOUR PLAN</Typography>
            <ButtonBase onClick={() => goStep(0)} aria-label="Edit plan name" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, maxWidth: '100%', textAlign: 'left', color: 'inherit', fontFamily: 'inherit', borderRadius: '8px' }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.25, overflowWrap: 'anywhere' }}>{title.trim() || 'Untitled plan'}</Typography>
              <EditRoundedIcon sx={{ fontSize: 17, opacity: 0.8, flexShrink: 0 }} />
            </ButtonBase>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 1, mt: 2 }}>
              {[[items.length, items.length === 1 ? 'question' : 'questions'], [days, days === 1 ? 'day' : 'days'], [perDay, 'per day']].map(([big, label]) => (
                <Box key={label} sx={{ textAlign: 'center', py: 1, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.22)' }}>
                  <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{big}</Typography>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 700, opacity: 0.9 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 2, px: 1.25, py: 1, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.35)' }}>
              <EventRoundedIcon sx={{ fontSize: 19, color: '#fff' }} />
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Finish by {fmtDay(endDate)}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const bodies = [nameStep, questionsStep, deadlineStep];
  const accent = STEPS[step].color;

  return (
    <Box ref={topRef} sx={{ maxWidth: 1000, mx: 'auto', scrollMarginTop: 8 }}>
      {/* top: what this screen is + a way out */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography component="h1" sx={{ flex: 1, fontSize: { xs: '1.25rem', sm: '1.4rem' }, fontWeight: 800, letterSpacing: -0.3 }}>{plan ? 'Edit plan' : 'New study plan'}</Typography>
        <Tooltip title="Close without saving"><IconButton onClick={onCancel} disabled={saving} aria-label="Close without saving"><CloseRoundedIcon /></IconButton></Tooltip>
      </Box>

      <Box sx={[surface, { px: { xs: 1, sm: 3 }, py: 1.5, mb: 1.5 }]}>
        <Stepper step={step} onGo={goStep} canGo={canGo} />
      </Box>

      {/* the plan name stays in view once it is set, with one tap to change it */}
      {step > 0 && title.trim() && (
        <ButtonBase onClick={() => goStep(0)} aria-label="Edit plan name" sx={(t) => ({ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, px: 1.5, py: 0.6, maxWidth: '100%', borderRadius: 99, fontFamily: 'inherit', bgcolor: alpha(STEPS[0].color, 0.14), border: `1px solid ${alpha(STEPS[0].color, 0.4)}`, color: t.palette.text.primary })}>
          <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 800 }}>{title.trim()}</Typography>
          <EditRoundedIcon sx={{ fontSize: 15, color: STEPS[0].color, flexShrink: 0 }} />
        </ButtonBase>
      )}

      <Box sx={[surface, { position: 'relative', overflow: 'hidden', p: { xs: 2, sm: 3 }, pt: { xs: 2.5, sm: 3.25 } }]}>
        <Box aria-hidden sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 5, bgcolor: accent, transition: 'background-color .3s' }} />
        {bodies[step]}
      </Box>

      {/* always-visible action bar: where you are, and the one next thing to do */}
      <Box
        sx={(t) => ({
          position: 'sticky', bottom: 8, mt: 1.5, px: { xs: 1.25, sm: 2 }, py: 1.1, display: 'flex', alignItems: 'center', gap: 1.5,
          borderRadius: '16px', border: `1px solid ${t.palette.divider}`, bgcolor: t.palette.background.paper, boxShadow: '0 12px 28px -14px rgba(2,6,23,0.45)', zIndex: 2,
        })}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>
            {step === 0 ? 'Step 1 of 3' : step === 1 ? `${items.length} question${items.length === 1 ? '' : 's'} picked` : `${items.length} question${items.length === 1 ? '' : 's'} · by ${fmtDay(endDate, { weekday: undefined })}`}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.3, color: error ? 'error.main' : hint ? 'warning.main' : 'text.secondary', fontWeight: error || hint ? 700 : 400 }}>
            {error || hint || (step === 0 ? 'Name it, pick questions, set a deadline' : step === 1 ? 'Add as many as you like' : `${days} day${days === 1 ? '' : 's'} · about ${perDay}/day`)}
          </Typography>
        </Box>
        {step > 0 && <Button onClick={() => goStep(step - 1)} disabled={saving} sx={{ fontWeight: 700, color: 'text.secondary' }}>Back</Button>}
        <Button
          variant="contained" disableElevation onClick={next} disabled={saving || !valid[step]}
          endIcon={last ? <CheckRoundedIcon /> : <ArrowForwardRoundedIcon />}
          sx={{ fontWeight: 800, px: 3, height: 46, borderRadius: '14px', fontSize: 15, ...(valid[step] && !saving ? { background: `linear-gradient(135deg, ${accent}, #B20710)`, color: '#fff', '&:hover': { background: '#B20710' } } : {}) }}
        >
          {saving ? 'Saving…' : last ? (plan ? 'Save changes' : 'Save plan') : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
