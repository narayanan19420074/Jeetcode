import { Box, Stack } from '@mui/material';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { COLOR_PALETTE, FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

const REACTIONS = [
  { key: 'like', icon: ThumbUpRoundedIcon, background: COLOR_PALETTE.blue[600] },
  { key: 'love', icon: FavoriteRoundedIcon, background: COLOR_PALETTE.red[500] },
];

const badgeSx = (background, index) => ({
  display: 'grid',
  placeItems: 'center',
  width: SIZES.reactionBadge,
  height: SIZES.reactionBadge,
  ml: index === 0 ? 0 : -0.25,
  borderRadius: RADII_PX.circle,
  bgcolor: background,
  color: 'common.white',
  border: '2px solid',
  borderColor: 'background.paper',
});

// Two overlapping round reaction icons (like and love, as on LinkedIn) at the end of the row under a phone feed post. Display only for now.
export default function ReactionStack() {
  return (
    <Stack direction="row" role="img" aria-label="Reactions" sx={{ pr: 0.5 }}>
      {REACTIONS.map(({ key, icon: Icon, background }, index) => (
        <Box key={key} sx={badgeSx(background, index)}>
          <Icon sx={{ fontSize: FONT_SIZES.nano }} />
        </Box>
      ))}
    </Stack>
  );
}
