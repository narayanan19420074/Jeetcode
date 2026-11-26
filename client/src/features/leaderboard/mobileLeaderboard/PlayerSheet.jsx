import { Avatar, Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { DIFF_COLOR, tint } from '../../dashboard/dashboardUtils';
import { LIB_TRACKING, LibraryFont, libIconBtnSx, libSectionTitleSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII, RADII_PX, SIZES } from '../../../app/design/designTokens';
import FriendRequestButton from '../../friends/common/FriendRequestButton';
import { APT_COLOR, PT } from '../lbShared';
import { tierFor } from '../tiers';
import { ACCENT, num } from './leaderboardConfig';

const solvedTilesOf = (row) => [
  ['Easy', row.easy, PT.easy, DIFF_COLOR.Easy],
  ['Medium', row.medium, PT.medium, DIFF_COLOR.Medium],
  ['Hard', row.hard, PT.hard, DIFF_COLOR.Hard],
  ['Aptitude', row.aptitude, PT.aptitude, APT_COLOR],
];

function PlayerSheetHeader({ row, tierColor, onClose }) {
  const pal = useLibraryPalette();
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
      <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: SIZES.leaderboard.panelAvatar, height: SIZES.leaderboard.panelAvatar, fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold, border: `2px solid ${tint(tierColor, 70)}` }}>
        {row.name?.[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography component="h2" noWrap sx={libSectionTitleSx}>{row.name}</Typography>
        <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING }}>
          @{row.handle}{row.company ? `, ${row.company}` : ''}
        </Typography>
      </Box>
      <IconButton onClick={onClose} aria-label="Close player details" sx={{ ...libIconBtnSx, bgcolor: pal.player, color: pal.text }}>
        <CloseRoundedIcon />
      </IconButton>
    </Stack>
  );
}

function PlayerStatChips({ row }) {
  const chips = [`Rank #${num(row.rank)}`, `${num(row.score)} points`, ...(row.streak > 0 ? [`${row.streak}-day streak`] : [])];
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
      {chips.map((text) => (
        <Typography key={text} component="span" sx={{ px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, color: ACCENT, bgcolor: tint(ACCENT, 16), fontVariantNumeric: 'tabular-nums' }}>
          {text}
        </Typography>
      ))}
    </Stack>
  );
}

function SolvedTile({ label, count, points, color }) {
  return (
    <Box sx={{ p: 1, textAlign: 'center', minWidth: SIZES.flexShrinkMinWidth, borderRadius: RADII_PX.card, bgcolor: tint(color, 14), border: `1px solid ${tint(color, 30)}` }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: 1.2, color, fontVariantNumeric: 'tabular-nums' }}>{count}</Typography>
      <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.caption }}>{label}</Typography>
      <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.caption, fontVariantNumeric: 'tabular-nums' }}>{count * points} pts</Typography>
    </Box>
  );
}

function SolvedTiles({ row }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mt: 2 }}>
      {solvedTilesOf(row).map(([label, count, points, color]) => <SolvedTile key={label} label={label} count={count} points={points} color={color} />)}
    </Box>
  );
}

function TierProgress({ row, info }) {
  const caption = info.next ? `${num(info.toNext)} points to ${info.next.name}` : 'Top level reached';
  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: info.tier.color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg }}>
          <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
          {info.tier.name}
        </Stack>
        <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, fontVariantNumeric: 'tabular-nums' }}>{caption}</Typography>
      </Stack>
      <Box
        role="progressbar"
        aria-label={info.next ? `Progress to ${info.next.name}` : 'Top level reached'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={info.progress}
        sx={{ mt: 1, height: SIZES.leaderboard.progress, borderRadius: RADII_PX.pill, bgcolor: tint(info.tier.color, 20), overflow: 'hidden' }}
      >
        <Box sx={{ width: `${Math.max(info.progress, 4)}%`, height: SIZES.fill, borderRadius: RADII_PX.pill, bgcolor: info.tier.color }} />
      </Box>
      <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, mt: 1 }}>{row.recent} solved in the last 7 days</Typography>
    </Box>
  );
}

// Everything about one player. Players are added as friends from here, so finding someone on the Leaderboard (search a
// name or @handle) and befriending them takes two taps.
function PlayerSheetBody({ row, onClose }) {
  const info = tierFor(row.score);
  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
      <PlayerSheetHeader row={row} tierColor={info.tier.color} onClose={onClose} />
      <PlayerStatChips row={row} />
      <Box sx={{ mt: 1.5 }}><FriendRequestButton member={row} /></Box>
      <SolvedTiles row={row} />
      <TierProgress row={row} info={info} />
    </Box>
  );
}

// Bottom sheet with the details of the player picked in the phone Leaderboard.
export function PlayerSheet({ row, onClose }) {
  const pal = useLibraryPalette();
  const paperSx = { borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, maxHeight: SIZES.bottomSheetMaxHeight, pb: 'env(safe-area-inset-bottom)', backgroundImage: 'none', bgcolor: pal.bg, color: pal.text };
  return (
    <Drawer anchor="bottom" open={Boolean(row)} onClose={onClose} slotProps={{ paper: { sx: paperSx } }}>
      {row && <LibraryFont><PlayerSheetBody row={row} onClose={onClose} /></LibraryFont>}
    </Drawer>
  );
}
