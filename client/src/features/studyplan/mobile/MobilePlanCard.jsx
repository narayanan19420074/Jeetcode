import { Avatar, AvatarGroup, Box, Button, ButtonBase, IconButton, Stack, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { LIB_TRACKING, libPanelSx } from '../../dashboard/components/libraryStyle';
import { daysLeftInfo, fmtDay, fmtRange } from '../planUtils';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';
import { MUTED, TONE, accentFor, cardIconSx, dangerIconSx, solidBtn } from './mobileStyle';
import { Chip, PlanDisc } from './MobileUi';

// One sentence telling the learner what today looks like for this plan.
function planMessage(summary, todayLeft, behind, complete) {
  const s = summary;
  if (complete) return 'Plan complete. Every question is solved.';
  if (s.status === 'upcoming') return `Starts ${fmtDay(s.startDate)}.`;
  if (s.todayTotal === 0) return behind ? `${s.overdue} overdue. Catch up today.` : 'Nothing scheduled today.';
  if (todayLeft === 0) return "Today's goal is done.";
  return `${todayLeft} to solve today${s.overdue ? `, ${s.overdue} overdue` : ''}`;
}

export default function MobilePlanCard({ plan, today, onOpen, onAddFriend, onDelete }) {
  const s = plan.summary;
  const accent = accentFor(plan.id);
  const complete = s.status === 'completed';
  const behind = s.status === 'behind';
  const left = daysLeftInfo(s, today);
  const todayLeft = Math.max(0, s.todayTotal - s.todayDone);
  const leftColor = left.tone === 'primary' ? accent : TONE[left.tone] || accent;

  const message = planMessage(s, todayLeft, behind, complete);

  const cta = complete ? 'Review' : s.done > 0 ? 'Continue' : 'Start';

  return (
    <Box component="article" sx={{ ...libPanelSx, p: 2 }}>
      <ButtonBase
        onClick={onOpen}
        aria-label={`Open ${plan.title}`}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, textAlign: 'left', fontFamily: 'inherit', color: 'var(--lib-text)' }}
      >
        <PlanDisc percent={s.percent} accent={accent} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="h3" sx={{ fontSize: FONT_SIZES.subheading, lineHeight: '24px', fontWeight: FONT_WEIGHTS.bold, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}>
            {plan.title}
          </Typography>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: MUTED }}>
            {fmtRange(s.startDate, s.endDate)}
          </Typography>
        </Box>
      </ButtonBase>

      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
        <Chip color={leftColor}>{left.text}</Chip>
        <Chip>
          {s.total} {s.total === 1 ? 'Question' : 'Questions'}
        </Chip>
        <Chip>{s.done} Solved</Chip>
        {s.streak > 0 && (
          <Stack direction="row" sx={{ alignItems: 'center' }} aria-label={`${s.streak}-day streak`}>
            <LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.subheading, color: 'warning.main' }} />
            <Typography component="span" sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, fontVariantNumeric: 'tabular-nums' }}>
              {s.streak}d
            </Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.5 }}>
        <Typography sx={{ minWidth: 0, flex: 1, fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: behind && !complete ? 'var(--jc-hard)' : MUTED }}>{message}</Typography>
        <AvatarGroup max={3} sx={{ flexShrink: 0, '& .MuiAvatar-root': { width: 24, height: 24, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, border: '2px solid', borderColor: 'var(--lib-chip)' } }}>
          {plan.members.map((m) => (
            <Avatar key={m.id} src={m.avatarUrl || undefined} alt={m.name}>
              {m.name?.[0]?.toUpperCase()}
            </Avatar>
          ))}
        </AvatarGroup>
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 2 }}>
        <Button onClick={onOpen} disableElevation variant="contained" startIcon={<PlayArrowRoundedIcon />} sx={{ ...solidBtn(accent), flex: 1, minWidth: 0, height: 44, fontSize: FONT_SIZES.title }}>
          {cta}
        </Button>
        <IconButton aria-label={`Add friends to ${plan.title}`} onClick={(e) => onAddFriend(e.currentTarget, plan)} sx={cardIconSx}>
          <PersonAddAlt1RoundedIcon />
        </IconButton>
        <IconButton aria-label={plan.isOwner ? `Delete ${plan.title}` : `Leave ${plan.title}`} onClick={() => onDelete(plan)} sx={dangerIconSx}>
          {plan.isOwner ? <DeleteOutlineRoundedIcon /> : <ExitToAppRoundedIcon />}
        </IconButton>
      </Stack>
    </Box>
  );
}
