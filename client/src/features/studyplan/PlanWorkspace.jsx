import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import OverviewTab from './OverviewTab';
import ScheduleTab from './ScheduleTab';
import TeamTab from './TeamTab';
import ActivityTab from './ActivityTab';
import { Rise } from './motion';
import { StatusPill, fmtRange, localKey, shareUrl } from './planUtils';

export default function PlanWorkspace({ id, onEdit, onGone, onChanged }) {
  const today = localKey();
  const [plan, setPlan] = useState(null);
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await studyPlanApi.get(id);
      setPlan(data.data);
      setError('');
      onChanged?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [id, onChanged]);

  useEffect(() => {
    setPlan(null);
    setTab('overview');
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Progress comes from real solves, so refresh when the learner comes back from solving something.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 60000);
    return () => { document.removeEventListener('visibilitychange', onVisible); clearInterval(timer); };
  }, [load]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(plan.shareCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch { /* clipboard blocked — the Team tab shows the link in a field */ }
  };

  if (!plan) {
    return error ? <Alert severity="error">{error}</Alert> : (
      <Stack spacing={2}><Skeleton variant="rounded" height={110} sx={{ borderRadius: '14px' }} /><Skeleton variant="rounded" height={100} sx={{ borderRadius: '14px' }} /><Skeleton variant="rounded" height={260} sx={{ borderRadius: '14px' }} /></Stack>
    );
  }

  const s = plan.summary;

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      <Rise>
        <Box sx={[surface, { px: 2.5, pt: 2.25, pb: 0 }]}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}># {plan.title}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.75, alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
                <StatusPill status={s.status} />
                <Typography variant="body2" color="text.secondary">{fmtRange(s.startDate, s.endDate)} · {plan.memberCount} member{plan.memberCount === 1 ? '' : 's'}{plan.owner ? ` · by @${plan.owner.handle}` : ''}</Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              {plan.isOwner && <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => onEdit(plan)} sx={{ fontWeight: 700 }}>Edit plan</Button>}
              <Button size="small" variant={copied ? 'contained' : 'outlined'} color={copied ? 'success' : 'primary'} disableElevation startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />} onClick={copy} sx={{ fontWeight: 700 }}>
                {copied ? 'Link copied' : 'Invite link'}
              </Button>
            </Stack>
          </Box>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 1, minHeight: 42, '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 700 } }}>
            <Tab value="overview" label="Overview" />
            <Tab value="schedule" label={`Schedule · ${s.total}`} />
            <Tab value="team" label={`Team · ${plan.members.length}`} />
            <Tab value="activity" label="Activity" />
          </Tabs>
        </Box>
      </Rise>

      {tab === 'overview' && <OverviewTab plan={plan} today={today} onOpenTeam={() => setTab('team')} />}
      {tab === 'schedule' && <ScheduleTab plan={plan} today={today} />}
      {tab === 'team' && <TeamTab plan={plan} today={today} reload={load} onGone={onGone} />}
      {tab === 'activity' && <ActivityTab plan={plan} />}
    </Stack>
  );
}
