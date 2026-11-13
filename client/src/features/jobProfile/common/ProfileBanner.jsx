import { useRef } from 'react';
import { Box, CircularProgress, IconButton, Stack } from '@mui/material';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { SIZES } from '../../../app/design/designTokens';
import { BANNER_GRADIENT } from '../../dashboard/bannerGradients';
import { ACCEPTED_IMAGE_TYPES, communityImageUrl } from '../../community/common/imageUpload';
import useBannerUpload from './useBannerUpload';

const overlayButtonSx = { bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } };

// Camera and remove buttons in the corner of the banner. Only the owner of the profile sees them.
function BannerControls({ editor, hasImage }) {
  const fileInput = useRef(null);
  const banner = useBannerUpload(editor);
  const handleFile = (event) => {
    const [file] = event.target.files;
    event.target.value = '';
    if (file) banner.change(file);
  };
  return (
    <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 1, right: 1 }}>
      <input ref={fileInput} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} hidden onChange={handleFile} />
      <IconButton size="small" aria-label="Change banner image" disabled={banner.isBusy} onClick={() => fileInput.current.click()} sx={overlayButtonSx}>
        {banner.isBusy ? <CircularProgress size={SIZES.iconSize.small} /> : <CameraAltRoundedIcon fontSize="small" />}
      </IconButton>
      {hasImage && (
        <IconButton size="small" aria-label="Remove banner image" disabled={banner.isBusy} onClick={banner.remove} sx={overlayButtonSx}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );
}

// The picture across the top of a Job profile: the member's own banner image, or the default gradient until they add one.
export default function ProfileBanner({ editor }) {
  const imageId = editor.profile.bannerImage;
  const imageSx = { background: `url(${communityImageUrl(imageId)}) center / cover no-repeat` };
  return (
    <Box sx={{ position: 'relative', height: SIZES.profileBannerHeight, ...(imageId ? imageSx : { background: BANNER_GRADIENT.visualizer }) }}>
      {!editor.readOnly && <BannerControls editor={editor} hasImage={Boolean(imageId)} />}
    </Box>
  );
}
