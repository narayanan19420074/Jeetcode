import { Box, Stack, Typography } from '@mui/material';
import { DIFFICULTY } from '../../components/aptitudeUi';
import { FONTS, FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

const mono = { fontFamily: FONTS.mono };

function SolvedTotal({ totals }) {
  return (
    <Box>
      <Typography sx={{ ...mono, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.display, lineHeight: 1 }}>
        {totals.solved}
        <Typography component="span" color="text.secondary" sx={{ ...mono, fontSize: FONT_SIZES.body }}>/{totals.total}</Typography>
      </Typography>
      <Typography variant="caption" color="text.secondary">solved</Typography>
    </Box>
  );
}

function DifficultyTotal({ meta, count }) {
  return (
    <Box>
      <Typography sx={{ ...mono, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, color: meta.color, lineHeight: 1.2 }}>{count.solved}/{count.total}</Typography>
      <Typography variant="caption" color="text.secondary">{meta.label}</Typography>
    </Box>
  );
}

// Title of the practice page and the solved counts of the whole pattern.
export default function PracticeHeader({ totals, byDifficulty }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'flex-end', justifyContent: 'space-between', mb: 2.5 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: FONT_WEIGHTS.bold }}>Practice</Typography>
        <Typography color="text.secondary">Solve at your own pace. Every answer comes with the method and the exam shortcut.</Typography>
      </Box>
      {totals && (
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
          <SolvedTotal totals={totals} />
          {Object.entries(DIFFICULTY).map(([key, meta]) => <DifficultyTotal key={key} meta={meta} count={byDifficulty[key]} />)}
        </Stack>
      )}
    </Stack>
  );
}
