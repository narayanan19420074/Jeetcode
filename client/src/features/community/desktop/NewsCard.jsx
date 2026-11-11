import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Link, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { timeAgo } from '../../workspace/community/CommunityBits';
import { FONT_WEIGHTS } from '../../../app/design/designTokens';
import RailCard from './RailCard';

const FIRST_COUNT = 5;
const EXPANDED_COUNT = 10;

// Posts people are talking about most: score plus comments, from the posts already loaded in the feed.
const topStories = (items) => [...items].sort((a, b) => b.score + b.commentCount - (a.score + a.commentCount)).slice(0, EXPANDED_COUNT);

function Story({ post }) {
  return (
    <Link component={RouterLink} to={`/community/${post._id}`} underline="none" color="inherit" sx={{ display: 'block' }}>
      <Typography variant="body2" noWrap sx={{ fontWeight: FONT_WEIGHTS.semibold }}>{post.title}</Typography>
      <Typography variant="caption" color="text.secondary">{timeAgo(post.createdAt)} • {post.commentCount} comments</Typography>
    </Link>
  );
}

// Right rail "Community news": the most discussed posts, five at first and ten with "Show more".
export default function NewsCard({ items }) {
  const [expanded, setExpanded] = useState(false);
  const stories = topStories(items);
  const shown = expanded ? stories : stories.slice(0, FIRST_COUNT);

  return (
    <RailCard sx={{ p: 2 }}>
      <Typography component="h2" variant="h6" sx={{ fontWeight: FONT_WEIGHTS.bold }}>Community news</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1.5 }}>Top stories</Typography>
      {shown.length === 0 && <Typography variant="body2" color="text.secondary">No stories yet.</Typography>}
      <Stack spacing={1.5}>
        {shown.map((post) => <Story key={post._id} post={post} />)}
      </Stack>
      {stories.length > FIRST_COUNT && (
        <Button color="inherit" endIcon={<ExpandMoreRoundedIcon />} onClick={() => setExpanded((current) => !current)} sx={{ mt: 1, ml: -1 }}>
          {expanded ? 'Show less' : 'Show more news'}
        </Button>
      )}
    </RailCard>
  );
}
