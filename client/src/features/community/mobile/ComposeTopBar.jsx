import { ButtonBase, IconButton, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { libBackBtnSx, LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const postButtonSx = (theme) => ({
  height: SIZES.controlHeight.mobile,
  px: 3.5,
  borderRadius: RADII_PX.pill,
  fontFamily: 'inherit',
  fontSize: FONT_SIZES.subheading,
  fontWeight: FONT_WEIGHTS.medium,
  letterSpacing: LIB_TRACKING,
  bgcolor: theme.palette.success.main,
  color: theme.palette.common.white,
  '&.Mui-disabled': { opacity: 0.35, color: theme.palette.common.white },
});

// Back arrow on the left, the Post button on the right. Post stays disabled until the draft passes validation.
export default function ComposeTopBar({ onClose, onPost, canPost, saving }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <IconButton aria-label="Close" onClick={onClose} disabled={saving} sx={libBackBtnSx}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <ButtonBase onClick={onPost} disabled={!canPost} sx={postButtonSx}>
        {saving ? 'Posting…' : 'Post'}
      </ButtonBase>
    </Stack>
  );
}
