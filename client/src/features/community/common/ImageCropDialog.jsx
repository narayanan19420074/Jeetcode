import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Stack, Typography, useMediaQuery } from '@mui/material';
import CropStage from './CropStage';
import useImageCrop from './useImageCrop';
import { MAX_ZOOM } from './imageCrop';
import { FONT_SIZES, FONT_WEIGHTS, MEDIA_QUERIES } from '../../../app/design/designTokens';

const ZOOM_STEP = 0.01;

// Shown before an image is attached. The bright frame is the part that appears in the feed; the dimmed part is only
// visible when the post is opened. "Use full image" skips cropping.
export default function ImageCropDialog({ uploads }) {
  const { pendingFile, pendingCount, uploading, uploadCropped, uploadOriginal, skipPending } = uploads;
  const crop = useImageCrop(pendingFile);
  const isPhone = useMediaQuery(MEDIA_QUERIES.belowMd);
  return (
    <Dialog open={Boolean(pendingFile)} onClose={uploading ? undefined : skipPending} fullScreen={isPhone} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: FONT_WEIGHTS.bold }}>Crop image{pendingCount > 1 ? ` (${pendingCount} left)` : ''}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: FONT_SIZES.body, color: 'text.secondary' }}>
            The bright area is what shows in the feed. Drag the image to move it and use the slider to zoom.
          </Typography>
          <CropStage crop={crop} />
          <Slider aria-label="Zoom" min={1} max={MAX_ZOOM} step={ZOOM_STEP} value={crop.zoom} onChange={(_, value) => crop.changeZoom(value)} disabled={!crop.layout} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={skipPending} disabled={uploading}>Cancel</Button>
        <Button onClick={uploadOriginal} disabled={uploading}>Use full image</Button>
        <Button variant="contained" disableElevation onClick={() => uploadCropped(crop.renderBlob)} disabled={uploading || !crop.layout}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
