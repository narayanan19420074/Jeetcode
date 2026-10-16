import { useEffect, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { CodeBlock, MarkdownEditor } from './Markdown';
import { FeedSkeleton, LANG_LABEL, LangChip, MetricChip, timeAgo } from './CommunityBits';

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
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontWeight: 800 }}>
        <IosShareRoundedIcon color="primary" />
        <Box component="span" sx={{ flex: 1 }}>
          Share your solution
        </Box>
        <IconButton aria-label="Close" onClick={onClose} disabled={saving}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loadError && <Alert severity="error">{loadError}</Alert>}
        {!subs && !loadError && <FeedSkeleton count={1} withCode />}
        {subs && subs.length === 0 && <Alert severity="info">Get an Accepted submission on this problem first — then you can share it here.</Alert>}
        {allShared && <Alert severity="info">You have already shared all your Accepted submissions for this problem.</Alert>}

        {subs && subs.length > 0 && !allShared && (
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField select label="Accepted submission" value={subId} onChange={(e) => setSubId(e.target.value)} fullWidth>
              {subs.map((s) => (
                <MenuItem key={s._id} value={s._id} disabled={s.alreadyShared} sx={{ minHeight: 48 }}>
                  {LANG_LABEL[s.language] || s.language} · {s.runtimeMs != null ? `${s.runtimeMs} ms` : '—'} · {timeAgo(s.createdAt)}
                  {s.alreadyShared ? ' · shared' : ''}
                </MenuItem>
              ))}
            </TextField>
            {selected && (
              <Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <LangChip language={selected.language} />
                  {selected.runtimeMs != null && <MetricChip icon={<SpeedRoundedIcon />} label={`${selected.runtimeMs} ms`} />}
                  {selected.memoryKb != null && <MetricChip icon={<MemoryRoundedIcon />} label={`${(selected.memoryKb / 1024).toFixed(1)} MB`} />}
                </Stack>
                <CodeBlock code={selected.code} language={selected.language} maxHeight={200} />
              </Box>
            )}
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
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
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" disableElevation size="large" startIcon={<IosShareRoundedIcon />} onClick={submit} disabled={saving || !subId || title.trim().length < 3} sx={{ height: 46, px: 3 }}>
          {saving ? 'Sharing…' : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
