import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, ButtonBase, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { LIB_ACCENT, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { COLOR_PALETTE, FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { TIERS } from '../tiers';
import { accentTileSx, cardSx, insetPillSx } from './lbLook';
import { TRACKS } from './boardOptions';

const ICON_TILE = SIZES.leaderboard.controlSize;

function IconMessage({ Icon, title, subtitle, action }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={accentTileSx(ICON_TILE)}><Icon /></Box>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography noWrap title={title} sx={{ fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, lineHeight: 1.3 }}>{title}</Typography>
        <Typography noWrap title={subtitle} sx={{ fontSize: FONT_SIZES.caption, color: pal.muted }}>{subtitle}</Typography>
      </Box>
      {action}
    </Box>
  );
}

export function SignInCard() {
  const pal = useLibraryPalette();
  const action = <Button component={RouterLink} to="/login" size="small" variant="contained" disableElevation startIcon={<BoltRoundedIcon />} sx={{ fontWeight: FONT_WEIGHTS.bold }}>Sign in</Button>;
  return (
    <Box sx={[cardSx(pal), { p: 2 }]}>
      <IconMessage Icon={EmojiEventsRoundedIcon} title="See where you stand" subtitle="Sign in to get your rank." action={action} />
    </Box>
  );
}

function focusMessage({ me, neighbors, ranked, isAuthenticated, period, points }) {
  if (me && neighbors?.above) {
    const { above } = neighbors;
    return { Icon: TrendingUpRoundedIcon, title: `${above.gap.toLocaleString()} pts to catch ${above.name}`, subtitle: `About ${Math.ceil(above.gap / points.medium)} Medium questions` };
  }
  if (me && neighbors) return { Icon: EmojiEventsRoundedIcon, title: me.rank === 1 ? 'You lead this board' : 'Keep solving', subtitle: 'Solve more to stay ahead.' };
  if (isAuthenticated && !ranked) return { Icon: BoltRoundedIcon, title: 'Not ranked yet', subtitle: `Solve a question${period === 'all' ? '' : ' in this period'} to enter.` };
  return null;
}

function TrackPills({ value, onChange }) {
  const pal = useLibraryPalette();
  return (
    <Box role="group" aria-label="Leaderboard track" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
      {TRACKS.map(({ value: key, label, Icon }) => (
        <ButtonBase key={key} aria-pressed={value === key} onClick={() => onChange(key)} sx={[insetPillSx(pal, value === key), { px: 1, fontSize: FONT_SIZES.body }]}>
          <Icon sx={{ fontSize: FONT_SIZES.title }} />{label}
        </ButtonBase>
      ))}
    </Box>
  );
}

// What to do next to climb ("12 pts to catch Asha"), with the track switch under it.
export function FocusCard({ track, onTrack, ...message }) {
  const pal = useLibraryPalette();
  const content = focusMessage(message);
  return (
    <Box sx={[cardSx(pal), { p: 2, display: 'grid', gap: 1.5 }]}>
      {content && <IconMessage {...content} />}
      <TrackPills value={track} onChange={onTrack} />
    </Box>
  );
}

// The six tiers; the player's own tier is filled.
export function TierStrip({ currentKey }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={[cardSx(pal), { p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }]}>
      {TIERS.map((tier) => {
        const on = tier.key === currentKey;
        return (
          <Tooltip key={tier.key} title={`${tier.name}, ${tier.min.toLocaleString()}+ pts`}>
            <Box role="img" aria-label={`${tier.name} tier, ${tier.min} points`} tabIndex={0} sx={{ width: SIZES.leaderboard.tierIcon, height: SIZES.leaderboard.tierIcon, display: 'grid', placeItems: 'center', borderRadius: RADII_PX.circle, color: on ? COLOR_PALETTE.white : tier.color, bgcolor: on ? tier.color : alpha(tier.color, 0.16), '&:focus-visible': { outline: `2px solid ${LIB_ACCENT}` } }}>
              <WorkspacePremiumRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
