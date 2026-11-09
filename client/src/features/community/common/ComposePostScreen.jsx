import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, ButtonBase, Dialog, IconButton, InputBase, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { LibraryFont, libBackBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { UserAvatar } from '../../workspace/community/CommunityBits';
import { PostAvatar } from './PostAuthor';
import { validateDraft } from './useComposePost';
import { POST_BODY_MAX, POST_CATEGORY_OPTIONS, POST_TITLE_MAX } from './communityCategories';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';

const CODE_FENCE = '```\n\n```\n';

// Phone compose screen: back arrow and Post pill on top, a big title line, a free body, and a bottom bar with
// who is posting (tap to go anonymous), the category and a code-block button. Same fields as the desktop dialog.
function ComposeBody({ draft, update, publish, saving, error, clearError, onClose }) {
  const pal = useLibraryPalette();
  const user = useSelector((state) => state.auth.user);
  const bodyRef = useRef(null);
  const [identityAnchor, setIdentityAnchor] = useState(null);
  const [categoryAnchor, setCategoryAnchor] = useState(null);
  const canPost = !saving && !validateDraft(draft);
  const category = POST_CATEGORY_OPTIONS.find((option) => option.value === draft.category);

  // Insert an empty fenced block where the cursor is, with the cursor placed inside it.
  const insertCode = () => {
    const el = bodyRef.current;
    const at = el ? el.selectionStart : draft.body.length;
    const before = draft.body.slice(0, at);
    const lead = before && !before.endsWith('\n') ? '\n' : '';
    const next = `${before}${lead}${CODE_FENCE}${draft.body.slice(at)}`.slice(0, POST_BODY_MAX);
    update('body')(next);
    const cursor = before.length + lead.length + 4;
    requestAnimationFrame(() => {
      if (!bodyRef.current) return;
      bodyRef.current.focus();
      bodyRef.current.setSelectionRange(cursor, cursor);
    });
  };

  const pickAnonymous = (value) => {
    update('isAnonymous')(value);
    setIdentityAnchor(null);
  };

  return (
    <Stack sx={{ height: SIZES.viewportHeight, bgcolor: 'var(--lib-bg)', px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 'env(safe-area-inset-bottom)' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <IconButton aria-label="Close" onClick={onClose} disabled={saving} sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <ButtonBase
          onClick={publish}
          disabled={!canPost}
          sx={(t) => ({
            height: SIZES.controlHeight.mobile,
            px: 3.5,
            borderRadius: RADII_PX.pill,
            fontFamily: 'inherit',
            fontSize: FONT_SIZES.subheading,
            fontWeight: FONT_WEIGHTS.medium,
            bgcolor: t.palette.success.main,
            color: t.palette.common.white,
            '&.Mui-disabled': { opacity: 0.35, color: t.palette.common.white },
          })}
        >
          {saving ? 'Posting…' : 'Post'}
        </ButtonBase>
      </Stack>

      <Box onClick={() => bodyRef.current?.focus()} sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflowY: 'auto', pt: 2 }}>
        <InputBase
          multiline
          fullWidth
          value={draft.title}
          disabled={saving}
          placeholder="What's on your mind?"
          onChange={(e) => {
            clearError();
            update('title')(e.target.value.replace(/\n/g, ' ').slice(0, POST_TITLE_MAX));
          }}
          inputProps={{ 'aria-label': 'Title' }}
          sx={{ fontSize: FONT_SIZES.displayLg, lineHeight: '36px', fontWeight: FONT_WEIGHTS.bold, '& textarea::placeholder': { color: pal.muted, opacity: 0.55 } }}
        />
        <InputBase
          multiline
          fullWidth
          value={draft.body}
          disabled={saving}
          placeholder="Share your solution, insights, questions, or interview experience…"
          onChange={(e) => {
            clearError();
            update('body')(e.target.value.slice(0, POST_BODY_MAX));
          }}
          inputRef={bodyRef}
          inputProps={{ 'aria-label': 'Post' }}
          sx={{ mt: 1.5, alignItems: 'flex-start', fontSize: FONT_SIZES.subheading, lineHeight: '28px', letterSpacing: '0.03em', '& textarea::placeholder': { color: pal.muted, opacity: 0.55 } }}
        />
        {error && (
          <Typography role="alert" sx={{ mt: 1, fontSize: FONT_SIZES.bodyLg, color: 'error.main' }}>
            {error}
          </Typography>
        )}
      </Box>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.5 }}>
        <ButtonBase
          aria-label={draft.isAnonymous ? 'Posting anonymously' : 'Posting as you'}
          onClick={(e) => setIdentityAnchor(e.currentTarget)}
          sx={{ width: SIZES.touchTarget, height: SIZES.touchTarget, borderRadius: RADII_PX.circle, bgcolor: 'var(--lib-player)', flexShrink: 0 }}
        >
          {draft.isAnonymous ? <PostAvatar author={null} size={SIZES.avatar.md} /> : <UserAvatar user={user} size={SIZES.avatar.md} />}
        </ButtonBase>
        <ButtonBase
          onClick={(e) => setCategoryAnchor(e.currentTarget)}
          sx={{ height: SIZES.filterPillHeight, pl: 2, pr: 1.25, gap: 0.5, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-player)', fontFamily: 'inherit', fontSize: FONT_SIZES.bodyLg, letterSpacing: '0.03em', color: 'var(--lib-text)' }}
        >
          {category?.label}
          <ExpandMoreRoundedIcon sx={{ fontSize: FONT_SIZES.display }} />
        </ButtonBase>
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" sx={{ height: SIZES.controlHeight.mobile, px: 1.5, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-player)', alignItems: 'center' }}>
          <IconButton aria-label="Insert code block" onClick={insertCode} disabled={saving} sx={{ color: 'var(--lib-text)' }}>
            <CodeRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Menu anchorEl={identityAnchor} open={Boolean(identityAnchor)} onClose={() => setIdentityAnchor(null)}>
        <LibraryFont>
          <MenuItem selected={!draft.isAnonymous} onClick={() => pickAnonymous(false)}>Post as {user?.name || 'you'}</MenuItem>
          <MenuItem selected={draft.isAnonymous} onClick={() => pickAnonymous(true)}>Post anonymously</MenuItem>
        </LibraryFont>
      </Menu>
      <Menu anchorEl={categoryAnchor} open={Boolean(categoryAnchor)} onClose={() => setCategoryAnchor(null)}>
        <LibraryFont>
          {POST_CATEGORY_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              selected={option.value === draft.category}
              onClick={() => {
                update('category')(option.value);
                setCategoryAnchor(null);
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </LibraryFont>
      </Menu>
    </Stack>
  );
}

export default function ComposePostScreen({ open, onClose, compose }) {
  const pal = useLibraryPalette();
  return (
    <Dialog open={open} onClose={compose.saving ? undefined : onClose} fullScreen PaperProps={{ sx: { bgcolor: pal.bg, backgroundImage: 'none' } }}>
      <LibraryFont>
        <ComposeBody {...compose} onClose={onClose} />
      </LibraryFont>
    </Dialog>
  );
}
