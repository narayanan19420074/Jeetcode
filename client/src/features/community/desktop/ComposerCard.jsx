import { useSelector } from 'react-redux';
import { ButtonBase, Stack, Tooltip, Typography } from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { PostAvatar } from '../common/PostAuthor';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import RailCard from './RailCard';

const actionSx = { flex: 1, gap: 1, py: 1, borderRadius: RADII_PX.control, color: 'text.secondary', fontFamily: 'inherit', '&:hover': { bgcolor: 'action.hover' } };

function ComposerAction({ icon: Icon, label, onClick, disabledReason }) {
  const button = (
    <ButtonBase onClick={onClick} disabled={Boolean(disabledReason)} sx={actionSx}>
      <Icon />
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>
        {label}
      </Typography>
    </ButtonBase>
  );
  // A disabled button gets no hover events, so the tooltip sits on a wrapper.
  return disabledReason ? (
    <Tooltip title={disabledReason}>
      <Stack sx={{ flex: 1 }}>{button}</Stack>
    </Tooltip>
  ) : (
    button
  );
}

// "Start a post" box with Video, Photo and Write article underneath, like the LinkedIn feed. Photo and Write
// article open the compose dialog; video posts are not supported yet.
export default function ComposerCard({ onOpen }) {
  const user = useSelector((state) => state.auth.user);

  return (
    <RailCard sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <PostAvatar author={user} size={SIZES.avatar.post} />
        <ButtonBase
          onClick={onOpen}
          sx={{ flex: 1, justifyContent: 'flex-start', height: SIZES.menuRowHeight, px: 2, border: '1px solid', borderColor: 'divider', borderRadius: RADII_PX.pill, color: 'text.secondary', fontFamily: 'inherit', fontWeight: FONT_WEIGHTS.semibold, '&:hover': { bgcolor: 'action.hover' } }}
        >
          Start a post
        </ButtonBase>
      </Stack>
      <Stack direction="row" sx={{ mt: 1 }}>
        <ComposerAction icon={VideocamOutlinedIcon} label="Video" disabledReason="Video posts are coming soon" />
        <ComposerAction icon={ImageOutlinedIcon} label="Photo" onClick={onOpen} />
        <ComposerAction icon={ArticleOutlinedIcon} label="Write article" onClick={onOpen} />
      </Stack>
    </RailCard>
  );
}
