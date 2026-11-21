import { Avatar, Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { railCardSx } from '../../dashboard/components/rail/railCardStyles';
import { SOFT } from '../../dashboard/components/rail/railTokens';
import { PLAN_AMBER } from '../../studyplan/planUtils';
import { COLOR_PALETTE, withAlpha, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SHADOWS, SIZES } from '../../../app/design/designTokens';
import { tierFor } from '../tiers';
import { CountUp, Mix, YouChip } from '../lbShared';
import { TABULAR, FOCUS_RING } from './lbLook';

const chipSx = { display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, borderRadius: RADII_PX.pill, bgcolor: withAlpha(COLOR_PALETTE.white, 0.16), fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, lineHeight: 1.7 };

function TopPlayerIdentity({ row, isMe }) {
  const { tier } = tierFor(row.score);
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, mb: 0.5, borderRadius: RADII_PX.pill, bgcolor: alpha(PLAN_AMBER, 0.2), color: PLAN_AMBER, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, letterSpacing: 0.6 }}>
        <EmojiEventsRoundedIcon sx={{ fontSize: FONT_SIZES.body }} />TOP PLAYER
      </Box>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.display, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.2 }}>{row.name}{isMe && <YouChip />}</Typography>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.caption, color: SOFT }}>@{row.handle}{row.company ? `, ${row.company}` : ''}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
        <Box sx={chipSx}><WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.body, color: COLOR_PALETTE.amber[200] }} />{tier.name}</Box>
        <Box sx={chipSx}><LocalFireDepartmentRoundedIcon sx={{ fontSize: FONT_SIZES.body, color: PLAN_AMBER }} />{row.streak}d</Box>
      </Box>
    </Box>
  );
}

function TopPlayerScore({ row }) {
  return (
    <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
      <Typography sx={[{ fontSize: FONT_SIZES.hero, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.1 }, TABULAR]}>
        <CountUp value={row.score} /><Box component="span" sx={{ ml: 0.5, fontSize: FONT_SIZES.caption, color: SOFT }}>pts</Box>
      </Typography>
      <Typography sx={{ fontSize: FONT_SIZES.caption, color: SOFT }}>{row.recent > 0 ? `+${row.recent} this week` : `${row.solved} solved`}</Typography>
    </Box>
  );
}

const cardSx = (selected) => [
  ...railCardSx,
  { display: 'block', width: SIZES.fill, textAlign: 'left', fontFamily: 'inherit', '&.Mui-focusVisible': FOCUS_RING },
  selected && { boxShadow: `${SHADOWS.ring(PLAN_AMBER)}, ${SHADOWS.cardLit(COLOR_PALETTE.slate[950], 0.85, 0.18)}` },
];

// The leader of the board, on the same indigo card as the streak calendar of the dashboard.
export default function TopPlayerCard({ row, isMe, selected, onPick }) {
  return (
    <ButtonBase onClick={(event) => onPick(event, row)} aria-label={`${row.name}, top player, ${row.score} points`} sx={cardSx(selected)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: SIZES.leaderboard.topAvatar, height: SIZES.leaderboard.topAvatar, fontSize: FONT_SIZES.display, fontWeight: FONT_WEIGHTS.bold, color: COLOR_PALETTE.white, bgcolor: withAlpha(COLOR_PALETTE.white, 0.2) }}>{row.name?.[0]?.toUpperCase()}</Avatar>
        <TopPlayerIdentity row={row} isMe={isMe} />
        <TopPlayerScore row={row} />
      </Box>
      <Mix row={row} onDark sx={{ mt: 2 }} />
    </ButtonBase>
  );
}
