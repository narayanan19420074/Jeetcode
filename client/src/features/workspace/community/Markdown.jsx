import { useState } from 'react';
import { Box, IconButton, Stack, Tab, Tabs, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

// Small, dependency-free markdown renderer. It never uses
// dangerouslySetInnerHTML — everything becomes React text nodes, so user
// content can't inject HTML/script. Supports: fenced code, headings (#-###),
// bullet/numbered lists, blockquotes, **bold**, *italic*, `code`, and
// http(s) links.

const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };

export const LANG_LABEL = { javascript: 'JavaScript', python: 'Python', cpp: 'C++' };
export const LANG_COLOR = { javascript: '#F59E0B', python: '#3B82F6', cpp: '#8B5CF6' };

function LangDot({ language }) {
  return <Box component="span" sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: LANG_COLOR[language] || 'text.disabled', flexShrink: 0 }} />;
}

// Read-only snippet used as the "photo" of a feed card: first lines of the
// code with a fade-out at the bottom. Tapping is handled by the parent.
export function CodePreview({ code, language }) {
  return (
    <Box sx={{ position: 'relative', mt: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.default', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ px: 1.5, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
        <LangDot language={language} />
        <Typography variant="caption" sx={{ fontWeight: 600, ...mono }}>
          {LANG_LABEL[language] || language}
        </Typography>
      </Stack>
      <Box component="pre" sx={{ m: 0, px: 1.5, py: 1.25, maxHeight: 150, overflow: 'hidden', fontSize: '0.8rem', lineHeight: 1.6, ...mono }}>
        <code>{code}</code>
      </Box>
      <Box
        sx={(t) => ({
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 44,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom, ${alpha(t.palette.background.default, 0)}, ${t.palette.background.default})`,
        })}
      />
    </Box>
  );
}

export function CodeBlock({ code, language, maxHeight = 420 }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked (insecure context / permissions) — nothing useful to do
    }
  };

  return (
    <Box sx={{ my: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.default', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pl: 1.5, pr: 0.5, minHeight: 40, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          {language && <LangDot language={language} />}
          <Typography variant="caption" sx={{ fontWeight: 600, ...mono }}>
            {LANG_LABEL[language] || language || 'code'}
          </Typography>
        </Stack>
        <Tooltip title={copied ? 'Copied' : 'Copy code'}>
          <IconButton aria-label="Copy code" onClick={copy}>
            {copied ? <CheckRoundedIcon sx={{ fontSize: 20 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>
      </Stack>
      <Box component="pre" sx={{ m: 0, p: 1.5, overflow: 'auto', maxHeight, fontSize: '0.85rem', lineHeight: 1.65, ...mono }}>
        <code>{code}</code>
      </Box>
    </Box>
  );
}

function renderInline(text, keyPrefix) {
  const re = /`([^`\n]+)`|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const out = [];
  let last = 0;
  let m;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${n++}`;
    if (m[1] !== undefined) {
      out.push(
        <Box key={key} component="code" sx={{ px: 0.6, py: 0.1, borderRadius: 1, bgcolor: 'action.hover', fontSize: '0.85em', ...mono }}>
          {m[1]}
        </Box>
      );
    } else if (m[2] !== undefined) {
      out.push(<strong key={key}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      out.push(<em key={key}>{m[3]}</em>);
    } else {
      out.push(
        <Box key={key} component="a" href={m[5]} target="_blank" rel="noopener noreferrer nofollow" sx={{ color: 'primary.main' }}>
          {m[4]}
        </Box>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const UL = /^\s*[-*]\s+/;
const OL = /^\s*\d+[.)]\s+/;

function parseBlocks(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: 'code', lang: fence[1], text: buf.join('\n') });
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      blocks.push({ type: 'h', level: h[1].length, text: h[2] });
      i++;
      continue;
    }
    if (UL.test(line)) {
      const items = [];
      while (i < lines.length && UL.test(lines[i])) items.push(lines[i++].replace(UL, ''));
      blocks.push({ type: 'ul', items });
      continue;
    }
    if (OL.test(line)) {
      const items = [];
      while (i < lines.length && OL.test(lines[i])) items.push(lines[i++].replace(OL, ''));
      blocks.push({ type: 'ol', items });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: buf.join('\n') });
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,3}\s|>)/.test(lines[i]) && !UL.test(lines[i]) && !OL.test(lines[i])) {
      buf.push(lines[i++]);
    }
    if (!buf.length) buf.push(lines[i++]);
    blocks.push({ type: 'p', text: buf.join('\n') });
  }
  return blocks;
}

export default function Markdown({ source }) {
  if (!source?.trim()) return null;
  const blocks = parseBlocks(source);

  return (
    <Box sx={{ fontSize: '0.95rem', lineHeight: 1.7, wordBreak: 'break-word', '& > :first-of-type': { mt: 0 } }}>
      {blocks.map((b, i) => {
        const k = `b${i}`;
        switch (b.type) {
          case 'code':
            return <CodeBlock key={k} code={b.text} language={b.lang} />;
          case 'h':
            return (
              <Typography key={k} variant={b.level === 1 ? 'h6' : 'subtitle1'} sx={{ fontWeight: 700, mt: 2, mb: 0.5 }}>
                {renderInline(b.text, k)}
              </Typography>
            );
          case 'ul':
          case 'ol':
            return (
              <Box key={k} component={b.type} sx={{ pl: 3, my: 1 }}>
                {b.items.map((it, j) => (
                  <li key={`${k}-${j}`}>{renderInline(it, `${k}-${j}`)}</li>
                ))}
              </Box>
            );
          case 'quote':
            return (
              <Box key={k} sx={{ my: 1, pl: 1.5, borderLeft: '3px solid', borderColor: 'divider', color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                {renderInline(b.text, k)}
              </Box>
            );
          default:
            return (
              <Box key={k} sx={{ my: 1, whiteSpace: 'pre-wrap' }}>
                {renderInline(b.text, k)}
              </Box>
            );
        }
      })}
    </Box>
  );
}

// Textarea with Write / Preview toggle.
export function MarkdownEditor({ value, onChange, maxLength = 10000, minRows = 6, placeholder, label, disabled }) {
  const [tab, setTab] = useState('write');

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{label}</Typography>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, py: 0, fontSize: '0.88rem' } }}>
          <Tab value="write" label="Write" />
          <Tab value="preview" label="Preview" />
        </Tabs>
      </Stack>
      {tab === 'write' ? (
        <TextField
          fullWidth
          multiline
          minRows={minRows}
          maxRows={16}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          helperText={`Markdown supported · \`\`\`code\`\`\` blocks · ${value.length}/${maxLength}`}
          slotProps={{ htmlInput: { style: { fontSize: '0.95rem' } } }}
        />
      ) : (
        <Box sx={{ minHeight: minRows * 24, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {value.trim() ? <Markdown source={value} /> : <Typography variant="body2" color="text.secondary">Nothing to preview.</Typography>}
        </Box>
      )}
    </Box>
  );
}
