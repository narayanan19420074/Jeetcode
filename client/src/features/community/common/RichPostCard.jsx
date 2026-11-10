import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import PostCardHeader from './PostCardHeader';
import PostEngagementBar from './PostEngagementBar';
import { communityImageUrl } from './imageUpload';
import { clamp } from '../../workspace/community/CommunityBits';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FEED_IMAGE_FRAME, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const PREVIEW_CHARS = 140;
// A post never grows past these lines in the feed, whatever its length; the rest is read on the post page.
const TITLE_LINES = 2;
const TEXT_LINES = 3;
// Every photo is shown in the same square frame, edge to edge inside the card, so all posts keep the same layout.
// Photos that were not cropped when the post was written are centred and trimmed to the frame.
const frameSx = {
  position: 'relative',
  width: (theme) => `calc(100% + ${theme.spacing(3)})`,
  mx: -1.5,
  mt: 1,
  aspectRatio: FEED_IMAGE_FRAME.aspectRatio,
  overflow: 'hidden',
  bgcolor: 'action.hover',
};
const coverSx = { position: 'absolute', inset: 0, display: 'block', width: SIZES.fill, height: SIZES.fill, objectFit: 'cover' };

const cardSx = { px: 1.5, pt: 1.5, pb: 0, bgcolor: 'background.paper', borderRadius: { md: RADII_PX.card } };
const contentLinkSx = { display: 'block', mt: 1, textDecoration: 'none', color: 'inherit' };
const mutedSx = { color: 'var(--lib-muted)', letterSpacing: LIB_TRACKING };

// First characters of the text, cut at a word boundary, so long posts end in "…more" like on LinkedIn.
function previewOf(text) {
  if (text.length <= PREVIEW_CHARS) return { text, cut: false };
  const head = text.slice(0, PREVIEW_CHARS);
  return { text: head.slice(0, head.lastIndexOf(' ') > 0 ? head.lastIndexOf(' ') : PREVIEW_CHARS), cut: true };
}

function PostText({ title, excerpt }) {
  const preview = previewOf(excerpt);
  return (
    <>
      <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.semibold, lineHeight: 1.3, ...clamp(TITLE_LINES) }}>{title}</Typography>
      <Typography sx={{ mt: 0.25, fontSize: FONT_SIZES.body, lineHeight: 1.3, letterSpacing: LIB_TRACKING, ...clamp(TEXT_LINES) }}>
        {preview.text}
        {preview.cut && <Box component="span" sx={mutedSx}>… more</Box>}
      </Typography>
    </>
  );
}

// A feed post laid out like a LinkedIn post: author row with Follow and the "..." menu, the text with "…more" and its
// first image (both open the post), then the like, comment, repost and share row. The phone feed swaps in its own
// `Header` and `engagementTrailing`; everything else is shared.
export default function RichPostCard({ post, onRemoved, Header = PostCardHeader, engagementTrailing }) {
  return (
    <Box component="article" sx={cardSx}>
      <Header post={post} onRemoved={onRemoved} />
      <Box component={RouterLink} to={`/community/${post._id}`} sx={contentLinkSx}>
        <PostText title={post.title} excerpt={post.excerpt} />
        {post.coverImage && (
          <Box sx={frameSx}>
            <Box component="img" src={communityImageUrl(post.coverImage)} alt="" loading="lazy" sx={coverSx} />
          </Box>
        )}
      </Box>
      <PostEngagementBar post={post} trailing={engagementTrailing} />
    </Box>
  );
}
