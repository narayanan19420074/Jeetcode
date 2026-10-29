import { useState } from 'react';
import { Box, ButtonBase, Divider, IconButton, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { LIB_ACCENT, LIB_TRACKING, libBackBtnSx, libChipSx, libIconBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { PhoneDifficultyTag } from './phoneStyle';

// Phone header of the workspace, in the Library look of the phone Problems page.
//   Row 1: back, problem name (tap to open the problem), menu
//   Row 2: Code / Solutions / Discussion / Submissions tabs
// The menu holds the tags switch (eye), the problem list and the editor actions.
//   chipsOn / onToggleChips  show or hide the difficulty and topic tags under the name
//   menuItems                [{ key, label, onClick } | { key, divider: true }], falsy entries are skipped

export default function PhoneHeader({ problem, tabs, view, onView, onBack, onOpenProblem, chipsOn, onToggleChips, menuItems = [] }) {
  const pal = useLibraryPalette();
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);

  const itemSx = { py: 1.25, fontSize: 16, fontWeight: 500, letterSpacing: LIB_TRACKING, color: pal.text };

  return (
    <Box sx={{ flexShrink: 0, pt: 'calc(8px + env(safe-area-inset-top))' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 2 }}>
        <IconButton onClick={onBack} aria-label="Back" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>

        <ButtonBase
          onClick={onOpenProblem}
          aria-label={`Open problem: ${problem.title}`}
          sx={{ flex: 1, minWidth: 0, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', py: 0.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
        >
          <Typography noWrap sx={{ maxWidth: '100%', fontWeight: 700, fontSize: 18, lineHeight: '24px' }}>
            {problem.title}
          </Typography>
          {chipsOn && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: '4px', maxWidth: '100%', minWidth: 0 }}>
              <PhoneDifficultyTag difficulty={problem.difficulty} />
              {problem.tags?.length > 0 && (
                <Typography noWrap sx={{ minWidth: 0, fontSize: 15, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
                  {problem.tags.slice(0, 2).join(' · ')}
                </Typography>
              )}
            </Stack>
          )}
        </ButtonBase>

        <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="More options" aria-haspopup="menu" sx={libIconBtnSx}>
          <MoreHorizRoundedIcon />
        </IconButton>
      </Stack>

      <Box
        role="tablist"
        sx={{
          display: 'flex',
          gap: 1,
          mt: 1.5,
          pb: 1.5,
          px: 2,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {tabs.map((tab) => (
          <ButtonBase key={tab.value} role="tab" aria-selected={tab.value === view} onClick={() => onView(tab.value)} sx={libChipSx(tab.value === view)}>
            {tab.label}
          </ButtonBase>
        ))}
      </Box>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        slotProps={{ paper: { sx: { borderRadius: '20px', minWidth: 230, py: 0.5, bgcolor: pal.bg, backgroundImage: 'none', color: pal.text } } }}
      >
        <MenuItem role="menuitemcheckbox" aria-checked={chipsOn} onClick={onToggleChips} sx={itemSx}>
          <ListItemText slotProps={{ primary: { sx: { fontSize: 16, fontWeight: 500, letterSpacing: LIB_TRACKING } } }}>Tags</ListItemText>
          {chipsOn ? (
            <VisibilityRoundedIcon aria-label="Tags shown" sx={{ ml: 2, fontSize: 22, color: LIB_ACCENT }} />
          ) : (
            <VisibilityOffRoundedIcon aria-label="Tags hidden" sx={{ ml: 2, fontSize: 22, color: pal.muted }} />
          )}
        </MenuItem>
        {menuItems.filter(Boolean).map((it) =>
          it.divider ? (
            <Divider key={it.key} />
          ) : (
            <MenuItem
              key={it.key}
              onClick={() => {
                close();
                it.onClick();
              }}
              sx={itemSx}
            >
              {it.label}
            </MenuItem>
          )
        )}
      </Menu>
    </Box>
  );
}
