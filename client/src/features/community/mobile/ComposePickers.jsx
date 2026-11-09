import { useState } from 'react';
import { ButtonBase, Menu, MenuItem } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { LibraryFont, LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { UserAvatar } from '../../workspace/community/CommunityBits';
import { PostAvatar } from '../common/PostAuthor';
import { POST_CATEGORY_OPTIONS } from '../common/communityCategories';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

const avatarButtonSx = { width: SIZES.touchTarget, height: SIZES.touchTarget, borderRadius: RADII_PX.circle, bgcolor: 'var(--lib-player)', flexShrink: 0 };
const categoryButtonSx = { height: SIZES.filterPillHeight, pl: 2, pr: 1.25, gap: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-player)', fontFamily: 'inherit', fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, color: 'var(--lib-text)' };

// Menus render in a portal, so they need the library font and variables again.
function useAnchoredMenu() {
  const [anchor, setAnchor] = useState(null);
  return { anchor, open: (event) => setAnchor(event.currentTarget), close: () => setAnchor(null) };
}

// The avatar shows who the post will be published as; tapping it switches between the account and anonymous.
export function IdentityPicker({ user, isAnonymous, onChange }) {
  const menu = useAnchoredMenu();
  const choose = (value) => {
    onChange(value);
    menu.close();
  };
  return (
    <>
      <ButtonBase aria-label={isAnonymous ? 'Posting anonymously' : 'Posting as you'} onClick={menu.open} sx={avatarButtonSx}>
        {isAnonymous ? <PostAvatar author={null} size={SIZES.avatar.md} /> : <UserAvatar user={user} size={SIZES.avatar.md} />}
      </ButtonBase>
      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={menu.close}>
        <LibraryFont>
          <MenuItem selected={!isAnonymous} onClick={() => choose(false)}>Post as {user?.name || 'you'}</MenuItem>
          <MenuItem selected={isAnonymous} onClick={() => choose(true)}>Post anonymously</MenuItem>
        </LibraryFont>
      </Menu>
    </>
  );
}

// Category chip; every post is filed under exactly one category.
export function CategoryPicker({ category, onChange }) {
  const menu = useAnchoredMenu();
  const choose = (value) => {
    onChange(value);
    menu.close();
  };
  return (
    <>
      <ButtonBase aria-label="Post category" onClick={menu.open} sx={categoryButtonSx}>
        {POST_CATEGORY_OPTIONS.find((option) => option.value === category)?.label}
        <ExpandMoreRoundedIcon sx={{ fontSize: FONT_SIZES.display }} />
      </ButtonBase>
      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={menu.close}>
        <LibraryFont>
          {POST_CATEGORY_OPTIONS.map((option) => (
            <MenuItem key={option.value} selected={option.value === category} onClick={() => choose(option.value)}>{option.label}</MenuItem>
          ))}
        </LibraryFont>
      </Menu>
    </>
  );
}
