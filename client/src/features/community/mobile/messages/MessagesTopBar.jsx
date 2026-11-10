import { IconButton, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import SearchField from '../SearchField';

// Back arrow, the search field and the "..." button at the top of the messages screen.
export default function MessagesTopBar({ onBack }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, pt: 'calc(8px + env(safe-area-inset-top))' }}>
      <IconButton aria-label="Back" onClick={onBack}><ArrowBackRoundedIcon /></IconButton>
      <SearchField placeholder="Search messages" label="Search messages" />
      <IconButton aria-label="More options"><MoreVertRoundedIcon /></IconButton>
    </Stack>
  );
}
