import { Link as RouterLink } from 'react-router-dom';
import { Avatar, AvatarGroup, Box, ButtonBase, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { DIFF_COLOR, tint } from '../../dashboard/dashboardUtils';
import { LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { itemLink } from '../planUtils';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import { DIVIDER, MUTED, SHORT_DIFF } from './mobileStyle';

// One question, laid out like a row on the phone Problems page:
// difficulty tag and solved mark on the left, numbered title and details on the right.
export default function QuestionRow({ item, index, doers }) {
  const link = itemLink(item);
  const diffColor = DIFF_COLOR[item.difficulty] || 'var(--jc-pending)';

  const body = (
    <>
      <Stack sx={{ width: 43, flexShrink: 0, alignItems: 'center', gap: 1.5, pt: 0.5 }}>
        <Typography
          component="span"
          sx={{ flexShrink: 0, minWidth: 43, textAlign: 'center', px: 0.5, py: 0.5, borderRadius: RADII_PX.control, fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, lineHeight: '20px', color: diffColor, bgcolor: tint(diffColor, 14) }}
        >
          {SHORT_DIFF[item.difficulty] || item.difficulty}
        </Typography>
        {item.done ? (
          <CheckCircleRoundedIcon aria-label="Solved" sx={{ fontSize: FONT_SIZES.heading, color: 'var(--jc-easy)' }} />
        ) : item.overdue ? (
          <ErrorOutlineRoundedIcon aria-label="Overdue" sx={{ fontSize: FONT_SIZES.heading, color: 'var(--jc-hard)' }} />
        ) : (
          <RemoveRoundedIcon aria-label="Not solved" sx={{ fontSize: FONT_SIZES.heading, color: MUTED, opacity: 0.6 }} />
        )}
      </Stack>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: FONT_WEIGHTS.medium, fontSize: FONT_SIZES.subheading, lineHeight: '28px', letterSpacing: LIB_TRACKING }}>
          {index}. {item.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5, color: MUTED }}>
          <Typography sx={{ fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING }}>{item.type === 'problem' ? 'Coding' : 'Aptitude'}</Typography>
          {item.overdue && !item.done && <Typography sx={{ fontSize: FONT_SIZES.bodyLg, letterSpacing: LIB_TRACKING, color: 'var(--jc-hard)' }}>Overdue</Typography>}
          {doers.length > 0 && (
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.bold, border: '2px solid', borderColor: 'var(--lib-bg)' } }}>
              {doers.map((m) => (
                <Avatar key={m.userId} src={m.avatarUrl || undefined} alt={m.name}>
                  {m.name?.[0]?.toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
        </Stack>
      </Box>
    </>
  );

  const rowSx = {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 1.5,
    py: 2,
    textAlign: 'left',
    fontFamily: 'inherit',
    color: 'inherit',
    borderBottom: `1px solid ${DIVIDER}`,
    '&:last-of-type': { borderBottom: 'none' },
  };

  return link ? (
    <ButtonBase component={RouterLink} to={link} sx={rowSx}>
      {body}
    </ButtonBase>
  ) : (
    <Box sx={rowSx}>{body}</Box>
  );
}
