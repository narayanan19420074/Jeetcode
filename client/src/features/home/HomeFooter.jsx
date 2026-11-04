import { Box, Container, Grid, Link, Stack, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, TEXT_MEASURE } from '../../app/design/designTokens';
import { LEGAL_LINKS } from './homeContent';
import { hairline, wordmarkSx } from './homeStyles';

function FooterColumn({ title, links }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, mb: 1.5, fontSize: FONT_SIZES.bodyLg }}>{title}</Typography>
      <Stack spacing={1}>
        {links.map(([label, onClick]) => (
          <Link key={label} component="button" type="button" onClick={onClick} underline="hover" color="text.secondary" sx={{ textAlign: 'left', font: 'inherit', fontSize: FONT_SIZES.bodyLg }}>
            {label}
          </Link>
        ))}
      </Stack>
    </Box>
  );
}

function FooterColumns({ authed, onNavigate }) {
  const accountLinks = authed ? [['Dashboard', onNavigate('/dashboard')]] : [['Log in', onNavigate('/login')], ['Sign up', onNavigate('/signup')]];
  return (
    <>
      <Grid size={{ xs: 6, md: 2.5 }}>
        <FooterColumn title="Practice" links={[['Problems', onNavigate('/problems')], ['Aptitude', onNavigate('/aptitude')], ['Company prep', onNavigate('/prep')], ['Visualizer', onNavigate('/visualizer')]]} />
      </Grid>
      <Grid size={{ xs: 6, md: 2.5 }}>
        <FooterColumn title="Together" links={[['Pair rooms', onNavigate('/pair')], ['Contest', onNavigate('/contest')], ['Pricing', onNavigate('/pricing')]]} />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <FooterColumn title="Account" links={accountLinks} />
      </Grid>
    </>
  );
}

function LegalLinks({ onNavigate }) {
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
      {LEGAL_LINKS.map(([label, path]) => (
        <Link key={path} component="button" type="button" onClick={onNavigate(path)} underline="hover" color="text.secondary" sx={{ font: 'inherit', fontSize: FONT_SIZES.caption }}>
          {label}
        </Link>
      ))}
    </Stack>
  );
}

export default function HomeFooter({ authed, onNavigate }) {
  return (
    <Box component="footer" sx={{ borderTop: hairline, borderColor: 'divider', pt: 6, pb: { xs: 12, md: 4 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography sx={wordmarkSx}>JeetCode</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: TEXT_MEASURE.brief, lineHeight: LINE_HEIGHTS.relaxed }}>
              Coding, aptitude and company prep for placement season, in one place.
            </Typography>
          </Grid>
          <FooterColumns authed={authed} onNavigate={onNavigate} />
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 5, maxWidth: TEXT_MEASURE.legal, lineHeight: LINE_HEIGHTS.relaxed }}>
          Company names and marks belong to their owners. They appear only to show which company a question is tagged to, and do not imply any affiliation or endorsement.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>© {new Date().getFullYear()} JeetCode</Typography>
        <LegalLinks onNavigate={onNavigate} />
      </Container>
    </Box>
  );
}
