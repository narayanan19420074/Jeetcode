import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Pagination,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import Markdown, { MarkdownEditor } from './Markdown';
import { AuthorLine, VoteBar, ItemMenu, ConfirmDialog, ReportDialog } from './CommunityBits';
import CommentSection from './CommentSection';

function ThreadForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [body, setBody] = useState(initial?.body || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await onSubmit({ title: title.trim(), body: body.trim() });
    } catch (err) {
      setError(extractErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="Title" size="small" fullWidth value={title} disabled={saving} onChange={(e) => setTitle(e.target.value.slice(0, 150))} helperText={`${title.length}/150`} />
      <MarkdownEditor label="Details" value={body} onChange={setBody} minRows={6} disabled={saving} placeholder="Ask a question, share an approach, or describe where you're stuck…" />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button size="small" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button size="small" variant="contained" disableElevation onClick={submit} disabled={saving || title.trim().length < 3 || !body.trim()}>
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

function ThreadDetail({ id, onBack }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    communityApi
      .getThread(id)
      .then(({ data }) => !cancelled && setThread(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const remove = async () => {
    setDeleting(true);
    try {
      await communityApi.deleteThread(id);
      onBack();
    } catch (err) {
      setError(extractErrorMessage(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Box>
      <Button size="small" startIcon={<ArrowBackRoundedIcon />} onClick={onBack} sx={{ mb: 1.5 }}>
        All topics
      </Button>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={26} />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {thread && (
        <>
          {editing ? (
            <ThreadForm
              initial={thread}
              submitLabel="Save"
              onCancel={() => setEditing(false)}
              onSubmit={async (values) => {
                const { data } = await communityApi.updateThread(id, values);
                setThread((t) => ({ ...t, ...data.data }));
                setEditing(false);
              }}
            />
          ) : (
            <>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {thread.title}
                </Typography>
                <ItemMenu
                  canEdit={thread.isMine}
                  canDelete={thread.isMine || role === 'admin'}
                  canReport={isAuthenticated && !thread.isMine}
                  onEdit={() => setEditing(true)}
                  onDelete={() => setConfirmDelete(true)}
                  onReport={() => setReportOpen(true)}
                />
              </Stack>
              <Box sx={{ mt: 0.75 }}>
                <AuthorLine author={thread.author} createdAt={thread.createdAt} editedAt={thread.editedAt} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Markdown source={thread.body} />
              </Box>
              <Box sx={{ mt: 1 }}>
                <VoteBar targetType="thread" targetId={thread._id} score={thread.score} myVote={thread.myVote} isMine={thread.isMine} />
              </Box>
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Comments ({thread.commentCount})
          </Typography>
          <CommentSection kind="threads" targetId={thread._id} onCountChange={(d) => setThread((t) => ({ ...t, commentCount: Math.max(0, t.commentCount + d) }))} />

          <ConfirmDialog open={confirmDelete} title="Delete topic?" text="The topic and all its comments will be removed permanently." loading={deleting} onConfirm={remove} onClose={() => setConfirmDelete(false)} />
          <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="thread" targetId={thread._id} />
        </>
      )}
    </Box>
  );
}

export default function DiscussionPanel({ slug }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [view, setView] = useState({ name: 'list' }); // list | new | detail
  const [sort, setSort] = useState('active');
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce search so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(qInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    if (view.name !== 'list') return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    communityApi
      .listThreads(slug, { sort, page, limit: 10, ...(q ? { q } : {}) })
      .then(({ data: res }) => !cancelled && setData(res.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, sort, q, page, view.name]);

  const startNew = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
    setView({ name: 'new' });
  };

  if (view.name === 'detail') {
    return <ThreadDetail id={view.id} onBack={() => setView({ name: 'list' })} />;
  }

  if (view.name === 'new') {
    return (
      <Box>
        <Button size="small" startIcon={<ArrowBackRoundedIcon />} onClick={() => setView({ name: 'list' })} sx={{ mb: 1.5 }}>
          All topics
        </Button>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          New topic
        </Typography>
        <ThreadForm
          submitLabel="Post"
          onCancel={() => setView({ name: 'list' })}
          onSubmit={async (values) => {
            const { data: res } = await communityApi.createThread(slug, values);
            setView({ name: 'detail', id: res.data._id });
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search topics"
          value={qInput}
          onChange={(e) => setQInput(e.target.value.slice(0, 60))}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button size="small" variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={startNew} sx={{ flexShrink: 0 }}>
          New
        </Button>
      </Stack>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={sort}
        onChange={(e, v) => {
          if (v) {
            setSort(v);
            setPage(1);
          }
        }}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="active">Active</ToggleButton>
        <ToggleButton value="top">Most votes</ToggleButton>
        <ToggleButton value="new">Newest</ToggleButton>
      </ToggleButtonGroup>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={26} />
        </Box>
      ) : data.items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {q ? 'No topics match your search' : 'No topics yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {q ? 'Try different words.' : 'Be the first to ask a question about this problem.'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {data.items.map((t) => (
            <Paper key={t._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Box onClick={() => setView({ name: 'detail', id: t._id })} sx={{ cursor: 'pointer' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                  {t.title}
                </Typography>
                {t.excerpt && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.excerpt}
                  </Typography>
                )}
                <Box sx={{ mt: 0.75 }}>
                  <AuthorLine author={t.author} createdAt={t.createdAt} editedAt={t.editedAt} size={18} />
                </Box>
              </Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                <VoteBar targetType="thread" targetId={t._id} score={t.score} myVote={t.myVote} isMine={t.isMine} />
                <Button size="small" color="inherit" startIcon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: '16px !important' }} />} onClick={() => setView({ name: 'detail', id: t._id })} sx={{ color: 'text.secondary' }}>
                  {t.commentCount}
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {data.pagination?.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination size="small" count={data.pagination.totalPages} page={page} onChange={(e, p) => setPage(p)} />
        </Box>
      )}
    </Box>
  );
}
