import { Avatar, Box, ButtonBase, Typography } from '@mui/material';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { relTime } from '../planUtils';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { MUTED } from './mobileStyle';
import { Sheet } from './MobileUi';

// "Added to a plan" notifications in a bottom sheet; tapping one opens that plan.
export default function MobileNotesSheet({ open, onClose, items, onOpenPlan }) {
  return (
    <Sheet open={open} onClose={onClose} title="Notifications">
      {items.length === 0 ? (
        <Typography sx={{ fontSize: FONT_SIZES.title, color: MUTED, pb: 1 }}>Nothing new.</Typography>
      ) : (
        items.map((n) => (
          <ButtonBase
            key={n.id}
            onClick={() => {
              onClose();
              onOpenPlan(n.plan.id);
            }}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              gap: 1.5,
              px: 1,
              py: 1.5,
              mb: 0.5,
              borderRadius: RADII_PX.card,
              textAlign: 'left',
              fontFamily: 'inherit',
              color: 'var(--lib-text)',
              bgcolor: n.read ? 'transparent' : 'var(--lib-chip)',
            }}
          >
            <Avatar src={n.actor.avatarUrl || undefined} alt={n.actor.name} sx={{ width: 40, height: 40, fontWeight: FONT_WEIGHTS.bold }}>
              {n.actor.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '22px', letterSpacing: LIB_TRACKING }}>
                <b>{n.actor.name}</b> added you to <b>{n.plan.title}</b>
              </Typography>
              <Typography sx={{ fontSize: FONT_SIZES.body, color: MUTED, mt: 0.5 }}>{relTime(n.createdAt)}</Typography>
            </Box>
          </ButtonBase>
        ))
      )}
    </Sheet>
  );
}
