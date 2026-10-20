import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Container, Box, Typography, Chip, Button, ButtonBase, LinearProgress, CircularProgress, Stack, Tooltip,
  Link as MuiLink, FormControlLabel, Checkbox,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CompanyAvatar from '../../components/CompanyAvatar';
import DifficultyChip from '../../components/DifficultyChip';
import Alien3D from '../aptitude/components/Alien3D';
import { Confetti, CountUp, FloatingSymbols, XpBar, XpPop, TiltCard } from '../aptitude/components/MotionBits';
import { prepApi } from '../../api/prepApi';
import { examCountdown, formatExamDate } from './examDate';
import { BadgeTile, Collapse, QuestCoin } from './PrepQuestBits';
import {
  CLEARED_AT, RANKS, buildBadges, formFor, levelFor, loadSeen, nextFormFor, pickBoss, pickNextQuest,
  saveSeen, sectionPct, sectionState,
} from './questLogic';

const WEAKNESS_COLOR = { weak: 'error', moderate: 'warning', strong: 'success' };
const WEAKNESS_LABEL = { weak: 'Weak area', moderate: 'Needs work', strong: 'Strong' };
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
          <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, maxWidth: 140, height: 4, borderRadius: 2, bgcolor: 'action.disabledBackground' }} />
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
  const [party, setParty] = useState(null); // { text, confetti } shown for a few seconds
  const partyTimer = useRef(null);

  const celebrate = useCallback((text, confetti = true) => {
    setParty({ text, confetti, id: Date.now() });
    clearTimeout(partyTimer.current);
    partyTimer.current = setTimeout(() => setParty(null), 4200);
  }, []);
  useEffect(() => () => clearTimeout(partyTimer.current), []);

  // Compare with what the student last saw: more points or a new level means a celebration on return.
  const applyData = useCallback((data) => {
    setRoadmap(data);
    if (data.readiness === null || data.readiness === undefined) return;
    const level = levelFor(data.readiness);
    const seen = loadSeen(companySlug);
    if (seen && data.readiness > seen.readiness) {
      const gained = Math.round((data.readiness - seen.readiness) * 10);
      celebrate(level > seen.level ? `Level up! You are now Level ${level}` : `+${gained} XP since last time`, level > seen.level);
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
      celebrate('Quest started! First XP is waiting');
    } finally {
      setEnrolling(false);
    }
  };

  const handleSelfReportToggle = async (section, checked) => {
    await prepApi.updateProgress(companySlug, section.id, { selfReported: checked });
    await load();
    if (checked) celebrate(`${section.name} cleared!`);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!roadmap) return null;

  const readiness = roadmap.readiness ?? 0;
  const level = levelFor(readiness);
  const form = formFor(readiness);
  const nextForm = nextFormFor(readiness);
  const toNext = level >= 10 ? 0 : Math.round((level * 10 - readiness) * 10);
  const levelPct = level >= 10 ? 100 : ((readiness - (level - 1) * 10) / 10) * 100;
  const countdown = roadmap.examDate ? examCountdown(roadmap.examDate) : null;
  const sections = roadmap.sections || [];
  const nextQuest = roadmap.enrolled ? pickNextQuest(sections) : null;
  const boss = pickBoss(sections);
  const badges = buildBadges(roadmap);
  const clearedCount = sections.filter((s) => sectionPct(s) >= CLEARED_AT).length;

  const jumpTo = (section) => {
    setOpenId(section.id);
    setTimeout(() => document.getElementById(`quest-${section.id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 60);
  };

  // Sections arrive in exam order; consecutive sections with the same group share a heading.
  const groups = [];
  sections.forEach((s) => {
    const last = groups[groups.length - 1];
    if (last && last.title === s.group) last.items.push(s);
    else groups.push({ title: s.group, items: [s] });
  });

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      {party?.confetti && <Confetti key={party.id} pieces={60} />}
      {party && (
        <Box key={`pop-${party.id}`} role="status" sx={{ position: 'fixed', left: 0, right: 0, bottom: { xs: 96, md: 48 }, display: 'flex', justifyContent: 'center', zIndex: 1500, pointerEvents: 'none' }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
            <Box sx={{ px: 2.5, py: 1.25, borderRadius: 99, bgcolor: '#0F172A', color: '#FDE68A', fontWeight: 800, boxShadow: '0 10px 30px rgba(0,0,0,.35)', border: '1px solid rgba(253,230,138,.4)' }}>{party.text}</Box>
          </motion.div>
        </Box>
      )}

      {/* HERO: your buddy, level, XP bar and what evolves next */}
      <TiltCard max={4} sx={{ mb: 3 }}>
        <Box sx={{ position: 'relative', overflow: 'hidden', flex: 1, borderRadius: 7, p: { xs: 2.25, sm: 3 }, color: '#fff', background: 'linear-gradient(150deg, #0B1230 0%, #1B2A6B 55%, #3B2A8C 100%)', boxShadow: '0 18px 40px rgba(27,42,107,.35)' }}>
          <FloatingSymbols count={12} opacity={0.1} />
          <Box sx={{ position: 'relative' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2, flexWrap: 'wrap' }} useFlexGap>
              <CompanyAvatar name={roadmap.name} logoUrl={roadmap.logoUrl} size={40} />
              <Box sx={{ flexGrow: 1, minWidth: 140 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.1 }}>{roadmap.name}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.75 }}>{roadmap.examDurationMinutes ? `${roadmap.examDurationMinutes} min exam` : 'Prep quest'}</Typography>
              </Box>
              {roadmap.examDate && countdown && (
                <Chip
                  icon={<CalendarMonthRoundedIcon sx={{ fontSize: '0.95rem !important', color: 'inherit !important' }} />}
                  label={countdown.over ? 'Season over · next date soon' : `${formatExamDate(roadmap.examDate)} · ${countdown.text}`}
                  size="small"
                  sx={{ color: '#fff', fontWeight: 700, bgcolor: countdown.over ? 'rgba(255,255,255,.14)' : 'rgba(250,204,21,.25)', border: '1px solid rgba(255,255,255,.25)' }}
                />
              )}
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 3 } }}>
              <Box sx={{ position: 'relative', flexShrink: 0, width: 120, display: 'grid', placeItems: 'center' }}>
                <Box aria-hidden sx={{ position: 'absolute', width: 130, height: 130, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,211,252,.45), transparent 70%)' }} />
                <Alien3D kind={form.kind} size={110} wave />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.6rem', sm: '2rem' }, lineHeight: 1.05 }}>Level {level}</Typography>
                <Typography sx={{ fontWeight: 700, color: '#FDE68A', mb: 1 }}>{RANKS[level - 1]} · {form.name}</Typography>
                <XpBar pct={levelPct} color="#FACC15" height={12} />
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75, opacity: 0.85, fontFamily: '"JetBrains Mono", monospace' }}>
                  <CountUp value={Math.round(readiness * 10)} /> XP{level < 10 ? ` · ${toNext} to Level ${level + 1}` : ' · max level'}
                </Typography>
              </Box>
            </Box>

            {nextForm && (
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 4, bgcolor: 'rgba(255,255,255,.08)', border: '1px dashed rgba(255,255,255,.3)' }}>
                <Box aria-hidden sx={{ width: 52, height: 62, overflow: 'hidden', display: 'grid', placeItems: 'center', filter: 'brightness(0) invert(1)', opacity: 0.28, flexShrink: 0 }}>
                  <Alien3D kind={nextForm.kind} size={48} wave={false} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Something is hiding at {nextForm.at} ready.
                  <Typography component="span" variant="caption" sx={{ display: 'block', opacity: 0.8, fontWeight: 500 }}>
                    {Math.max(1, Math.ceil(nextForm.at - readiness))} more points and your buddy evolves.
                  </Typography>
                </Typography>
              </Box>
            )}

            {!roadmap.enrolled && (
              <Button fullWidth size="large" variant="contained" disableElevation disabled={enrolling} onClick={handleEnroll} startIcon={<PlayArrowRoundedIcon />}
                sx={{ mt: 2, fontWeight: 800, borderRadius: 99, color: '#2B1B00', bgcolor: '#FACC15', '&:hover': { bgcolor: '#FDE047' } }}>
                {enrolling ? 'Starting…' : 'Start quest'}
              </Button>
            )}
          </Box>
        </Box>
      </TiltCard>

      {/* NEXT QUEST: the single best thing to do right now */}
      {nextQuest && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 20 }}>
          <ButtonBase onClick={() => jumpTo(nextQuest)} sx={{ width: '100%', mb: 3, p: 2, borderRadius: 5, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid', borderColor: 'primary.main', bgcolor: 'background.paper' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>Next quest</Typography>
              <Typography sx={{ fontWeight: 800 }} noWrap>{nextQuest.name}</Typography>
              <Typography variant="caption" color="text.secondary">Worth {nextQuest.weight}% of the exam · {sectionPct(nextQuest)}% done</Typography>
            </Box>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'primary.main', color: 'primary.contrastText', display: 'grid', placeItems: 'center' }}>
              <PlayArrowRoundedIcon />
            </Box>
          </ButtonBase>
        </motion.div>
      )}

      {/* BADGES: unlocked ones glow, locked ones tease how to earn them */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>Badges <Typography component="span" variant="caption" color="text.secondary">{badges.filter((b) => b.got).length}/{badges.length} unlocked</Typography></Typography>
        <Box sx={{ display: 'flex', gap: 1.25, overflowX: 'auto', pb: 1.5, mx: -0.5, px: 0.5 }}>
          {badges.map((b, i) => <BadgeTile key={b.id} badge={b} index={i} />)}
        </Box>
      </Box>

      {/* QUEST MAP */}
      <Typography sx={{ fontWeight: 800, mb: 0.25 }}>Quest map</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>{clearedCount} of {sections.length} cleared · reach {CLEARED_AT}% in a section to clear it</Typography>

      {groups.map((group, gi) => (
        <Box key={group.title || 'all'} sx={{ mb: 2 }}>
          {group.title && <Typography variant="overline" color="text.secondary" sx={{ display: 'block', fontWeight: 800, letterSpacing: '0.08em', mb: 1 }}>{group.title}</Typography>}
          {group.items.map((section, si) => {
            const pct = sectionPct(section);
            const state = sectionState(section);
            const isBoss = boss && section.id === boss.id && sections.length > 1;
            const isNext = nextQuest && nextQuest.id === section.id;
            const isOpen = openId === section.id;
            const isLast = gi === groups.length - 1 && si === group.items.length - 1;
            const Icon = state === 'cleared' ? CheckRoundedIcon : isBoss ? WhatshotRoundedIcon : SECTION_ICON[section.contentType] || MenuBookRoundedIcon;
            const meta = [section.questionCount ? `${section.questionCount} Q` : null, section.minutes ? `${section.minutes} min` : null].filter(Boolean).join(' · ');
            return (
              <Box key={section.id} id={`quest-${section.id}`} sx={{ display: 'flex', gap: 1.75, scrollMarginTop: 80 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <QuestCoin pct={pct} state={state} boss={isBoss} Icon={Icon} active={isNext} size={isBoss ? 62 : 54} />
                  {!isLast && <Box sx={{ flex: 1, width: 0, minHeight: 18, my: 0.5, borderLeft: '3px', borderLeftStyle: state === 'cleared' ? 'solid' : 'dotted', borderLeftColor: state === 'cleared' ? '#F5B301' : 'divider' }} />}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, mb: 1.5, borderRadius: 4, border: '1px solid', borderColor: isNext ? 'primary.main' : 'divider', bgcolor: 'background.paper', px: 1.75, py: 1.25 }}>
                  <ButtonBase onClick={() => setOpenId(isOpen ? null : section.id)} aria-expanded={isOpen} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, textAlign: 'left', justifyContent: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{section.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{[meta, `${section.weight}% of exam`].filter(Boolean).join(' · ')}</Typography>
                      <Stack direction="row" spacing={0.75} useFlexGap sx={{ mt: 0.75, flexWrap: 'wrap' }}>
                        {isBoss && <Chip label="Boss" size="small" sx={{ fontWeight: 800, bgcolor: '#F97316', color: '#fff', height: 22 }} />}
                        {section.selfReported && <Chip label="Self-reported" size="small" variant="outlined" sx={{ fontWeight: 600, borderStyle: 'dashed', height: 22 }} />}
                        {section.weakness && !section.selfReported && <Chip label={WEAKNESS_LABEL[section.weakness]} size="small" color={WEAKNESS_COLOR[section.weakness]} variant="outlined" sx={{ fontWeight: 600, height: 22 }} />}
                      </Stack>
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
        </Box>
      ))}
    </Container>
  );
}
