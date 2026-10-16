import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Divider, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import AddCommentRoundedIcon from '@mui/icons-material/AddCommentRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import Markdown, { MarkdownEditor } from './Markdown';
import {
  ActionButton,
  AuthorHeader,
  ComposerPrompt,
  ConfirmDialog,
  EmptyBlock,
  FeedSkeleton,
  ItemMenu,
  ReportDialog,
  SegmentedTabs,
  VoteBar,
  clamp,
} from './CommunityBits';
import CommentSection from './CommentSection';

const SORTS = [
  { value: 'active', label: 'Active', icon: <BoltRoundedIcon /> },
  { value: 'top', label: 'Most votes', icon: <TrendingUpRoundedIcon /> },
  { value: 'new', label: 'Newest', icon: <AccessTimeRoundedIcon /> },
];

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
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Title"
        fullWidth
        value={title}
        disabled={saving}
        onChange={(e) => setTitle(e.target.value.slice(0, 150))}
        placeholder="What do you want to discuss?"
        helperText={`${title.length}/150`}
      />
      <MarkdownEditor label="Details" value={body} onChange={setBody} minRows={7} disabled={saving} placeholder="Ask a question, share an approach, or describe where you're stuck…" />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" disableElevation endIcon={<SendRoundedIcon />} onClick={submit} disabled={saving || title.trim().length < 3 || !body.trim()} sx={{ height: 44, px: 2.5 }}>
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

function ThreadPost({ t, onOpen }) {
  return (
    <Box component="article" sx={{ py: 2 }}>
      <AuthorHeader author={t.author} createdAt={t.createdAt} editedAt={t.editedAt} isMine={t.isMine} />
      <Box
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => e.key === 'Enter' && onOpen()}
        sx={{ mt: 1.5, cursor: 'pointer', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', borderRadius: 2 } }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1.08rem', lineHeight: 1.35 }}>{t.title}</Typography>
        {t.excerpt && (
          <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.93rem', lineHeight: 1.55, ...clamp(3) }}>
            {t.excerpt}
          </Typography>
        )}
      </Box>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5 }}>
        <VoteBar targetType="thread" targetId={t._id} score={t.score} myVote={t.myVote} isMine={t.isMine} />
        <ActionButton icon={<ChatBubbleOutlineRoundedIcon />} count={t.commentCount} label="Open comments" onClick={onOpen} />
      </Stack>
    </Box>
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
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack} sx={{ mb: 1, ml: -1, height: 44, fontWeight: 700 }}>
        Discussion
      </Button>

      {loading && <FeedSkeleton count={1} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {thread && (
        <>
          <AuthorHeader
            author={thread.author}
            createdAt={thread.createdAt}
            editedAt={thread.editedAt}
            isMine={thread.isMine}
            right={
              <ItemMenu
                canEdit={thread.isMine}
                canDelete={thread.isMine || role === 'admin'}
                canReport={isAuthenticated && !thread.isMine}
                onEdit={() => setEditing(true)}
                onDelete={() => setConfirmDelete(true)}
                onReport={() => setReportOpen(true)}
              />
            }
          />

          {editing ? (
            <Box sx={{ mt: 2 }}>
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
            </Box>
          ) : (
            <>
              <Typography sx={{ mt: 2, fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.3 }}>{thread.title}</Typography>
              <Box sx={{ mt: 1.5 }}>
                <Markdown source={thread.body} />
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
                <VoteBar targetType="thread" targetId={thread._id} score={thread.score} myVote={thread.myVote} isMine={thread.isMine} />
                <ActionButton icon={<ChatBubbleOutlineRoundedIcon />} count={thread.commentCount} label="Comments" />
              </Stack>
            </>
          )}

          <Divider sx={{ my: 2.5 }} />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 22 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>Comments · {thread.commentCount}</Typography>
          </Stack>
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
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Debounce search so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 300);
    return () => clearTimeout(t);
  }, [qInput]);

  const fetchPage = useCallback(
    (page) => communityApi.listThreads(slug, { sort, page, limit: 10, ...(q ? { q } : {}) }).then(({ data }) => data.data),
    [slug, sort, q]
  );

  useEffect(() => {
    if (view.name !== 'list') return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPage(1)
      .then((d) => {
        if (cancelled) return;
        setItems(d.items);
        setPagination(d.pagination);
      })
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [fetchPage, view.name]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await fetchPage(pagination.page + 1);
      setItems((prev) => [...prev, ...d.items]);
      setPagination(d.pagination);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

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
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => setView({ name: 'list' })} sx={{ mb: 1, ml: -1, height: 44, fontWeight: 700 }}>
          Discussion
        </Button>
        <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', mb: 2.5 }}>New topic</Typography>
        <ThreadForm
          submitLabel="Post"
          onCancel={() => setView({ name: 'list' })}
          onSubmit={async (values) => {
            const { data } = await communityApi.createThread(slug, values);
            setView({ name: 'detail', id: data.data._id });
          }}
        />
      </Box>
    );
  }

  const hasMore = pagination && pagination.page < pagination.totalPages;

  return (
    <Box>
      <ComposerPrompt icon={<AddCommentRoundedIcon />} placeholder="Ask a question or start a topic…" onClick={startNew} />

      <Stack spacing={1.5} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Search topics"
          value={qInput}
          onChange={(e) => setQInput(e.target.value.slice(0, 60))}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999, height: 48 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
              endAdornment: qInput ? (
                <InputAdornment position="end">
                  <IconButton aria-label="Clear search" onClick={() => setQInput('')}>
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
        <SegmentedTabs value={sort} onChange={setSort} options={SORTS} />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 1 }}>
        {loading ? (
          <FeedSkeleton />
        ) : items.length === 0 ? (
          <EmptyBlock
            icon={<ForumOutlinedIcon />}
            title={q ? 'No topics match your search' : 'No discussions yet'}
            text={q ? 'Try different words.' : 'Be the first to ask a question about this problem.'}
          />
        ) : (
          <Stack divider={<Divider flexItem />}>
            {items.map((t) => (
              <ThreadPost key={t._id} t={t} onOpen={() => setView({ name: 'detail', id: t._id })} />
            ))}
          </Stack>
        )}
      </Box>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button variant="outlined" onClick={loadMore} disabled={loadingMore} sx={{ height: 44, px: 3 }}>
            {loadingMore ? 'Loading…' : 'Show more'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
