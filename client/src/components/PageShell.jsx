import { useRef } from 'react';
import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import BackToDashboard from './BackToDashboard';
import useViewportFill from '../features/dashboard/useViewportFill';

// One layout for every page except the dashboard, so margins, page names and the right
// sidebar are the same everywhere.
//
//   title             page name, always in the same place with the back button
//   actions           optional buttons on the right of the title row
//   aside             optional content for the right column; without it the column is just empty space
//   asideMobile       phones have no right column: 'none' hides it, 'top' / 'bottom' stacks it
//   rail={false}      no right column at all
//   fill              wide screens: page is exactly one window tall and only the body scrolls;
//                     then `children` can be a function: ({ fill }) => ...
//   contentMax        cap the width of the main column (narrow forms / pricing cards)
export default function PageShell({ title, actions, aside, asideMobile = 'none', rail = true, fill = false, contentMax, children }) {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const rootRef = useRef(null);
  const fillH = useViewportFill(rootRef, fill && isLg);
  const filled = Boolean(fillH);

  return (
    <Box ref={rootRef} sx={filled ? { height: fillH, overflow: 'hidden' } : { minHeight: 'calc(100vh - 64px)' }}>
      <Container
        maxWidth={false}
        sx={{ maxWidth: 1480, py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 }, height: filled ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, md: 2.5 }, flexShrink: 0 }}>
          <BackToDashboard />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {title}
            </Typography>
          </Box>
          {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0 }}>{actions}</Box>}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, lg: 0 },
            alignItems: 'start',
            flex: filled ? 1 : 'none',
            minHeight: 0,
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: rail ? 'minmax(0, 1fr) 340px' : 'minmax(0, 1fr)' },
            gridTemplateRows: filled ? 'minmax(0, 1fr)' : undefined,
          }}
        >
          <Box
            className={filled ? 'autohide-scroll' : undefined}
            sx={{
              minWidth: 0,
              minHeight: 0,
              height: filled ? '100%' : 'auto',
              pr: { lg: rail ? 3 : 0 },
              maxWidth: contentMax || 'none',
              width: '100%',
            }}
          >
            {typeof children === 'function' ? children({ fill: filled }) : children}
          </Box>

          {rail && (
            <Box
              className="autohide-scroll"
              sx={{
                display: { xs: asideMobile === 'none' || !aside ? 'none' : 'block', lg: 'block' },
                order: { xs: asideMobile === 'top' ? -1 : 1, lg: 0 },
                minWidth: 0,
                minHeight: 0,
                height: { lg: filled ? '100%' : 'auto' },
                overflowY: { lg: filled ? 'auto' : 'visible' },
                pl: { lg: 3 },
                alignSelf: 'start',
              }}
            >
              <Box sx={{ width: { xs: '100%', lg: 316 } }}>{aside}</Box>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
