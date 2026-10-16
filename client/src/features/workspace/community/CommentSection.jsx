import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Box, Button, Chip, Skeleton, Stack, TextField, Typography } from '@mui/material';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import Markdown from './Markdown';
import { UserAvatar, VoteBar, ItemMenu, ConfirmDialog, ReportDialog, timeAgo } from './CommunityBits';

const MAX_DEPTH = 3; // keep in sync with MAX_COMMENT_DEPTH on the server

// Rounded "Add a comment…" input. The action row only appears once there is
// text (or when editing / replying), like Instagram.
function Composer({ initial = '', placeholder, submitLabel = 'Post', onSubmit, onCancel, autoFocus, showAvatar }) {
  const user = useSelector((s) => s.auth.user);
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
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      {showAvatar && user && <UserAvatar user={user} size={36} />}
      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={8}
          autoFocus={autoFocus}
          value={body}
          disabled={saving}
          placeholder={placeholder}
          onChange={(e) => setBody(e.target.value.slice(0, 3000))}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '22px', px: 2, py: 1.1, fontSize: '0.95rem' } }}
        />
        {(body.trim() || onCancel) && (
          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
            {body.length > 2500 && (
              <Typography color="text.secondary" sx={{ fontSize: '0.78rem', mr: 'auto' }}>
                {body.length}/3000
              </Typography>
            )}
            {onCancel && (
              <Button onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
            )}
            <Button variant="contained" disableElevation endIcon={<SendRoundedIcon />} onClick={submit} disabled={saving || !body.trim()}>
              {submitLabel}
            </Button>
          </Stack>
        )}
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
    <Box sx={{ mt: 2.25, ...(c.depth > 0 && { ml: 1.25, pl: 1.5, borderLeft: '2px solid', borderColor: 'divider' }) }}>
      {c.isDeleted ? (
        <Typography color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '0.92rem' }}>
          [deleted]
        </Typography>
      ) : (
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <UserAvatar user={c.author} size={c.depth > 0 ? 30 : 36} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem' }}>{c.author?.name || 'Unknown'}</Typography>
              {c.isMine && <Chip size="small" label="You" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />}
              <Typography color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                {timeAgo(c.createdAt)}
                {c.editedAt ? ' · edited' : ''}
              </Typography>
            </Stack>

            {editing ? (
              <Box sx={{ mt: 1 }}>
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
              <Box sx={{ mt: 0.25 }}>
                <Markdown source={c.body} />
              </Box>
            )}

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25, ml: -1 }}>
              {canReply && (
                <Button size="small" startIcon={<ReplyRoundedIcon />} onClick={() => setReplying((v) => !v)} sx={{ color: 'text.secondary', fontWeight: 600, height: 36 }}>
                  Reply
                </Button>
              )}
              <ItemMenu
                size="small"
                canEdit={c.isMine}
                canDelete={c.isMine || ctx.role === 'admin'}
                canReport={ctx.isAuthenticated && !c.isMine}
                onEdit={() => setEditing(true)}
                onDelete={() => setConfirmDelete(true)}
                onReport={() => setReportOpen(true)}
              />
            </Stack>
          </Box>
          <VoteBar variant="column" targetType="comment" targetId={c._id} score={c.score} myVote={c.myVote} isMine={c.isMine} />
        </Stack>
      )}

      {replying && (
        <Box sx={{ mt: 1 }}>
          <Composer
            placeholder={`Reply to ${c.author?.name || 'comment'}…`}
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

function CommentSkeleton() {
  return (
    <Stack spacing={2.25} sx={{ mt: 2.5 }}>
      {[0, 1].map((i) => (
        <Stack key={i} direction="row" spacing={1.25}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="30%" height={20} />
            <Skeleton width="90%" />
            <Skeleton width="60%" />
          </Box>
        </Stack>
      ))}
    </Stack>
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
          showAvatar
          placeholder="Add a comment…"
          onSubmit={async (body) => {
            const { data } = await communityApi.createComment(kind, targetId, { body });
            ctx.add(data.data);
          }}
        />
      ) : (
        <Alert severity="info" action={<Button color="inherit" onClick={() => navigate('/login', { state: { from: { pathname } } })}>Sign in</Button>}>
          Sign in to join the conversation.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CommentSkeleton />
      ) : roots.length === 0 ? (
        <Stack alignItems="center" spacing={0.75} sx={{ py: 4, color: 'text.secondary' }}>
          <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 32 }} />
          <Typography sx={{ fontSize: '0.92rem' }}>No comments yet. Start the conversation.</Typography>
        </Stack>
      ) : (
        roots.map((c) => <CommentNode key={c._id} c={c} byParent={byParent} ctx={ctx} />)
      )}
    </Box>
  );
}
