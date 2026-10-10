import { useSelector } from 'react-redux';
import { Alert, Box, MenuItem, Select } from '@mui/material';
import { Card, PageTitle, Row, SwitchRow, usePreferences } from '../components/SettingsUi';

export default function AccessibilitySection() {
  const { prefs, set } = usePreferences();
  const a = prefs.accessibility;
  const mode = useSelector((s) => s.ui.mode);
  const contrast = prefs.appearance.contrast;

  return (
    <Box>
      <PageTitle title="Accessibility" description="Options that make JeetCode easier on your eyes and your attention." />

      <Card title="Motion">
        <Row
          title="Reduce motion"
          description="Turns off interface transitions and decorative animation. “Match device” follows your operating-system setting."
          control={
            <Select size="small" value={a.reduceMotion} onChange={(e) => set('accessibility', { reduceMotion: e.target.value })} sx={{ minWidth: 190 }} inputProps={{ 'aria-label': 'Reduce motion' }}>
              <MenuItem value="system">Match device</MenuItem>
              <MenuItem value="on">Always reduce</MenuItem>
              <MenuItem value="off">Never reduce</MenuItem>
            </Select>
          }
        />
        <Box sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
          <Alert severity="info" variant="outlined" sx={{ borderColor: 'divider' }}>
            The 3D mascots and level-map walkers on the Aptitude page always follow your <b>device</b> reduced-motion setting.
          </Alert>
        </Box>
      </Card>

      <Card title="Reading">
        <SwitchRow title="Underline links" description="Always underline links so they don't rely on colour alone." checked={a.underlineLinks} onChange={(on) => set('accessibility', { underlineLinks: on })} />
        <SwitchRow
          title="Increase contrast"
          description={`Stronger text and borders. Currently ${mode} mode.`}
          checked={contrast === 'high'}
          onChange={(on) => set('appearance', { contrast: on ? 'high' : 'normal' })}
        />
      </Card>
    </Box>
  );
}
