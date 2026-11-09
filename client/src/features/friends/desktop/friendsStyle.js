import { FONT_SIZES, FONT_WEIGHTS, MOTION } from '../../../app/design/designTokens';
import { WS } from '../../workspace/wsTokens';
import { alpha } from '@mui/material';

export const SORTS = [['recent', 'Recent chats'], ['online', 'Online first'], ['points', 'Most points'], ['name', 'Name A to Z']];
export const REQUEST_TABS = ['friends', 'requests', 'sent'];

// Soft tonal pill button used for "Add friend", "Accept" and friends' small actions.
export const pillBtn = (color) => (t) => ({
  height: 32, px: 1.5, flexShrink: 0, borderRadius: `${WS.radius + 2}px`, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.bold, textTransform: 'none', whiteSpace: 'nowrap',
  color: t.palette[color].main, bgcolor: alpha(t.palette[color].main, 0.12), transition: `background-color ${MOTION.standard}ms, transform ${MOTION.fast}ms`,
  '&:hover': { bgcolor: alpha(t.palette[color].main, 0.22) },
  '&:active': { transform: 'scale(0.96)' },
});

// Round icon-only action (accept / decline / cancel) with a tinted background.
export const tint = (color) => (t) => ({
  width: 36, height: 36,
  color: color ? t.palette[color].main : t.palette.text.secondary,
  bgcolor: alpha(color ? t.palette[color].main : t.palette.text.primary, color ? 0.12 : 0.06),
  '&:hover': { bgcolor: alpha(color ? t.palette[color].main : t.palette.text.primary, color ? 0.22 : 0.12), color: color ? t.palette[color].main : t.palette.text.primary },
});
