import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Avatar, Box, Button, Stack, TextField, Typography, alpha } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import { Rise } from './motion';
import { DiffTag, localKey, relDay, relTime } from './planUtils';

function Event({ e, myHandle }) {
  const base = (
    <Avatar src={e.user.avatarUrl || undefined} sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, mt: 0.25 }}>{e.user.name?.[0]?.toUpperCase()}</Avatar>
  );
  const head = (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>{e.user.name}</Typography>
      <Typography variant="caption" color="text.secondary">{relTime(e.at)}</Typography>
    </Box>
  );

  if (e.type === 'solved') {
    return (
      <Box sx={{ display: 'flex', gap: 1.25, py: 0.75 }}>
        {base}
        <Box sx={{ minWidth: 0 }}>
          {head}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="body2">solved <Box component="span" sx={{ fontWeight: 700 }}>{e.item.title}</Box></Typography>
            <DiffTag difficulty={e.item.difficulty} />
          </Box>
        </Box>
      </Box>
    );
  }
  if (e.type === 'joined' || e.type === 'created') {
    return (
      <Box sx={{ display: 'flex', gap: 1.25, py: 0.5, alignItems: 'center' }}>
        <Box sx={{ width: 32 }} />
        <Typography variant="caption" color="text.secondary">
          <Box component="span" sx={{ fontWeight: 700 }}>{e.user.name}</Box> {e.type === 'created' ? 'created this plan' : 'joined the plan'} · {relTime(e.at)}
        </Typography>
      </Box>
    );
  }
  const mentionsMe = e.type === 'nudge' && e.target?.handle === myHandle;
  return (
    <Box sx={{ display: 'flex', gap: 1.25, py: 0.75 }}>
      {base}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {head}
        {e.type === 'nudge' ? (
          <Box sx={(t) => ({ display: 'inline-flex', gap: 0.75, alignItems: 'flex-start', px: 1.25, py: 0.75, borderRadius: '10px', bgcolor: alpha(t.palette.warning.main, mentionsMe ? 0.2 : 0.1), border: `1px solid ${alpha(t.palette.warning.main, 0.4)}` })}>
            <NotificationsActiveRoundedIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.2 }} />
            <Typography variant="body2"><Box component="span" sx={{ fontWeight: 800 }}>@{e.target?.handle}</Box> {e.text}</Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{e.text}</Typography>
        )}
      </Box>
    </Box>
  );
}

// Slack-style channel: solves, joins, nudges and chat in one timeline (newest at the bottom).
export default function ActivityTab({ plan }) {
  const [events, setEvents] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const box = useRef(null);
  const stick = useRef(true);
  const today = localKey();
  const me = plan.members.find((m) => m.isMe);

  const load = useCallback(async () => {
    try {
      const { data } = await studyPlanApi.feed(plan.id);
      setEvents(data.data.events);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [plan.id]);

  useEffect(() => {
    load();
    const timer = setInterval(() => document.visibilityState === 'visible' && load(), 20000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (box.current && stick.current) box.current.scrollTop = box.current.scrollHeight;
  }, [events]);

  const send = async () => {
    const msg = text.trim();
    if (!msg || sending) return;
    setSending(true);
    try {
      await studyPlanApi.postMessage(plan.id, msg);
      setText('');
      stick.current = true;
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  // Date dividers like Slack.
  const groups = [];
  (events || []).forEach((e) => {
    const k = localKey(new Date(e.at));
    const last = groups[groups.length - 1];
    if (last && last.key === k) last.items.push(e);
    else groups.push({ key: k, items: [e] });
  });

  return (
    <Rise>
      <Box sx={[surface, { display: 'flex', flexDirection: 'column' }]}>
        <Box sx={(t) => ({ px: 2, py: 1.25, borderBottom: `1px solid ${t.palette.divider}` })}>
          <Typography sx={{ fontWeight: 700 }}># {plan.title}</Typography>
          <Typography variant="caption" color="text.secondary">Solves appear here automatically. Say something to your team or cheer them on.</Typography>
        </Box>

        <Box
          ref={box}
          onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40; }}
          sx={{ px: 2, py: 1, height: 420, overflowY: 'auto' }}
        >
          {events === null && !error && <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Loading…</Typography>}
          {events && events.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Nothing yet. Be the first to say hi.</Typography>}
          {groups.map((g) => (
            <Box key={g.key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{relDay(g.key, today)}</Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              </Box>
              {g.items.map((e) => <Event key={e.id} e={e} myHandle={me?.handle} />)}
            </Box>
          ))}
        </Box>

        {error && <Alert severity="error" sx={{ mx: 2, mb: 1 }} onClose={() => setError('')}>{error}</Alert>}

        <Stack direction="row" spacing={1} sx={(t) => ({ p: 1.5, borderTop: `1px solid ${t.palette.divider}`, alignItems: 'flex-end' })}>
          <TextField
            multiline maxRows={4} size="small" fullWidth value={text} placeholder={`Message # ${plan.title}`}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            slotProps={{ htmlInput: { maxLength: 500, 'aria-label': 'Message' } }}
          />
          <Button variant="contained" disableElevation onClick={send} disabled={!text.trim() || sending} endIcon={<SendRoundedIcon />} sx={{ fontWeight: 700, height: 40 }}>Send</Button>
        </Stack>
      </Box>
    </Rise>
  );
}
