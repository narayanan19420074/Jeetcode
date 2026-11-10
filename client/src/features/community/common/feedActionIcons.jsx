import { createSvgIcon } from '@mui/material/utils';

// Outline icons for the row under a feed post (like, comment, repost, share), drawn on the 24-unit grid with a
// uniform stroke so they look the same as on LinkedIn: thumbs up, speech bubble, two looping arrows, paper plane.
const outline = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

const thumbsUpPath = 'M7.5 10.5V20H4V10.5h3.5zM7.5 10.5l3.6-6.6c1.3-.2 2.4.8 2.4 2.1v3.5h5.3c1.1 0 1.9 1 1.7 2.1l-1.2 6.4c-.2 1-1 1.7-2 1.7H7.5';

export const LikeOutlineIcon = createSvgIcon(<path d={thumbsUpPath} {...outline} />, 'LikeOutline');
export const LikeFilledIcon = createSvgIcon(<path d={thumbsUpPath} {...outline} fill="currentColor" />, 'LikeFilled');

export const CommentOutlineIcon = createSvgIcon(
  <path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-7.5l-4.5 3.5V16.5H5A1.5 1.5 0 0 1 3.5 15V6A1.5 1.5 0 0 1 5 4.5z" {...outline} />,
  'CommentOutline'
);

export const RepostOutlineIcon = createSvgIcon(
  <path d="M4.5 12V9.5a2.5 2.5 0 0 1 2.5-2.5h11.5M15.5 4l3 3-3 3M19.5 12v2.5a2.5 2.5 0 0 1-2.5 2.5H5.5M8.5 14l-3 3 3 3" {...outline} />,
  'RepostOutline'
);

export const SendOutlineIcon = createSvgIcon(<path d="M21 3 3 10.5l7 2.5 2.5 7L21 3zM10 13l11-10" {...outline} />, 'SendOutline');
