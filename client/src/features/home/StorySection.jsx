import { Box, Container, Typography } from '@mui/material';
import { BORDER_WIDTHS, FONT_WEIGHTS } from '../../app/design/designTokens';
import { bandSx, quoteSx } from './homeStyles';

// Why it exists: the founder's reason, in his own words.
export default function StorySection() {
  return (
    <Box sx={bandSx}>
      <Container maxWidth="md" sx={{ py: { xs: 7, md: 9 } }}>
        <Box sx={{ pl: { xs: 3, md: 5 }, borderLeft: `${BORDER_WIDTHS.accent}px solid`, borderColor: 'primary.main' }}>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'text.secondary', mb: 1.5 }}>Why I built this</Typography>
          <Typography sx={quoteSx}>
            I lived the scattered prep: tabs everywhere, no clear next step, nobody to practice with. JeetCode is the tool I wish I had.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
