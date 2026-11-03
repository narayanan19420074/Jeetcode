import { useState } from 'react';
import { Box, ButtonBase, Collapse, IconButton, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { LIB_TRACKING, libIconBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { PhoneDifficultyTag } from './phoneStyle';
import { mono } from './wsTokens';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, MOTION } from '../../app/design/designTokens';

// Problem statement on phones, in the Library look: page-title name, tags (switchable from the menu),
// description, then folded examples and constraints. Used inside ProblemSheet.

function TagPill({ label, outlined = false }) {
  const pal = useLibraryPalette();
  return (
    <Box
      component="span"
      sx={{
        height: 34,
        px: 2,
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: RADII_PX.pill,
        fontSize: FONT_SIZES.bodyLg,
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
    <Box sx={{ mb: 1.5, borderRadius: RADII_PX.card, border: `1px solid ${pal.border}`, overflow: 'hidden' }}>
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start', gap: 1, px: 2, py: 1.5, textAlign: 'left', fontFamily: 'inherit', color: pal.text }}
      >
        <Typography sx={{ flex: 1, fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING }}>
          {title}
          {count > 0 && (
            <Box component="span" sx={{ ml: 1, color: pal.muted, fontWeight: FONT_WEIGHTS.regular }}>
              {count}
            </Box>
          )}
        </Typography>
        <ExpandMoreRoundedIcon sx={{ fontSize: FONT_SIZES.display, color: pal.muted, transition: `transform ${MOTION.standard}ms`, transform: open ? 'rotate(180deg)' : 'none' }} />
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
    <Stack component="ul" sx={{ gap: 1, m: 0, pl: 2.5 }}>
      {items.map((c, i) => (
        <Typography key={i} component="li" sx={{ fontSize: FONT_SIZES.bodyLg, lineHeight: '24px', '&::marker': { color: pal.muted } }}>
          <Box component="code" sx={{ ...mono, fontSize: FONT_SIZES.body, px: 1, py: 0.5, borderRadius: RADII_PX.control, wordBreak: 'break-word', bgcolor: pal.chip }}>
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
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, mb: 1 }}>Example {index + 1}</Typography>
      <Box sx={{ p: 1.5, borderRadius: RADII_PX.card, bgcolor: pal.chip }}>
        {rows.map(([label, value]) => (
          <Typography key={label} sx={{ ...mono, fontSize: FONT_SIZES.body, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <Box component="span" sx={{ fontWeight: FONT_WEIGHTS.bold, color: pal.muted }}>
              {label}:{' '}
            </Box>
            {value}
          </Typography>
        ))}
        {example.explanation && (
          <Typography sx={{ mt: 1, fontSize: FONT_SIZES.bodyLg, lineHeight: '24px', whiteSpace: 'pre-wrap' }}>
            <Box component="span" sx={{ fontWeight: FONT_WEIGHTS.bold, color: pal.muted }}>
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
// nav (optional): { hasPrev, hasNext, onPrev, onNext } -> previous / next arrows beside the name (pair room).
export default function PhoneProblemDescription({ problem, showTags = true, nav }) {
  const pal = useLibraryPalette();
  const key = problem.slug || problem._id || problem.title;
  const constraints = problem.constraints || [];
  // two short constraints stay visible; anything longer folds away
  const foldConstraints = constraints.length > 2 || constraints.join('').length > 140;
  const topics = problem.tags || [];
  const companies = problem.companies || [];

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
        <Typography component="h1" sx={{ flex: 1, minWidth: 0, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '32px', wordBreak: 'break-word' }}>
          {problem.title}
        </Typography>
        {nav && (
          <Stack direction="row" sx={{ flexShrink: 0, gap: 1 }}>
            <IconButton aria-label="Previous problem" disabled={!nav.hasPrev} onClick={nav.onPrev} sx={libIconBtnSx}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <IconButton aria-label="Next problem" disabled={!nav.hasNext} onClick={nav.onNext} sx={libIconBtnSx}>
              <ChevronRightRoundedIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>

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
              <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted, mb: 1 }}>Companies</Typography>
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {companies.map((c) => (
                  <TagPill key={c} label={c} outlined />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}

      <Typography sx={{ whiteSpace: 'pre-line', mt: 2.5, mb: 3, fontSize: FONT_SIZES.title, lineHeight: '27px', letterSpacing: '0.01em' }}>{problem.description}</Typography>

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
            <Typography sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, letterSpacing: LIB_TRACKING, mb: 1 }}>Constraints</Typography>
            <ConstraintList items={constraints} />
          </Box>
        ))}
    </>
  );
}
