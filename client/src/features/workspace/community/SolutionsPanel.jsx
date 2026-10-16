import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Divider, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import Markdown, { CodeBlock, CodePreview, MarkdownEditor } from './Markdown';
import {
  AcceptedBadge,
  ActionButton,
  AuthorHeader,
  ComposerPrompt,
  ConfirmDialog,
  EmptyBlock,
  FeedSkeleton,
  FilterChips,
  ItemMenu,
  LANG_LABEL,
  LangChip,
  MetricChip,
  ReportDialog,
  SegmentedTabs,
  VoteBar,
  clamp,
} from './CommunityBits';
import CommentSection from './CommentSection';

const SORTS = [
  { value: 'top', label: 'Most votes', icon: <TrendingUpRoundedIcon /> },
  { value: 'new', label: 'Newest', icon: <AccessTimeRoundedIcon /> },
];
const LANG_FILTERS = [{ value: '', label: 'All' }, ...Object.entries(LANG_LABEL).map(([value, label]) => ({ value, label }))];

const fmtMem = (kb) => (kb == null ? null : `${(kb / 1024).toFixed(1)} MB`);

function Metrics({ s }) {
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
      <LangChip language={s.language} />
      {s.runtimeMs != null && <MetricChip icon={<SpeedRoundedIcon />} label={`${s.runtimeMs} ms`} />}
      {s.memoryKb != null && <MetricChip icon={<MemoryRoundedIcon />} label={fmtMem(s.memoryKb)} />}
    </Stack>
  );
}

function SendButton({ onClick, loading, size = 44 }) {
  return (
    <Tooltip title="Send to editor">
      <span>
        <IconButton
          aria-label="Send to editor"
          onClick={onClick}
          disabled={loading}
          sx={(t) => ({ width: size, height: size, color: 'primary.main', bgcolor: alpha(t.palette.primary.main, 0.12), '&:hover': { bgcolor: alpha(t.palette.primary.main, 0.2) } })}
        >
          {loading ? <CircularProgress size={20} /> : <SendRoundedIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

function SolutionPost({ s, onOpen, onSend, sending }) {
  return (
    <Box component="article" sx={{ py: 2 }}>
      <AuthorHeader author={s.author} createdAt={s.createdAt} editedAt={s.editedAt} isMine={s.isMine} right={<AcceptedBadge />} />

      <Box
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => e.key === 'Enter' && onOpen()}
        sx={{ mt: 1.5, cursor: 'pointer', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', borderRadius: 2 } }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1.08rem', lineHeight: 1.35 }}>{s.title}</Typography>
        {s.excerpt && (
          <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: '0.93rem', lineHeight: 1.55, ...clamp(2) }}>
            {s.excerpt}
          </Typography>
        )}
        {s.codePreview && <CodePreview code={s.codePreview} language={s.language} />}
      </Box>

      <Box sx={{ mt: 1.5 }}>
        <Metrics s={s} />
      </Box>

      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5 }}>
        <VoteBar targetType="solution" targetId={s._id} score={s.score} myVote={s.myVote} allowDown={false} isMine={s.isMine} />
        <ActionButton icon={<ChatBubbleOutlineRoundedIcon />} count={s.commentCount} label="Open comments" onClick={onOpen} />
        <Box sx={{ flex: 1 }} />
        <SendButton onClick={onSend} loading={sending} />
      </Stack>
    </Box>
  );
}

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
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={onBack} sx={{ mb: 1, ml: -1, height: 44, fontWeight: 700 }}>
        Solutions
      </Button>

      {loading && <FeedSkeleton count={1} withCode />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {sol && (
        <>
          <AuthorHeader
            author={sol.author}
            createdAt={sol.createdAt}
            editedAt={sol.editedAt}
            isMine={sol.isMine}
            right={
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
            }
          />

          {editing ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField label="Title" fullWidth value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value.slice(0, 120) }))} />
              <MarkdownEditor label="Write-up" value={draft.content} onChange={(v) => setDraft((d) => ({ ...d, content: v }))} minRows={6} />
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="contained" disableElevation onClick={save} disabled={saving || draft.title.trim().length < 3}>
                  Save
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Typography sx={{ mt: 2, fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.3 }}>{sol.title}</Typography>
              <Box sx={{ mt: 1.5 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                  <AcceptedBadge />
                  <LangChip language={sol.language} />
                  {sol.runtimeMs != null && <MetricChip icon={<SpeedRoundedIcon />} label={`${sol.runtimeMs} ms`} />}
                  {sol.memoryKb != null && <MetricChip icon={<MemoryRoundedIcon />} label={fmtMem(sol.memoryKb)} />}
                </Stack>
              </Box>
              {sol.content && (
                <Box sx={{ mt: 2 }}>
                  <Markdown source={sol.content} />
                </Box>
              )}
              <CodeBlock code={sol.code} language={sol.language} maxHeight={480} />
            </>
          )}

          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 1.5 }}>
            <VoteBar targetType="solution" targetId={sol._id} score={sol.score} myVote={sol.myVote} allowDown={false} isMine={sol.isMine} />
            <Button variant="contained" disableElevation size="large" startIcon={<SendRoundedIcon />} onClick={() => onSendToEditor(sol)} sx={{ height: 46, px: 2.5 }}>
              Send to editor
            </Button>
          </Stack>

          <Divider sx={{ my: 2.5 }} />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 22 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>Comments · {sol.commentCount}</Typography>
          </Stack>
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
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [sendingId, setSendingId] = useState(null);

  // A fresh share (refreshKey bump) returns to the feed.
  useEffect(() => {
    setOpenId(null);
  }, [refreshKey]);

  const fetchPage = useCallback(
    (page) => communityApi.listSolutions(slug, { sort, page, limit: 10, ...(language ? { language } : {}) }).then(({ data }) => data.data),
    [slug, sort, language]
  );

  useEffect(() => {
    if (openId) return undefined;
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
  }, [fetchPage, refreshKey, openId]);

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

  const handleShare = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } });
    onShare();
  };

  // One tap from the feed: fetch the code, hand it to the workspace.
  const sendFromList = async (item) => {
    setSendingId(item._id);
    try {
      const { data } = await communityApi.getSolution(item._id);
      onSendToEditor(data.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSendingId(null);
    }
  };

  if (openId) {
    return <SolutionDetail id={openId} onBack={() => setOpenId(null)} onSendToEditor={onSendToEditor} />;
  }

  const hasMore = pagination && pagination.page < pagination.totalPages;

  return (
    <Box>
      <ComposerPrompt icon={<IosShareRoundedIcon />} placeholder="Share your solution…" onClick={handleShare} />

      <Stack spacing={1.5} sx={{ mt: 2 }}>
        <SegmentedTabs value={sort} onChange={setSort} options={SORTS} />
        <FilterChips value={language} onChange={setLanguage} options={LANG_FILTERS} />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 1 }}>
        {loading ? (
          <FeedSkeleton withCode />
        ) : items.length === 0 ? (
          <EmptyBlock
            icon={<LightbulbOutlinedIcon />}
            title="No solutions yet"
            text={language ? 'Nothing in this language yet — try another filter.' : 'Solve it, then share your approach with everyone.'}
          />
        ) : (
          <Stack divider={<Divider flexItem />}>
            {items.map((s) => (
              <SolutionPost key={s._id} s={s} onOpen={() => setOpenId(s._id)} onSend={() => sendFromList(s)} sending={sendingId === s._id} />
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
