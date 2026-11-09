import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Avatar, AvatarGroup, Box, Button, ButtonBase, Collapse, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, MOTION, RADII, RADII_PX, SHADOWS, withAlpha } from '../../../app/design/designTokens';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { PLAN_AMBER, PlanTaskRow, ProgressRing, daysTile, fmtDay, fmtRange, planTheme, relDay } from '../planUtils';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import { extractErrorMessage } from '../../../api/apiClient';
import { studyPlanApi } from '../../../api/studyPlanApi';
import { useEffect, useMemo, useState } from 'react';
import { mono } from './plannerStyle';

// Full question list of one plan, loaded the first time the card is expanded.
export function PlanQuestions({ planId, today }) {
  const [state, setState] = useState({ loading: true, items: [], members: [], error: '' });

  useEffect(() => {
    let cancelled = false;
    setState((p) => ({ ...p, loading: true, error: '' }));
    studyPlanApi
      .get(planId)
      .then(({ data }) => !cancelled && setState({ loading: false, items: data.data.items || [], members: data.data.members || [], error: '' }))
      .catch((err) => !cancelled && setState({ loading: false, items: [], members: [], error: extractErrorMessage(err) }));
    return () => { cancelled = true; };
  }, [planId]);

  const membersById = useMemo(() => new Map(state.members.map((m) => [m.userId, m])), [state.members]);
  const days = useMemo(() => {
    const out = [];
    state.items.forEach((it) => {
      const last = out[out.length - 1];
      if (last && last.date === it.date) last.items.push(it);
      else out.push({ date: it.date, items: [it] });
    });
    return out;
  }, [state.items]);

  if (state.loading) return <Box sx={{ p: 1.5 }}><Skeleton variant="rounded" height={52} sx={{ mb: 1, borderRadius: RADII_PX.card }} /><Skeleton variant="rounded" height={52} sx={{ borderRadius: RADII_PX.card }} /></Box>;
  if (state.error) return <Typography variant="body2" color="error" sx={{ p: 1.5 }}>{state.error}</Typography>;
  if (days.length === 0) return <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>No questions in this plan.</Typography>;

  return (
    <Box sx={{ maxHeight: 380, overflowY: 'auto', scrollbarWidth: 'thin', px: 1.5, py: 1 }}>
      {days.map((d) => {
        const doneCount = d.items.filter((i) => i.done).length;
        return (
          <Box key={d.date}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5, pb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.4, color: d.date === today ? 'primary.main' : 'text.secondary' }}>{relDay(d.date, today).toUpperCase()}</Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="caption" sx={[{ fontWeight: FONT_WEIGHTS.bold, color: doneCount === d.items.length ? 'success.main' : 'text.secondary' }, mono]}>{doneCount}/{d.items.length}</Typography>
            </Box>
            {d.items.map((it) => <PlanTaskRow key={it.id} item={it} doers={it.doneBy.map((u) => membersById.get(u)).filter((m) => m && !m.isMe)} />)}
          </Box>
        );
      })}
    </Box>
  );
}

export function PlanCard({ plan, today, expanded, onToggle, onOpen, onAddFriend, onDelete }) {
  const s = plan.summary;
  const theme = planTheme(plan.id);
  const tile = daysTile(s, today);
  const complete = s.status === 'completed';
  const behind = s.status === 'behind';
  const todayItems = plan.today || [];
  const todayLeft = Math.max(0, s.todayTotal - s.todayDone);

  let message;
  if (complete) message = 'Plan complete! Every question is solved.';
  else if (s.status === 'upcoming') message = `Starts ${fmtDay(s.startDate)}. Get ready!`;
  else if (s.todayTotal === 0) message = behind ? `${s.overdue} overdue. Catch up today!` : 'Nothing scheduled today. Get ahead!';
  else if (todayLeft === 0) message = "Today's goal done. Great work!";
  else message = `${todayLeft} to solve today${s.overdue ? ` · ${s.overdue} overdue` : ''}`;

  const cta = complete ? 'Review plan' : s.done > 0 ? 'Continue plan' : 'Start plan';
  const glassBtn = { width: 44, height: 44, flexShrink: 0, color: COLOR_PALETTE.white, bgcolor: withAlpha(COLOR_PALETTE.white, 0.16), '&:hover': { bgcolor: withAlpha(COLOR_PALETTE.white, 0.28) } };

  return (
    <Box sx={(t) => ({ borderRadius: RADII_PX.card, overflow: 'hidden', bgcolor: t.palette.background.paper, boxShadow: SHADOWS.card(COLOR_PALETTE.slate[950], 0.85) })}>
      <Box sx={{ position: 'relative', color: COLOR_PALETTE.white, background: theme.gradient, boxShadow: SHADOWS.highlight(0.18), overflow: 'hidden' }}>
        <Box aria-hidden sx={{ position: 'absolute', right: -50, top: -50, width: 190, height: 190, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(COLOR_PALETTE.amber[400], 0.26)}, transparent 70%)`, pointerEvents: 'none' }} />
        <Box aria-hidden sx={{ position: 'absolute', left: -40, bottom: 20, width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle, ${withAlpha(COLOR_PALETTE.white, 0.10)}, transparent 70%)`, pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', p: { xs: 2, sm: 2.5 } }}>
          {/* title + countdown tile (tap to open) */}
          <ButtonBase
            onClick={onOpen} aria-label={`Open ${plan.title}`}
            sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', borderRadius: RADII_PX.control }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.subheading, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{plan.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, color: withAlpha(COLOR_PALETTE.white, 0.88) }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: FONT_SIZES.title }} />
                <Typography sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold }}>{fmtRange(s.startDate, s.endDate)}</Typography>
              </Box>
              {behind && (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1, px: 1, py: 0.5, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.amber[400], 0.18), color: COLOR_PALETTE.amber[200] }}>
                  <ErrorOutlineRoundedIcon sx={{ fontSize: FONT_SIZES.body }} />
                  <Typography sx={{ fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold }}>{s.overdue} overdue</Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ flexShrink: 0, minWidth: 84, px: 1.5, py: 1, borderRadius: RADII_PX.card, textAlign: 'center', bgcolor: tile.urgent ? withAlpha(COLOR_PALETTE.amber[400], 0.2) : withAlpha(COLOR_PALETTE.white, 0.14), border: tile.urgent ? `1px solid ${withAlpha(COLOR_PALETTE.amber[400], 0.6)}` : '1px solid transparent' }}>
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: tile.big.length > 3 ? FONT_SIZES.heading : FONT_SIZES.hero, lineHeight: tile.big.length > 3 ? 1.5 : 1, fontVariantNumeric: 'tabular-nums', color: tile.urgent ? COLOR_PALETTE.amber[200] : COLOR_PALETTE.white }}>{tile.big}</Typography>
              {tile.label && <Typography sx={{ fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, mt: 0.5, color: withAlpha(COLOR_PALETTE.white, 0.85) }}>{tile.label}</Typography>}
            </Box>
          </ButtonBase>

          {/* what are we studying today: ring + speech bubble */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
            <ProgressRing value={s.percent} size={64} onDark />
            <Box sx={{ minWidth: 0, flex: 1, px: 1.5, py: 1, borderRadius: `${RADII.card}px ${RADII.card}px ${RADII.card}px ${RADII.badge}px`, bgcolor: withAlpha(COLOR_PALETTE.white, 0.14) }}>
              <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: 1.4, fontWeight: FONT_WEIGHTS.bold }}>{message}</Typography>
              {!complete && todayItems.slice(0, 3).map((it) => (
                <Typography key={it.id} noWrap sx={{ fontSize: FONT_SIZES.caption, mt: 0.5, fontWeight: FONT_WEIGHTS.semibold, opacity: it.done ? 0.6 : 0.95, textDecoration: it.done ? 'line-through' : 'none' }}>
                  {it.done ? '✓ ' : it.overdue ? '! ' : '• '}{it.title}
                </Typography>
              ))}
              {!complete && todayItems.length > 3 && <Typography sx={{ fontSize: FONT_SIZES.caption, opacity: 0.8 }}>+{todayItems.length - 3} more</Typography>}
            </Box>
          </Box>

          {/* solved bar */}
          <Box sx={{ mt: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
              <Typography sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.amber[200], fontVariantNumeric: 'tabular-nums' }}>{s.done}/{s.total} solved</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {s.streak > 0 && (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.title, color: PLAN_AMBER }} />
                    <Typography sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold }}>{s.streak}d</Typography>
                  </Box>
                )}
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, border: `2px solid ${withAlpha(COLOR_PALETTE.white, 0.9)}` } }}>
                  {plan.members.map((m) => <Avatar key={m.id} src={m.avatarUrl || undefined} alt={m.name}>{m.name?.[0]?.toUpperCase()}</Avatar>)}
                </AvatarGroup>
              </Box>
            </Box>
            <Box role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.percent} aria-label="Plan progress" sx={{ height: 10, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.white, 0.18), overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.max(s.percent, 4)}%`, height: '100%', borderRadius: RADII_PX.pill, background: `linear-gradient(90deg, ${PLAN_AMBER}, ${COLOR_PALETTE.amber[500]})`, transition: `width ${MOTION.progress}ms ease` }} />
            </Box>
          </Box>

          {/* open + quick actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Button
              onClick={onOpen} startIcon={<BoltRoundedIcon />} endIcon={<ArrowForwardRoundedIcon />} disableElevation
              sx={{ flex: 1, height: 44, borderRadius: RADII_PX.card, bgcolor: PLAN_AMBER, color: COLOR_PALETTE.custom.black1B1200, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg, '&:hover': { bgcolor: COLOR_PALETTE.amber[400] } }}
            >
              {cta}
            </Button>
            <Tooltip title="Add friends">
              <IconButton aria-label="Add friends to plan" onClick={(e) => onAddFriend(e.currentTarget)} sx={glassBtn}><PersonAddRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} /></IconButton>
            </Tooltip>
            <Tooltip title={plan.isOwner ? 'Delete plan' : 'Leave plan'}>
              <IconButton aria-label={plan.isOwner ? 'Delete plan' : 'Leave plan'} onClick={() => onDelete(plan)} sx={[glassBtn, { color: COLOR_PALETTE.red[200] }]}>
                {plan.isOwner ? <DeleteOutlineRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} /> : <ExitToAppRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* arrow: show / hide the questions right here */}
        <ButtonBase
          onClick={onToggle} aria-expanded={expanded} aria-label={expanded ? 'Hide questions' : 'Show questions'}
          sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, py: 1, bgcolor: withAlpha(COLOR_PALETTE.black, 0.24), fontFamily: 'inherit', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.white, '&:hover': { bgcolor: withAlpha(COLOR_PALETTE.black, 0.34) } }}
        >
          {expanded ? 'Hide questions' : `Show ${s.total} question${s.total === 1 ? '' : 's'}`}
          <ExpandMoreRoundedIcon sx={{ fontSize: FONT_SIZES.heading, transition: `transform ${MOTION.standard}ms`, transform: expanded ? 'rotate(180deg)' : 'none' }} />
        </ButtonBase>
      </Box>

      <Collapse in={expanded} unmountOnExit>
        <PlanQuestions planId={plan.id} today={today} />
      </Collapse>
    </Box>
  );
}

// ---------- main ----------
