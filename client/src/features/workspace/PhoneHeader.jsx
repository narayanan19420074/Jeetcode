import { useState } from 'react';
import { Box, ButtonBase, Divider, IconButton, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { LIB_ACCENT, LIB_TRACKING, libBackBtnSx, libChipSx, libIconBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { PhoneDifficultyTag } from './phoneStyle';

// Phone header of the workspace and the pair room, in the Library look of the phone Problems page.
//   Row 1: back, name (tap to open the problem), optional extras, menu
//   Row 2: tabs (Code / Solutions / Discussion / Submissions, plus Chat in the room)
// The menu holds the tags switch (eye) and whatever the page passes in.
//   problem                  the open problem (tags under the name come from it)
//   title                    overrides the name (the room shows its own title)
//   onOpenProblem            makes the name tappable; leave it out when there is nothing to open
//   backLabel                accessible name of the back arrow
//   trailing                 extra controls between the name and the menu (room: people, video)
//   chipsOn / onToggleChips  show or hide the difficulty and topic tags; no switch when onToggleChips is missing
//   menuItems                [{ key, label, onClick(anchorEl) } | { key, divider: true }], falsy entries are skipped
//   tabs                     [{ value, label, dot? }]

export default function PhoneHeader({
  problem,
  title,
  tabs,
  view,
  onView,
  onBack,
  backLabel = 'Back',
  onOpenProblem,
  trailing,
  chipsOn = false,
  onToggleChips,
  menuItems = [],
}) {
  const pal = useLibraryPalette();
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);

  const itemSx = { py: 1.25, fontSize: 16, fontWeight: 500, letterSpacing: LIB_TRACKING, color: pal.text };
  const name = title ?? problem?.title ?? '';
  const showTags = chipsOn && Boolean(problem);

  const heading = (
    <>
      <Typography noWrap sx={{ maxWidth: '100%', fontWeight: 700, fontSize: 18, lineHeight: '24px' }}>
        {name}
      </Typography>
      {showTags && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: '4px', maxWidth: '100%', minWidth: 0 }}>
          <PhoneDifficultyTag difficulty={problem.difficulty} />
          {problem.tags?.length > 0 && (
            <Typography noWrap sx={{ minWidth: 0, fontSize: 15, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: pal.muted }}>
              {problem.tags.slice(0, 2).join(' · ')}
            </Typography>
          )}
        </Stack>
      )}
    </>
  );
  const headingSx = { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', py: 0.5, textAlign: 'left' };

  return (
    <Box sx={{ flexShrink: 0, pt: 'calc(8px + env(safe-area-inset-top))' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, px: 2 }}>
        <IconButton onClick={onBack} aria-label={backLabel} sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>

        {onOpenProblem ? (
          <ButtonBase onClick={onOpenProblem} aria-label={`Open problem: ${problem?.title ?? name}`} sx={{ ...headingSx, fontFamily: 'inherit', color: 'inherit' }}>
            {heading}
          </ButtonBase>
        ) : (
          <Box sx={headingSx}>{heading}</Box>
        )}

        {trailing}

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
            {tab.dot && <Box aria-hidden sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: tab.dot }} />}
          </ButtonBase>
        ))}
      </Box>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        slotProps={{ paper: { sx: { borderRadius: '20px', minWidth: 230, py: 0.5, bgcolor: pal.bg, backgroundImage: 'none', color: pal.text } } }}
      >
        {onToggleChips && (
          <MenuItem role="menuitemcheckbox" aria-checked={chipsOn} onClick={onToggleChips} sx={itemSx}>
            <ListItemText slotProps={{ primary: { sx: { fontSize: 16, fontWeight: 500, letterSpacing: LIB_TRACKING } } }}>Tags</ListItemText>
            {chipsOn ? (
              <VisibilityRoundedIcon aria-label="Tags shown" sx={{ ml: 2, fontSize: 22, color: LIB_ACCENT }} />
            ) : (
              <VisibilityOffRoundedIcon aria-label="Tags hidden" sx={{ ml: 2, fontSize: 22, color: pal.muted }} />
            )}
          </MenuItem>
        )}
        {menuItems.filter(Boolean).map((it) =>
          it.divider ? (
            <Divider key={it.key} />
          ) : (
            <MenuItem
              key={it.key}
              onClick={() => {
                const el = anchor;
                close();
                it.onClick(el);
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
