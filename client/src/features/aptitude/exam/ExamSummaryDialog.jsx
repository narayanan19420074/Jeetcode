import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { PaletteSymbol } from '../AptitudeTestInstructionsPage';
import { formatClock } from '../components/aptitudeUi';
import { COLOR_PALETTE, FONT_WEIGHTS } from '../../../app/design/designTokens';
import { mono } from './examStyle';

// Final confirmation: the learner sees what is unanswered before the paper is locked.
export default function ExamSummaryDialog({ open, onClose, onSubmit, total, counts, remaining }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>Test summary</DialogTitle>
      <DialogContent>
        <Table size="small">
          <TableBody>
            {[
              ['Total questions', total, null],
              ['Answered', counts.answered + counts.answeredMarked, 'answered'],
              ['Not answered', counts.notAnswered, 'notAnswered'],
              ['Marked for review', counts.marked + counts.answeredMarked, 'marked'],
              ['Not visited', counts.notVisited, 'notVisited'],
            ].map(([label, value, kind]) => (
              <TableRow key={label}>
                <TableCell sx={{ border: 0, py: 1 }}>
                  <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                    {kind ? <PaletteSymbol kind={kind} size={18} /> : <Box sx={{ width: 18 }} />}
                    <span>{label}</span>
                  </Stack>
                </TableCell>
                <TableCell align="right" sx={{ border: 0, py: 1, ...mono, fontWeight: FONT_WEIGHTS.bold }}>
                  {value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          You still have {formatClock(remaining ?? 0)} left. Once you submit, you cannot change your answers.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Go back</Button>
        <Button variant="contained" disableElevation onClick={onSubmit} sx={{ bgcolor: COLOR_PALETTE.custom.green2E9E4F, '&:hover': { bgcolor: COLOR_PALETTE.green[700] } }}>
          Submit test
        </Button>
      </DialogActions>
    </Dialog>
  );
}
