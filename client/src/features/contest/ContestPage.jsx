import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Alert, Box, Button, Checkbox, Container, FormControlLabel, Typography, alpha } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { contestApi } from '../../api/contestApi';
import { extractErrorMessage } from '../../api/apiClient';
import { surface } from '../dashboard/dashboardUtils';
import ContestTabs, { ContestTile, LiveNow } from './ContestTabs';
import GlobalTop from './GlobalTop';
import WinnersPanel from './WinnersPanel';
import { fmtStart, useContest } from './contestUtils';

const RULE_ICON = { 'fair-play': SmartToyRoundedIcon, verification: FactCheckRoundedIcon, format: TimerRoundedIcon, eligibility: HowToRegRoundedIcon, prize: PaymentsRoundedIcon, penalties: GavelRoundedIcon };

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

// Preview only: open the contest page with &demo=winners to see a finished contest with sample winners.
const DEMO_WINNERS = [
  { rank: 1, name: 'Demo Champion', handle: 'demo_one', solved: 10, prize: 50000 },
  { rank: 2, name: 'Demo Runner', handle: 'demo_two', solved: 9, prize: 30000 },
  { rank: 3, name: 'Demo Third', handle: 'demo_three', solved: 8, prize: 20000 },
];

// List view: winners podium (only once a contest has ended) + Global top 10 on the left, live-now card + Upcoming/Past small cards on the right.
// Tapping a contest opens its explain page (rules + apply) with ?c=<id>, so Back and refresh work.
export default function ContestPage({ embedded = false }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { contest, setContest } = useContest();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const applyRef = useRef(null);
  const winnersRef = useRef(null);
  const timerRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [runKey, setRunKey] = useState(0);

  const detail = Boolean(contest && params.get('c') === contest.id);
  // list view data: the real contest, or a finished one with sample winners when ?demo=winners
  const shown = params.get('demo') === 'winners' && contest ? { ...contest, status: 'ended', winners: DEMO_WINNERS } : contest;
  const hasPast = shown?.status === 'ended';

  useEffect(() => () => clearTimeout(timerRef.current), []);

  // keep the other query params (view=contest, demo) and only touch ?c=
  const openContest = (c) => setParams((p) => { const n = new URLSearchParams(p); n.set('view', 'contest'); n.set('c', c.id); return n; });
  const closeContest = () => setParams((p) => { const n = new URLSearchParams(p); n.set('view', 'contest'); n.delete('c'); return n; });

  // tapping a past contest: scroll to the podium, then fire the reveal
  const openPast = () => {
    winnersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!revealed) { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setRevealed(true), 450); }
  };
  const replay = () => {
    clearTimeout(timerRef.current);
    setRevealed(false);
    setRunKey((k) => k + 1);
    timerRef.current = setTimeout(() => setRevealed(true), 700);
  };

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

  const upcoming = contest?.status === 'upcoming';
  const goApply = () => applyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  if (!detail) {
    return (
      <Container maxWidth="lg" disableGutters={embedded} sx={embedded ? { py: 0 } : { py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 } }}>
        <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.55fr) minmax(0,1fr)' } }}>
          <Box sx={{ order: { xs: 2, md: 1 }, display: 'grid', gap: 2, minWidth: 0 }}>
            {hasPast && (
              <Box ref={winnersRef}>
                <WinnersPanel contest={shown} revealed={revealed} runKey={runKey} onReveal={() => setRevealed(true)} onReplay={replay} />
              </Box>
            )}
            <GlobalTop />
          </Box>
          <Box sx={{ order: { xs: 1, md: 2 }, display: 'grid', gap: 2, minWidth: 0 }}>
            <LiveNow contest={shown} onOpen={openContest} />
            <ContestTabs contest={shown} onOpen={openContest} onOpenPast={openPast} pastSelected={revealed} />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" disableGutters={embedded} sx={embedded ? { py: 0 } : { py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 } }}>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box>
          <Button onClick={closeContest} startIcon={<ArrowBackRoundedIcon />} color="inherit" sx={{ fontWeight: 700, ml: -1 }}>All contests</Button>
        </Box>

        <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) minmax(0,1.5fr)' } }}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 0 } }}>
            <ContestTile contest={contest} past={contest.status === 'ended'} ctaLabel={contest.status === 'upcoming' ? (contest.applied ? 'You are in' : 'Apply now') : 'Rules & details'} onOpen={goApply} />
          </Box>

          <Box sx={{ display: 'grid', gap: 1.5, minWidth: 0 }}>
            <Alert severity="warning" icon={<SmartToyRoundedIcon />} sx={{ fontWeight: 600 }}>
              No AI, no outside help. Every solution must be your own work. Cheaters are disqualified and lose any prize.
            </Alert>

            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>Contest rules</Typography>
            {contest.rules.map((rule, i) => <RuleSection key={rule.id} rule={rule} index={i} />)}

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
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
