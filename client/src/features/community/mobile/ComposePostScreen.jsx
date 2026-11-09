import { useSelector } from 'react-redux';
import { Box, Dialog, Stack } from '@mui/material';
import { LibraryFont, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import ComposeTopBar from './ComposeTopBar';
import ComposeTextFields from './ComposeTextFields';
import ComposeBottomBar from './ComposeBottomBar';
import useCodeBlockInsert from '../common/useCodeBlockInsert';
import { validateDraft } from '../common/useComposePost';
import { POST_BODY_MAX } from '../common/communityCategories';
import { SIZES } from '../../../app/design/designTokens';

const screenSx = { height: SIZES.viewportHeight, bgcolor: 'var(--lib-bg)', px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 'env(safe-area-inset-bottom)' };
const scrollAreaSx = { flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflowY: 'auto', pt: 2 };

function ComposeScreenBody({ compose, onClose }) {
  const { draft, update, publish, saving, error, clearError } = compose;
  const user = useSelector((state) => state.auth.user);
  const { bodyRef, insertCodeBlock } = useCodeBlockInsert(draft.body, update('body'), POST_BODY_MAX);
  return (
    <Stack sx={screenSx}>
      <ComposeTopBar onClose={onClose} onPost={publish} canPost={!saving && !validateDraft(draft)} saving={saving} />
      {/* Tapping the empty area under the text still puts the cursor in the post body. */}
      <Box onClick={() => bodyRef.current?.focus()} sx={scrollAreaSx}>
        <ComposeTextFields draft={draft} update={update} saving={saving} error={error} clearError={clearError} bodyRef={bodyRef} />
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
