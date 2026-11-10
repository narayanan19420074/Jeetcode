import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import OutlinedFlagRoundedIcon from '@mui/icons-material/OutlinedFlagRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

const baseEntries = ({ isSaved, actions }) => [
  { key: 'save', label: isSaved ? 'Unsave' : 'Save', icon: isSaved ? BookmarkRoundedIcon : BookmarkBorderRoundedIcon, onSelect: actions.toggleSave },
  { key: 'share', label: 'Share via', icon: ShareOutlinedIcon, onSelect: actions.share },
];

// Hiding only makes sense for other people's posts, and an anonymous author has no name to hide.
const hideEntries = ({ post, actions }) => {
  if (post.isMine) return [];
  const hideAuthor = post.author ? [{ key: 'hide-author', label: `Hide posts by ${post.author.name}`, icon: VisibilityOffOutlinedIcon, onSelect: actions.hideAuthor }] : [];
  return [...hideAuthor, { key: 'not-interested', label: 'Not interested', icon: ThumbDownAltOutlinedIcon, onSelect: actions.hidePost }];
};

const moderationEntries = ({ canReport, canDelete, actions }) => [
  ...(canReport ? [{ key: 'report', label: 'Report post', icon: OutlinedFlagRoundedIcon, onSelect: actions.report }] : []),
  ...(canDelete ? [{ key: 'delete', label: 'Delete post', icon: DeleteOutlineRoundedIcon, onSelect: actions.remove, danger: true }] : []),
];

// The items of a post's "..." menu, in the order readers know from other social feeds.
export const buildPostMenuEntries = (options) => [...baseEntries(options), ...hideEntries(options), ...moderationEntries(options)];
