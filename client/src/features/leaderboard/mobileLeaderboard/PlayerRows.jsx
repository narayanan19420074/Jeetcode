import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import { Avatar, Box, ButtonBase, Skeleton, Stack, Typography } from '@mui/material';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { tint } from '../../dashboard/dashboardUtils';
import { ACCENT, PODIUM, num } from './leaderboardConfig';

export function RankMark({ rank }) {
  const podium = PODIUM[rank];
  return (
    <Box
      aria-label={`Rank ${rank}`}
      sx={(t) => ({
        width: 32,
        height: 32,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: rank > 999 ? FONT_SIZES.caption : FONT_SIZES.bodyLg,
        fontWeight: podium ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium,
        fontVariantNumeric: 'tabular-nums',
        color: podium ? podium.color : 'var(--lib-muted)',
        bgcolor: podium ? (t.palette.mode === 'dark' ? tint(podium.color, 16) : podium.bg) : 'transparent',
      })}
    >
      {rank}
    </Box>
  );
}

export function YouTag() {
  return (
    <Typography component="span" sx={{ flexShrink: 0, px: 1, py: 0, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.caption, lineHeight: '18px', fontWeight: FONT_WEIGHTS.medium, color: ACCENT, bgcolor: tint(ACCENT, 16) }}>
      You
    </Typography>
  );
}

// Rank change since last week (all-time, everyone board only; the server sends null otherwise).
export function Move({ row }) {
  if (row.isNew) {
    return (
      <Typography component="span" sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', fontWeight: FONT_WEIGHTS.medium, color: ACCENT }}>
        New
      </Typography>
    );
  }
  const m = row.movement;
  if (m === null || m === undefined || m === 0) return null;
  const up = m > 0;
  const Icon = up ? ArrowDropUpRoundedIcon : ArrowDropDownRoundedIcon;
  return (
    <Box
      component="span"
      aria-label={`${up ? 'Up' : 'Down'} ${Math.abs(m)} since last week`}
      sx={{ display: 'inline-flex', alignItems: 'center', color: up ? 'var(--jc-easy)' : 'var(--jc-hard)', fontSize: FONT_SIZES.body, lineHeight: '20px', fontWeight: FONT_WEIGHTS.medium, fontVariantNumeric: 'tabular-nums' }}
    >
      <Icon aria-hidden sx={{ fontSize: FONT_SIZES.display, ml: -0.5 }} />
      {Math.abs(m)}
    </Box>
  );
}

// Same row as the dashboard lists: 48px avatar, 16/24 name, 14/20 muted line, divider underneath.
// Rank on the left, points on the right. Streak and tier details open in the player sheet.
export function PlayerRow({ row, isMe, onPick }) {
  return (
    <Box
      id={isMe ? 'lb-me' : undefined}
      sx={(t) => ({
        borderBottom: '1px solid',
        borderColor: 'var(--lib-divider)',
        '&:last-of-type': { borderBottom: 'none' },
        ...(isMe && { mx: -1, px: 1, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9), borderRadius: RADII_PX.card, borderColor: 'transparent' }),
      })}
    >
      <ButtonBase
        onClick={() => onPick(row)}
        aria-label={`${row.name}, rank ${row.rank}, ${num(row.score)} points. Open details`}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, py: 1.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <RankMark rank={row.rank} />
        <Avatar src={row.avatarUrl || undefined} alt="" sx={{ width: 48, height: 48, flexShrink: 0, fontSize: FONT_SIZES.subheading, fontWeight: FONT_WEIGHTS.medium }}>
          {row.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, minWidth: 0 }}>
              {row.name}
            </Typography>
            {isMe && <YouTag />}
          </Stack>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: 'var(--lib-muted)' }}>
            @{row.handle}
          </Typography>
        </Box>
        <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
          <Typography component="div" sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums' }}>
            {num(row.score)}
            <Typography component="span" sx={{ ml: 0.5, fontWeight: FONT_WEIGHTS.regular, fontSize: FONT_SIZES.body, color: 'var(--lib-muted)' }}>
              pts
            </Typography>
          </Typography>
          <Box sx={{ minHeight: 20 }}>
            <Move row={row} />
          </Box>
        </Box>
      </ButtonBase>
    </Box>
  );
}

export function SkeletonRows({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: '1px solid', borderColor: 'var(--lib-divider)' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={`${45 + ((i * 17) % 35)}%`} />
            <Skeleton variant="text" width="30%" />
          </Box>
          <Skeleton variant="text" width={52} />
        </Box>
      ))}
    </>
  );
}

// ---------- your position ----------
