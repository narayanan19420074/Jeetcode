import { Box, Button, Stack, Typography } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import { FilterChips } from '../../workspace/community/CommunityBits';
import PostList from '../common/PostList';
import ComposePostDialog from '../common/ComposePostDialog';
import { FEED_TABS } from '../common/communityCategories';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

// Desktop layout: a centred reading column with the title and the compose button in the header.
export default function CommunityDesktopView({ page }) {
  const { category, setCategory, feed, composeOpen, openCompose, closeCompose } = page;
  return (
    <Box sx={{ maxWidth: SIZES.readingMaxWidth, mx: 'auto', px: 3, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography component="h1" sx={{ fontSize: FONT_SIZES.hero, fontWeight: FONT_WEIGHTS.bold }}>Community</Typography>
        <Button variant="contained" disableElevation startIcon={<EditNoteRoundedIcon />} onClick={openCompose}>Create post</Button>
      </Stack>
      <FilterChips value={category} onChange={setCategory} options={FEED_TABS} />
      <PostList feed={feed} />
      <ComposePostDialog open={composeOpen} onClose={closeCompose} onPublished={feed.prepend} />
    </Box>
  );
}
