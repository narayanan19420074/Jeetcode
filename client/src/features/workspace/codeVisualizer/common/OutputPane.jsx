import { Box, Typography } from '@mui/material';
import { FONT_SIZES, FONTS } from '../../../../app/design/designTokens';

function Section({ title, text, emptyText }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      <Box component="pre" sx={{ m: 0, fontFamily: FONTS.mono, fontSize: FONT_SIZES.body, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: text ? 'text.primary' : 'text.secondary' }}>
        {text || emptyText}
      </Box>
    </Box>
  );
}

// The sample input of the traced case and everything the program has printed up to the current step.
export default function OutputPane({ input, output }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1.5 }}>
      <Section title="Input" text={input} emptyText="No input" />
      <Section title="Output so far" text={output} emptyText="Nothing printed yet" />
    </Box>
  );
}
