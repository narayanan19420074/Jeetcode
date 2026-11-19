import Editor from '@monaco-editor/react';
import { Box, CircularProgress } from '@mui/material';
import EditorScroller from './EditorScroller';
import { SIZES } from '../../app/design/designTokens';

// The Monaco canvas plus, on phones, the fast-scroller. Hidden (not unmounted) while another pane is maximized.
export default function EditorSurface({ hidden, surface, isMobile, editor, editorProps }) {
  const sx = {
    position: 'relative',
    bgcolor: surface.canvas,
    flex: 1,
    minHeight: SIZES.flexShrinkMinHeight,
    display: hidden ? 'none' : 'block',
  };
  return (
    <Box sx={sx}>
      <Editor height={SIZES.fill} loading={<CircularProgress size={SIZES.iconSize.large} aria-label="Loading editor" />} {...editorProps} />
      {isMobile && <EditorScroller editor={editor} />}
    </Box>
  );
}
