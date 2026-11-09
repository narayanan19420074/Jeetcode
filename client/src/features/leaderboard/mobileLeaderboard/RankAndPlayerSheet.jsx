import { APT_COLOR, PT } from '../lbShared';
import { Avatar, Box, Button, ButtonBase, Drawer, IconButton, Stack, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { DIFF_COLOR, tint } from '../../dashboard/dashboardUtils';
import { FONT_SIZES, FONT_WEIGHTS, MOTION, RADII, RADII_PX } from '../../../app/design/designTokens';
import { LIB_TRACKING, LibraryFont, libIconBtnSx, libSectionTitleSx, libTintBtnSx, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { tierFor } from '../tiers';
import { ACCENT, num } from './leaderboardConfig';

export function MyRank({ me, canFind, onOpen, onFind }) {
  const { tier, next, progress, toNext } = tierFor(me.score);
  return (
    <Box
      sx={{ mt: 3, p: 2, borderRadius: RADII_PX.card, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
    >
      <ButtonBase
        onClick={onOpen}
        aria-label="Open your player details"
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontFamily: 'inherit', color: 'inherit', textAlign: 'left' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING }}>
            Your rank
          </Typography>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '34px', fontVariantNumeric: 'tabular-nums' }}>#{num(me.rank)}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right', minWidth: 0 }}>
          <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING }}>
            Points
          </Typography>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.displayLg, lineHeight: '34px', fontVariantNumeric: 'tabular-nums' }}>{num(me.score)}</Typography>
        </Box>
        <ChevronRightRoundedIcon sx={{ color: 'var(--lib-muted)', flexShrink: 0 }} />
      </ButtonBase>

      <Box sx={{ mt: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: tier.color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.subheading }} />
            {tier.name}
          </Stack>
          <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, fontVariantNumeric: 'tabular-nums' }}>
            {next ? `${num(toNext)} points to ${next.name}` : 'Top level reached'}
          </Typography>
        </Stack>
        <Box
          role="progressbar"
          aria-label={next ? `Progress to ${next.name}` : 'Top level reached'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          sx={{ mt: 1, height: 5, borderRadius: RADII_PX.pill, bgcolor: tint(tier.color, 20), overflow: 'hidden' }}
        >
          <Box sx={{ width: `${Math.max(progress, 3)}%`, height: '100%', borderRadius: RADII_PX.pill, bgcolor: tier.color, transition: `width ${MOTION.deliberate}ms` }} />
        </Box>
      </Box>

      {canFind && (
        <Button onClick={onFind} fullWidth disableElevation variant="contained" startIcon={<MyLocationRoundedIcon />} sx={{ ...libTintBtnSx, mt: 1.5, bgcolor: 'var(--lib-player)' }}>
          Find me in the list
        </Button>
      )}
    </Box>
  );
}

// ---------- player details sheet ----------

export function PlayerSheet({ row, onClose }) {
  const pal = useLibraryPalette();
  const open = Boolean(row);
  const info = row ? tierFor(row.score) : null;
  const tiles = row
    ? [
        ['Easy', row.easy, PT.easy, DIFF_COLOR.Easy],
        ['Medium', row.medium, PT.medium, DIFF_COLOR.Medium],
        ['Hard', row.hard, PT.hard, DIFF_COLOR.Hard],
        ['Aptitude', row.aptitude, PT.aptitude, APT_COLOR],
      ]
    : [];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: `${RADII.card}px ${RADII.card}px 0 0`, maxHeight: '90dvh', pb: 'env(safe-area-inset-bottom)', backgroundImage: 'none', bgcolor: pal.bg, color: pal.text } } }}
    >
      {row && info && (
        <LibraryFont>
        <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: 52, height: 52, fontSize: FONT_SIZES.heading, fontWeight: FONT_WEIGHTS.bold, border: `2px solid ${tint(info.tier.color, 70)}` }}>
              {row.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography component="h2" noWrap sx={{ ...libSectionTitleSx }}>
                {row.name}
              </Typography>
              <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING }}>
                @{row.handle}
                {row.company ? `, ${row.company}` : ''}
              </Typography>
            </Box>
            <IconButton onClick={onClose} aria-label="Close player details" sx={{ ...libIconBtnSx, bgcolor: pal.player, color: pal.text }}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
            {[`Rank #${num(row.rank)}`, `${num(row.score)} points`, ...(row.streak > 0 ? [`${row.streak}-day streak`] : [])].map((text) => (
              <Typography key={text} component="span" sx={{ px: 1.5, py: 0.5, borderRadius: RADII_PX.pill, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.medium, color: ACCENT, bgcolor: tint(ACCENT, 16), fontVariantNumeric: 'tabular-nums' }}>
                {text}
              </Typography>
            ))}
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mt: 2 }}>
            {tiles.map(([label, n, pts, color]) => (
              <Box key={label} sx={{ p: 1, textAlign: 'center', minWidth: 0, borderRadius: RADII_PX.card, bgcolor: tint(color, 14), border: `1px solid ${tint(color, 30)}` }}>
                <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.heading, lineHeight: 1.2, color, fontVariantNumeric: 'tabular-nums' }}>{n}</Typography>
                <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.caption }}>
                  {label}
                </Typography>
                <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.caption, fontVariantNumeric: 'tabular-nums' }}>
                  {n * pts} pts
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: info.tier.color, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.bodyLg }}>
                <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
                {info.tier.name}
              </Stack>
              <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, fontVariantNumeric: 'tabular-nums' }}>
                {info.next ? `${num(info.toNext)} points to ${info.next.name}` : 'Top level reached'}
              </Typography>
            </Stack>
            <Box
              role="progressbar"
              aria-label={info.next ? `Progress to ${info.next.name}` : 'Top level reached'}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={info.progress}
              sx={{ mt: 1, height: 8, borderRadius: RADII_PX.pill, bgcolor: tint(info.tier.color, 20), overflow: 'hidden' }}
            >
              <Box sx={{ width: `${Math.max(info.progress, 4)}%`, height: '100%', borderRadius: RADII_PX.pill, bgcolor: info.tier.color }} />
            </Box>
            <Typography color="var(--lib-muted)" sx={{ fontSize: FONT_SIZES.body, mt: 1 }}>
              {row.recent} solved in the last 7 days
            </Typography>
          </Box>
        </Box>
        </LibraryFont>
      )}
    </Drawer>
  );
}

// ---------- the page ----------
