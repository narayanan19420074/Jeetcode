import { Box, Button, MenuItem, Select, Slider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { Card, CardBody, PageTitle, Row, SwitchRow, usePreferences } from '../components/SettingsUi';

const SAMPLE = `function twoSum(nums, target) {
\tconst seen = new Map();
\tfor (let i = 0; i < nums.length; i++) {
\t\tconst need = target - nums[i];
\t\tif (seen.has(need)) return [seen.get(need), i]; // => <= !== ->
\t\tseen.set(nums[i], i);
\t}
\treturn [];
}`;

const THEMES = {
  'vs-dark': { bg: '#1E1E1E', fg: '#D4D4D4', gutter: '#858585' },
  vs: { bg: '#FFFFFF', fg: '#1F2937', gutter: '#9CA3AF' },
  'hc-black': { bg: '#000000', fg: '#FFFFFF', gutter: '#FFFFFF' },
};

// Static stand-in for Monaco that honours the same settings, so changes are
// visible without opening a problem.
function Preview({ e, uiMode }) {
  const t = THEMES[e.theme === 'auto' ? (uiMode === 'dark' ? 'vs-dark' : 'vs') : e.theme];
  const lines = SAMPLE.split('\n');
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px', overflow: 'hidden', bgcolor: t.bg }}>
      <Box sx={{ overflowX: 'auto', py: 1.25 }}>
        {lines.map((line, i) => (
          <Box key={i} sx={{ display: 'flex', fontFamily: '"JetBrains Mono","Fira Code",monospace', fontSize: e.fontSize, lineHeight: 1.6, tabSize: e.tabSize, MozTabSize: e.tabSize, fontVariantLigatures: e.ligatures ? 'normal' : 'none', color: t.fg }}>
            {e.lineNumbers && (
              <Box component="span" sx={{ width: '3.2ch', textAlign: 'right', pr: 1.5, flexShrink: 0, color: t.gutter, userSelect: 'none', opacity: 0.8 }}>
                {i + 1}
              </Box>
            )}
            <Box component="span" sx={{ pl: e.lineNumbers ? 0 : 1.5, pr: 1.5, whiteSpace: e.wordWrap ? 'pre-wrap' : 'pre', wordBreak: e.wordWrap ? 'break-word' : 'normal', minWidth: 0 }}>
              {line || ' '}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function EditorSection() {
  const { prefs, set, reset } = usePreferences();
  const e = prefs.editor;
  const uiMode = typeof document !== 'undefined' ? (document.documentElement.style.colorScheme === 'light' ? 'light' : 'dark') : 'dark';

  return (
    <Box>
      <PageTitle
        title="Code editor"
        description="How the editor looks and behaves when you solve problems."
        action={
          <Button size="small" color="inherit" startIcon={<RestartAltRoundedIcon />} onClick={() => reset('editor')} sx={{ flexShrink: 0 }}>
            Reset
          </Button>
        }
      />

      <Card title="Preview">
        <CardBody>
          <Preview e={e} uiMode={uiMode} />
        </CardBody>
      </Card>

      <Card title="Text">
        <Row
          title="Font size"
          description={`${e.fontSize}px`}
          control={
            <Box sx={{ width: { xs: '100%', sm: 220 }, px: 1 }}>
              <Slider value={e.fontSize} min={10} max={28} step={1} onChange={(_, v) => set('editor', { fontSize: v })} aria-label="Editor font size" valueLabelDisplay="auto" />
            </Box>
          }
        />
        <Row
          title="Tab size"
          description="Spaces per indentation level."
          control={
            <ToggleButtonGroup exclusive size="small" value={e.tabSize} onChange={(_, v) => v && set('editor', { tabSize: v })} aria-label="Tab size">
              {[2, 4, 8].map((n) => (
                <ToggleButton key={n} value={n} sx={{ px: 2 }}>
                  {n}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          }
        />
        <SwitchRow title="Font ligatures" description="Draw => and !== as single glyphs (needs a font that supports them)." checked={e.ligatures} onChange={(v) => set('editor', { ligatures: v })} />
      </Card>

      <Card title="Behaviour">
        <SwitchRow title="Word wrap" description="Wrap long lines instead of scrolling sideways." checked={e.wordWrap} onChange={(v) => set('editor', { wordWrap: v })} />
        <SwitchRow title="Line numbers" checked={e.lineNumbers} onChange={(v) => set('editor', { lineNumbers: v })} />
        <SwitchRow title="Minimap" description="Small overview of the file on the right edge." checked={e.minimap} onChange={(v) => set('editor', { minimap: v })} />
        <SwitchRow title="Auto-close brackets and quotes" checked={e.autoClose} onChange={(v) => set('editor', { autoClose: v })} />
      </Card>

      <Card title="Defaults">
        <Row
          title="Editor theme"
          description="“Match app” switches with light and dark mode."
          control={
            <Select size="small" value={e.theme} onChange={(ev) => set('editor', { theme: ev.target.value })} sx={{ minWidth: 190 }} inputProps={{ 'aria-label': 'Editor theme' }}>
              <MenuItem value="auto">Match app</MenuItem>
              <MenuItem value="vs-dark">Dark</MenuItem>
              <MenuItem value="vs">Light</MenuItem>
              <MenuItem value="hc-black">High contrast</MenuItem>
            </Select>
          }
        />
        <Row
          title="Default language"
          description="The language selected when you open a problem."
          control={
            <Select size="small" value={e.defaultLanguage} onChange={(ev) => set('editor', { defaultLanguage: ev.target.value })} sx={{ minWidth: 190 }} inputProps={{ 'aria-label': 'Default language' }}>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
            </Select>
          }
        />
      </Card>
    </Box>
  );
}
