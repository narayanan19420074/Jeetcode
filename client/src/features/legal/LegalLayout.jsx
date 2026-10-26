import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Link, Stack, Typography } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { LAST_UPDATED, LEGAL_LINKS, SITE_NAME } from './legalConfig';

// Public, standalone shell for legal pages (works logged-in or logged-out).
// `sections` = [{ title, body: [string | { list: string[] }] }]
export default function LegalLayout({ title, intro, sections }) {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label={`${SITE_NAME} home`}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}
          >
            <CodeRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography sx={{ fontWeight: 800 }}>{SITE_NAME}</Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: '1.7rem', md: '2.1rem' }, fontWeight: 800, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Last updated: {LAST_UPDATED}
        </Typography>
        {intro && (
          <Typography sx={{ mb: 3, lineHeight: 1.75 }}>{intro}</Typography>
        )}

        {sections.map((s, i) => (
          <Box key={s.title} component="section" sx={{ mb: 3.5 }}>
            <Typography component="h2" sx={{ fontSize: '1.15rem', fontWeight: 700, mb: 1 }}>
              {i + 1}. {s.title}
            </Typography>
            {s.body.map((b, j) =>
              typeof b === 'string' ? (
                <Typography key={j} sx={{ mb: 1.25, lineHeight: 1.75 }}>
                  {b}
                </Typography>
              ) : (
                <Box key={j} component="ul" sx={{ mt: 0, mb: 1.25, pl: 3 }}>
                  {b.list.map((li) => (
                    <Typography key={li} component="li" sx={{ lineHeight: 1.75, mb: 0.5 }}>
                      {li}
                    </Typography>
                  ))}
                </Box>
              )
            )}
          </Box>
        ))}

        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 5, pt: 2 }}>
          <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} component={RouterLink} to={l.to} underline="hover" color="text.secondary" variant="body2">
                {l.label}
              </Link>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
