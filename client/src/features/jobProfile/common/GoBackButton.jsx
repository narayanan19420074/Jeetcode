import { IconButton } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import useGoBack from './useGoBack';

const COMMUNITY_PATH = '/community';

// Back arrow of another member's profile, which is reached from the Community feed.
export default function GoBackButton({ sx }) {
  const goBack = useGoBack(COMMUNITY_PATH);
  return (
    <IconButton onClick={goBack} aria-label="Back" sx={sx}>
      <ArrowBackRoundedIcon />
    </IconButton>
  );
}
