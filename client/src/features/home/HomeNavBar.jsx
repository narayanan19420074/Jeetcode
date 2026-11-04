import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Container, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { toggleThemeMode } from '../../app/uiSlice';
import { FONT_SIZES, FONT_WEIGHTS, SIZES, Z_INDEX } from '../../app/design/designTokens';
import { PrimaryCta } from './HomeCommon';
import { NAV_ANCHORS } from './homeContent';
import { hairline, wordmarkSx } from './homeStyles';

function SectionLinks() {
  return (
    <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
      {NAV_ANCHORS.map(([label, href]) => (
        <Link key={label} href={href} underline="none" color="text.secondary" sx={{ fontWeight: FONT_WEIGHTS.semibold, fontSize: FONT_SIZES.bodyLg, '&:hover': { color: 'text.primary' } }}>
          {label}
        </Link>
      ))}
    </Stack>
  );
}

function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.ui.mode);
  return (
    <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={() => dispatch(toggleThemeMode())} color="inherit" aria-label="Toggle color theme">
        {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}

// Solid page-coloured header, so the page stays pure white behind it while scrolling.
export default function HomeNavBar({ authed, onStart, onLogin }) {
  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: Z_INDEX.header, borderBottom: hairline, borderColor: 'divider', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Stack direction="row" sx={{ height: SIZES.appBarHeight.desktop, alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
            <Typography component="a" href="#top" sx={wordmarkSx}>
              JeetCode
            </Typography>
            <SectionLinks />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ThemeToggle />
            {!authed && (
              <Button color="inherit" onClick={onLogin} sx={{ fontWeight: FONT_WEIGHTS.bold, whiteSpace: 'nowrap' }}>
                Log in
              </Button>
            )}
            <PrimaryCta size="medium" label={authed ? 'Dashboard' : 'Sign up'} onClick={onStart} sx={{ px: 2.5, py: 0.5 }} />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
