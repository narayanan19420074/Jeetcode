import { useMediaQuery, useTheme } from '@mui/material';
import useComposePost from './useComposePost';
import ComposePostScreen from '../mobile/ComposePostScreen';
import DesktopComposeDialog from '../desktop/DesktopComposeDialog';

// Phones get the full-screen compose page; desktop gets the LinkedIn-style dialog.
export default function ComposePostDialog({ open, onClose, onPublished }) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('md'));
  const compose = useComposePost((post) => {
    onPublished(post);
    onClose();
  });

  if (fullScreen) return <ComposePostScreen open={open} onClose={onClose} compose={compose} />;
  return <DesktopComposeDialog open={open} onClose={onClose} compose={compose} />;
}
