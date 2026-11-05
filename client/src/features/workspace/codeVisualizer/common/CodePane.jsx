import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FONT_SIZES, FONTS, SIZES } from '../../../../app/design/designTokens';

const TAB_SIZE = 4;

function CodeLine({ number, text, state, lineRef }) {
  const highlighted = state === 'active' || state === 'error';
  return (
    <Box
      ref={lineRef}
      sx={(theme) => ({
        display: 'flex',
        borderLeft: 3,
        borderLeftColor: highlighted ? (state === 'error' ? 'error.main' : 'primary.main') : 'transparent',
        bgcolor: highlighted ? alpha(state === 'error' ? theme.palette.error.main : theme.palette.primary.main, 0.16) : 'transparent',
      })}
    >
      <Box sx={{ width: SIZES.codeVisualizer.lineNumberColumn, flexShrink: 0, pr: 1.5, textAlign: 'right', color: 'text.secondary', userSelect: 'none' }}>
        {number}
      </Box>
      <Box component="span" sx={{ whiteSpace: 'pre', pr: 2 }}>
        {text || ' '}
      </Box>
    </Box>
  );
}

// The learner's code, read only. The line about to run is highlighted and kept in view while stepping.
export default function CodePane({ code, activeLine, errorLine }) {
  const activeRef = useRef(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeLine]);

  return (
    <Box
      role="region"
      aria-label="Your code"
      sx={{ fontFamily: FONTS.mono, fontSize: FONT_SIZES.body, lineHeight: 1.7, tabSize: TAB_SIZE, overflow: 'auto', py: 1, height: SIZES.fill }}
    >
      {code.split('\n').map((text, index) => {
        const number = index + 1;
        const state = number === activeLine ? 'active' : number === errorLine ? 'error' : 'idle';
        return <CodeLine key={number} number={number} text={text} state={state} lineRef={number === activeLine ? activeRef : undefined} />;
      })}
    </Box>
  );
}
