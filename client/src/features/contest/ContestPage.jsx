import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Alert, Box, Button, Checkbox, Container, FormControlLabel, IconButton, Typography, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { contestApi } from '../../api/contestApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import ContestTabs from './ContestTabs';
import GlobalTop from './GlobalTop';
import { fmtDuration, fmtStart, inr, useContest } from './contestUtils';

const RULE_ICON = { 'fair-play': SmartToyRoundedIcon, verification: FactCheckRoundedIcon, format: TimerRoundedIcon, eligibility: HowToRegRoundedIcon, prize: PaymentsRoundedIcon, penalties: GavelRoundedIcon };

function Stat({ icon: Icon, label, value }) {
  return (
    <Box sx={[surface, { p: 1.5, display: 'flex', alignItems: 'center', gap: 1.25 }]}>
      <Icon sx={{ fontSize: 22, color: 'primary.main' }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>{label}</Typography>
        <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }} noWrap>{value}</Typography>
      </Box>
    </Box>
  );
}

function RuleSection({ rule, index }) {
  const Icon = RULE_ICON[rule.id] || GavelRoundedIcon;
  return (
    <Box
      sx={[surface, (t) => ({ p: { xs: 2, sm: 2.5 }, ...(rule.highlight && { borderColor: t.palette.warning.main, bgcolor: alpha(t.palette.warning.main, t.palette.mode === 'dark' ? 0.08 : 0.05) }) })]}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Icon sx={{ fontSize: 22, color: rule.highlight ? 'warning.main' : 'primary.main' }} />
        <Typography sx={{ fontWeight: 800, fontSize: 16 }}>{index + 1}. {rule.title}</Typography>
      </Box>
      <Box component="ol" sx={{ m: 0, pl: 2.75, display: 'grid', gap: 0.9 }}>
        {rule.items.map((text) => (
          <Typography key={text} component="li" variant="body2" sx={{ lineHeight: 1.6, '&::marker': { fontWeight: 700, color: 'text.secondary' } }}>{text}</Typography>
        ))}
      </Box>
    </Box>
  );
}

// `embedded`: rendered inside the dashboard (sidebar stays visible), so no back button / own page padding.
export default function ContestPage({ embedded = false }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { contest, setContest } = useContest();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const applyRef = useRef(null);

  const run = async (call, okMsg) => {
    setBusy(true);
    try {
      const { data } = await call();
      setContest(data.data);
      setAccepted(false);
      enqueueSnackbar(okMsg, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(extractErrorMessage(err), { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const back = embedded ? null : <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" edge="start"><ArrowBackRoundedIcon /></IconButton>;

  const upcoming = contest?.status === 'upcoming';
  const goApply = () => applyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <Container maxWidth="lg" disableGutters={embedded} sx={embedded ? { py: 0 } : { py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ display: 'grid', gap: 2 }}>
        {back && <Box>{back}</Box>}

        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', fontSize: { xs: 26, sm: 32 } }}>Contests</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.25 }}>Compete, climb the global ranks and win real prizes.</Typography>
        </Box>

        {/* Global top 10 (left) + upcoming / past contests (right). On phones the contests come first. */}
        <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.55fr) minmax(0,1fr)' } }}>
          <Box sx={{ order: { xs: 2, md: 1 } }}><GlobalTop /></Box>
          <Box sx={{ order: { xs: 1, md: 2 }, position: { md: 'sticky' }, top: { md: 16 } }}><ContestTabs contest={contest} onOpen={goApply} /></Box>
        </Box>

        {contest && (
        <>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.01em', mt: 1.5 }}>{contest.title}</Typography>

        {/* Key facts */}
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', sm: 'repeat(4, minmax(0,1fr))' } }}>
          <Stat icon={GroupsRoundedIcon} label="Applicants" value={contest.applicants.toLocaleString('en-IN')} />
          <Stat icon={PaymentsRoundedIcon} label="Cash prize" value={inr(contest.prizePool)} />
          <Stat icon={CodeRoundedIcon} label="Questions" value={`${contest.problemCount} ${contest.difficulty}`} />
          <Stat icon={TimerRoundedIcon} label="Duration" value={fmtDuration(contest.durationMinutes)} />
        </Box>

        <Alert severity="warning" icon={<SmartToyRoundedIcon />} sx={{ fontWeight: 600 }}>
          No AI, no outside help. Every solution must be your own work. Cheaters are disqualified and lose any prize.
        </Alert>

        {/* Rules */}
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 1 }}>Contest rules</Typography>
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' }, alignItems: 'start' }}>
          {contest.rules.map((rule, i) => <RuleSection key={rule.id} rule={rule} index={i} />)}
        </Box>

        {/* Apply */}
        <Box ref={applyRef} sx={[surface, { p: { xs: 2, sm: 2.5 }, scrollMarginTop: 90 }]}>
          <Typography sx={{ fontWeight: 800, fontSize: 16, mb: 1 }}>Apply</Typography>
          {contest.applied ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <CheckCircleRoundedIcon sx={{ color: 'success.main' }} />
              <Typography sx={{ flex: 1, minWidth: 200, fontWeight: 600 }}>You are in. See you on {fmtStart(contest.startsAt)}.</Typography>
              {upcoming && <Button color="inherit" size="small" disabled={busy} onClick={() => run(contestApi.withdraw, 'Application withdrawn')}>Withdraw</Button>}
            </Box>
          ) : !upcoming ? (
            <Typography color="text.secondary">Applications are closed.</Typography>
          ) : !isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography color="text.secondary" sx={{ flex: 1, minWidth: 200 }}>Log in to apply. It is free.</Typography>
              <Button variant="contained" disableElevation sx={{ fontWeight: 700 }} onClick={() => navigate('/login')}>Log in to apply</Button>
            </Box>
          ) : (
            <>
              <FormControlLabel
                control={<Checkbox checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />}
                label={<Typography variant="body2">I have read the rules above. I will not use AI or any outside help, and I accept that cheating means disqualification and loss of any prize.</Typography>}
                sx={{ alignItems: 'flex-start', m: 0, mb: 1.5, '& .MuiCheckbox-root': { pt: 0.25 } }}
              />
              <Button variant="contained" disableElevation disabled={!accepted || busy} onClick={() => run(contestApi.apply, 'You are in!')} sx={{ fontWeight: 700, px: 4 }}>
                {busy ? 'Applying…' : 'Apply for the contest'}
              </Button>
            </>
          )}
        </Box>
        </>
        )}
      </Box>
    </Container>
  );
}
