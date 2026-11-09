import { Box, Button, Typography } from '@mui/material';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import { LIB_TRACKING, libPanelSx, libSmallBtnSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';
import { MUTED } from './mobileStyle';
import { PlanDisc } from './MobileUi';

// Everyone's progress as a grid of discs. The owner can remove other members (after confirmation).
export default function MobileMembersGrid({ plan, accent, onRemoveMember }) {
  return (
    <Box role="tabpanel" aria-label="Friends" sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
      {[...plan.members].sort((a, b) => Number(b.isMe) - Number(a.isMe)).map((m) => {
        const discColor = m.status === 'completed' ? 'var(--jc-easy)' : m.status === 'behind' ? 'var(--jc-hard)' : accent;
        return (
          <Box key={m.userId} sx={{ ...libPanelSx, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <PlanDisc percent={m.percent} accent={discColor} size={96} />
            <Typography noWrap sx={{ mt: 1.5, maxWidth: '100%', fontSize: FONT_SIZES.title, lineHeight: '22px', fontWeight: FONT_WEIGHTS.medium, letterSpacing: LIB_TRACKING }}>
              {m.isMe ? 'You' : m.name}
            </Typography>
            <Typography sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', color: MUTED, fontVariantNumeric: 'tabular-nums' }}>
              {m.done}/{m.total} Solved
            </Typography>
            {plan.isOwner && !m.isOwner && (
              <Button onClick={() => onRemoveMember(m)} aria-label={`Remove ${m.name}`} startIcon={<PersonRemoveRoundedIcon />} sx={{ ...libSmallBtnSx, mt: 1, bgcolor: 'var(--lib-bg)', color: 'var(--lib-text)' }}>
                Remove
              </Button>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
