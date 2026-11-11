import { useSelector } from 'react-redux';
import { ButtonBase, Stack } from '@mui/material';
import { PostAvatar } from '../common/PostAuthor';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import RailCard from './RailCard';

// "Start a post" box at the top of the feed. It opens the same compose dialog as the phone's floating button.
export default function ComposerCard({ onOpen }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <RailCard sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <PostAvatar author={user} size={SIZES.avatar.md} />
        <ButtonBase
          onClick={onOpen}
          sx={{ flex: 1, justifyContent: 'flex-start', height: SIZES.menuRowHeight, px: 2, border: '1px solid', borderColor: 'divider', borderRadius: RADII_PX.pill, color: 'text.secondary', fontFamily: 'inherit', fontWeight: FONT_WEIGHTS.semibold, '&:hover': { bgcolor: 'action.hover' } }}
        >
          Start a post
        </ButtonBase>
      </Stack>
    </RailCard>
  );
}
