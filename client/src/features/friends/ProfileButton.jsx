import { ButtonBase, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { jobProfilePathOf } from '../jobProfile/common/jobProfilePaths';

// Opens a member's Job profile. It is used on avatars that sit next to a "chat" action, so the click is stopped
// here: tapping the picture goes to the profile, tapping the rest of the row still opens the chat.
export default function ProfileButton({ person, children, sx }) {
  const navigate = useNavigate();
  const openProfile = (event) => {
    event.stopPropagation();
    navigate(jobProfilePathOf(person.userId));
  };
  return (
    <Tooltip title="View profile">
      <ButtonBase onClick={openProfile} aria-label={`View profile of ${person.name}`} sx={[{ borderRadius: '50%', flexShrink: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
        {children}
      </ButtonBase>
    </Tooltip>
  );
}
