import { Box, ButtonBase } from '@mui/material';
import { libChipSx } from '../../dashboard/components/libraryStyle';

// Category pills (All, Pro, Courses, Merch, ...). Needs the Library CSS variables, so it lives inside LibraryFont.
export default function CategoryTabs({ categories, cat, onCat }) {
  return (
    <Box role="tablist" aria-label="Categories" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {categories.map((category) => (
        <ButtonBase key={category.id} role="tab" aria-selected={category.id === cat} onClick={() => onCat(category.id)} sx={libChipSx(category.id === cat)}>
          {category.label}
        </ButtonBase>
      ))}
    </Box>
  );
}
