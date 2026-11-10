import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import PostCardHeader from './PostCardHeader';
import PostEngagementBar from './PostEngagementBar';
import { communityImageUrl } from './imageUpload';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

const PREVIEW_CHARS = 140;
// The photo runs edge to edge inside the card, at its own proportions, like a LinkedIn photo post.
const coverSx = { display: 'block', width: (theme) => `calc(100% + ${theme.spacing(3)})`, mx: -1.5, mt: 1, borderRadius: RADII_PX.square };

const cardSx = { px: 1.5, pt: 1, pb: 0, bgcolor: 'background.paper', borderRadius: { md: RADII_PX.card } };
const contentLinkSx = { display: 'block', mt: 1.25, textDecoration: 'none', color: 'inherit' };
const actionsSx = { py: 0.5 };
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
      <Typography sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.semibold, lineHeight: 1.4 }}>{title}</Typography>
      <Typography sx={{ mt: 0.25, fontSize: FONT_SIZES.body, lineHeight: 1.45, letterSpacing: LIB_TRACKING }}>
        {preview.text}
        {preview.cut && <Box component="span" sx={mutedSx}>… more</Box>}
      </Typography>
    </>
  );
}

// A feed post laid out like a LinkedIn post: author row with Follow and the "..." menu, the text with "…more" and its
// first image (both open the post), then the like, comment, repost and share row.
export default function RichPostCard({ post, onRemoved }) {
  return (
    <Box component="article" sx={cardSx}>
      <PostCardHeader post={post} onRemoved={onRemoved} />
      <Box component={RouterLink} to={`/community/${post._id}`} sx={contentLinkSx}>
        <PostText title={post.title} excerpt={post.excerpt} />
        {post.coverImage && <Box component="img" src={communityImageUrl(post.coverImage)} alt="" loading="lazy" sx={coverSx} />}
      </Box>
      <Box sx={actionsSx}>
        <PostEngagementBar post={post} />
      </Box>
    </Box>
  );
}
