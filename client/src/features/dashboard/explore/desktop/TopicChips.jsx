import { Box, ButtonBase, Skeleton } from '@mui/material';
import { LIB_TRACKING, useLibraryPalette } from '../../components/libraryStyle';

const SKELETON_WIDTHS = [70, 110, 84, 130, 96, 74, 120, 88];

function Chip({ tag, count, onBrowse, palette }) {
  return (
    <ButtonBase
      onClick={() => onBrowse({ tags: [tag] })}
      aria-label={`Browse ${tag} questions`}
      sx={{ height: 34, px: '14px', gap: 0.75, borderRadius: 999, fontFamily: 'inherit', bgcolor: palette.chip, color: palette.chipText, fontSize: 15, letterSpacing: LIB_TRACKING, whiteSpace: 'nowrap', '&:hover': { bgcolor: palette.player } }}
    >
      {tag}
      <Box component="span" sx={{ fontSize: 13, opacity: 0.7, fontVariantNumeric: 'tabular-nums' }}>{count}</Box>
    </ButtonBase>
  );
}

// Topic chips that wrap onto as many rows as the width needs.
export default function TopicChips({ tags, onBrowse }) {
  const palette = useLibraryPalette();
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {tags === null
        ? SKELETON_WIDTHS.map((width) => <Skeleton key={width} variant="rounded" width={width} height={34} sx={{ borderRadius: 999 }} />)
        : tags.map(({ tag, count }) => <Chip key={tag} tag={tag} count={count} onBrowse={onBrowse} palette={palette} />)}
    </Box>
  );
}
