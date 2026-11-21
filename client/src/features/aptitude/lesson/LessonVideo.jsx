import { Box, Link, Paper, Typography } from '@mui/material';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import { FONT_SIZES, RADII_PX, SIZES, VIDEO_ASPECT_RATIO } from '../../../app/design/designTokens';
import { Eyebrow } from './LessonSections';

// The privacy-enhanced YouTube domain does not set tracking cookies until the learner presses play.
const embedUrl = (videoId) => `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
const watchUrl = (videoId) => `https://www.youtube.com/watch?v=${videoId}`;

function VideoFrame({ video }) {
  return (
    <Box sx={{ aspectRatio: VIDEO_ASPECT_RATIO, width: SIZES.fill, borderRadius: RADII_PX.card, overflow: 'hidden' }}>
      <Box
        component="iframe"
        src={embedUrl(video.id)}
        title={video.title}
        loading="lazy"
        allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sx={{ width: SIZES.fill, height: SIZES.fill, border: 0, display: 'block' }}
      />
    </Box>
  );
}

// A video explainer for the lesson. The link below the player is the fallback for videos whose owner blocks embedding.
export default function LessonVideo({ video }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: RADII_PX.card }}>
      <Eyebrow icon={PlayCircleRoundedIcon}>WATCH THE LESSON</Eyebrow>
      <VideoFrame video={video} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: FONT_SIZES.body }}>
        {video.title}.{' '}
        <Link href={watchUrl(video.id)} target="_blank" rel="noopener noreferrer">Watch on YouTube</Link>
      </Typography>
    </Paper>
  );
}
