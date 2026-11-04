import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, SIZES, TEXT_MEASURE } from '../../app/design/designTokens';
import { SectionHeading } from './HomeCommon';
import { hairline } from './homeStyles';

function FaqItem({ question, answer }) {
  return (
    <Accordion disableGutters elevation={0} square sx={{ bgcolor: 'transparent', borderBottom: hairline, borderColor: 'divider', '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 0, py: 1 }}>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.title }}>{question}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0, pb: 2.5 }}>
        <Typography color="text.secondary" sx={{ maxWidth: TEXT_MEASURE.answer, lineHeight: LINE_HEIGHTS.long }}>{answer}</Typography>
      </AccordionDetails>
    </Accordion>
  );
}

export default function FaqSection({ items }) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 } }}>
      <SectionHeading align="left" maxWidth={SIZES.headingMaxWidth.narrow}>
        Questions? Answered.
      </SectionHeading>
      <Box>
        {items.map(({ q, a }) => (
          <FaqItem key={q} question={q} answer={a} />
        ))}
      </Box>
    </Container>
  );
}
