import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import Markdown, { CodeBlock, MarkdownEditor } from './Markdown';
import { AuthorLine, VoteBar, ItemMenu, ConfirmDialog, ReportDialog, LANG_LABEL } from './CommunityBits';
import CommentSection from './CommentSection';

function SolutionDetail({ id, onBack, onSendToEditor }) {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const [sol, setSol] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    communityApi
      .getSolution(id)
      .then(({ data }) => !cancelled && setSol(data.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await communityApi.updateSolution(id, draft);
      setSol((s) => ({ ...s, ...data.data }));
      setEditing(false);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await communityApi.deleteSolution(id);
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
        All solutions
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

      {sol && (
        <>
          {editing ? (
            <Stack spacing={2}>
              <TextField label="Title" size="small" fullWidth value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value.slice(0, 120) }))} />
              <MarkdownEditor label="Write-up" value={draft.content} onChange={(v) => setDraft((d) => ({ ...d, content: v }))} minRows={6} />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button size="small" variant="contained" disableElevation onClick={save} disabled={saving || draft.title.trim().length < 3}>
                  Save
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {sol.title}
                </Typography>
                <ItemMenu
                  canEdit={sol.isMine}
                  canDelete={sol.isMine || role === 'admin'}
                  canReport={isAuthenticated && !sol.isMine}
                  onEdit={() => {
                    setDraft({ title: sol.title, content: sol.content });
                    setEditing(true);
                  }}
                  onDelete={() => setConfirmDelete(true)}
                  onReport={() => setReportOpen(true)}
                />
              </Stack>
              <Box sx={{ mt: 0.75 }}>
                <AuthorLine author={sol.author} createdAt={sol.createdAt} editedAt={sol.editedAt} />
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                <Chip size="small" label={LANG_LABEL[sol.language] || sol.language} />
                {sol.runtimeMs != null && <Chip size="small" variant="outlined" label={`${sol.runtimeMs} ms`} />}
                {sol.memoryKb != null && <Chip size="small" variant="outlined" label={`${(sol.memoryKb / 1024).toFixed(1)} MB`} />}
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 1.5 }}>
                <VoteBar targetType="solution" targetId={sol._id} score={sol.score} myVote={sol.myVote} allowDown={false} isMine={sol.isMine} />
                <Button size="small" variant="contained" disableElevation startIcon={<CodeRoundedIcon />} onClick={() => onSendToEditor(sol)}>
                  Load in editor
                </Button>
              </Stack>

              {sol.content && (
                <Box sx={{ mt: 2 }}>
                  <Markdown source={sol.content} />
                </Box>
              )}
              <CodeBlock code={sol.code} language={LANG_LABEL[sol.language]} maxHeight={480} />
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
            Comments ({sol.commentCount})
          </Typography>
          <CommentSection kind="solutions" targetId={sol._id} onCountChange={(d) => setSol((s) => ({ ...s, commentCount: Math.max(0, s.commentCount + d) }))} />

          <ConfirmDialog open={confirmDelete} title="Delete solution?" text="The solution and its comments will be removed permanently." loading={deleting} onConfirm={remove} onClose={() => setConfirmDelete(false)} />
          <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} targetType="solution" targetId={sol._id} />
        </>
      )}
    </Box>
  );
}

export default function SolutionsPanel({ slug, refreshKey, onShare, onSendToEditor }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [sort, setSort] = useState('top');
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingId, setSendingId] = useState(null);

  // A fresh share (refreshKey bump) returns to the list on page 1.
  useEffect(() => {
    setOpenId(null);
    setPage(1);
  }, [refreshKey]);

  useEffect(() => {
    if (openId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    communityApi
      .listSolutions(slug, { sort, page, limit: 10, ...(language ? { language } : {}) })
      .then(({ data: res }) => !cancelled && setData(res.data))
      .catch((err) => !cancelled && setError(extractErrorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slug, sort, language, page, refreshKey, openId]);

  const handleShare = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
    onShare();
  };

  // One click from the list: fetch the code, hand it to the workspace.
  const sendFromList = async (item) => {
    setSendingId(item._id);
    try {
      const { data: res } = await communityApi.getSolution(item._id);
      onSendToEditor(res.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSendingId(null);
    }
  };

  if (openId) {
    return <SolutionDetail id={openId} onBack={() => setOpenId(null)} onSendToEditor={onSendToEditor} />;
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
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
        >
          <ToggleButton value="top">Most votes</ToggleButton>
          <ToggleButton value="new">Newest</ToggleButton>
        </ToggleButtonGroup>
        <Stack direction="row" spacing={1}>
          <TextField
            select
            size="small"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setPage(1);
            }}
            slotProps={{ select: { displayEmpty: true } }}
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="">All languages</MenuItem>
            {Object.entries(LANG_LABEL).map(([id, label]) => (
              <MenuItem key={id} value={id}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <Button size="small" variant="contained" disableElevation startIcon={<AddRoundedIcon />} onClick={handleShare}>
            Share
          </Button>
        </Stack>
      </Stack>

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
            No solutions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {language ? 'Nothing in this language yet — try another filter.' : 'Solve it, then share your approach.'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {data.items.map((s) => (
            <Paper key={s._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Box onClick={() => setOpenId(s._id)} sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                    {s.title}
                  </Typography>
                  {s.excerpt && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {s.excerpt}
                    </Typography>
                  )}
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                    <AuthorLine author={s.author} createdAt={s.createdAt} editedAt={s.editedAt} size={18} />
                    <Chip size="small" label={LANG_LABEL[s.language] || s.language} sx={{ height: 20, fontSize: '0.7rem' }} />
                    {s.runtimeMs != null && (
                      <Typography variant="caption" color="text.secondary">
                        {s.runtimeMs} ms
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Tooltip title="Load this code in the editor">
                  <span>
                    <IconButton size="small" aria-label="Load in editor" onClick={() => sendFromList(s)} disabled={sendingId === s._id} color="primary">
                      {sendingId === s._id ? <CircularProgress size={18} /> : <CodeRoundedIcon />}
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
                <VoteBar targetType="solution" targetId={s._id} score={s.score} myVote={s.myVote} allowDown={false} isMine={s.isMine} />
                <Button size="small" color="inherit" startIcon={<ChatBubbleOutlineRoundedIcon sx={{ fontSize: '16px !important' }} />} onClick={() => setOpenId(s._id)} sx={{ color: 'text.secondary' }}>
                  {s.commentCount}
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
