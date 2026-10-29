import { useState } from 'react';
import { Box, ButtonBase, Collapse, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { LIB_TRACKING, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { PhoneDifficultyTag } from './phoneStyle';
import { mono } from './wsTokens';

// Problem statement on phones, in the Library look: page-title name, tags (switchable from the menu),
// description, then folded examples and constraints. Used inside ProblemSheet.

function TagPill({ label, outlined = false }) {
  const pal = useLibraryPalette();
  return (
    <Box
      component="span"
      sx={{
        height: 34,
        px: '14px',
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        fontSize: 15,
        letterSpacing: LIB_TRACKING,
        whiteSpace: 'nowrap',
        color: pal.chipText,
        bgcolor: outlined ? 'transparent' : pal.chip,
        border: outlined ? `1px solid ${pal.divider}` : 'none',
      }}
    >
      {label}
    </Box>
  );
}

function Fold({ title, count, children }) {
  const pal = useLibraryPalette();
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mb: 1.5, borderRadius: '20px', border: `1px solid ${pal.border}`, overflow: 'hidden' }}>
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start', gap: 1, px: 2, py: 1.5, textAlign: 'left', fontFamily: 'inherit', color: pal.text }}
      >
        <Typography sx={{ flex: 1, fontSize: 16, fontWeight: 500, letterSpacing: LIB_TRACKING }}>
          {title}
          {count > 0 && (
            <Box component="span" sx={{ ml: 1, color: pal.muted, fontWeight: 400 }}>
              {count}
            </Box>
          )}
        </Typography>
        <ExpandMoreRoundedIcon sx={{ fontSize: 22, color: pal.muted, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </ButtonBase>
      <Collapse in={open} unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

function ConstraintList({ items }) {
  const pal = useLibraryPalette();
  return (
    <Stack component="ul" sx={{ gap: 1, m: 0, pl: 2.25 }}>
      {items.map((c, i) => (
        <Typography key={i} component="li" sx={{ fontSize: 15, lineHeight: '24px', '&::marker': { color: pal.muted } }}>
          <Box component="code" sx={{ ...mono, fontSize: 13, px: 0.75, py: 0.25, borderRadius: '8px', wordBreak: 'break-word', bgcolor: pal.chip }}>
            {c}
          </Box>
        </Typography>
      ))}
    </Stack>
  );
}

function ExampleBlock({ index, example }) {
  const pal = useLibraryPalette();
  const rows = [
    ['Input', example.input],
    ['Output', example.output],
  ];
  return (
    <Box sx={{ mb: 2, '&:last-of-type': { mb: 0 } }}>
      <Typography sx={{ fontWeight: 700, fontSize: 15, letterSpacing: LIB_TRACKING, mb: 1 }}>Example {index + 1}</Typography>
      <Box sx={{ p: 1.5, borderRadius: '16px', bgcolor: pal.chip }}>
        {rows.map(([label, value]) => (
          <Typography key={label} sx={{ ...mono, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <Box component="span" sx={{ fontWeight: 700, color: pal.muted }}>
              {label}:{' '}
            </Box>
            {value}
          </Typography>
        ))}
        {example.explanation && (
          <Typography sx={{ mt: 1, fontSize: 15, lineHeight: '24px', whiteSpace: 'pre-wrap' }}>
            <Box component="span" sx={{ fontWeight: 700, color: pal.muted }}>
              Explanation:{' '}
            </Box>
            {example.explanation}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// showTags: difficulty, topic and company tags (the switch in the header menu).
export default function PhoneProblemDescription({ problem, showTags = true }) {
  const pal = useLibraryPalette();
  const key = problem.slug || problem._id || problem.title;
  const constraints = problem.constraints || [];
  // two short constraints stay visible; anything longer folds away
  const foldConstraints = constraints.length > 2 || constraints.join('').length > 140;
  const topics = problem.tags || [];
  const companies = problem.companies || [];

  return (
    <>
      <Typography component="h1" sx={{ fontWeight: 700, fontSize: 26, lineHeight: '32px', wordBreak: 'break-word' }}>
        {problem.title}
      </Typography>

      {showTags && (
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <PhoneDifficultyTag difficulty={problem.difficulty} />
            {topics.map((t) => (
              <TagPill key={t} label={t} />
            ))}
          </Stack>
          {companies.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted, mb: 0.75 }}>Companies</Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {companies.map((c) => (
                  <TagPill key={c} label={c} outlined />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}

      <Typography sx={{ whiteSpace: 'pre-line', mt: 2.5, mb: 3, fontSize: 16, lineHeight: '27px', letterSpacing: '0.01em' }}>{problem.description}</Typography>

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
            <Typography sx={{ fontWeight: 500, fontSize: 16, letterSpacing: LIB_TRACKING, mb: 1 }}>Constraints</Typography>
            <ConstraintList items={constraints} />
          </Box>
        ))}
    </>
  );
}
