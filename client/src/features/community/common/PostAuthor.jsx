import { Avatar, Typography } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { UserAvatar } from '../../workspace/community/CommunityBits';
import { SIZES } from '../../../app/design/designTokens';

// Anonymous posts arrive with `author: null`; the real identity is never sent by the server.
export const authorLabel = (author) => (author ? author.name : 'Anonymous User');

export function PostAvatar({ author, size = SIZES.avatar.md }) {
  if (author) return <UserAvatar user={author} size={size} />;
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: 'action.selected', color: 'text.secondary' }}>
      <PersonRoundedIcon />
    </Avatar>
  );
}

export function AuthorName({ author }) {
  return (
    <Typography component="span" noWrap sx={{ fontSize: 'inherit', color: 'inherit' }}>
      {authorLabel(author)}
    </Typography>
  );
}
