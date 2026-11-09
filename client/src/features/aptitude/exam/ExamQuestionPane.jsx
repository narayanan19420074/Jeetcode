import { Box, Button, Radio, Stack, Typography } from '@mui/material';
import QuestionStimulus from '../components/QuestionStimulus';
import { OPTION_LABELS, PALETTE } from '../components/aptitudeUi';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES, RADII_PX } from '../../../app/design/designTokens';

// Question column: statement, options and the review/navigation action bar.
export default function ExamQuestionPane({ current, cur, idx, total, setsById, onSelect, onUnmark, onMarkNext, onClear, onGoTo, onSaveNext }) {
  return (
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', bgcolor: COLOR_PALETTE.white, px: { xs: 1.5, sm: 2.5 }, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading }}>Question No. {idx + 1}</Typography>
            <Typography variant="caption" color="text.secondary">
              Marks: <b style={{ color: COLOR_PALETTE.custom.green2E9E4F }}>+1</b> / <b style={{ color: COLOR_PALETTE.custom.redE53935 }}>−0</b>
            </Typography>
          </Stack>

          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: COLOR_PALETTE.white, px: { xs: 1.5, sm: 2.5 }, py: 2.5 }}>
            <Box sx={{ maxWidth: 820 }}>
              <QuestionStimulus set={current.setId ? setsById[current.setId] : null} />
              <Typography sx={{ fontSize: FONT_SIZES.subheading, lineHeight: 1.7, fontWeight: FONT_WEIGHTS.medium, mb: 3, whiteSpace: 'pre-line' }}>{current.questionText}</Typography>

              <Stack spacing={1}>
                {current.options.map((o, i) => {
                  const on = cur.selected === i;
                  return (
                    <Box
                      key={i}
                      onClick={() => onSelect(i)}
                      role="radio"
                      aria-checked={on}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1,
                        py: 1,
                        border: '1px solid',
                        borderColor: on ? COLOR_PALETTE.blue[600] : 'divider',
                        bgcolor: on ? withAlpha(COLOR_PALETTE.blue[600], 0.07) : 'transparent',
                        borderRadius: RADII_PX.control,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: on ? withAlpha(COLOR_PALETTE.blue[600], 0.07) : 'action.hover' },
                      }}
                    >
                      <Radio checked={on} tabIndex={-1} size="small" sx={{ p: 1 }} />
                      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary', width: 22 }}>{OPTION_LABELS[i]}.</Typography>
                      <Typography sx={{ fontSize: FONT_SIZES.title }}>{o.text}</Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Box>

          {/* Action bar */}
          <Stack
            direction="row"
           
            spacing={1}
           
            useFlexGap
            sx={{ alignItems: 'center', flexWrap: 'wrap', bgcolor: COLOR_PALETTE.slate[50], borderTop: '1px solid', borderColor: 'divider', px: { xs: 1.5, sm: 2.5 }, py: 1.5 }}
          >
            {cur.marked ? (
              <Button variant="outlined" size="small" onClick={onUnmark} sx={{ borderColor: PALETTE.marked.bg, color: PALETTE.marked.bg }}>
                Unmark review
              </Button>
            ) : (
              <Button variant="outlined" size="small" onClick={onMarkNext} sx={{ borderColor: PALETTE.marked.bg, color: PALETTE.marked.bg, '&:hover': { borderColor: PALETTE.marked.bg, bgcolor: withAlpha(COLOR_PALETTE.custom.indigo6A3FB5, 0.08) } }}>
                Mark for Review &amp; Next
              </Button>
            )}
            <Button variant="outlined" size="small" color="inherit" onClick={onClear} disabled={cur.selected === null}>
              Clear Response
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button size="small" color="inherit" disabled={idx === 0} onClick={() => onGoTo(idx - 1)}>
              ‹ Back
            </Button>
            <Button size="small" color="inherit" disabled={idx === total - 1} onClick={() => onGoTo(idx + 1)}>
              Next ›
            </Button>
            <Button variant="contained" disableElevation onClick={onSaveNext} sx={{ bgcolor: COLOR_PALETTE.blue[600], px: 3, fontWeight: FONT_WEIGHTS.bold }}>
              {idx === total - 1 ? 'Save' : 'Save & Next'}
            </Button>
          </Stack>
        </Box>
  );
}
