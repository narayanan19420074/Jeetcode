import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, ButtonBase, CircularProgress, Dialog, DialogContent, IconButton, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import { prepApi } from '../../api/prepApi';
import CompanyAvatar from '../../components/CompanyAvatar';
import PrepReadinessCard from '../../components/PrepReadinessCard';
import useViewportFill from '../dashboard/useViewportFill';
import { PLAN_AMBER, PLAN_THEMES } from '../studyplan/planUtils';
import { daysUntil, formatExamDate, pickExamDate } from '../prep/examDate';
import { CATEGORIES, EXAMS } from './examsData';
import BackToDashboard from '../../components/BackToDashboard';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, MOTION } from '../../app/design/designTokens';

// Exams that have a full mock paper on /mocks (paper ids live in server/src/config/mockTests.js).
const HAS_MOCK = new Set(['tcs-nqt', 'infosys', 'cognizant']);

const norm = (s) => String(s || '').trim().toLowerCase();
const readinessOf = (pct) => Math.max(0, Math.min(100, Math.round(pct ?? 0)));
const shortDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

// Everything a card needs to know about dates, worked out once.
// status.tone: urgent (apply closes within a week) | open | info | closed | muted
function examInfo(exam, track) {
  const examOn = exam.id === 'tcs-nqt' ? pickExamDate(track?.examDate) : exam.examOn;
  const toExam = examOn ? daysUntil(examOn) : null;
  const toApply = exam.applyBy ? daysUntil(exam.applyBy) : null;
  const closed = toApply !== null && toApply < 0;

  let status;
  if (toApply !== null && toApply >= 0) {
    status = { tone: toApply <= 7 ? 'urgent' : 'open', text: toApply === 0 ? 'Apply today' : `Apply by ${shortDate(exam.applyBy)} · ${toApply}d left` };
  } else if (closed && toExam !== null && toExam >= 0) {
    status = { tone: 'closed', text: `Applications closed · exam in ${toExam}d` };
  } else if (toExam !== null && toExam >= 0) {
    status = { tone: 'info', text: toExam === 0 ? 'Exam today' : `Exam in ${toExam} days` };
  } else if (closed) {
    status = { tone: 'closed', text: 'Applications closed' };
  } else {
    status = { tone: 'muted', text: 'Dates on official site' };
  }
  return { examOn, toExam, toApply, closed, status };
}

const TONES = {
  urgent: { fg: [COLOR_PALETTE.red[700], COLOR_PALETTE.red[300]], bg: withAlpha(COLOR_PALETTE.red[500], 0.14) },
  open: { fg: [COLOR_PALETTE.amber[800], COLOR_PALETTE.amber[200]], bg: withAlpha(COLOR_PALETTE.amber[400], 0.18) },
  info: { fg: [COLOR_PALETTE.blue[700], COLOR_PALETTE.blue[300]], bg: withAlpha(COLOR_PALETTE.blue[500], 0.14) },
  closed: { fg: [COLOR_PALETTE.slate[600], COLOR_PALETTE.slate[400]], bg: withAlpha(COLOR_PALETTE.slate[400], 0.16) },
  muted: { fg: [COLOR_PALETTE.slate[600], COLOR_PALETTE.slate[400]], bg: withAlpha(COLOR_PALETTE.slate[400], 0.12) },
};

function StatusPill({ status }) {
  const tone = TONES[status.tone];
  return (
    <Box sx={(t) => ({ minWidth: 0, maxWidth: '100%', px: 1, height: 22, display: 'inline-flex', alignItems: 'center', borderRadius: RADII_PX.pill, bgcolor: tone.bg, color: tone.fg[t.palette.mode === 'dark' ? 1 : 0], fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold })}>
      <Typography noWrap component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 1 }}>{status.text}</Typography>
    </Box>
  );
}

// Small readiness ring: the one number a learner scans for on each card.
function ReadyRing({ value, label }) {
  return (
    <Box role="img" aria-label={label} sx={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
      <CircularProgress variant="determinate" value={100} size={40} thickness={4.5} sx={{ position: 'absolute', inset: 0, color: 'divider' }} />
      <CircularProgress
        variant="determinate" value={value ?? 0} size={40} thickness={4.5}
        sx={{ position: 'absolute', inset: 0, color: PLAN_AMBER, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
      />
      <Typography sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, fontVariantNumeric: 'tabular-nums', color: value === null ? 'text.disabled' : 'text.primary' }}>
        {value === null ? '–' : `${value}%`}
      </Typography>
    </Box>
  );
}

// One exam: a compact card. Name + readiness ring, one status line, two actions.
// Pattern, eligibility and the rest live in the details dialog so every card stays the same height.
function ExamCard({ exam, index, track, onOpen }) {
  const navigate = useNavigate();
  const theme = PLAN_THEMES[index % PLAN_THEMES.length];
  const { status, closed } = examInfo(exam, track);

  const hasTrack = Boolean(track);
  const readiness = hasTrack && track.readiness !== null ? readinessOf(track.readiness) : null;
  const prepare = () => (hasTrack ? navigate(`/prep/${track.slug}`) : navigate(exam.practice[0].to));

  return (
    <Box sx={(t) => ({ position: 'relative', display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, pt: 2, borderRadius: RADII_PX.card, overflow: 'hidden', bgcolor: t.palette.background.paper, border: `1px solid ${t.palette.divider}`, transition: `border-color ${MOTION.fast}ms, transform ${MOTION.fast}ms`, '&:hover': { borderColor: PLAN_AMBER, transform: 'translateY(-1px)' } })}>
      <Box aria-hidden sx={{ position: 'absolute', left: 0, right: 0, top: 0, height: 3, background: theme.gradient }} />

      <ButtonBase onClick={onOpen} aria-label={`${exam.name} details`} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', textAlign: 'left', justifyContent: 'flex-start', fontFamily: 'inherit', borderRadius: RADII_PX.control }}>
        <CompanyAvatar name={exam.brand || exam.short} size={40} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, lineHeight: 1.25 }}>{exam.name}</Typography>
          <Typography noWrap variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>{exam.org}</Typography>
        </Box>
        <ReadyRing value={readiness} label={readiness === null ? `${exam.name} readiness not available` : `${exam.name} readiness ${readiness}%`} />
      </ButtonBase>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0 }}>
        <StatusPill status={status} />
        <Typography noWrap variant="caption" color="text.secondary" sx={{ flexShrink: 0, maxWidth: '45%', fontWeight: FONT_WEIGHTS.semibold }}>{exam.tags.join(' · ')}</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
        <Button
          component="a" href={exam.applyUrl} target="_blank" rel="noopener noreferrer" disableElevation endIcon={<LaunchRoundedIcon sx={{ fontSize: FONT_SIZES.title }} />}
          sx={{ flex: 1, height: 34, borderRadius: RADII_PX.control, bgcolor: PLAN_AMBER, color: COLOR_PALETTE.custom.black1B1200, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, '&:hover': { bgcolor: COLOR_PALETTE.amber[400] } }}
        >
          {closed ? 'Official site' : 'Apply'}
        </Button>
        <Button
          onClick={prepare} disableElevation startIcon={<BoltRoundedIcon sx={{ fontSize: FONT_SIZES.title }} />}
          sx={(t) => ({ flex: 1, height: 34, borderRadius: RADII_PX.control, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, color: 'text.primary', border: `1px solid ${t.palette.divider}`, '&:hover': { bgcolor: t.palette.action.hover } })}
        >
          {hasTrack ? (readiness ? 'Continue' : 'Start prep') : 'Prepare'}
        </Button>
        {HAS_MOCK.has(exam.id) && (
          <IconButton onClick={() => navigate('/mocks')} aria-label={`${exam.name} mock test`} size="small" sx={{ width: 34, height: 34, borderRadius: RADII_PX.control, color: PLAN_AMBER }}>
            <QuizRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
          </IconButton>
        )}
        <IconButton onClick={onOpen} aria-label={`${exam.name} pattern and eligibility`} size="small" sx={{ width: 34, height: 34, borderRadius: RADII_PX.control, color: 'text.secondary' }}>
          <InfoOutlinedIcon sx={{ fontSize: FONT_SIZES.heading }} />
        </IconButton>
      </Box>
    </Box>
  );
}

function Fact({ label, children }) {
  return (
    <Box>
      <Typography sx={{ fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.6, color: 'text.secondary', textTransform: 'uppercase' }}>{label}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>{children}</Typography>
    </Box>
  );
}

// Everything that does not fit on the card: what the exam is, key dates, pattern, who can apply.
function ExamDetails({ exam, track, onClose }) {
  const navigate = useNavigate();
  const { examOn, closed, status } = examInfo(exam, track);
  const hasTrack = Boolean(track);
  const go = (to) => { onClose(); navigate(to); };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="exam-details-title" slotProps={{ paper: { sx: { borderRadius: RADII_PX.card } } }}>
      <DialogContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CompanyAvatar name={exam.brand || exam.short} size={46} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography id="exam-details-title" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{exam.name}</Typography>
            <Typography variant="caption" color="text.secondary">by {exam.org}</Typography>
          </Box>
          <IconButton onClick={onClose} aria-label="Close" size="small"><CloseRoundedIcon /></IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{exam.blurb}</Typography>
        <Box sx={{ mt: 1.5 }}><StatusPill status={status} /></Box>

        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, mt: 2 }}>
          <Fact label="Exam date">{examOn ? formatExamDate(examOn) : 'Announced on the official site'}</Fact>
          <Fact label="Apply by">{exam.applyBy ? `${formatExamDate(exam.applyBy)}${closed ? ' (closed)' : ''}` : 'Announced on the official site'}</Fact>
          <Fact label="Mode">{exam.mode}</Fact>
          <Fact label="Covers">{exam.tags.join(', ')}</Fact>
        </Box>

        <Box sx={{ display: 'grid', gap: 1.5, mt: 2, pt: 2, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
          {exam.pattern.map(([k, v]) => (
            <Box key={k}>
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>{k}</Typography>
              <Typography variant="body2" color="text.secondary">{v}</Typography>
            </Box>
          ))}
          <Box>
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body }}>Who can apply</Typography>
            <Typography variant="body2" color="text.secondary">{exam.eligibility}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2.5 }}>
          <Button
            component="a" href={exam.applyUrl} target="_blank" rel="noopener noreferrer" disableElevation endIcon={<LaunchRoundedIcon />}
            sx={{ height: 40, px: 2.5, borderRadius: RADII_PX.card, bgcolor: PLAN_AMBER, color: COLOR_PALETTE.custom.black1B1200, fontWeight: FONT_WEIGHTS.bold, '&:hover': { bgcolor: COLOR_PALETTE.amber[400] } }}
          >
            {closed ? 'Official site' : 'Apply'}
          </Button>
          {HAS_MOCK.has(exam.id) && (
            <Button variant="outlined" startIcon={<QuizRoundedIcon />} onClick={() => go('/mocks')} sx={{ height: 40, borderRadius: RADII_PX.card, fontWeight: FONT_WEIGHTS.bold }}>Take mock test</Button>
          )}
          {hasTrack ? (
            <Button onClick={() => go(`/prep/${track.slug}`)} variant="outlined" endIcon={<ArrowForwardRoundedIcon />} sx={{ height: 40, borderRadius: RADII_PX.card, fontWeight: FONT_WEIGHTS.bold }}>Open prep track</Button>
          ) : (
            exam.practice.map((p) => <Button key={p.to} variant="outlined" onClick={() => go(p.to)} sx={{ height: 40, borderRadius: RADII_PX.card, fontWeight: FONT_WEIGHTS.bold }}>{p.label}</Button>)
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// Slim banner: the next thing the learner should act on. Soonest open application, else the next exam date.
function NextUpBanner() {
  const navigate = useNavigate();
  const pick = useMemo(() => {
    const open = EXAMS.filter((e) => e.applyBy && daysUntil(e.applyBy) >= 0).sort((a, b) => daysUntil(a.applyBy) - daysUntil(b.applyBy))[0];
    if (open) {
      const d = daysUntil(open.applyBy);
      return { exam: open, urgent: d <= 7, text: d === 0 ? `${open.name} applications close today` : `${open.name} applications close ${shortDate(open.applyBy)} · ${d} ${d === 1 ? 'day' : 'days'} left`, cta: 'Apply now', href: open.applyUrl };
    }
    const next = EXAMS.filter((e) => e.examOn && daysUntil(e.examOn) >= 0).sort((a, b) => daysUntil(a.examOn) - daysUntil(b.examOn))[0];
    if (next) {
      const d = daysUntil(next.examOn);
      return { exam: next, urgent: false, text: `${next.name} is on ${formatExamDate(next.examOn)} · ${d} ${d === 1 ? 'day' : 'days'} to go`, cta: 'Prepare', to: next.practice[0].to };
    }
    return null;
  }, []);

  if (!pick) return null;
  const tint = pick.urgent ? COLOR_PALETTE.red[500] : COLOR_PALETTE.amber[400];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, px: 1.5, py: 1, minHeight: 46, borderRadius: RADII_PX.card, flexShrink: 0, bgcolor: withAlpha(tint, 0.12), border: `1px solid ${withAlpha(tint, 0.4)}` }}>
      <EventAvailableRoundedIcon sx={{ fontSize: FONT_SIZES.display, flexShrink: 0, color: pick.urgent ? 'error.main' : PLAN_AMBER }} />
      <Typography sx={{ flex: 1, minWidth: 0, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.3 }}>{pick.text}</Typography>
      <Button
        {...(pick.href ? { component: 'a', href: pick.href, target: '_blank', rel: 'noopener noreferrer' } : { onClick: () => navigate(pick.to) })}
        disableElevation size="small"
        sx={{ flexShrink: 0, height: 30, px: 2, borderRadius: RADII_PX.control, bgcolor: PLAN_AMBER, color: COLOR_PALETTE.custom.black1B1200, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.caption, '&:hover': { bgcolor: COLOR_PALETTE.amber[400] } }}
      >
        {pick.cta}
      </Button>
    </Box>
  );
}

// Exams: the top coding and aptitude exams in India, one compact card each (Apply goes to the official site),
// with the learner's readiness on the right. On wide screens the page is one window tall: the header and banner
// stay put, and the cards and the readiness card each scroll on their own, both starting on the same line.
export default function ExamsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const rootRef = useRef(null);
  const fillH = useViewportFill(rootRef, isLg);
  const [tracks, setTracks] = useState(null);
  const [cat, setCat] = useState('all');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    prepApi.listCompanies().then(({ data }) => setTracks(data.data.items || [])).catch(() => setTracks([]));
  }, []);

  const trackFor = (exam) => (tracks || []).find((t) => t.slug === exam.trackSlug || norm(t.name) === norm(exam.short)) || null;
  const shown = useMemo(() => EXAMS.map((e, i) => ({ e, i })).filter(({ e }) => cat === 'all' || e.category === cat), [cat]);
  const opened = openId ? EXAMS.find((e) => e.id === openId) : null;

  return (
    <Box ref={rootRef} sx={fillH ? { height: fillH, overflow: 'hidden' } : undefined}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 2.5 }, px: { xs: 1.5, sm: 3 }, height: fillH ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 1.5, mb: 1.5, flexShrink: 0 }}>
          <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <BackToDashboard sx={{ mt: 0.5 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '-0.01em', lineHeight: 1.2 }}>Exams</Typography>
              <Typography variant="body2" color="text.secondary">{shown.length} top coding and aptitude exams. Apply on the official site, track how ready you are.</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
          <Button onClick={() => navigate('/mocks')} disableElevation startIcon={<QuizRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />} sx={{ height: 32, px: 1.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, bgcolor: PLAN_AMBER, color: COLOR_PALETTE.custom.black1B1200, '&:hover': { bgcolor: COLOR_PALETTE.amber[400] } }}>Mock tests</Button>
          <Box role="tablist" aria-label="Exam type" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
            {CATEGORIES.map((c) => {
              const on = cat === c.key;
              return (
                <ButtonBase
                  key={c.key} role="tab" aria-selected={on} onClick={() => setCat(c.key)}
                  sx={(t) => ({ px: 1.5, height: 32, borderRadius: RADII_PX.pill, fontFamily: 'inherit', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, border: `1px solid ${on ? PLAN_AMBER : t.palette.divider}`, bgcolor: on ? PLAN_AMBER : 'transparent', color: on ? COLOR_PALETTE.custom.black1B1200 : 'text.primary', transition: `background-color ${MOTION.fast}ms` })}
                >
                  {c.label}
                </ButtonBase>
              );
            })}
          </Box>
          </Box>
        </Box>

        <NextUpBanner />

        <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', flex: fillH ? 1 : 'none', minHeight: 0, gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1fr) 330px' }, gridTemplateRows: fillH ? 'minmax(0, 1fr)' : undefined }}>
          <Box className="autohide-scroll" sx={{ order: { xs: 2, lg: 1 }, minWidth: 0, ...(fillH && { alignSelf: 'stretch', height: '100%', overflowY: 'auto', pt: 0.25, pr: 1, pb: 2, pl: 0.25, scrollbarGutter: 'stable' }) }}>
            <Box sx={{ display: 'grid', gap: 1.5, alignItems: 'stretch', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))' } }}>
              {shown.map(({ e, i }) => <ExamCard key={e.id} exam={e} index={i} track={trackFor(e)} onOpen={() => setOpenId(e.id)} />)}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Always confirm dates, fees and eligibility on the official site. Names and logos belong to their owners and are shown only to identify each exam.
            </Typography>
          </Box>

          <Box className="autohide-scroll" sx={{ order: { xs: 1, lg: 2 }, minWidth: 0, ...(fillH && { alignSelf: 'start', maxHeight: '100%', overflowY: 'auto' }) }}>
            <PrepReadinessCard tracks={tracks} />
          </Box>
        </Box>
      </Container>

      {opened && <ExamDetails exam={opened} track={trackFor(opened)} onClose={() => setOpenId(null)} />}
    </Box>
  );
}
