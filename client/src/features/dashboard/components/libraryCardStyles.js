import { RADII_PX } from '../../../app/design/designTokens';
import { useLibraryPalette } from './libraryStyle';

// Left-column card of the Problems and Aptitude pages. Both pages share this one surface so the sidebar cards look
// identical: library chip colour, hairline border and the dialog radius, with the content stacked in an even grid.
export function useLibraryCardSx() {
  const pal = useLibraryPalette();
  return { display: 'grid', gap: 2, p: 2, borderRadius: RADII_PX.dialog, bgcolor: pal.chip, border: `1px solid ${pal.border}` };
}
