import { useTheme } from '@mui/material/styles';
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography, Chip } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import tokens, { ACCENTS } from '../../../theme/theme';
import { Card, CardBody, ChoiceCard, PageTitle, Row, SwitchRow, usePreferences } from '../components/SettingsUi';

// A tiny app window drawn in the real palette so the theme options are
// recognisable at a glance. `half` renders the diagonal "match my device" split.
function Mock({ scheme, accent }) {
  const dark = scheme === 'dark';
  const bg = dark ? tokens.slate900 : tokens.slate50;
  const paper = dark ? tokens.slate800 : '#FFFFFF';
  const line = dark ? 'rgba(148,163,184,.35)' : '#CBD5E1';
  const text = dark ? '#F8FAFC' : '#0F172A';
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: bg, p: 1 }}>
      <Box sx={{ height: 9, borderRadius: 1, bgcolor: paper, mb: 0.75, display: 'flex', alignItems: 'center', px: 0.5, gap: 0.5 }}>
        <Box sx={{ width: 10, height: 4, borderRadius: 1, bgcolor: accent }} />
        <Box sx={{ width: 16, height: 3, borderRadius: 1, bgcolor: line }} />
      </Box>
      <Box sx={{ bgcolor: paper, borderRadius: 1, p: 0.75, border: `1px solid ${line}` }}>
        <Box sx={{ width: '55%', height: 4, borderRadius: 1, bgcolor: text, mb: 0.6, opacity: 0.85 }} />
        <Box sx={{ width: '85%', height: 3, borderRadius: 1, bgcolor: line, mb: 0.4 }} />
        <Box sx={{ width: '70%', height: 3, borderRadius: 1, bgcolor: line, mb: 0.75 }} />
        <Box sx={{ width: 26, height: 8, borderRadius: 1, bgcolor: accent }} />
      </Box>
    </Box>
  );
}

function ThemePreview({ variant, accent }) {
  return (
    <Box sx={{ position: 'relative', height: 92, borderRadius: '8px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      {variant === 'system' ? (
        <>
          <Mock scheme="light" accent={accent} />
          <Box sx={{ position: 'absolute', inset: 0, clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
            <Mock scheme="dark" accent={accent} />
          </Box>
        </>
      ) : (
        <Mock scheme={variant} accent={accent} />
      )}
    </Box>
  );
}

const SIZES = [
  { key: 'sm', label: 'Small', px: 13 },
  { key: 'md', label: 'Default', px: 15 },
  { key: 'lg', label: 'Large', px: 18 },
];

export default function AppearanceSection() {
  const theme = useTheme();
  const { prefs, set, reset } = usePreferences();
  const a = prefs.appearance;
  const accentHex = (ACCENTS[a.accent] ?? ACCENTS.blue)[theme.palette.mode === 'dark' ? 'dark' : 'light'][0];
  const previewAccent = (ACCENTS[a.accent] ?? ACCENTS.blue).dark[0];

  return (
    <Box>
      <PageTitle
        title="Appearance"
        description="Make JeetCode look the way you like. Changes apply immediately and follow you to other devices."
        action={
          <Button size="small" color="inherit" startIcon={<RestartAltRoundedIcon />} onClick={() => reset('appearance')} sx={{ flexShrink: 0 }}>
            Reset
          </Button>
        }
      />

      <Card title="Theme mode" description="Choose light, dark, or follow your device.">
        <CardBody>
          <Box role="radiogroup" aria-label="Theme mode" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, minmax(0,1fr))' }, gap: { xs: 1, sm: 1.75 } }}>
            {[
              { key: 'light', label: 'Light' },
              { key: 'dark', label: 'Dark' },
              { key: 'system', label: 'Sync with system', hint: 'Matches your device' },
            ].map((o) => (
              <ChoiceCard key={o.key} selected={a.theme === o.key} onClick={() => set('appearance', { theme: o.key })} label={o.label} hint={o.hint}>
                <ThemePreview variant={o.key} accent={previewAccent} />
              </ChoiceCard>
            ))}
          </Box>
        </CardBody>
      </Card>

      <Card title="Accent colour" description="Used for buttons, links and highlights across the app.">
        <CardBody>
          <Box role="radiogroup" aria-label="Accent colour" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {Object.entries(ACCENTS).map(([key, def]) => {
              const sel = a.accent === key;
              const swatch = def[theme.palette.mode === 'dark' ? 'dark' : 'light'][0];
              return (
                <Tooltip key={key} title={def.label}>
                  <Box
                    component="button"
                    type="button"
                    role="radio"
                    aria-checked={sel}
                    aria-label={def.label}
                    onClick={() => set('appearance', { accent: key })}
                    sx={{
                      all: 'unset',
                      cursor: 'pointer',
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: swatch,
                      display: 'grid',
                      placeItems: 'center',
                      color: def.text,
                      outline: sel ? `3px solid ${swatch}` : '3px solid transparent',
                      outlineOffset: 3,
                      transition: 'outline-color .15s, transform .15s',
                      '&:hover': { transform: 'scale(1.06)' },
                      '&:focus-visible': { outline: `3px solid ${theme.palette.text.primary}` },
                    }}
                  >
                    {sel && <CheckRoundedIcon />}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </CardBody>
      </Card>

      <Card title="Interface">
        <Row
          title="Density"
          description="Compact tightens spacing and uses smaller controls to fit more on screen."
          control={
            <ToggleButtonGroup exclusive size="small" value={a.density} onChange={(_, v) => v && set('appearance', { density: v })} aria-label="Density">
              <ToggleButton value="comfortable" sx={{ px: 2 }}>Comfortable</ToggleButton>
              <ToggleButton value="compact" sx={{ px: 2 }}>Compact</ToggleButton>
            </ToggleButtonGroup>
          }
        />
        <Row
          title="Text size"
          description="Scales text across the whole app."
          control={
            <ToggleButtonGroup exclusive size="small" value={a.fontScale} onChange={(_, v) => v && set('appearance', { fontScale: v })} aria-label="Text size">
              {SIZES.map((s) => (
                <ToggleButton key={s.key} value={s.key} sx={{ px: 2, gap: 0.75, alignItems: 'baseline' }}>
                  <span style={{ fontSize: s.px, fontWeight: 700 }}>Aa</span>
                  <span style={{ fontSize: 12 }}>{s.label}</span>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          }
        />
        <SwitchRow title="Increase contrast" description="Stronger text and borders for easier reading." checked={a.contrast === 'high'} onChange={(on) => set('appearance', { contrast: on ? 'high' : 'normal' })} />
      </Card>

      <Card title="Preview">
        <CardBody>
          <Stack spacing={1.5}>
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="contained" disableElevation>Primary action</Button>
              <Button variant="outlined">Secondary</Button>
              <Chip label="Medium" size="small" color="warning" />
              <Chip label="Solved" size="small" color="success" />
              <Typography component="a" href="#preview" onClick={(e) => e.preventDefault()} sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.9rem' }}>
                A sample link
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Accent <b style={{ color: accentHex }}>{ACCENTS[a.accent]?.label}</b> · {a.density} density · text {SIZES.find((s) => s.key === a.fontScale)?.label.toLowerCase()}
            </Typography>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
