import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Container, Box, Typography, Chip, Button, ButtonBase, LinearProgress, CircularProgress, Stack, Tooltip,
  Link as MuiLink, FormControlLabel, Checkbox,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DifficultyChip from '../../components/DifficultyChip';
import Alien3D from '../aptitude/components/Alien3D';
import TcsBuddy from './TcsBuddy';
import { getBrandLogo } from '../../components/brandLogos';
import { Confetti, CountUp, XpBar } from '../aptitude/components/MotionBits';
import { prepApi } from '../../api/prepApi';
import { examCountdown, formatExamDate } from './examDate';
import { Collapse, QuestCoin } from './PrepQuestBits';
import { FORMS, RANKS, formFor, levelFor, loadSeen, pickNextQuest, saveSeen, sectionPct, sectionState } from './questLogic';

const PROBLEMS_SHOWN = 15;
const SECTION_ICON = { 'aptitude-pattern': CalculateRoundedIcon, 'external-only': MenuBookRoundedIcon, 'problem-filter': CodeRoundedIcon, 'learn-topic': MenuBookRoundedIcon };

// One aptitude pattern inside a quest: progress + Learn / Practice (or a lock).
function PatternRow({ pattern, hard, navigate }) {
  const pct = pattern.total ? Math.round((pattern.solved / pattern.total) * 100) : 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
      <Box sx={{ flex: '1 1 170px', minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>{pattern.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, maxWidth: 140, height: 4, borderRadius: '2px', bgcolor: 'action.disabledBackground' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{pattern.solved}/{pattern.total}</Typography>
        </Box>
      </Box>
      {pattern.unlocked ? (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => navigate(`/aptitude/${pattern.slug}/learn`)} sx={{ fontWeight: 600 }}>Learn</Button>
          <Button size="small" variant="contained" disableElevation onClick={() => navigate(`/aptitude/${pattern.slug}/practice${hard ? '?difficulty=hard' : ''}`)} sx={{ fontWeight: 600 }}>Practice</Button>
        </Stack>
      ) : (
        <Tooltip title="Pass the previous aptitude pattern's test to unlock this one" enterTouchDelay={0}>
          <Chip icon={<LockRoundedIcon />} label="Locked" size="small" variant="outlined" />
        </Tooltip>
      )}
    </Box>
  );
}

// The sheet's coding problems, each opens in the editor.
function ProblemList({ problems, total, navigate }) {
  const [all, setAll] = useState(false);
  const shown = all ? problems : problems.slice(0, PROBLEMS_SHOWN);
  return (
    <Box sx={{ mb: 1 }}>
      {shown.map((p) => (
        <ButtonBase
          key={p.slug}
          onClick={() => navigate(`/workspace/${p.slug}`)}
          sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.25, py: 1, px: 0.5, textAlign: 'left', borderTop: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}
        >
          {p.solved ? <CheckCircleRoundedIcon color="success" sx={{ fontSize: 20 }} /> : <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid', borderColor: 'divider' }} />}
          <Typography variant="body2" sx={{ flex: 1, minWidth: 0, fontWeight: 600 }} noWrap>{p.title}</Typography>
          <DifficultyChip difficulty={p.difficulty} />
        </ButtonBase>
      ))}
      {problems.length > PROBLEMS_SHOWN && (
        <Button size="small" onClick={() => setAll((v) => !v)} sx={{ mt: 0.5 }}>{all ? 'Show fewer' : `Show all ${total ?? problems.length}`}</Button>
      )}
    </Box>
  );
}

// Everything that used to live inside the accordion, unchanged in behaviour.
function QuestDetails({ section, navigate, onSelfReport }) {
  const hard = section.aptitudeDifficulty === 'hard';

  // legacy whole-feature links (sections with no pattern list)
  const goToLearn = () => {
    if (section.contentType === 'learn-topic' && section.learnTopicSlug) navigate(`/learn/${section.learnTopicSlug}`);
    else if (section.contentType === 'aptitude-pattern') navigate(section.aptitudePatternSlug ? `/aptitude/${section.aptitudePatternSlug}` : '/aptitude');
  };
  const goToPractice = () => {
    if (section.contentType === 'aptitude-pattern') {
      navigate(section.aptitudePatternSlug ? `/aptitude/${section.aptitudePatternSlug}/practice` : '/aptitude');
      return;
    }
    if (section.contentType !== 'problem-filter') return;
    const params = new URLSearchParams();
    (section.problemFilter?.companies || []).forEach((c) => params.append('company', c));
    if (section.problemFilter?.difficulty) params.set('difficulty', section.problemFilter.difficulty);
    navigate(params.toString() ? `/problems?${params.toString()}` : '/problems');
  };

  return (
    <Box sx={{ pt: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{section.description}</Typography>

      {section.trackable && !section.selfReported && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          {section.practiceCount} / {section.target} practiced{hard ? ' (hard questions)' : ''}
        </Typography>
      )}

      {section.contentType === 'external-only' && (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>No in-app practice for this section yet. Use the links below.</Typography>
          <FormControlLabel
            sx={{ mb: 1, display: 'flex' }}
            control={<Checkbox checked={Boolean(section.selfReported)} onChange={(e) => onSelfReport(section, e.target.checked)} />}
            label={
              <Typography variant="body2">
                I've reviewed this section
                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Self-reported: we can't measure activity on external sites, so this is an honesty checkbox, not a verified score.
                </Typography>
              </Typography>
            }
          />
        </>
      )}

      {section.patterns?.length > 0 && (
        <Box sx={{ mb: section.externalResources?.length ? 2 : 0 }}>
          {section.patterns.map((p) => <PatternRow key={p.slug} pattern={p} hard={hard} navigate={navigate} />)}
        </Box>
      )}

      {section.problems && (
        section.problems.length > 0
          ? <ProblemList problems={section.problems} total={section.problemTotal} navigate={navigate} />
          : <Typography variant="body2" color="text.secondary">No problems tagged for this section yet.</Typography>
      )}

      {!section.patterns && !section.problems && (
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', mb: section.externalResources?.length ? 2 : 0 }}>
          {(section.contentType === 'learn-topic' || section.contentType === 'aptitude-pattern') && (
            <Button size="small" variant="outlined" onClick={goToLearn} sx={{ fontWeight: 600 }}>Learn</Button>
          )}
          {(section.contentType === 'problem-filter' || section.contentType === 'aptitude-pattern') && (
            <Button size="small" variant="contained" disableElevation onClick={goToPractice} sx={{ fontWeight: 600 }}>Practice</Button>
          )}
        </Stack>
      )}

      {section.externalResources?.length > 0 && (
        <Stack spacing={0.5} sx={{ pb: 0.5 }}>
          {section.externalResources.map((r) => (
            <MuiLink key={r.url} href={r.url} target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', fontWeight: 600 }}>
              {r.label} <OpenInNewRoundedIcon sx={{ fontSize: '0.9rem' }} />
            </MuiLink>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function PrepRoadmapPage() {
  const { companySlug } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [party, setParty] = useState(null);
  const partyTimer = useRef(null);

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

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await prepApi.enroll(companySlug);
      await load();
    } finally {
      setEnrolling(false);
    }
  };

  const handleSelfReportToggle = async (section, checked) => {
    await prepApi.updateProgress(companySlug, section.id, { selfReported: checked });
    await load();
    if (checked) celebrate(`${section.name} cleared!`, true);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!roadmap) return null;

  const readiness = roadmap.readiness ?? 0;
  const level = levelFor(readiness);
  const form = formFor(readiness);
  const tier = FORMS.findIndex((f) => f.kind === form.kind);
  const brand = /^tcs/i.test(companySlug) ? getBrandLogo(roadmap.name) : null; // the TCS mark becomes the character
  const toNext = level >= 10 ? 0 : Math.max(1, Math.round((level * 10 - readiness) * 10));
  const levelPct = level >= 10 ? 100 : ((readiness - (level - 1) * 10) / 10) * 100;
  const countdown = roadmap.examDate ? examCountdown(roadmap.examDate) : null;
  const sections = roadmap.sections || [];
  const nextQuest = roadmap.enrolled ? pickNextQuest(sections) : null;

  const jumpTo = (section) => {
    setOpenId(section.id);
    setTimeout(() => document.getElementById(`quest-${section.id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 60);
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
      {party?.confetti && <Confetti key={party.id} pieces={50} />}
      {party && (
        <Box key={`pop-${party.id}`} role="status" sx={{ position: 'fixed', left: 0, right: 0, bottom: { xs: 96, md: 48 }, display: 'flex', justifyContent: 'center', zIndex: 1500, pointerEvents: 'none' }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: '99px', bgcolor: '#0F172A', color: '#FDE68A', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,.35)' }}>{party.text}</Box>
          </motion.div>
        </Box>
      )}

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
          <Button fullWidth size="large" variant="contained" disableElevation onClick={() => jumpTo(nextQuest)} startIcon={<PlayArrowRoundedIcon />}
            sx={{ mt: 2.5, fontWeight: 800, borderRadius: '99px', color: '#2B1B00', bgcolor: '#FACC15', '&:hover': { bgcolor: '#FDE047' } }}>
            Next: {nextQuest.name}
          </Button>
        ) : null}
      </Box>

      {/* ROADMAP: one path, you are here, exam day at the end */}
      {sections.map((section) => {
        const pct = sectionPct(section);
        const state = sectionState(section);
        const isNext = nextQuest && nextQuest.id === section.id;
        const isOpen = openId === section.id;
        const Icon = state === 'cleared' ? CheckRoundedIcon : SECTION_ICON[section.contentType] || MenuBookRoundedIcon;
        const status = state === 'cleared' ? 'Cleared' : isNext ? 'You are here' : state === 'progress' ? 'In progress' : 'Not started';
        return (
          <Box key={section.id} id={`quest-${section.id}`} sx={{ display: 'flex', gap: 2, scrollMarginTop: 80 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <QuestCoin pct={pct} state={state} Icon={Icon} active={isNext} size={54} />
              <Box sx={{ flex: 1, width: 0, minHeight: 20, my: 0.5, borderLeft: '3px', borderLeftStyle: state === 'cleared' ? 'solid' : 'dotted', borderLeftColor: state === 'cleared' ? '#F5B301' : 'divider' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, mb: 1.5, borderRadius: '14px', border: '1px solid', borderColor: isNext ? 'primary.main' : 'divider', bgcolor: 'background.paper', px: 1.75, py: 1.25, alignSelf: 'flex-start', width: '100%' }}>
              <ButtonBase onClick={() => setOpenId(isOpen ? null : section.id)} aria-expanded={isOpen} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left', justifyContent: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{section.name}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: isNext ? 800 : 500, color: isNext ? 'primary.main' : 'text.secondary' }}>{status}</Typography>
                </Box>
                <Typography sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{pct}%</Typography>
                <ExpandMoreRoundedIcon sx={{ transition: 'transform .25s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </ButtonBase>
              <Collapse open={isOpen}>
                <QuestDetails section={section} navigate={navigate} onSelfReport={handleSelfReportToggle} />
              </Collapse>
            </Box>
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
            {roadmap.examDate && countdown ? (countdown.over ? 'Next date soon' : `${formatExamDate(roadmap.examDate)} · ${countdown.text}`) : 'Date soon'}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
