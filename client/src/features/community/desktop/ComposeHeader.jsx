import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Chip, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { PostAvatar } from '../common/PostAuthor';
import { POST_CATEGORY_OPTIONS, categoryLabel } from '../common/communityCategories';
import { FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

function CategoryChip({ category, onChange, disabled }) {
  const [anchorEl, setAnchorEl] = useState(null);
  return (
    <>
      <Chip label={`Category: ${categoryLabel(category)}`} onClick={(event) => setAnchorEl(event.currentTarget)} onDelete={(event) => setAnchorEl(event.currentTarget)} deleteIcon={<ExpandMoreRoundedIcon />} disabled={disabled} />
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {POST_CATEGORY_OPTIONS.map((option) => (
          <MenuItem key={option.value} selected={option.value === category} onClick={() => { onChange(option.value); setAnchorEl(null); }}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

// Top of the compose dialog like LinkedIn's: your photo and name, then the post settings as chips. "Post to Anyone"
// becomes the category, and anonymous posting is the visibility switch.
export default function ComposeHeader({ draft, update, saving, onClose }) {
  const user = useSelector((state) => state.auth.user);
  const anonymous = draft.isAnonymous;
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', p: 3, pb: 1 }}>
      <PostAvatar author={anonymous ? null : user} size={SIZES.avatar.lg} />
      <Stack spacing={1} sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: FONT_WEIGHTS.semibold }}>{anonymous ? 'Anonymous User' : user?.name}</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <CategoryChip category={draft.category} onChange={update('category')} disabled={saving} />
          <Chip
            icon={anonymous ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
            label={anonymous ? 'Posting anonymously' : 'Posting as you'}
            color={anonymous ? 'primary' : 'default'}
            onClick={() => update('isAnonymous')(!anonymous)}
            disabled={saving}
          />
        </Stack>
      </Stack>
      <IconButton aria-label="Close" onClick={onClose} disabled={saving}>
        <CloseRoundedIcon />
      </IconButton>
    </Stack>
  );
}
