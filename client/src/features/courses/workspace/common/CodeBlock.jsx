import { Box, Typography } from '@mui/material';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { BORDER_WIDTHS, FONTS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, RADII_PX } from '../../../../app/design/designTokens';

const monoTextSx = { m: 0, fontFamily: FONTS.mono, fontSize: FONT_SIZES.body, lineHeight: LINE_HEIGHTS.comfortable };

function ProgramOutput({ result, palette }) {
  return (
    <Box sx={{ px: 2, py: 1.5, borderTop: `${BORDER_WIDTHS.thin}px solid ${palette.border}` }}>
      <Typography component="span" sx={{ display: 'block', mb: 0.5, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: palette.muted }}>Output</Typography>
      <Box component="pre" sx={{ ...monoTextSx, color: palette.muted, overflowX: 'auto' }}>{result}</Box>
    </Box>
  );
}

// A Python example in a monospace panel, with the output of the program under it when there is one. The code panel can
// be focused so keyboard users can scroll long lines sideways.
export default function CodeBlock({ value, result = null }) {
  const palette = useLibraryPalette();
  return (
    <Box sx={{ my: 2, overflow: 'hidden', borderRadius: RADII_PX.control, bgcolor: palette.chip, border: `${BORDER_WIDTHS.thin}px solid ${palette.border}` }}>
      <Box component="pre" tabIndex={0} aria-label="Python code example" sx={{ ...monoTextSx, p: 2, overflowX: 'auto' }}>{value}</Box>
      {result !== null && <ProgramOutput result={result} palette={palette} />}
    </Box>
  );
}
