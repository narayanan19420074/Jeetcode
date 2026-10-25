import { useState } from 'react';
import { Box, ButtonBase, Chip, Collapse, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DifficultyChip from '../../components/DifficultyChip';
import { wsSurface } from './workspaceTheme';
import { WS, mono } from './wsTokens';
import { WsIconButton } from './wsUi';

// Pattern names (the problem's topics) under the title: the first thing a learner needs to know.
function PatternChips({ items }) {
  if (!items?.length) return null;
  return (
    <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
      {items.map((t) => (
        <Chip
          key={t}
          label={t}
          size="small"
          sx={(th) => ({ height: 26, borderRadius: '6px', fontWeight: 700, fontSize: '0.76rem', color: th.palette.primary.main, bgcolor: alpha(th.palette.primary.main, th.palette.mode === 'dark' ? 0.16 : 0.1) })}
        />
      ))}
    </Stack>
  );
}

// Company tags: small and quiet, under the pattern names.
function CompanyChips({ items }) {
  if (!items?.length) return null;
  return (
    <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
      {items.map((t) => (
        <Chip
          key={t}
          label={t}
          size="small"
          variant="outlined"
          sx={{ height: 20, borderRadius: '5px', fontWeight: 600, fontSize: '0.66rem', color: 'text.secondary', '& .MuiChip-label': { px: 0.9 } }}
        />
      ))}
    </Stack>
  );
}

// A section that folds away, so the whole statement fits on screen without scrolling.
function Fold({ title, count, children }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={(t) => ({ mb: 1.25, borderRadius: `${WS.radius + 2}px`, border: `1px solid ${t.palette.divider}` })}>
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start', gap: 1, px: 1.5, py: 1, textAlign: 'left', borderRadius: 'inherit' }}
      >
        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '0.86rem' }}>
          {title}
          {count > 0 && <Box component="span" sx={{ ml: 0.75, color: 'text.secondary', fontWeight: 600 }}>{count}</Box>}
        </Typography>
        <ExpandMoreRoundedIcon sx={{ fontSize: 22, color: 'text.secondary', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: 1.5, pb: 1.5 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

function ConstraintList({ items }) {
  return (
    <Stack component="ul" sx={{ gap: 0.75, m: 0, pl: 2.25 }}>
      {items.map((c, i) => (
        <Typography key={i} component="li" variant="body2" sx={{ lineHeight: 1.6, '&::marker': { color: 'text.disabled' } }}>
          <Box
            component="code"
            sx={(t) => ({ ...mono, fontSize: '0.78rem', px: 0.75, py: 0.25, borderRadius: '6px', wordBreak: 'break-word', bgcolor: wsSurface(t).raised })}
          >
            {c}
          </Box>
        </Typography>
      ))}
    </Stack>
  );
}

function ExampleBlock({ index, example }) {
  const rows = [
    ['Input', example.input],
    ['Output', example.output],
  ];
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 0.75 }}>Example {index + 1}</Typography>
      <Box sx={(t) => ({ p: 1.5, borderRadius: `${WS.radius + 2}px`, bgcolor: wsSurface(t).raised })}>
        {rows.map(([label, value]) => (
          <Typography key={label} sx={{ ...mono, fontSize: '0.8rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {label}:{' '}
            </Box>
            {value}
          </Typography>
        ))}
        {example.explanation && (
          <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Explanation:{' '}
            </Box>
            {example.explanation}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// Problem statement: title, pattern names, company tags, description, then folded examples and constraints.
// Shared by the desktop left pane and the phone drawer.
// nav (optional): { hasPrev, hasNext, onPrev, onNext, size } -> arrows beside the title.
export default function ProblemDescription({ problem, nav }) {
  const key = problem.slug || problem._id || problem.title;
  const constraints = problem.constraints || [];
  // two short constraints stay visible; anything longer folds away
  const foldConstraints = constraints.length > 2 || constraints.join('').length > 140;

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1, mb: 1.25 }}>
        <Typography sx={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.3, letterSpacing: '-0.01em', wordBreak: 'break-word' }}>{problem.title}</Typography>
        {nav && (
          <Stack direction="row" sx={{ flexShrink: 0, gap: 0.25, mt: -0.25 }}>
            <WsIconButton title="Previous problem" size={nav.size} disabled={!nav.hasPrev} onClick={nav.onPrev}>
              <ChevronLeftRoundedIcon />
            </WsIconButton>
            <WsIconButton title="Next problem" size={nav.size} disabled={!nav.hasNext} onClick={nav.onNext}>
              <ChevronRightRoundedIcon />
            </WsIconButton>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
        <DifficultyChip difficulty={problem.difficulty} />
        <PatternChips items={problem.tags} />
      </Stack>
      <CompanyChips items={problem.companies} />

      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 2.5, mb: 2.5, lineHeight: 1.8 }}>
        {problem.description}
      </Typography>

      {problem.examples?.length > 0 && (
        <Fold key={`ex-${key}`} title="Examples" count={problem.examples.length}>
          {problem.examples.map((ex, i) => (
            <ExampleBlock key={i} index={i} example={ex} />
          ))}
        </Fold>
      )}

      {constraints.length > 0 &&
        (foldConstraints ? (
          <Fold key={`co-${key}`} title="Constraints" count={constraints.length}>
            <ConstraintList items={constraints} />
          </Fold>
        ) : (
          <Box sx={{ mt: 1.5, mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', mb: 1 }}>Constraints</Typography>
            <ConstraintList items={constraints} />
          </Box>
        ))}
    </>
  );
}
