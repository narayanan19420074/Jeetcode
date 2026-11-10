import { useSelector } from 'react-redux';
import { Box, Dialog, Stack, Typography } from '@mui/material';
import { LibraryFont, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import ComposeTopBar from './ComposeTopBar';
import ComposeTextFields from './ComposeTextFields';
import ComposeBottomBar from './ComposeBottomBar';
import useCodeBlockInsert from '../common/useCodeBlockInsert';
import { POST_BODY_MAX } from '../common/communityCategories';
import { FONT_SIZES, SIZES } from '../../../app/design/designTokens';

const screenSx = { height: SIZES.viewportHeight, bgcolor: 'var(--lib-bg)', px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 'env(safe-area-inset-bottom)' };
const scrollAreaSx = { flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflowY: 'auto', pt: 2 };

// Tapping the empty area under the text puts the cursor in the post body. Taps on the title or the body themselves
// must keep their own focus, so only taps on the blank area count.
const focusBodyOnBlankTap = (bodyRef) => (event) => {
  if (event.target === event.currentTarget) bodyRef.current?.focus();
};

function ComposeScreenBody({ compose, onClose }) {
  const { draft, update, publish, saving, error, clearError } = compose;
  const user = useSelector((state) => state.auth.user);
  const { bodyRef, insertCodeBlock } = useCodeBlockInsert(draft.body, update('body'), POST_BODY_MAX);
  return (
    <Stack sx={screenSx}>
      <ComposeTopBar onClose={onClose} onPost={publish} saving={saving} />
      {error && <Typography role="alert" sx={{ pt: 1.5, fontSize: FONT_SIZES.bodyLg, color: 'error.main' }}>{error}</Typography>}
      <Box onClick={focusBodyOnBlankTap(bodyRef)} sx={scrollAreaSx}>
        <ComposeTextFields draft={draft} update={update} saving={saving} clearError={clearError} bodyRef={bodyRef} />
      </Box>
      <ComposeBottomBar draft={draft} update={update} user={user} saving={saving} onInsertCode={insertCodeBlock} />
    </Stack>
  );
}

// Phone compose page: a full-screen dialog in the Library look, sharing its state with the desktop dialog.
export default function ComposePostScreen({ open, onClose, compose }) {
  const palette = useLibraryPalette();
  return (
    <Dialog open={open} onClose={compose.saving ? undefined : onClose} fullScreen PaperProps={{ sx: { bgcolor: palette.bg, backgroundImage: 'none' } }}>
      <LibraryFont>
        <ComposeScreenBody compose={compose} onClose={onClose} />
      </LibraryFont>
    </Dialog>
  );
}
