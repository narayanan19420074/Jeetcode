import { Alert, Box, Button, Dialog, Divider, InputBase, Stack } from '@mui/material';
import ComposeImageStrip from '../common/ComposeImageStrip';
import useCodeBlockInsert from '../common/useCodeBlockInsert';
import { POST_BODY_MAX, POST_TITLE_MAX } from '../common/communityCategories';
import { validateDraft } from '../common/useComposePost';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import ComposeHeader from './ComposeHeader';
import ComposeToolbar from './ComposeToolbar';
import useBodyFormatting from './useBodyFormatting';

const fieldSx = { px: 3, fontSize: FONT_SIZES.heading, alignItems: 'flex-start' };
const paperSx = { width: SIZES.composeDialog.width, maxWidth: SIZES.fill, minHeight: SIZES.composeDialog.minHeight, borderRadius: RADII_PX.card, backgroundImage: 'none' };

// Desktop "Create post" dialog laid out like LinkedIn's: who is posting and where, the text, a formatting row and the
// Post button, which stays grey until the post can be sent. `compose` is the shared state from useComposePost.
export default function DesktopComposeDialog({ open, onClose, compose }) {
  const { draft, update, publish, saving, error, clearError, imageUploads } = compose;
  const { bodyRef, insertCodeBlock } = useCodeBlockInsert(draft.body, update('body'), POST_BODY_MAX);
  const formatting = useBodyFormatting({ bodyRef, body: draft.body, setBody: update('body'), maxLength: POST_BODY_MAX });
  const canPost = !validateDraft(draft) && !imageUploads.uploading && !saving;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth={false} slotProps={{ paper: { sx: paperSx } }}>
      <ComposeHeader draft={draft} update={update} saving={saving} onClose={onClose} />
      <Stack sx={{ flex: 1 }}>
        <InputBase autoFocus placeholder="Title" value={draft.title} disabled={saving} onChange={(e) => update('title')(e.target.value.slice(0, POST_TITLE_MAX))} inputProps={{ 'aria-label': 'Post title' }} sx={{ ...fieldSx, fontWeight: FONT_WEIGHTS.semibold }} />
        <InputBase multiline minRows={8} placeholder="Share your thoughts …" value={draft.body} disabled={saving} onChange={(e) => update('body')(e.target.value)} inputRef={bodyRef} inputProps={{ 'aria-label': 'Post text', maxLength: POST_BODY_MAX }} sx={{ ...fieldSx, mt: 1 }} />
        <Box sx={{ px: 3 }}><ComposeImageStrip uploads={imageUploads} /></Box>
      </Stack>
      {error && <Alert severity="error" onClose={clearError} sx={{ mx: 3, mb: 1 }}>{error}</Alert>}
      <Box sx={{ px: 2, pb: 1 }}><ComposeToolbar formatting={formatting} uploads={imageUploads} onInsertCode={insertCodeBlock} disabled={saving} /></Box>
      <Divider />
      <Stack direction="row" sx={{ justifyContent: 'flex-end', p: 2 }}>
        <Button variant="contained" disableElevation disabled={!canPost} onClick={publish} sx={{ borderRadius: RADII_PX.pill, px: 3 }}>
          {saving ? 'Posting…' : 'Post'}
        </Button>
      </Stack>
    </Dialog>
  );
}
