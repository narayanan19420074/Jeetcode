import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Container, Box, Typography, Button, ButtonBase, CircularProgress } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Alien3D from '../aptitude/components/Alien3D';
import { Confetti, CountUp, XpBar } from '../aptitude/components/MotionBits';
import { getBrandLogo } from '../../components/brandLogos';
import { prepApi } from '../../api/prepApi';
import { examCountdown, formatExamDate, pickExamDate } from './examDate';
import { QuestCoin } from './PrepQuestBits';
import SectionRoadmap from './SectionRoadmap';
import TcsBuddy from './TcsBuddy';
import { FORMS, RANKS, formFor, levelFor, loadSeen, pickNextQuest, saveSeen, sectionPct, sectionState } from './questLogic';

const SECTION_ICON = { 'aptitude-pattern': CalculateRoundedIcon, 'external-only': MenuBookRoundedIcon, 'problem-filter': CodeRoundedIcon, 'learn-topic': MenuBookRoundedIcon };

export default function PrepRoadmapPage() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const reduce = useReducedMotion();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [party, setParty] = useState(null);
  const partyTimer = useRef(null);
  const scrollY = useRef(0);
  const sectionId = sp.get('section');

  const celebrate = useCallback((text, confetti = false) => {
    setParty({ text, confetti, id: Date.now() });
    clearTimeout(partyTimer.current);
    partyTimer.current = setTimeout(() => setParty(null), 4000);
  }, []);
  useEffect(() => () => clearTimeout(partyTimer.current), []);

  // Compare with what the student last saw: more points or a new level means a small celebration on return.
  const applyData = useCallback((data) => {
    setRoadmap(data);
    if (data.readiness === null || data.readiness === undefined) return;
    const level = levelFor(data.readiness);
    const seen = loadSeen(companySlug);
    if (seen && data.readiness > seen.readiness) {
      const gained = Math.round((data.readiness - seen.readiness) * 10);
      celebrate(level > seen.level ? `Level up! Level ${level} unlocked` : `+${gained} XP`, level > seen.level);
    }
    saveSeen(companySlug, { readiness: data.readiness, level });
  }, [companySlug, celebrate]);

  const load = useCallback(() => prepApi.getRoadmap(companySlug).then(({ data }) => applyData(data.data)), [companySlug, applyData]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const openSection = (id) => {
    scrollY.current = window.scrollY;
    setSp({ section: String(id) });
  };
  // Back uses real history so the phone's back button does the same thing.
  const closeSection = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else setSp({}, { replace: true });
  };
  useEffect(() => {
    if (sectionId) return undefined;
    const t = setTimeout(() => window.scrollTo(0, scrollY.current), 260);
    return () => clearTimeout(t);
  }, [sectionId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await prepApi.enroll(companySlug);
      await load();
    } finally {
      setEnrolling(false);
    }
  };

  const handleSelfReportToggle = useCallback(async (section, checked) => {
    await prepApi.updateProgress(companySlug, section.id, { selfReported: checked });
    await load();
    if (checked) celebrate(`${section.name} cleared!`, true);
  }, [companySlug, load, celebrate]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!roadmap) return null;

  const readiness = roadmap.readiness ?? 0;
  const level = levelFor(readiness);
  const form = formFor(readiness);
  const tier = FORMS.findIndex((f) => f.kind === form.kind);
  const brand = /^tcs/i.test(companySlug) ? getBrandLogo(roadmap.name) : null; // the TCS mark becomes the character
  const toNext = level >= 10 ? 0 : Math.max(1, Math.round((level * 10 - readiness) * 10));
  const levelPct = level >= 10 ? 100 : ((readiness - (level - 1) * 10) / 10) * 100;
  const examDate = /^tcs/i.test(companySlug) ? pickExamDate(roadmap.examDate) : roadmap.examDate;
  const countdown = examDate ? examCountdown(examDate) : null;
  const sections = roadmap.sections || [];
  const nextQuest = roadmap.enrolled ? pickNextQuest(sections) : null;
  const openedSection = sectionId ? sections.find((s) => String(s.id) === sectionId) : null;

  const slide = reduce ? { opacity: 0 } : { opacity: 0, x: 48 };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 }, overflowX: 'clip' }}>
      {party?.confetti && <Confetti key={party.id} pieces={50} />}
      {party && (
        <Box key={`pop-${party.id}`} role="status" sx={{ position: 'fixed', left: 0, right: 0, bottom: { xs: 96, md: 48 }, display: 'flex', justifyContent: 'center', zIndex: 1500, pointerEvents: 'none' }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '99px', bgcolor: '#0F172A', color: '#FDE68A', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,.35)' }}>{party.text}</Box>
          </motion.div>
        </Box>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {openedSection ? (
          <motion.div key={`s-${openedSection.id}`} initial={slide} animate={{ opacity: 1, x: 0 }} exit={slide} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <SectionRoadmap section={openedSection} navigate={navigate} onSelfReport={handleSelfReportToggle} onBack={closeSection} />
          </motion.div>
        ) : (
          <motion.div key="list" initial={reduce ? { opacity: 0 } : { opacity: 0, x: -48 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -48 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            {/* HERO: how ready am I, what is the next level, what do I do now */}
            <Box sx={{ borderRadius: '20px', p: { xs: 2.25, sm: 3 }, color: '#fff', background: 'linear-gradient(150deg, #0B1230 0%, #1B2A6B 60%, #3B2A8C 100%)', boxShadow: '0 18px 40px rgba(27,42,107,.3)', mb: 4 }}>
              <Typography sx={{ fontWeight: 700, opacity: 0.8, mb: 1 }}>{roadmap.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ flexShrink: 0, width: 124, display: 'grid', placeItems: 'center' }}>
                  {brand ? <TcsBuddy path={brand.path} color={brand.color} tier={tier} size={116} /> : <Alien3D kind={form.kind} size={96} wave />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '2.4rem', lineHeight: 1 }}><CountUp value={Math.round(readiness)} />% <Typography component="span" sx={{ fontWeight: 700, fontSize: '1rem', opacity: 0.85 }}>ready</Typography></Typography>
                  <Typography sx={{ fontWeight: 700, color: '#FDE68A', mt: 0.5, mb: 1 }}>Level {level} · {RANKS[level - 1]}</Typography>
                  <XpBar pct={levelPct} color="#FACC15" height={10} />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.75, opacity: 0.85 }}>
                    {level < 10 ? `${toNext} XP to Level ${level + 1}` : 'Max level reached'}
                  </Typography>
                </Box>
              </Box>

              {!roadmap.enrolled ? (
                <Button fullWidth size="large" variant="contained" disableElevation disabled={enrolling} onClick={handleEnroll} startIcon={<PlayArrowRoundedIcon />}
                  sx={{ mt: 2.5, fontWeight: 800, borderRadius: '99px', color: '#2B1B00', bgcolor: '#FACC15', '&:hover': { bgcolor: '#FDE047' } }}>
                  {enrolling ? 'Starting…' : 'Start'}
                </Button>
              ) : nextQuest ? (
                <Button fullWidth size="large" variant="contained" disableElevation onClick={() => openSection(nextQuest.id)} startIcon={<PlayArrowRoundedIcon />}
                  sx={{ mt: 2.5, fontWeight: 800, borderRadius: '99px', color: '#2B1B00', bgcolor: '#FACC15', '&:hover': { bgcolor: '#FDE047' } }}>
                  Next: {nextQuest.name}
                </Button>
              ) : null}
            </Box>

            {/* ROADMAP: one path, tap a stop to open its own roadmap */}
            {sections.map((section) => {
              const pct = sectionPct(section);
              const state = sectionState(section);
              const isNext = nextQuest && nextQuest.id === section.id;
              const Icon = state === 'cleared' ? CheckRoundedIcon : SECTION_ICON[section.contentType] || MenuBookRoundedIcon;
              const status = state === 'cleared' ? 'Cleared' : isNext ? 'You are here' : state === 'progress' ? 'In progress' : 'Not started';
              return (
                <Box key={section.id} sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <ButtonBase onClick={() => openSection(section.id)} aria-label={`Open ${section.name}`} sx={{ borderRadius: '50%' }}>
                      <QuestCoin pct={pct} state={state} Icon={Icon} active={isNext} size={54} />
                    </ButtonBase>
                    <Box sx={{ flex: 1, width: 0, minHeight: 20, my: 0.5, borderLeft: '3px', borderLeftStyle: state === 'cleared' ? 'solid' : 'dotted', borderLeftColor: state === 'cleared' ? '#F5B301' : 'divider' }} />
                  </Box>
                  <ButtonBase
                    onClick={() => openSection(section.id)}
                    sx={{ flex: 1, minWidth: 0, mb: 1.5, borderRadius: '14px', border: '1px solid', borderColor: isNext ? 'primary.main' : 'divider', bgcolor: 'background.paper', px: 1.75, py: 1.25, alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left', justifyContent: 'flex-start' }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{section.name}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: isNext ? 800 : 500, color: isNext ? 'primary.main' : 'text.secondary' }}>{status}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{pct}%</Typography>
                    <ChevronRightRoundedIcon />
                  </ButtonBase>
                </Box>
              );
            })}

            {/* the finish line */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, color: '#4A3300', background: 'radial-gradient(circle at 30% 25%, #FFE58A, #F5B301)', boxShadow: '0 8px 20px rgba(245,179,1,.4)' }}>
                <EmojiEventsRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800 }}>Exam day</Typography>
                <Typography variant="caption" color="text.secondary">
                  {examDate && countdown ? (countdown.over ? 'Next date soon' : `${formatExamDate(examDate)} · ${countdown.text}`) : 'Date soon'}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
}
