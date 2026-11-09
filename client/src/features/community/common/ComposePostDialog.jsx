import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, Switch, TextField, useMediaQuery, useTheme } from '@mui/material';
import { MarkdownEditor } from '../../workspace/community/Markdown';
import useComposePost from './useComposePost';
import ComposePostScreen from './ComposePostScreen';
import { POST_BODY_MAX, POST_CATEGORY_OPTIONS, POST_TITLE_MAX } from './communityCategories';

function ComposeFields({ draft, update, saving }) {
  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <TextField label="Title" value={draft.title} disabled={saving} onChange={(e) => update('title')(e.target.value.slice(0, POST_TITLE_MAX))} fullWidth />
      <TextField select label="Category" value={draft.category} disabled={saving} onChange={(e) => update('category')(e.target.value)} fullWidth>
        {POST_CATEGORY_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </TextField>
      <MarkdownEditor label="Post" value={draft.body} onChange={update('body')} maxLength={POST_BODY_MAX} disabled={saving} placeholder="Share your question, experience or advice…" />
      <FormControlLabel
        control={<Switch checked={draft.isAnonymous} disabled={saving} onChange={(e) => update('isAnonymous')(e.target.checked)} />}
        label="Post anonymously"
      />
    </Stack>
  );
}

// Phones get the full-screen compose page (ComposePostScreen); desktop keeps the regular dialog.
export default function ComposePostDialog({ open, onClose, onPublished }) {
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('md'));
  const compose = useComposePost((post) => {
    onPublished(post);
    onClose();
  });
  const { draft, update, publish, saving, error, clearError } = compose;

  if (fullScreen) return <ComposePostScreen open={open} onClose={onClose} compose={compose} />;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create post</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" onClose={clearError} sx={{ mb: 1 }}>{error}</Alert>}
        <ComposeFields draft={draft} update={update} saving={saving} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={publish} disabled={saving}>{saving ? 'Publishing…' : 'Publish'}</Button>
      </DialogActions>
    </Dialog>
  );
}
