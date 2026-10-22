import { useEffect, useState } from 'react';
import { Box, ButtonBase, Skeleton, Stack, Typography } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { submissionsApi } from '../../api/submissionsApi';
import { extractErrorMessage } from '../../api/apiClient';
import { timeAgo, LANG_LABEL } from './community/CommunityBits';
import { wsSurface } from './workspaceTheme';
import { WS, mono } from './wsTokens';
import { EmptyState, WsButton } from './wsUi';

const statusColor = (status) => {
  if (status === 'Accepted') return 'success.main';
  if (status === 'Time Limit Exceeded') return 'warning.main';
  return 'error.main';
};

function Row({ s, open, onToggle, onLoad }) {
  return (
    <Box sx={(t) => ({ borderRadius: `${WS.radius + 2}px`, bgcolor: open ? wsSurface(t).raised : 'transparent' })}>
      <ButtonBase
        onClick={onToggle}
        sx={(t) => ({
          width: '100%',
          justifyContent: 'flex-start',
          textAlign: 'left',
          gap: 1.5,
          px: 1.5,
          py: 1.1,
          borderRadius: `${WS.radius + 2}px`,
          '&:hover': { bgcolor: open ? 'transparent' : wsSurface(t).raised },
        })}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: statusColor(s.status) }}>{s.status}</Typography>
          <Typography variant="caption" color="text.secondary">
            {timeAgo(s.createdAt)}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {LANG_LABEL[s.language] || s.language}
        </Typography>
        <Typography variant="caption" sx={{ ...mono, color: 'text.secondary', minWidth: 54, textAlign: 'right' }}>
          {s.runtimeMs != null ? `${s.runtimeMs} ms` : '—'}
        </Typography>
        <Typography variant="caption" sx={{ ...mono, color: 'text.secondary', minWidth: 58, textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
          {s.memoryKb ? `${(s.memoryKb / 1024).toFixed(1)} MB` : '—'}
        </Typography>
        <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: 'text.secondary', transition: 'transform .15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </ButtonBase>
      {open && (
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
            {s.passedCount}/{s.totalCount} test cases passed
          </Typography>
          <Box
            component="pre"
            sx={(t) => ({
              ...mono,
              m: 0,
              p: 1.5,
              maxHeight: 280,
              overflow: 'auto',
              fontSize: '0.78rem',
              lineHeight: 1.65,
              borderRadius: `${WS.radius}px`,
              bgcolor: wsSurface(t).canvas,
            })}
          >
            {s.code}
          </Box>
          <WsButton variant="secondary" onClick={() => onLoad(s)} sx={{ mt: 1.25 }}>
            Load in editor
          </WsButton>
        </Box>
      )}
    </Box>
  );
}

// This user's submissions for the open problem. The server lists submissions
// across problems, so the newest 50 are fetched and filtered here.
export default function SubmissionsPanel({ slug, isAuthenticated, refreshKey, onLoad, onSignIn }) {
  const [state, setState] = useState({ status: 'loading', items: [], error: null });
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    submissionsApi
      .history({ limit: 50 })
      .then(({ data }) => {
        if (cancelled) return;
        const items = (data.data.items || []).filter((s) => s.problem?.slug?.toLowerCase() === slug.toLowerCase());
        setState({ status: 'ready', items, error: null });
      })
      .catch((e) => !cancelled && setState({ status: 'error', items: [], error: extractErrorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [slug, isAuthenticated, refreshKey]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        icon={<LockOutlinedIcon />}
        title="Sign in to see your submissions"
        text="Your attempts for this problem are saved to your account."
        action={
          <WsButton variant="primary" onClick={onSignIn}>
            Sign in
          </WsButton>
        }
      />
    );
  }
  if (state.status === 'loading') {
    return (
      <Stack sx={{ gap: 1 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: `${WS.radius + 2}px` }} />
        ))}
      </Stack>
    );
  }
  if (state.status === 'error') return <EmptyState icon={<HistoryRoundedIcon />} title="Couldn't load submissions" text={state.error} />;
  if (state.items.length === 0) {
    return <EmptyState icon={<HistoryRoundedIcon />} title="No submissions yet" text="Submit your solution and every attempt will show up here." />;
  }
  return (
    <Stack sx={{ gap: 0.25, mx: -0.5 }}>
      {state.items.map((s) => (
        <Row key={s._id} s={s} open={openId === s._id} onToggle={() => setOpenId((id) => (id === s._id ? null : s._id))} onLoad={onLoad} />
      ))}
    </Stack>
  );
}
