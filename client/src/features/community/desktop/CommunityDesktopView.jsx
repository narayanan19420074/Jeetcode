import { Box, Button, Stack, Typography } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CategoryTabs from '../common/CategoryTabs';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import PostList from '../common/PostList';
import ComposePostDialog from '../common/ComposePostDialog';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

// Desktop layout: a centred reading column with the title and the compose button in the header.
export default function CommunityDesktopView({ page }) {
  const { category, setCategory, tabs, feed, composeOpen, openCompose, closeCompose } = page;
  return (
    <LibraryFont>
    <Box sx={{ maxWidth: SIZES.readingMaxWidth, mx: 'auto', px: 3, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: FONT_SIZES.hero, fontWeight: FONT_WEIGHTS.bold }}>Community</Typography>
        <Button variant="contained" disableElevation sx={(theme) => ({ bgcolor: navActiveColor(theme), '&:hover': { bgcolor: navActiveColor(theme) } })} startIcon={<EditNoteRoundedIcon />} onClick={openCompose}>Create post</Button>
      </Stack>
      <CategoryTabs value={category} onChange={setCategory} options={tabs} />
      <PostList feed={feed} category={category} />
      <ComposePostDialog open={composeOpen} onClose={closeCompose} onPublished={feed.prepend} />
    </Box>
    </LibraryFont>
  );
}
