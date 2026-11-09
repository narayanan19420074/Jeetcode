import { Stack, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { FONT_SIZES, SIZES } from '../../../app/design/designTokens';

function Stat({ icon: Icon, value, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} aria-label={`${value} ${label}`}>
      <Icon sx={{ fontSize: SIZES.iconSize.small }} />
      <Typography sx={{ fontSize: FONT_SIZES.bodyLg }}>{value}</Typography>
    </Stack>
  );
}

// Read-only counters on a feed card; voting happens on the post page.
export default function PostStats({ score, viewCount, commentCount }) {
  return (
    <Stack direction="row" spacing={2.5} sx={{ color: 'var(--lib-muted)' }}>
      <Stat icon={ArrowUpwardRoundedIcon} value={score} label="upvotes" />
      <Stat icon={VisibilityOutlinedIcon} value={viewCount} label="views" />
      <Stat icon={ChatBubbleOutlineRoundedIcon} value={commentCount} label="comments" />
    </Stack>
  );
}
