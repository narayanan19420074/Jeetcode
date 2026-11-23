import { Box, Typography } from '@mui/material';
import { tint } from '../../../dashboard/dashboardUtils';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { BORDER_WIDTHS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, RADII_PX } from '../../../../app/design/designTokens';
import CodeBlock from './CodeBlock';
import VideoBlock from './VideoBlock';

const NOTE_TONES = { tip: { label: 'Tip', color: 'success.main' }, warning: { label: 'Watch out', color: 'warning.main' } };
const NOTE_TINT_PERCENT = 10;

const TextBlock = ({ block }) => <Typography sx={{ my: 1.5, fontSize: FONT_SIZES.bodyLg, lineHeight: LINE_HEIGHTS.long }}>{block.value}</Typography>;

const HeadingBlock = ({ block }) => <Typography component="h3" sx={{ mt: 3.5, mb: 1, fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold }}>{block.value}</Typography>;

function BulletsBlock({ block }) {
  return (
    <Box component="ul" sx={{ my: 1.5, pl: 3, fontSize: FONT_SIZES.bodyLg, lineHeight: LINE_HEIGHTS.long }}>
      {block.items.map((item) => <li key={item}>{item}</li>)}
    </Box>
  );
}

const CodeBlockItem = ({ block }) => <CodeBlock value={block.value} result={block.result} />;

function NoteBlock({ block }) {
  const palette = useLibraryPalette();
  const tone = NOTE_TONES[block.tone] ?? NOTE_TONES.tip;
  return (
    <Box role="note" sx={{ my: 2, p: 2, borderRadius: RADII_PX.control, bgcolor: tint(palette.muted, NOTE_TINT_PERCENT), borderLeft: `${BORDER_WIDTHS.accent}px solid`, borderColor: tone.color }}>
      <Typography component="span" sx={{ fontWeight: FONT_WEIGHTS.bold, color: tone.color }}>{tone.label}: </Typography>
      <Typography component="span" sx={{ fontSize: FONT_SIZES.bodyLg, lineHeight: LINE_HEIGHTS.long }}>{block.value}</Typography>
    </Box>
  );
}

const BLOCK_RENDERERS = { text: TextBlock, heading: HeadingBlock, bullets: BulletsBlock, code: CodeBlockItem, note: NoteBlock, video: VideoBlock };

// Reading content of a lesson: paragraphs, headings, lists, code examples, notes and videos, in the order they were written.
export default function LessonBlocks({ blocks }) {
  return blocks.map((block, index) => {
    const Renderer = BLOCK_RENDERERS[block.type];
    return <Renderer key={`${block.type}-${index}`} block={block} />;
  });
}
