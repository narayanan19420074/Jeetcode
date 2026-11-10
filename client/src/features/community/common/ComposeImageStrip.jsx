import { Box, CircularProgress, IconButton, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { communityImageUrl } from './imageUpload';
import { RADII_PX, SIZES } from '../../../app/design/designTokens';

const tileSx = { position: 'relative', flexShrink: 0, width: SIZES.composeThumbnail, height: SIZES.composeThumbnail, borderRadius: RADII_PX.card, overflow: 'hidden', bgcolor: 'action.hover', display: 'grid', placeItems: 'center' };
const pictureSx = { display: 'block', width: SIZES.fill, height: SIZES.fill, objectFit: 'cover' };
const removeSx = (theme) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  width: SIZES.iconButton.desktop,
  height: SIZES.iconButton.desktop,
  color: theme.palette.common.white,
  bgcolor: alpha(theme.palette.common.black, 0.55),
  '&:hover': { bgcolor: alpha(theme.palette.common.black, 0.7) },
});

function ImageTile({ image, onRemove }) {
  return (
    <Box sx={tileSx}>
      <Box component="img" src={communityImageUrl(image.id)} alt="Attached to your post" sx={pictureSx} />
      <IconButton aria-label="Remove image" onClick={() => onRemove(image.id)} sx={removeSx}>
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

// Previews of the images attached to the post being written, with a remove button on each.
export default function ComposeImageStrip({ uploads }) {
  const { images, uploading, remove } = uploads;
  if (images.length === 0 && !uploading) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ py: 1, overflowX: 'auto' }}>
      {images.map((image) => (
        <ImageTile key={image.id} image={image} onRemove={remove} />
      ))}
      {uploading && (
        <Box sx={tileSx} role="status" aria-label="Uploading image">
          <CircularProgress size={SIZES.iconSize.medium} />
        </Box>
      )}
    </Stack>
  );
}
