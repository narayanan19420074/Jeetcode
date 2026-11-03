import { Box, ButtonBase, Skeleton } from '@mui/material';
import { LIB_TRACKING, useLibraryPalette } from '../../components/libraryStyle';
import { FONT_SIZES, RADII_PX } from '../../../../app/design/designTokens';

const SKELETON_WIDTHS = [70, 110, 84, 130, 96, 74, 120, 88];

function Chip({ tag, count, onBrowse, palette }) {
  return (
    <ButtonBase
      onClick={() => onBrowse({ tags: [tag] })}
      aria-label={`Browse ${tag} questions`}
      sx={{ height: 34, px: 2, gap: 1, borderRadius: RADII_PX.pill, fontFamily: 'inherit', bgcolor: palette.chip, color: palette.chipText, fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, whiteSpace: 'nowrap', '&:hover': { bgcolor: palette.player } }}
    >
      {tag}
      <Box component="span" sx={{ fontSize: FONT_SIZES.body, opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</Box>
    </ButtonBase>
  );
}

// Topic chips that wrap onto as many rows as the width needs.
export default function TopicChips({ tags, onBrowse }) {
  const palette = useLibraryPalette();
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {tags === null
        ? SKELETON_WIDTHS.map((width) => <Skeleton key={width} variant="rounded" width={width} height={34} sx={{ borderRadius: RADII_PX.pill }} />)
        : tags.map(({ tag, count }) => <Chip key={tag} tag={tag} count={count} onBrowse={onBrowse} palette={palette} />)}
    </Box>
  );
}
