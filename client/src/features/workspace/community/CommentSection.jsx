import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import Markdown from './Markdown';
import { AuthorLine, VoteBar, ItemMenu, ConfirmDialog, ReportDialog } from './CommunityBits';

const MAX_DEPTH = 3; // keep in sync with MAX_COMMENT_DEPTH on the server

function Composer({ initial = '', placeholder, submitLabel, onSubmit, onCancel, autoFocus }) {
  const [body, setBody] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await onSubmit(body.trim());
      setBody('');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={1}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={10}
        size="small"
        autoFocus={autoFocus}
        value={body}
        disabled={saving}
        placeholder={placeholder}
        onChange={(e) => setBody(e.target.value.slice(0, 3000))}
        helperText={`${body.length}/3000 · markdown supported`}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {onCancel && (
          <Button size="small" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button size="small" variant="contained" disableElevation onClick={submit} disabled={saving || !body.trim()}>
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

function CommentNode({ c, byParent, ctx }) {
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const children = byParent.get(c._id) || [];
  const canReply = ctx.isAuthenticated && !c.isDeleted && c.depth < MAX_DEPTH;

  const doDelete = async () => {
    setDeleting(true);
    try {
      const { data } = await communityApi.deleteComment(c._id);
      ctx.remove(c._id, data.data.soft);
    } catch (err) {
      ctx.setError(extractErrorMessage(err));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Box sx={{ mt: 1.5, ...(c.depth > 0 && { pl: 1.5, borderLeft: '2px solid', borderColor: 'divider' }) }}>
      {c.isDeleted ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          [deleted]
        </Typography>
      ) : (
        <>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <AuthorLine author={c.author} createdAt={c.createdAt} editedAt={c.editedAt} size={20} />
            <ItemMenu
              canEdit={c.isMine}
              canDelete={c.isMine || ctx.role === 'admin'}
              canReport={ctx.isAuthenticated && !c.isMine}
              onEdit={() => setEditing(true)}
              onDelete={() => setConfirmDelete(true)}
              onReport={() => setReportOpen(true)}
            />
          </Stack>

          {editing ? (
            <Box sx={{ mt: 0.5 }}>
              <Composer
                initial={c.body}
                submitLabel="Save"
                autoFocus
                onCancel={() => setEditing(false)}
                onSubmit={async (body) => {
                  const { data } = await communityApi.updateComment(c._id, { body });
                  ctx.patch(c._id, { body: data.data.body, editedAt: data.data.editedAt });
                  setEditing(false);
                }}
              />
            </Box>
          ) : (
            <Box sx={{ mt: 0.5 }}>
              <Markdown source={c.body} />
            </Box>
          )}

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
            <VoteBar targetType="comment" targetId={c._id} score={c.score} myVote={c.myVote} isMine={c.isMine} />
            {canReply && (
              <Button size="small" onClick={() => setReplying((v) => !v)} sx={{ minWidth: 0 }}>
                Reply
              </Button>
            )}
          </Stack>

          {replying && (
            <Box sx={{ mt: 1 }}>
              <Composer
                placeholder="Write a reply…"
                submitLabel="Reply"
                autoFocus
                onCancel={() => setReplying(false)}
                onSubmit={async (body) => {
                  const { data } = await communityApi.createComment(ctx.kind, ctx.targetId, { body, parentId: c._id });
                  ctx.add(data.data);
                  setReplying(false);
                }}
              />
            </Box>
          )}
        </>
      )}

      {children.map((child) => (
        <CommentNode key={child._id} c={child} byParent={byParent} ctx={ctx} />
      ))}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete comment?"
        text={children.length ? 'Replies will stay, but this comment will show as deleted.' : 'This cannot be undone.'}
        loading={deleting}
        onConfirm={doDelete}
        onClose={() => setConfirmDelete(false)}
      />
      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="comment" targetId={c._id} />
    </Box>
  );
}

// kind: 'solutions' | 'threads'. onCountChange(delta) lets the parent keep
// its "N comments" label in sync without refetching.
export default function CommentSection({ kind, targetId, onCountChange }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    communityApi
      .listComments(kind, targetId)
      .then(({ data }) => !cancelled && setComments(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [kind, targetId]);

  const byParent = useMemo(() => {
    const map = new Map();
    for (const c of comments) {
      const key = c.parent || 'root';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    }
    return map;
  }, [comments]);

  const ctx = {
    kind,
    targetId,
    role,
    isAuthenticated,
    setError,
    add: (c) => {
      setComments((prev) => [...prev, c]);
      onCountChange?.(1);
    },
    patch: (id, patch) => setComments((prev) => prev.map((c) => (c._id === id ? { ...c, ...patch } : c))),
    remove: (id, soft) => {
      setComments((prev) => (soft ? prev.map((c) => (c._id === id ? { ...c, isDeleted: true, body: '', score: 0 } : c)) : prev.filter((c) => c._id !== id)));
      onCountChange?.(-1);
    },
  };

  const roots = byParent.get('root') || [];

  return (
    <Box>
      {isAuthenticated ? (
        <Composer
          placeholder="Add a comment…"
          submitLabel="Comment"
          onSubmit={async (body) => {
            const { data } = await communityApi.createComment(kind, targetId, { body });
            ctx.add(data.data);
          }}
        />
      ) : (
        <Alert severity="info" action={<Button size="small" onClick={() => navigate('/login', { state: { from: { pathname } } })}>Sign in</Button>}>
          Sign in to join the conversation.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={22} />
        </Box>
      ) : roots.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No comments yet.
        </Typography>
      ) : (
        roots.map((c) => <CommentNode key={c._id} c={c} byParent={byParent} ctx={ctx} />)
      )}
    </Box>
  );
}
