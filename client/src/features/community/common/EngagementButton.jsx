import { Link as RouterLink } from 'react-router-dom';
import { ButtonBase, Typography } from '@mui/material';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import { FONT_SIZES, RADII_PX, SIZES } from '../../../app/design/designTokens';

const buttonSx = (active) => (theme) => ({
  minWidth: SIZES.touchTarget,
  height: SIZES.touchTarget,
  px: 1.5,
  gap: 1,
  borderRadius: RADII_PX.pill,
  color: active ? navActiveColor(theme) : 'var(--lib-muted)',
});

// One icon button of the row under a post (like, comment, repost, share) with an optional count.
// Pass `to` to make it a link, otherwise `onClick`. `active` is only for toggles (like, repost): it marks the state the viewer switched on.
export default function EngagementButton({ icon: Icon, label, count, active, to, onClick, disabled }) {
  const behaviour = to ? { component: RouterLink, to } : { onClick, 'aria-pressed': active };
  const hasCount = count !== undefined;
  return (
    <ButtonBase {...behaviour} disabled={disabled} aria-label={hasCount ? `${label}, ${count}` : label} sx={buttonSx(active)}>
      <Icon sx={{ fontSize: SIZES.iconSize.medium }} />
      {hasCount && <Typography component="span" sx={{ fontSize: FONT_SIZES.title, color: 'inherit' }}>{count.toLocaleString()}</Typography>}
    </ButtonBase>
  );
}
