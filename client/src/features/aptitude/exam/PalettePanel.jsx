import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { PaletteSymbol } from '../AptitudeTestInstructionsPage';
import { PALETTE } from '../components/aptitudeUi';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { NAVY } from './examStyle';
import { emptyState, statusOf } from './examState';

export default function PalettePanel({ user, questions, states, idx, counts, onJump, onSubmit, submitting }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: RADII_PX.control, bgcolor: 'action.hover', display: 'grid', placeItems: 'center', fontWeight: FONT_WEIGHTS.bold, color: NAVY, fontSize: FONT_SIZES.subheading }}>
          {(user?.name || 'C').charAt(0).toUpperCase()}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2 }} noWrap>
            {user?.name || 'Candidate'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Candidate
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        {['answered', 'notAnswered', 'notVisited', 'marked', 'answeredMarked'].map((k) => (
          <Stack key={k} direction="row" spacing={1} sx={{ alignItems: 'center', gridColumn: k === 'answeredMarked' ? '1 / -1' : undefined }}>
            <PaletteSymbol kind={k} size={26}>
              {counts[k]}
            </PaletteSymbol>
            <Typography variant="caption" sx={{ lineHeight: 1.2 }}>
              {PALETTE[k].label}
            </Typography>
          </Stack>
        ))}
      </Box>

      <Box sx={{ px: 1.5, py: 1, bgcolor: NAVY, color: COLOR_PALETTE.white }}>
        <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '0.06em' }}>
          QUESTION PALETTE
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
          {questions.map((q, i) => {
            const kind = statusOf(states[q._id] ?? emptyState());
            const current = i === idx;
            return (
              <Box
                key={q._id}
                onClick={() => onJump(i)}
                role="button"
                aria-label={`Question ${i + 1}: ${PALETTE[kind].label}`}
                sx={{
                  cursor: 'pointer',
                  justifySelf: 'center',
                  borderRadius: RADII_PX.control,
                  outline: current ? `2.5px solid ${COLOR_PALETTE.blue[600]}` : '2.5px solid transparent',
                  outlineOffset: 2,
                  '&:hover': { filter: 'brightness(0.93)' },
                }}
              >
                <PaletteSymbol kind={kind} size={36}>
                  {i + 1}
                </PaletteSymbol>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button fullWidth variant="contained" disableElevation onClick={onSubmit} disabled={submitting} sx={{ py: 1, bgcolor: COLOR_PALETTE.custom.green2E9E4F, '&:hover': { bgcolor: COLOR_PALETTE.green[700] } }}>
          {submitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Test'}
        </Button>
      </Box>
    </Box>
  );
}
