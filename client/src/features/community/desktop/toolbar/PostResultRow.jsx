import { Link as RouterLink } from 'react-router-dom';
import { ListItemButton, Typography } from '@mui/material';
import { authorLabel } from '../../common/PostAuthor';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

// One post in the search dropdown; it opens the full post.
export default function PostResultRow({ post }) {
  return (
    <ListItemButton component={RouterLink} to={`/community/${post._id}`} sx={{ display: 'block', px: 0 }}>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.semibold }}>{post.title}</Typography>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.body, color: 'text.secondary' }}>{`by ${authorLabel(post.author)}`}</Typography>
    </ListItemButton>
  );
}
