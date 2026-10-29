import { Box, ButtonBase, IconButton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import { PHONE_ACCENT } from './wsTokens';

// Phone header of the workspace. It follows the phone Problems page: 44px round icon buttons,
// tinted pills, 1rem / 700 title. The app's top bar is hidden here, so this is the only header.
//   Row 1: back, problem name (tap to open the problem), problem list
//   Row 2: Code / Solutions / Discussion / Submissions tabs

const SHORT_DIFF = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };

function DifficultyTag({ difficulty }) {
  const color = DIFF_COLOR[difficulty] || 'var(--jc-pending)';
  return (
    <Typography
      component="span"
      sx={{ flexShrink: 0, px: 1, py: 0.4, borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, lineHeight: 1.2, color, bgcolor: tint(color, 16) }}
    >
      {SHORT_DIFF[difficulty] || difficulty}
    </Typography>
  );
}

export default function PhoneHeader({ problem, tabs, view, onView, onBack, onOpenProblem, onOpenList }) {
  return (
    <Box sx={{ flexShrink: 0, pt: 'calc(6px + env(safe-area-inset-top))' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 1.75 }}>
        <IconButton onClick={onBack} aria-label="Back" sx={{ width: 44, height: 44, flexShrink: 0 }}>
          <ArrowBackRoundedIcon />
        </IconButton>

        <ButtonBase
          onClick={onOpenProblem}
          aria-label={`Open problem: ${problem.title}`}
          sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', gap: 1, py: 0.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.35 }}>
              {problem.title}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.4, minWidth: 0 }}>
              <DifficultyTag difficulty={problem.difficulty} />
              {problem.tags?.length > 0 && (
                <Typography noWrap color="text.secondary" sx={{ minWidth: 0, fontSize: '0.82rem' }}>
                  {problem.tags.slice(0, 2).join(' · ')}
                </Typography>
              )}
            </Stack>
          </Box>
          <KeyboardArrowUpRoundedIcon aria-hidden sx={{ color: 'text.secondary', flexShrink: 0 }} />
        </ButtonBase>

        <IconButton
          onClick={onOpenList}
          aria-label="Problem list"
          sx={(t) => ({ width: 44, height: 44, flexShrink: 0, bgcolor: tint(PHONE_ACCENT, t.palette.mode === 'dark' ? 16 : 9), color: PHONE_ACCENT })}
        >
          <FormatListBulletedRoundedIcon />
        </IconButton>
      </Stack>

      <Box
        role="tablist"
        sx={{
          display: 'flex',
          gap: 0.75,
          mt: 0.75,
          pb: 1,
          px: 1.75,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {tabs.map((tab) => {
          const on = tab.value === view;
          return (
            <ButtonBase
              key={tab.value}
              role="tab"
              aria-selected={on}
              onClick={() => onView(tab.value)}
              sx={(t) => ({
                flexShrink: 0,
                height: 40,
                px: 2,
                borderRadius: 999,
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                fontWeight: on ? 800 : 700,
                whiteSpace: 'nowrap',
                color: on ? PHONE_ACCENT : t.palette.text.secondary,
                bgcolor: on ? tint(PHONE_ACCENT, 20) : 'transparent',
              })}
            >
              {tab.label}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
