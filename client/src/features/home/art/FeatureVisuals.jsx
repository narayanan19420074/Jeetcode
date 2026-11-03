import { useEffect, useMemo, useState } from 'react';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import CompanyAvatar from '../../../components/CompanyAvatar';
import { MONO_FONT, blink, pulseDot, trainRun } from '../anim';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, RADII, MOTION } from '../../../app/design/designTokens';

const panel = {
  borderRadius: RADII_PX.card,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  overflow: 'hidden',
};

const mono = { fontFamily: MONO_FONT, fontVariantNumeric: 'tabular-nums' };

function Segmented({ items, value, onChange, label }) {
  return (
    <Stack direction="row" role="tablist" aria-label={label} spacing={0.5} sx={{ p: 0.5, borderRadius: RADII_PX.control, bgcolor: (t) => alpha(t.palette.text.secondary, 0.1), width: 'fit-content', maxWidth: '100%' }}>
      {items.map((it) => {
        const on = value === it;
        return (
          <ButtonBase
            key={it}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it)}
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: RADII_PX.control,
              fontSize: FONT_SIZES.body,
              fontWeight: FONT_WEIGHTS.bold,
              color: on ? 'text.primary' : 'text.secondary',
              bgcolor: on ? 'background.paper' : 'transparent',
              boxShadow: on ? `0 1px 3px ${withAlpha(COLOR_PALETTE.black, 0.18)}` : 'none',
              transition: `background-color ${MOTION.fast}ms, color ${MOTION.fast}ms`,
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            {it}
          </ButtonBase>
        );
      })}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Code arena: same problem, three languages. Click to switch.
const SNIPPETS = {
  JavaScript: [
    'function twoSum(nums, target) {',
    '  const seen = new Map();',
    '  for (let i = 0; i < nums.length; i++) {',
    '    const need = target - nums[i];',
    '    if (seen.has(need)) return [seen.get(need), i];',
    '    seen.set(nums[i], i);',
    '  }',
    '}',
  ],
  Python: [
    'def two_sum(nums, target):',
    '    seen = {}',
    '    for i, n in enumerate(nums):',
    '        if target - n in seen:',
    '            return [seen[target - n], i]',
    '        seen[n] = i',
  ],
  'C++': [
    'vector<int> twoSum(vector<int>& a, int t) {',
    '  unordered_map<int,int> seen;',
    '  for (int i = 0; i < a.size(); i++) {',
    '    if (seen.count(t - a[i]))',
    '      return {seen[t - a[i]], i};',
    '    seen[a[i]] = i;',
    '  }',
    '  return {};',
    '}',
  ],
};

export function ArenaVisual() {
  const t = useTheme();
  const [lang, setLang] = useState('Python');
  return (
    <Box sx={panel}>
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Segmented items={Object.keys(SNIPPETS)} value={lang} onChange={setLang} label="Language" />
      </Box>
      <Box sx={{ p: 2, minHeight: 196, ...mono, fontSize: { xs: FONT_SIZES.micro, sm: FONT_SIZES.caption }, lineHeight: 1.8, overflowX: 'auto' }}>
        <motion.div key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          {SNIPPETS[lang].map((l, i) => (
            <Box key={i} sx={{ whiteSpace: 'pre', color: 'text.secondary' }}>
              <Box component="span" sx={{ display: 'inline-block', width: 22, color: alpha(t.palette.text.secondary, 0.5) }}>{i + 1}</Box>
              {l}
            </Box>
          ))}
        </motion.div>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', alignItems: { sm: 'center' } }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'success.main', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>
          <CheckCircleRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} /> <span>Accepted on every test case</span>
        </Stack>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12), ml: { sm: 'auto !important' } }}>
          <LightbulbRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg }} /> <span>Stuck? Ask for a hint, not the answer</span>
        </Stack>
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Aptitude lab: Learn / Practice / Test, each with its own panel.
const PRACTICE = [
  ['Divisibility rules', 'Easy', true],
  ['Remainder theorems & cyclicity', 'Medium', true],
  ['Unit digit & last two digits', 'Medium', false],
  ['Trailing zeros & factorials', 'Hard', false],
];
const DIFF = { Easy: 'success', Medium: 'warning', Hard: 'error' };
// Sample answer states for the exam palette: a = answered, m = marked, n = not visited.
const PALETTE = 'aaaaamaaaaamaaaannnnnnnnn'.split('');

function TrainLesson() {
  const t = useTheme();
  const ink = t.palette.text.secondary;
  return (
    <Stack spacing={1.5}>
      <Box sx={{ position: 'relative', height: 92, borderRadius: RADII_PX.control, overflow: 'hidden', bgcolor: alpha(t.palette.primary.main, 0.08) }}>
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 20, height: 3, bgcolor: alpha(ink, 0.5) }} />
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 14, height: 6, backgroundImage: `repeating-linear-gradient(90deg, ${alpha(ink, 0.5)} 0 2px, transparent 2px 14px)` }} />
        <Box sx={{ position: 'absolute', left: '28%', bottom: 23, width: 5, height: 40, borderRadius: RADII_PX.pill, bgcolor: 'warning.main' }} />
        <Box
          sx={{
            position: 'absolute',
            left: '30%',
            bottom: 23,
            display: 'flex',
            animation: `${trainRun} 4.5s linear infinite`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none', transform: 'translateX(40px)' },
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ width: 44, height: 28, mr: 0.5, borderRadius: i === 0 ? `${RADII.badge}px ${RADII.card}px ${RADII.badge}px ${RADII.badge}px` : RADII_PX.badge, bgcolor: 'primary.main', position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 6, left: 7, width: 10, height: 8, borderRadius: RADII_PX.pill, bgcolor: alpha(COLOR_PALETTE.white, 0.85) }} />
              <Box sx={{ position: 'absolute', top: 6, right: 7, width: 10, height: 8, borderRadius: RADII_PX.pill, bgcolor: alpha(COLOR_PALETTE.white, 0.85) }} />
            </Box>
          ))}
        </Box>
      </Box>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>Speed = distance ÷ time</Typography>
      <Typography variant="body2" color="text.secondary">
        The lesson plays the problem first. 150 m in 10 s is 15 m/s, then you convert it. Concept first, formulas second.
      </Typography>
    </Stack>
  );
}

export function LabVisual() {
  const t = useTheme();
  const [mode, setMode] = useState('Learn');
  return (
    <Box sx={panel}>
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Segmented items={['Learn', 'Practice', 'Test']} value={mode} onChange={setMode} label="Aptitude flow" />
      </Box>
      <Box sx={{ p: 2, minHeight: 236 }}>
        <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          {mode === 'Learn' && <TrainLesson />}
          {mode === 'Practice' && (
            <Stack spacing={0.9}>
              {PRACTICE.map(([name, diff, done]) => (
                <Stack key={name} direction="row" spacing={1.25} sx={{ alignItems: 'center', py: 0.5, px: 1.5, borderRadius: RADII_PX.control, border: '1px solid', borderColor: 'divider' }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: FONT_SIZES.subheading, color: done ? 'success.main' : alpha(t.palette.text.secondary, 0.35) }} />
                  <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body, flex: 1 }}>{name}</Typography>
                  <Typography sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: `${DIFF[diff]}.main` }}>{diff}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
          {mode === 'Test' && (
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>Question palette</Typography>
                <Typography sx={{ ...mono, fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.body, color: 'text.secondary' }}>18:42 left</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 0.5 }}>
                {PALETTE.map((s, i) => (
                  <Box
                    key={i}
                    sx={{
                      aspectRatio: '1',
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: RADII_PX.control,
                      fontSize: FONT_SIZES.micro,
                      fontWeight: FONT_WEIGHTS.bold,
                      border: '1px solid',
                      borderColor: s === 'a' ? 'success.main' : s === 'm' ? 'warning.main' : 'divider',
                      bgcolor: s === 'a' ? alpha(t.palette.success.main, 0.16) : s === 'm' ? alpha(t.palette.warning.main, 0.16) : 'transparent',
                      color: s === 'n' ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {i + 1}
                  </Box>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">
                Answered, marked for review and not visited, the way the exam screen shows them. Hit the pass mark to unlock the next pattern.
              </Typography>
            </Stack>
          )}
        </motion.div>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Company prep: exam-pattern roadmap + company-tagged problem counts.
const SECTIONS = [
  ['Numerical Ability', 78],
  ['Verbal Ability', 64],
  ['Reasoning Ability', 71],
  ['Advanced Quantitative', 42],
  ['Advanced Reasoning', 35],
  ['Advanced Coding', 18],
];
// Real counts of company-tagged problems in the question bank.
const TAGGED = [['Amazon', 230], ['Google', 113], ['Meta', 80], ['Microsoft', 44]];

export function CompanyVisual() {
  const t = useTheme();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const R = 34;
  const C = 2 * Math.PI * R;
  const score = 52;
  return (
    <Box ref={ref} sx={panel}>
      <Stack direction="row" spacing={2} sx={{ p: 2, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
          <svg viewBox="0 0 84 84" width="84" height="84" aria-hidden="true">
            <circle cx="42" cy="42" r={R} fill="none" stroke={alpha(t.palette.text.secondary, 0.2)} strokeWidth="8" />
            <motion.circle
              cx="42" cy="42" r={R} fill="none" stroke={t.palette.primary.main} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: inView ? C * (1 - score / 100) : C }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              transform="rotate(-90 42 42)"
            />
          </svg>
          <Typography sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, ...mono }}>
            {score}%
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.title }}>TCS NQT readiness</Typography>
          <Typography variant="body2" color="text.secondary">Built from the real exam sections and their weights. Sample progress shown.</Typography>
        </Box>
      </Stack>
      <Stack spacing={1.1} sx={{ p: 2 }}>
        {SECTIONS.map(([name, pct], i) => (
          <Box key={name}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold }}>{name}</Typography>
              <Typography sx={{ fontSize: FONT_SIZES.caption, color: 'text.secondary', ...mono }}>{pct}%</Typography>
            </Stack>
            <Box sx={{ height: 6, borderRadius: RADII_PX.pill, bgcolor: alpha(t.palette.text.secondary, 0.15), overflow: 'hidden' }}>
              <Box component={motion.div} initial={{ width: 0 }} animate={{ width: inView ? `${pct}%` : 0 }} transition={{ duration: 0.9, delay: 0.1 * i, ease: 'easeOut' }} sx={{ height: '100%', borderRadius: RADII_PX.card, bgcolor: pct < 40 ? 'warning.main' : 'primary.main' }} />
            </Box>
          </Box>
        ))}
      </Stack>
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: alpha(t.palette.text.secondary, 0.04) }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: FONT_WEIGHTS.semibold }}>
          Coding problems tagged by company
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          {TAGGED.map(([name, n]) => (
            <Stack key={name} direction="row" spacing={1.1} sx={{ alignItems: 'center' }}>
              <CompanyAvatar name={name} size={30} />
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>{name}</Typography>
              <Typography sx={{ ml: 'auto !important', fontSize: FONT_SIZES.caption, color: 'text.secondary', ...mono }}>{n}</Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Pair room: two people, video, chat, invite link.
const ROOM_CHAT = [
  ['K', 'I will take the left pointer'],
  ['A', 'Cool, I will handle the right and edge cases'],
  ['K', 'Run it together?'],
];

function Tile({ name, color, speaking }) {
  return (
    <Box sx={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: RADII_PX.control, display: 'grid', placeItems: 'center', background: `linear-gradient(145deg, ${alpha(color, 0.32)}, ${alpha(color, 0.1)})`, outline: speaking ? `2px solid ${color}` : 'none' }}>
      <Box sx={{ width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: color, color: COLOR_PALETTE.white, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading }}>{name[0]}</Box>
      <Typography sx={{ position: 'absolute', left: 8, bottom: 6, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold }}>{name}</Typography>
    </Box>
  );
}

export function RoomVisual() {
  const t = useTheme();
  const [copied, setCopied] = useState(false);
  const me = t.palette.primary.main;
  const other = t.palette.warning.main;
  return (
    <Box sx={panel}>
      <Stack direction="row" spacing={1} sx={{ p: 1.5, alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', '--pulse': alpha(t.palette.success.main, 0.5), animation: `${pulseDot} 2s infinite` }} />
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>Room is live</Typography>
        <ButtonBase
          onClick={() => setCopied(true)}
          aria-live="polite"
          sx={{ ml: 'auto', gap: 0.5, px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: copied ? 'success.main' : 'primary.main', bgcolor: alpha(copied ? t.palette.success.main : t.palette.primary.main, 0.12), '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' } }}
        >
          {copied ? <CheckCircleRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg }} /> : <LinkRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg }} />}
          {copied ? 'Invite link ready' : 'Copy invite link'}
        </ButtonBase>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, p: 1.5 }}>
        <Tile name="Asha" color={me} speaking />
        <Tile name="Karthik" color={other} />
      </Box>
      <Stack spacing={0.8} sx={{ px: 1.5, pb: 1.5 }}>
        {ROOM_CHAT.map(([who, text]) => (
          <Box key={text} sx={{ alignSelf: who === 'A' ? 'flex-start' : 'flex-end', maxWidth: '84%', px: 1.5, py: 0.5, borderRadius: who === 'A' ? `${RADII.card}px ${RADII.card}px ${RADII.card}px ${RADII.badge}px` : `${RADII.card}px ${RADII.card}px ${RADII.badge}px ${RADII.card}px`, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.medium, bgcolor: alpha(who === 'A' ? me : other, 0.15) }}>
            {text}
          </Box>
        ))}
        <Stack direction="row" spacing={0.5} sx={{ alignSelf: 'flex-start', px: 1.5, py: 1, borderRadius: RADII_PX.card, bgcolor: alpha(t.palette.text.secondary, 0.1) }} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.secondary', animation: `${blink} 1.2s steps(1) ${i * 0.2}s infinite` }} />
          ))}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'center' }}>
        {[MicRoundedIcon, VideocamRoundedIcon].map((I, i) => (
          <Box key={i} sx={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: alpha(t.palette.text.secondary, 0.12) }}>
            <I sx={{ fontSize: FONT_SIZES.subheading, color: 'text.secondary' }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Visualizer: a real bubble sort, stepping through.
const START = [6, 2, 9, 4, 7, 1, 8, 3];

function bubbleFrames(arr) {
  const a = [...arr];
  const frames = [{ a: [...a], i: -1, sorted: 0 }];
  for (let end = a.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      frames.push({ a: [...a], i, sorted: a.length - 1 - end, cmp: true });
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        frames.push({ a: [...a], i, sorted: a.length - 1 - end, swap: true });
      }
    }
  }
  frames.push({ a: [...a], i: -1, sorted: a.length });
  return frames;
}

export function SortVisual() {
  const t = useTheme();
  const reduce = useReducedMotion();
  const frames = useMemo(() => bubbleFrames(START), []);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setK((x) => (x + 1) % (frames.length + 6)), 380);
    return () => clearInterval(id);
  }, [reduce, frames.length]);
  const f = reduce ? frames[frames.length - 1] : frames[Math.min(k, frames.length - 1)];
  const n = f.a.length;
  return (
    <Box>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'flex-end', height: 120 }} aria-hidden="true">
        {f.a.map((v, idx) => {
          const sorted = idx >= n - f.sorted;
          const active = f.i >= 0 && (idx === f.i || idx === f.i + 1);
          return (
            <Box
              key={idx}
              sx={{
                flex: 1,
                height: `${v * 11}%`,
                borderRadius: `${RADII.badge}px ${RADII.badge}px ${RADII.badge}px ${RADII.badge}px`,
                transition: `height ${MOTION.standard}ms ease, background-color ${MOTION.standard}ms`,
                bgcolor: sorted ? 'success.main' : active ? (f.swap ? 'warning.main' : 'primary.main') : alpha(t.palette.text.secondary, 0.3),
              }}
            />
          );
        })}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Bubble sort, one comparison at a time
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Leaderboard tiers (real thresholds from the app).
const TIERS = [
  ['Bronze', 0, COLOR_PALETTE.orange[700]],
  ['Silver', 150, COLOR_PALETTE.slate[400]],
  ['Gold', 500, COLOR_PALETTE.amber[500]],
  ['Platinum', 1200, COLOR_PALETTE.cyan[400]],
  ['Diamond', 2500, COLOR_PALETTE.indigo[400]],
  ['Legend', 5000, COLOR_PALETTE.rose[500]],
];

export function TierVisual() {
  return (
    <Stack spacing={0.7}>
      {TIERS.map(([name, min, color], i) => (
        <Stack key={name} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: RADII_PX.badge, bgcolor: color, transform: 'rotate(45deg)', flexShrink: 0 }} />
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, width: 66 }}>{name}</Typography>
          <Box sx={{ flex: 1, height: 5, borderRadius: RADII_PX.pill, bgcolor: alpha(color, 0.18), overflow: 'hidden' }}>
            <Box component={motion.div} initial={{ width: 0 }} whileInView={{ width: `${(i + 1) * (100 / TIERS.length)}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.08 }} sx={{ height: '100%', bgcolor: color, borderRadius: RADII_PX.card }} />
          </Box>
          <Typography sx={{ fontSize: FONT_SIZES.caption, color: 'text.secondary', width: 40, textAlign: 'right', ...mono }}>{min}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Streak heatmap: deterministic sample so it never reshuffles between renders.
export function HeatVisual() {
  const t = useTheme();
  const cols = 20;
  const cells = useMemo(
    () => Array.from({ length: 7 * cols }, (_, i) => {
      const x = Math.sin(i * 12.9898) * 43758.5453;
      const r = x - Math.floor(x);
      const trend = i / (7 * cols);
      return r + trend * 0.55 > 0.95 ? 3 : r + trend * 0.55 > 0.72 ? 2 : r + trend * 0.55 > 0.5 ? 1 : 0;
    }),
    []
  );
  const alphas = [0.1, 0.35, 0.65, 1];
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column', gap: 0.5 }} aria-hidden="true">
        {cells.map((lvl, i) => (
          <Box key={i} sx={{ aspectRatio: '1', borderRadius: RADII_PX.badge, bgcolor: lvl === 0 ? alpha(t.palette.text.secondary, 0.14) : alpha(t.palette.success.main, alphas[lvl]) }} />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Sample activity. Yours fills in as you practice.
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Study plan: a shared week with a friend.
const WEEK = [
  ['Mon', 'Percentages', true],
  ['Tue', 'Two pointers', true],
  ['Wed', 'Time and work', false],
  ['Thu', 'Mock test', false],
];

export function PlanVisual() {
  const t = useTheme();
  return (
    <Stack spacing={0.8}>
      {WEEK.map(([day, what, done]) => (
        <Stack key={day} direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Typography sx={{ width: 32, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary' }}>{day}</Typography>
          <Box sx={{ flex: 1, px: 1.5, py: 0.5, borderRadius: RADII_PX.control, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold, display: 'flex', alignItems: 'center', gap: 1, border: '1px solid', borderColor: done ? alpha(t.palette.success.main, 0.5) : 'divider', bgcolor: done ? alpha(t.palette.success.main, 0.08) : 'transparent' }}>
            {done && <CheckCircleRoundedIcon sx={{ fontSize: FONT_SIZES.bodyLg, color: 'success.main' }} />}
            {what}
          </Box>
        </Stack>
      ))}
      <Stack direction="row" spacing={-0.8} sx={{ pt: 0.5, pl: 5.5 }} aria-hidden="true">
        {[['A', t.palette.primary.main], ['K', t.palette.warning.main]].map(([n, c]) => (
          <Box key={n} sx={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: c, color: COLOR_PALETTE.white, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, border: '2px solid', borderColor: 'background.paper' }}>{n}</Box>
        ))}
        <Typography sx={{ pl: 2, fontSize: FONT_SIZES.caption, color: 'text.secondary', alignSelf: 'center' }}>Planning together</Typography>
      </Stack>
    </Stack>
  );
}
