import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { CodeBlock, MarkdownEditor } from './Markdown';
import { LANG_LABEL, timeAgo } from './CommunityBits';

// Share one of the user's Accepted submissions as a community solution.
// Code / language / runtime come from the submission on the server.
export default function ShareSolutionDialog({ open, onClose, slug, defaultSubmissionId, onShared }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [subs, setSubs] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [subId, setSubId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setSubs(null);
    setLoadError('');
    setError('');
    setTitle('');
    setContent('');
    communityApi
      .myAccepted(slug)
      .then(({ data }) => {
        if (cancelled) return;
        const list = data.data;
        setSubs(list);
        const pick = list.find((s) => s._id === defaultSubmissionId && !s.alreadyShared) || list.find((s) => !s.alreadyShared);
        setSubId(pick?._id || '');
      })
      .catch((err) => !cancelled && setLoadError(extractErrorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [open, slug, defaultSubmissionId]);

  const selected = subs?.find((s) => s._id === subId);
  const allShared = subs && subs.length > 0 && subs.every((s) => s.alreadyShared);

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await communityApi.createSolution(slug, { submissionId: subId, title: title.trim(), content });
      onShared?.(data.data);
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>Share your solution</DialogTitle>
      <DialogContent dividers>
        {loadError && <Alert severity="error">{loadError}</Alert>}
        {!subs && !loadError && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={26} />
          </Box>
        )}
        {subs && subs.length === 0 && <Alert severity="info">Get an Accepted submission on this problem first — then you can share it here.</Alert>}
        {allShared && <Alert severity="info">You have already shared all your Accepted submissions for this problem.</Alert>}

        {subs && subs.length > 0 && !allShared && (
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField select label="Accepted submission" value={subId} onChange={(e) => setSubId(e.target.value)} fullWidth size="small">
              {subs.map((s) => (
                <MenuItem key={s._id} value={s._id} disabled={s.alreadyShared}>
                  {LANG_LABEL[s.language] || s.language} · {s.runtimeMs != null ? `${s.runtimeMs} ms` : '—'} · {timeAgo(s.createdAt)}
                  {s.alreadyShared ? ' · shared' : ''}
                </MenuItem>
              ))}
            </TextField>
            {selected && <CodeBlock code={selected.code} language={LANG_LABEL[selected.language]} maxHeight={200} />}
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              size="small"
              fullWidth
              placeholder="e.g. Hash map, one pass — O(n)"
              helperText={`${title.length}/120`}
            />
            <MarkdownEditor label="Explain your approach (optional)" value={content} onChange={setContent} minRows={5} placeholder="Intuition, complexity, edge cases…" />
            <Typography variant="caption" color="text.secondary">
              Your code is copied from the submission above and shown publicly with your name.
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" disableElevation onClick={submit} disabled={saving || !subId || title.trim().length < 3}>
          {saving ? 'Sharing…' : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
