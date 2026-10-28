import { alpha } from '@mui/material/styles';

// Scrollbars stay invisible until the pointer is over the scrollable area
// (workspace and pair room). Use as: sx={(t) => ({ ...hoverScrollbars(t), ... })}
export const hoverScrollbars = (t) => {
  const thumb = alpha(t.palette.text.primary, 0.35);
  return {
    '& *': { scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' },
    '& *:hover': { scrollbarColor: `${thumb} transparent` },
    '& *::-webkit-scrollbar': { width: 8, height: 8 },
    '& *::-webkit-scrollbar-track': { background: 'transparent' },
    '& *::-webkit-scrollbar-thumb': { backgroundColor: 'transparent', borderRadius: 8 },
    '& *:hover::-webkit-scrollbar-thumb': { backgroundColor: thumb },
    // Monaco draws its own scrollbars
    '& .monaco-scrollable-element > .scrollbar > .slider': { opacity: 0, transition: 'opacity .2s' },
    '& .monaco-editor:hover .monaco-scrollable-element > .scrollbar > .slider': { opacity: 1 },
  };
};
