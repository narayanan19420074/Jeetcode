import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, ButtonBase, Collapse, Container, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import { prepApi } from '../../api/prepApi';
import CompanyAvatar from '../../components/CompanyAvatar';
import PrepReadinessCard from '../../components/PrepReadinessCard';
import useViewportFill from '../dashboard/useViewportFill';
import { PLAN_AMBER, PLAN_THEMES } from '../studyplan/planUtils';
import { daysUntil, formatExamDate, pickExamDate } from '../prep/examDate';
import { CATEGORIES, EXAMS } from './examsData';

const norm = (s) => String(s || '').trim().toLowerCase();
const readinessOf = (pct) => Math.max(0, Math.min(100, Math.round(pct ?? 0)));

function Chip({ children }) {
  return <Box sx={{ px: 1.1, py: 0.35, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.14)', fontSize: 12, fontWeight: 700 }}>{children}</Box>;
}

// One exam, styled like a study plan card: gradient, glow, date tile, readiness bar, amber Apply button.
function ExamCard({ exam, index, track }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const theme = PLAN_THEMES[index % PLAN_THEMES.length];

  const examOn = exam.id === 'tcs-nqt' ? pickExamDate(track?.examDate) : exam.examOn;
  const toExam = examOn ? daysUntil(examOn) : null;
  const closed = exam.applyBy ? daysUntil(exam.applyBy) < 0 : false;
  const tile = toExam === null ? null : toExam < 0 ? { big: 'Done', label: 'this cycle' } : toExam === 0 ? { big: 'Today', label: '' } : { big: String(toExam), label: toExam === 1 ? 'day to exam' : 'days to exam' };

  const hasTrack = Boolean(track);
  const readiness = hasTrack && track.readiness !== null ? readinessOf(track.readiness) : null;

  const prepare = () => (hasTrack ? navigate(`/prep/${track.slug}`) : navigate(exam.practice[0].to));
  const glass = { color: '#fff', bgcolor: 'rgba(255,255,255,0.16)', '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' } };

  return (
    <Box sx={(t) => ({ borderRadius: '16px', overflow: 'hidden', bgcolor: t.palette.background.paper, boxShadow: '0 14px 28px -16px rgba(2,6,23,0.85)' })}>
      <Box sx={{ position: 'relative', overflow: 'hidden', color: '#fff', background: theme.gradient, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)' }}>
        <Box aria-hidden sx={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.26), transparent 70%)', pointerEvents: 'none' }} />
        <Box aria-hidden sx={{ position: 'absolute', left: -40, bottom: 20, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', p: { xs: 2, sm: 2.25 } }}>
          {/* name + date tile */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.25, minWidth: 0 }}>
              <CompanyAvatar name={exam.brand || exam.short} size={46} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.2, overflowWrap: 'anywhere' }}>{exam.name}</Typography>
                <Typography sx={{ fontSize: '0.78rem', opacity: 0.85, mt: 0.25 }}>by {exam.org}</Typography>
              </Box>
            </Box>
            {tile && (
              <Box sx={{ flexShrink: 0, minWidth: 78, px: 1.25, py: 0.8, borderRadius: '14px', textAlign: 'center', bgcolor: 'rgba(255,255,255,0.14)' }}>
                <Typography sx={{ fontWeight: 900, fontSize: tile.big.length > 3 ? '1.15rem' : '1.7rem', lineHeight: tile.big.length > 3 ? 1.5 : 1, fontVariantNumeric: 'tabular-nums' }}>{tile.big}</Typography>
                {tile.label && <Typography sx={{ fontSize: '0.64rem', fontWeight: 700, mt: 0.3, opacity: 0.85 }}>{tile.label}</Typography>}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
            {exam.tags.map((t) => <Chip key={t}>{t}</Chip>)}
            <Chip>{exam.mode}</Chip>
          </Box>

          <Typography sx={{ fontSize: '0.84rem', lineHeight: 1.45, fontWeight: 600, mt: 1.5, opacity: 0.95 }}>{exam.blurb}</Typography>

          {/* dates */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25, opacity: 0.92 }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {examOn ? `Exam ${formatExamDate(examOn)}` : 'Dates are announced on the official site'}
              {exam.applyBy && ` · ${closed ? 'Applications closed' : `Apply by ${formatExamDate(exam.applyBy)}`}`}
            </Typography>
          </Box>

          {/* readiness */}
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#FDE68A' }}>Readiness</Typography>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{readiness !== null ? `${readiness}%` : hasTrack ? 'Log in to track' : 'Prep track coming soon'}</Typography>
            </Box>
            <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={readiness ?? 0} aria-label={`${exam.name} readiness`} sx={{ height: 10, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.18)', overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.max(readiness ?? 0, 4)}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${PLAN_AMBER}, #F59E0B)`, transition: 'width .6s ease', opacity: readiness === null ? 0.35 : 1 }} />
            </Box>
          </Box>

          {/* actions */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.75 }}>
            <Button
              component="a" href={exam.applyUrl} target="_blank" rel="noopener noreferrer" disableElevation endIcon={<LaunchRoundedIcon />}
              sx={{ flex: 1, height: 44, borderRadius: '14px', bgcolor: PLAN_AMBER, color: '#1B1200', fontWeight: 800, fontSize: '0.92rem', '&:hover': { bgcolor: '#F5B50F' } }}
            >
              {closed ? 'Official site' : 'Apply'}
            </Button>
            <Button onClick={prepare} disableElevation startIcon={<BoltRoundedIcon />} endIcon={<ArrowForwardRoundedIcon />} sx={[{ flex: 1, height: 44, borderRadius: '14px', fontWeight: 800, fontSize: '0.92rem' }, glass]}>
              {hasTrack ? (readiness ? 'Continue prep' : 'Start prep') : 'Prepare'}
            </Button>
          </Box>
        </Box>

        <ButtonBase
          onClick={() => setOpen((v) => !v)} aria-expanded={open}
          sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, py: 1, bgcolor: 'rgba(0,0,0,0.24)', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.34)' } }}
        >
          {open ? 'Hide pattern' : 'Pattern & eligibility'}
          <ExpandMoreRoundedIcon sx={{ fontSize: 20, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }} />
        </ButtonBase>
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box sx={{ p: 2, display: 'grid', gap: 1.25 }}>
          {exam.pattern.map(([k, v]) => (
            <Box key={k}>
              <Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>{k}</Typography>
              <Typography variant="body2" color="text.secondary">{v}</Typography>
            </Box>
          ))}
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>Who can apply</Typography>
            <Typography variant="body2" color="text.secondary">{exam.eligibility}</Typography>
          </Box>
          {!hasTrack && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {exam.practice.map((p) => <Button key={p.to} size="small" variant="outlined" onClick={() => navigate(p.to)} sx={{ fontWeight: 700 }}>{p.label}</Button>)}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// Exams: the top coding and aptitude exams in India, one card each, with an Apply button (official site)
// and the learner's readiness. On wide screens the page is one window tall (the cards scroll by themselves)
// with the readiness card on the right, like the Companies page.
export default function ExamsPage() {
  const theme = useTheme();
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const rootRef = useRef(null);
  const fillH = useViewportFill(rootRef, isLg);
  const [tracks, setTracks] = useState(null);
  const [cat, setCat] = useState('all');

  useEffect(() => {
    prepApi.listCompanies().then(({ data }) => setTracks(data.data.items || [])).catch(() => setTracks([]));
  }, []);

  const trackFor = (exam) => (tracks || []).find((t) => t.slug === exam.trackSlug || norm(t.name) === norm(exam.short)) || null;
  const shown = useMemo(() => EXAMS.map((e, i) => ({ e, i })).filter(({ e }) => cat === 'all' || e.category === cat), [cat]);

  return (
    <Box ref={rootRef} sx={fillH ? { height: fillH, overflow: 'hidden' } : undefined}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 3 }, height: fillH ? '100%' : 'auto' }}>
        <Box sx={{ display: 'grid', gap: 2.5, alignItems: 'start', height: fillH ? '100%' : 'auto', gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: 'minmax(0,1fr) 340px' }, gridTemplateRows: fillH ? 'minmax(0, 1fr)' : undefined }}>
          <Box sx={{ order: { xs: 2, lg: 1 }, minWidth: 0, minHeight: 0, height: fillH ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 1.5, flexShrink: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.01em' }}>Exams</Typography>
              <Typography variant="body2" color="text.secondary">Top coding and aptitude exams in India. Apply on the official site and track how ready you are.</Typography>
            </Box>

            <Box role="tablist" aria-label="Exam type" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2, flexShrink: 0 }}>
              {CATEGORIES.map((c) => {
                const on = cat === c.key;
                return (
                  <ButtonBase
                    key={c.key} role="tab" aria-selected={on} onClick={() => setCat(c.key)}
                    sx={(t) => ({ px: 1.75, height: 34, borderRadius: 99, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, border: `1px solid ${on ? PLAN_AMBER : t.palette.divider}`, bgcolor: on ? PLAN_AMBER : 'transparent', color: on ? '#1B1200' : 'text.primary', transition: 'background-color .15s' })}
                  >
                    {c.label}
                  </ButtonBase>
                );
              })}
            </Box>

            <Box className="autohide-scroll" sx={fillH ? { flex: 1, minHeight: 0, overflowY: 'auto', pr: 1, pb: 2, scrollbarGutter: 'stable' } : undefined}>
              <Box sx={{ display: 'grid', gap: 2, alignItems: 'start', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' } }}>
                {shown.map(({ e, i }) => <ExamCard key={e.id} exam={e} index={i} track={trackFor(e)} />)}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2.5, textAlign: 'center' }}>
                Always confirm dates, fees and eligibility on the official site. Names and logos belong to their owners and are shown only to identify each exam.
              </Typography>
            </Box>
          </Box>

          <Box className="autohide-scroll" sx={{ order: { xs: 1, lg: 2 }, minWidth: 0, ...(fillH && { overflowY: 'auto', maxHeight: '100%' }) }}>
            <PrepReadinessCard tracks={tracks} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
