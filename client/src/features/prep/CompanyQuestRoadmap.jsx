import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, Button, ButtonBase, CircularProgress, IconButton, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { problemsApi } from '../../api/problemsApi';
import CompanyAvatar from '../../components/CompanyAvatar';
import { Confetti, CountUp, XpBar } from '../aptitude/components/MotionBits';
import { COLOR_PALETTE, withAlpha, FONT_WEIGHTS, FONT_SIZES, RADII_PX, RADII } from '../../app/design/designTokens';

const ROW = 108;
const GOLD = COLOR_PALETTE.amber[400];
const MAX_PAGES = 5; // 500 questions is plenty for one company path

// Candy colours per difficulty: [light, base, shadow]. Stars earned when the question is solved.
const CANDY = {
  Easy: { c: [COLOR_PALETTE.green[300], COLOR_PALETTE.green[500], COLOR_PALETTE.green[700]], stars: 1 },
  Medium: { c: [COLOR_PALETTE.orange[300], COLOR_PALETTE.orange[500], COLOR_PALETTE.orange[700]], stars: 2 },
  Hard: { c: [COLOR_PALETTE.pink[300], COLOR_PALETTE.pink[500], COLOR_PALETTE.pink[800]], stars: 3 },
};
const LOCKED = [COLOR_PALETTE.slate[300], COLOR_PALETTE.slate[400], COLOR_PALETTE.slate[500]];
const DONE = [COLOR_PALETTE.amber[200], COLOR_PALETTE.amber[400], COLOR_PALETTE.amber[700]];

const X = (i) => 50 + 27 * Math.sin(i * 0.95); // candy-crush style winding path, in % of the width
const Y = (i) => ROW / 2 + 20 + i * ROW;

// Pulls every question of one company (sorted easy to hard), 100 per request.
async function loadCompanyQuestions(company) {
  const all = [];
  let page = 1;
  let totalPages = 1;
  do {
    // eslint-disable-next-line no-await-in-loop
    const { data } = await problemsApi.list({ company, limit: 100, page, sort: 'difficulty-asc' });
    all.push(...data.data.items);
    totalPages = data.data.pagination?.totalPages || 1;
    page += 1;
  } while (page <= totalPages && page <= MAX_PAGES);
  return all;
}

function Candy({ colors, size, children, done }) {
  return (
    <Box
      sx={{
        position: 'relative', width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', color: COLOR_PALETTE.white,
        background: `radial-gradient(circle at 32% 26%, ${colors[0]} 0%, ${colors[1]} 58%, ${colors[2]} 130%)`,
        boxShadow: `0 6px 0 ${colors[2]}, 0 12px 18px -4px ${colors[2]}99, inset 0 -4px 6px ${colors[2]}66`,
        border: `3px solid ${withAlpha(COLOR_PALETTE.white, 0.75)}`,
        '&::after': { content: '""', position: 'absolute', top: '10%', left: '18%', width: '38%', height: '20%', borderRadius: '50%', background: withAlpha(COLOR_PALETTE.white, 0.65), transform: 'rotate(-28deg)', filter: 'blur(0.5px)' },
        ...(done ? { color: COLOR_PALETTE.custom.yellow5B3A00 } : null),
      }}
    >
      {children}
    </Box>
  );
}

export default function CompanyQuestRoadmap({ company, onBack }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState(null);
  const currentRef = useRef(null);

  useEffect(() => {
    let off = false;
    setItems(null);
    setFailed(false);
    loadCompanyQuestions(company.name)
      .then((list) => !off && setItems(list))
      .catch(() => !off && (setFailed(true), setItems([])));
    return () => { off = true; };
  }, [company.name]);

  const nodes = items || [];
  const solved = nodes.filter((p) => p.solvedByMe).length;
  const pct = nodes.length ? Math.round((solved / nodes.length) * 100) : 0;
  const stars = nodes.reduce((n, p) => n + (p.solvedByMe ? CANDY[p.difficulty]?.stars || 1 : 0), 0);
  const maxStars = nodes.reduce((n, p) => n + (CANDY[p.difficulty]?.stars || 1), 0);
  const current = nodes.findIndex((p) => !p.solvedByMe && !p.locked);
  const lastSolved = nodes.reduce((m, p, i) => (p.solvedByMe ? i : m), -1);
  const H = nodes.length * ROW + 150;
  const done = nodes.length > 0 && pct === 100;

  const pathTo = (last) => {
    let d = `M ${X(0)} ${Y(0)}`;
    for (let i = 0; i < last; i += 1) d += ` C ${X(i)} ${Y(i) + ROW / 2}, ${X(i + 1)} ${Y(i + 1) - ROW / 2}, ${X(i + 1)} ${Y(i + 1)}`;
    return d;
  };

  // Bring the "you are here" level into view once the path has popped in.
  useEffect(() => {
    if (!items || current < 3) return undefined;
    const t = setTimeout(() => currentRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }), 1100);
    return () => clearTimeout(t);
  }, [items, current, reduce]);

  const sheet = picked !== null ? nodes[picked] : null;
  const sheetColors = sheet ? (sheet.locked ? LOCKED : sheet.solvedByMe ? DONE : CANDY[sheet.difficulty]?.c || CANDY.Easy.c) : LOCKED;

  const sprinkles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ l: (i * 37) % 100, t: (i * 53) % 100, s: 6 + ((i * 7) % 12), d: 3 + ((i * 5) % 5), c: [COLOR_PALETTE.amber[200], COLOR_PALETTE.pink[300], COLOR_PALETTE.cyan[200], COLOR_PALETTE.green[200]][i % 4] })), []);

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', pb: 4 }}>
      {done && <Confetti pieces={60} />}

      {/* HERO: company, % complete, stars */}
      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: RADII_PX.card, p: { xs: 2, sm: 3 }, color: COLOR_PALETTE.white, background: `linear-gradient(140deg,${COLOR_PALETTE.violet[600]} 0%,${COLOR_PALETTE.pink[600]} 55%,${COLOR_PALETTE.orange[500]} 100%)`, boxShadow: `0 18px 36px -16px ${withAlpha(COLOR_PALETTE.violet[600], 0.75)}, inset 0 1px 0 ${withAlpha(COLOR_PALETTE.white, 0.35)}` }}>
        {sprinkles.map((s, i) => (
          <motion.span
            key={i} aria-hidden
            style={{ position: 'absolute', left: `${s.l}%`, top: `${s.t}%`, width: s.s, height: s.s, borderRadius: '50%', background: s.c, opacity: 0.55 }}
            animate={reduce ? undefined : { y: [0, -14, 0], scale: [1, 1.25, 1] }}
            transition={{ duration: s.d, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          />
        ))}
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <IconButton onClick={onBack} aria-label="Back to companies" size="small" sx={{ color: COLOR_PALETTE.white, bgcolor: withAlpha(COLOR_PALETTE.white, 0.2), '&:hover': { bgcolor: withAlpha(COLOR_PALETTE.white, 0.3) } }}>
            <ArrowBackRoundedIcon fontSize="small" />
          </IconButton>
          <CompanyAvatar name={company.name} logoUrl={company.logoUrl} size={40} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: 1.15 }}>{company.name}</Typography>
            <Typography sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, opacity: 0.9 }}>{nodes.length} levels · easy to hard</Typography>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.jumbo, lineHeight: 1, textShadow: `0 3px 0 ${withAlpha(COLOR_PALETTE.black, 0.18)}` }}>
              <CountUp value={pct} />%
            </Typography>
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, opacity: 0.95 }}>complete</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.black, 0.22) }}>
              <StarRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: GOLD }} />
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, fontVariantNumeric: 'tabular-nums' }}>{stars}/{maxStars}</Typography>
            </Box>
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, mt: 0.5 }}>{solved} of {nodes.length} solved</Typography>
          </Box>
        </Box>
        <Box sx={{ position: 'relative', mt: 1.5 }}>
          <XpBar pct={pct} color={GOLD} height={12} track={withAlpha(COLOR_PALETTE.black, 0.25)} />
        </Box>
        {company.examSlug && (
          <Button
            onClick={() => navigate(`/prep/${company.examSlug}`)} endIcon={<ArrowForwardRoundedIcon />} disableElevation size="small"
            sx={{ position: 'relative', mt: 1.5, fontWeight: FONT_WEIGHTS.bold, borderRadius: RADII_PX.pill, color: COLOR_PALETTE.white, bgcolor: withAlpha(COLOR_PALETTE.white, 0.2), '&:hover': { bgcolor: withAlpha(COLOR_PALETTE.white, 0.32) } }}
          >
            Exam pattern roadmap
          </Button>
        )}
      </Box>

      {/* PATH */}
      {items === null ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={30} /></Box>
      ) : nodes.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          {failed ? 'Could not load the questions. Try again in a moment.' : `No ${company.name} questions yet.`}
        </Typography>
      ) : (
        <Box sx={{ position: 'relative', height: H, mt: 1 }}>
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" width="100%" height={H} style={{ position: 'absolute', inset: 0 }} aria-hidden>
            <path d={pathTo(nodes.length - 1)} fill="none" stroke={withAlpha(COLOR_PALETTE.slate[400], 0.5)} strokeWidth="9" strokeLinecap="round" strokeDasharray="1 14" vectorEffect="non-scaling-stroke" />
            {lastSolved >= 0 && (
              <motion.path
                d={pathTo(Math.min(nodes.length - 1, lastSolved + 1))} fill="none" stroke={GOLD} strokeWidth="9" strokeLinecap="round" strokeDasharray="1 14" vectorEffect="non-scaling-stroke"
                initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
              />
            )}
          </svg>

          {nodes.map((p, i) => {
            const left = X(i) < 50;
            const isCurrent = i === current;
            const colors = p.locked ? LOCKED : p.solvedByMe ? DONE : CANDY[p.difficulty]?.c || CANDY.Easy.c;
            const earned = p.solvedByMe ? CANDY[p.difficulty]?.stars || 1 : 0;
            return (
              <Box key={p._id || p.slug}>
                <motion.div
                  ref={isCurrent ? currentRef : undefined}
                  initial={reduce ? false : { opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 15, delay: reduce ? 0 : 0.1 + Math.min(i, 14) * 0.07 }}
                  style={{ position: 'absolute', left: `${X(i)}%`, top: Y(i), x: '-50%', y: '-50%' }}
                >
                  {isCurrent && (
                    <>
                      <motion.span
                        aria-hidden
                        style={{ position: 'absolute', inset: -9, borderRadius: '50%', border: `3px solid ${colors[1]}` }}
                        animate={reduce ? undefined : { scale: [1, 1.35], opacity: [0.8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      />
                      <motion.div
                        aria-hidden
                        animate={reduce ? undefined : { y: [0, -6, 0] }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ position: 'absolute', top: -40, left: '50%', translateX: '-50%', whiteSpace: 'nowrap', zIndex: 2 }}
                      >
                        <Box sx={{ px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: COLOR_PALETTE.white, color: colors[2], fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, boxShadow: `0 4px 10px ${withAlpha(COLOR_PALETTE.black, 0.25)}`, position: 'relative', '&::after': { content: '""', position: 'absolute', left: '50%', bottom: -5, width: 10, height: 10, bgcolor: COLOR_PALETTE.white, transform: 'translateX(-50%) rotate(45deg)' } }}>
                          PLAY
                        </Box>
                      </motion.div>
                    </>
                  )}
                  <motion.div
                    animate={isCurrent && !reduce ? { y: [0, -4, 0] } : undefined}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ButtonBase
                      onClick={() => setPicked(i)} aria-label={`Level ${i + 1}: ${p.title}`}
                      component={motion.button} whileTap={reduce ? undefined : { scale: 0.88, rotate: -6 }} whileHover={reduce ? undefined : { scale: 1.08 }}
                      sx={{ borderRadius: '50%', display: 'block', WebkitTapHighlightColor: 'transparent' }}
                    >
                      <Candy colors={colors} size={isCurrent ? 68 : 58} done={p.solvedByMe}>
                        {p.locked ? <LockRoundedIcon sx={{ fontSize: FONT_SIZES.displayLg }} /> : p.solvedByMe ? <CheckRoundedIcon sx={{ fontSize: FONT_SIZES.hero }} /> : <Box component="span" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: isCurrent ? FONT_SIZES.display : FONT_SIZES.heading, textShadow: `0 2px 0 ${colors[2]}` }}>{i + 1}</Box>}
                      </Candy>
                    </ButtonBase>
                  </motion.div>
                  {earned > 0 && (
                    <Box sx={{ position: 'absolute', left: '50%', bottom: -20, transform: 'translateX(-50%)', display: 'flex' }}>
                      {Array.from({ length: earned }, (_, k) => (
                        <motion.span key={k} initial={reduce ? false : { scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 12, delay: 0.6 + k * 0.12 + Math.min(i, 14) * 0.05 }} style={{ display: 'flex' }}>
                          <StarRoundedIcon sx={{ fontSize: FONT_SIZES.heading, color: GOLD, filter: `drop-shadow(0 1px 1px ${withAlpha(COLOR_PALETTE.black, 0.35)})` }} />
                        </motion.span>
                      ))}
                    </Box>
                  )}
                </motion.div>

                <ButtonBase
                  onClick={() => setPicked(i)} tabIndex={-1} aria-hidden
                  sx={{
                    position: 'absolute', top: Y(i), transform: 'translateY(-50%)', display: 'block', textAlign: left ? 'left' : 'right',
                    ...(left ? { left: `calc(${X(i)}% + 46px)`, right: 6 } : { right: `calc(${100 - X(i)}% + 46px)`, left: 6 }),
                    opacity: p.locked ? 0.6 : 1,
                  }}
                >
                  <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.title}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: p.solvedByMe ? 'text.secondary' : CANDY[p.difficulty]?.c[1] }}>{p.solvedByMe ? 'Cleared' : p.difficulty}</Typography>
                </ButtonBase>
              </Box>
            );
          })}

          {/* finish line */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.4 + Math.min(nodes.length, 14) * 0.07 }}
            style={{ position: 'absolute', left: '50%', top: Y(nodes.length) + 6, x: '-50%', y: '-50%', textAlign: 'center' }}
          >
            <motion.div animate={done && !reduce ? { rotate: [-8, 8, -8], scale: [1, 1.12, 1] } : undefined} transition={{ duration: 1.4, repeat: Infinity }}>
              <Box sx={{ width: 76, height: 76, borderRadius: '50%', display: 'grid', placeItems: 'center', mx: 'auto', color: done ? COLOR_PALETTE.custom.yellow5B3A00 : COLOR_PALETTE.white, background: done ? `radial-gradient(circle at 30% 25%,${COLOR_PALETTE.yellow[200]},${COLOR_PALETTE.amber[500]})` : `radial-gradient(circle at 30% 25%,${LOCKED[0]},${LOCKED[1]})`, boxShadow: done ? `0 0 0 6px ${withAlpha(COLOR_PALETTE.amber[400], 0.3)}, 0 12px 24px ${withAlpha(COLOR_PALETTE.amber[500], 0.5)}` : `0 6px 0 ${COLOR_PALETTE.slate[500]}` }}>
                <EmojiEventsRoundedIcon sx={{ fontSize: FONT_SIZES.heroLg }} />
              </Box>
            </motion.div>
            <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, mt: 1 }}>{done ? `${company.name} cleared!` : 'Finish line'}</Typography>
          </motion.div>
        </Box>
      )}

      {/* tap a level: sheet slides up */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicked(null)} style={{ position: 'fixed', inset: 0, background: withAlpha(COLOR_PALETTE.slate[900], .5), zIndex: 1290 }} />
            <motion.div
              key="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1300, display: 'flex', justifyContent: 'center' }}
            >
              <Box sx={{ width: '100%', maxWidth: 560, bgcolor: 'background.paper', borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, p: 2.5, pb: 'calc(20px + env(safe-area-inset-bottom))', boxShadow: `0 -12px 40px ${withAlpha(COLOR_PALETTE.black, .3)}`, textAlign: 'center' }}>
                <Box sx={{ width: 40, height: 4, borderRadius: RADII_PX.pill, bgcolor: 'divider', mx: 'auto', mb: 2 }} />
                <Box sx={{ display: 'grid', placeItems: 'center', mb: 1.5 }}>
                  <motion.div initial={reduce ? false : { scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
                    <Candy colors={sheetColors} size={72} done={sheet.solvedByMe}>
                      {sheet.locked ? <LockRoundedIcon sx={{ fontSize: FONT_SIZES.hero }} /> : sheet.solvedByMe ? <CheckRoundedIcon sx={{ fontSize: FONT_SIZES.heroLg }} /> : <Box component="span" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, textShadow: `0 2px 0 ${sheetColors[2]}` }}>{picked + 1}</Box>}
                    </Candy>
                  </motion.div>
                </Box>
                <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: 1.25 }}>{sheet.title}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.white, bgcolor: CANDY[sheet.difficulty]?.c[1] }}>{sheet.difficulty}</Box>
                  <Box sx={{ display: 'flex' }}>
                    {[1, 2, 3].map((k) => <StarRoundedIcon key={k} sx={{ fontSize: FONT_SIZES.heading, color: k <= (CANDY[sheet.difficulty]?.stars || 1) ? GOLD : 'action.disabled' }} />)}
                  </Box>
                  {sheet.acceptanceRate > 0 && <Typography variant="caption" color="text.secondary" sx={{ fontWeight: FONT_WEIGHTS.bold }}>{sheet.acceptanceRate}% accepted</Typography>}
                </Box>
                {sheet.locked ? (
                  <Button fullWidth size="large" variant="contained" disableElevation startIcon={<LockRoundedIcon />} onClick={() => navigate('/pricing')} sx={{ fontWeight: FONT_WEIGHTS.bold, borderRadius: RADII_PX.card, py: 1.5 }}>Unlock with Pro</Button>
                ) : (
                  <Button
                    fullWidth size="large" variant="contained" disableElevation startIcon={<PlayArrowRoundedIcon />} onClick={() => navigate(`/workspace/${sheet.slug}`)}
                    sx={{ fontWeight: FONT_WEIGHTS.bold, borderRadius: RADII_PX.card, py: 1.5, color: COLOR_PALETTE.white, background: `linear-gradient(180deg, ${sheetColors[1]}, ${sheetColors[2]})`, boxShadow: `0 5px 0 ${sheetColors[2]}`, '&:hover': { background: `linear-gradient(180deg, ${sheetColors[1]}, ${sheetColors[2]})`, filter: 'brightness(1.08)' } }}
                  >
                    {sheet.solvedByMe ? 'Play again' : 'Play level'}
                  </Button>
                )}
              </Box>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Box>
  );
}
