import { useState } from 'react';
import { Box, Button, Paper, Slider, Stack, Typography, alpha } from '@mui/material';

// Small interactive visuals used inside Learn lessons. Each one lets the
// learner move a slider and SEE the rule, instead of reading it.

const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };

function WidgetShell({ title, hint, children }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: (t) => alpha(t.palette.primary.main, 0.03) }}>
      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '0.1em' }}>
        TRY IT · {title.toUpperCase()}
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
          {hint}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

function SliderRow({ label, value, min, max, step = 1, onChange, suffix = '%', sign = false }) {
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ ...mono, fontWeight: 800 }}>
          {sign && value > 0 ? '+' : ''}
          {value}
          {suffix}
        </Typography>
      </Stack>
      <Slider size="small" value={value} min={min} max={max} step={step} onChange={(_, v) => onChange(v)} />
    </Box>
  );
}

/* 10×10 grid: x% of N */
export function PercentGridWidget() {
  const [pct, setPct] = useState(35);
  const [n, setN] = useState(240);
  const result = (pct * n) / 100;
  return (
    <WidgetShell title="Percent grid" hint="100 squares = the whole. Drag the slider and watch x% fill the grid.">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: { sm: 'center' } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '3px', width: 200, flexShrink: 0 }}>
          {Array.from({ length: 100 }, (_, i) => (
            <Box
              key={i}
              sx={{
                aspectRatio: '1',
                borderRadius: '2px',
                bgcolor: i < pct ? 'primary.main' : 'action.disabledBackground',
                transition: 'background-color .15s',
              }}
            />
          ))}
        </Box>
        <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
          <SliderRow label="Percent" value={pct} min={0} max={100} onChange={setPct} />
          <SliderRow label="Of the number" value={n} min={20} max={1000} step={20} onChange={setN} suffix="" />
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ ...mono, fontSize: 14 }}>
              {pct}% of {n} = ({pct} × {n}) / 100 = <b>{Number.isInteger(result) ? result : result.toFixed(2)}</b>
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </WidgetShell>
  );
}

/* Successive change: bars for start → after 1st → after 2nd */
export function SuccessiveChangeWidget() {
  const [a, setA] = useState(20);
  const [b, setB] = useState(-20);
  const v1 = 100 * (1 + a / 100);
  const v2 = v1 * (1 + b / 100);
  const net = v2 - 100;
  const bar = (value, label, color) => (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={mono}>
          {value.toFixed(2)}
        </Typography>
      </Stack>
      <Box sx={{ height: 14, borderRadius: 1, bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${Math.min(100, (value / 200) * 100)}%`, bgcolor: color, transition: 'width .2s' }} />
      </Box>
    </Box>
  );
  return (
    <WidgetShell title="Successive change" hint="Start at 100. Apply two changes and compare with simply adding the percentages.">
      <Stack spacing={1.5}>
        <SliderRow label="First change" value={a} min={-50} max={50} onChange={setA} sign />
        <SliderRow label="Second change" value={b} min={-50} max={50} onChange={setB} sign />
        <Stack spacing={1}>
          {bar(100, 'Start', '#94A3B8')}
          {bar(v1, `After ${a >= 0 ? '+' : ''}${a}%`, '#3B82F6')}
          {bar(v2, `After ${b >= 0 ? '+' : ''}${b}%`, net >= 0 ? '#10B981' : '#EF4444')}
        </Stack>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ ...mono, fontSize: 14 }}>
            Net = {a} + ({b}) + ({a} × {b})/100 = <b>{net > 0 ? '+' : ''}{net.toFixed(2)}%</b>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Adding the percentages would wrongly say {a + b > 0 ? '+' : ''}{a + b}%.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => { setA(20); setB(-20); }}>+20 then −20</Button>
          <Button size="small" onClick={() => { setA(25); setB(-25); }}>+25 then −25</Button>
          <Button size="small" onClick={() => { setA(10); setB(10); }}>+10 then +10</Button>
        </Stack>
      </Stack>
    </WidgetShell>
  );
}

/* Price × consumption = expenditure, drawn as equal-area rectangles */
export function PriceConsumptionWidget() {
  const [x, setX] = useState(25);
  const cut = (x / (100 + x)) * 100;
  const W = 220;
  const H = 150;
  const newW = W * (1 + x / 100);
  const newH = H * (1 - cut / 100);
  const scale = Math.min(1, 320 / newW);
  return (
    <WidgetShell title="Price vs consumption" hint="Spending = price × consumption (the rectangle's area). Raise the price and see how far consumption must shrink to keep the area equal.">
      <Stack spacing={1.5}>
        <SliderRow label="Price rises by" value={x} min={5} max={100} step={5} onChange={setX} />
        <Box sx={{ overflowX: 'auto' }}>
          <svg width={(newW + 16) * scale} height={(H + 16) * scale} viewBox={`0 0 ${newW + 16} ${H + 16}`} role="img" aria-label="Equal-area rectangles">
            <rect x="8" y="8" width={W} height={H} rx="4" fill="rgba(148,163,184,0.25)" stroke="#94A3B8" />
            <rect x="8" y={8 + (H - newH)} width={newW} height={newH} rx="4" fill="rgba(59,130,246,0.30)" stroke="#3B82F6" strokeDasharray="5 3" />
            <text x={16} y={26} fontSize="12" fill="#64748B">Old: price 100 × consumption 100</text>
            <text x={16} y={8 + H - 8} fontSize="12" fill="#3B82F6">New: price {100 + x} × consumption {(100 - cut).toFixed(1)}</text>
          </svg>
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ ...mono, fontSize: 14 }}>
            Cut = {x} / (100 + {x}) × 100 = <b>{cut.toFixed(2)}%</b>
          </Typography>
        </Box>
      </Stack>
    </WidgetShell>
  );
}

export const LESSON_WIDGETS = {
  percentGrid: PercentGridWidget,
  successiveChange: SuccessiveChangeWidget,
  priceConsumption: PriceConsumptionWidget,
};
