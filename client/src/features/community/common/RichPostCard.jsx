import { Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import ThumbUpOffAltRoundedIcon from '@mui/icons-material/ThumbUpOffAltRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { PostAvatar, authorLabel } from './PostAuthor';
import { POST_CATEGORY_OPTIONS } from './communityCategories';
import { timeAgo } from '../../workspace/community/CommunityBits';
import { communityImageUrl } from './imageUpload';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const PREVIEW_CHARS = 140;
const coverSx = { display: 'block', width: SIZES.fill, mt: 1.5, borderRadius: RADII_PX.card };

const cardSx = { display: 'block', px: 2, pt: 2, pb: 1.5, textDecoration: 'none', color: 'inherit', bgcolor: 'background.paper', borderRadius: { md: RADII_PX.card } };
const mutedSx = { color: 'var(--lib-muted)', letterSpacing: LIB_TRACKING };

// First characters of the text, cut at a word boundary, so long posts end in "…more" like on LinkedIn.
function previewOf(text) {
  if (text.length <= PREVIEW_CHARS) return { text, cut: false };
  const head = text.slice(0, PREVIEW_CHARS);
  return { text: head.slice(0, head.lastIndexOf(' ') > 0 ? head.lastIndexOf(' ') : PREVIEW_CHARS), cut: true };
}

const categoryLabel = (value) => POST_CATEGORY_OPTIONS.find((option) => option.value === value)?.label;

function AuthorRow({ post }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <PostAvatar author={post.author} size={SIZES.avatar.md} />
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>{authorLabel(post.author)}</Typography>
        <Typography noWrap sx={{ ...mutedSx, fontSize: FONT_SIZES.body }}>{timeAgo(post.createdAt)} · {categoryLabel(post.category)}</Typography>
      </Box>
    </Stack>
  );
}

function PostText({ title, excerpt }) {
  const preview = previewOf(excerpt);
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography sx={{ fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.3 }}>{title}</Typography>
      <Typography sx={{ mt: 0.5, fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING }}>
        {preview.text}
        {preview.cut && <Box component="span" sx={mutedSx}>… more</Box>}
      </Typography>
    </Box>
  );
}

function Action({ icon: Icon, value, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} aria-label={`${value} ${label}`}>
      <Icon sx={{ fontSize: SIZES.iconSize.medium }} />
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg }}>{value}</Typography>
    </Stack>
  );
}

// A post laid out like a LinkedIn post: author, text with "…more", its first image, then the counters. Used for every
// Career post and for any post that has an image. Opens the post.
export default function RichPostCard({ post }) {
  return (
    <Box component={RouterLink} to={`/community/${post._id}`} sx={cardSx}>
      <AuthorRow post={post} />
      <PostText title={post.title} excerpt={post.excerpt} />
      {post.coverImage && <Box component="img" src={communityImageUrl(post.coverImage)} alt="" loading="lazy" sx={coverSx} />}
      <Stack direction="row" spacing={3} sx={{ ...mutedSx, mt: 2 }}>
        <Action icon={ThumbUpOffAltRoundedIcon} value={post.score} label="upvotes" />
        <Action icon={ChatBubbleOutlineRoundedIcon} value={post.commentCount} label="comments" />
        <Action icon={VisibilityOutlinedIcon} value={post.viewCount} label="views" />
      </Stack>
    </Box>
  );
}
