import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, MenuItem, Select, Stack, Tooltip } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import { NameDialog } from '../../components/ListDialogs';
import { useLibraryPalette } from '../../components/libraryStyle';
import { DIFF_COLOR } from '../../dashboardUtils';
import { DIFFICULTIES } from '../common/problemsConstants';
import DifficultyGauge from './DifficultyGauge';
import { FONTS, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../../app/design/designTokens';

// "Easy 0/19" rows in the colour of each difficulty.
function DifficultyRows({ progress }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      {DIFFICULTIES.map((level) => (
        <Stack key={level} direction="row" sx={{ justifyContent: 'space-between', fontFamily: FONTS.mono, fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold }}>
          <Box component="span" sx={{ color: DIFF_COLOR[level] }}>{level}</Box>
          <Box component="span" sx={{ color: 'text.secondary' }}>{progress?.solved?.[level] ?? 0}/{progress?.total?.[level] ?? 0}</Box>
        </Stack>
      ))}
    </Box>
  );
}

// Opens one of the learner's lists in the dashboard, where its problems are managed.
function ListPicker({ listsApi }) {
  const navigate = useNavigate();
  const { lists } = listsApi;
  return (
    <Select
      size="small"
      fullWidth
      displayEmpty
      value=""
      onChange={(event) => navigate(`/dashboard?view=list&list=${event.target.value}`)}
      inputProps={{ 'aria-label': 'Open one of your lists' }}
      renderValue={() => <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}><FormatListBulletedRoundedIcon fontSize="small" /><span>My lists</span></Stack>}
      sx={{ bgcolor: 'background.paper', borderRadius: RADII_PX.card, fontWeight: FONT_WEIGHTS.semibold }}
    >
      {lists.length === 0 && <MenuItem disabled value="">No lists yet</MenuItem>}
      {lists.map((list) => <MenuItem key={list.id} value={list.id}>{list.name} ({list.items.length})</MenuItem>)}
    </Select>
  );
}

function ActionButton({ label, icon, onClick, disabled }) {
  const pal = useLibraryPalette();
  return (
    <Tooltip title={label}>
      <span>
        <IconButton size="small" aria-label={label} disabled={disabled} onClick={onClick} sx={{ border: `1px solid ${pal.border}`, borderRadius: RADII_PX.card, bgcolor: 'background.paper' }}>{icon}</IconButton>
      </span>
    </Tooltip>
  );
}

// Shuffle opens a random problem of the current view, Reset clears the filters, New list creates a list.
function Actions({ lib, listsApi }) {
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const createList = (name) => {
    const listId = listsApi.createList(name);
    if (!listId) return false;
    navigate(`/dashboard?view=list&list=${listId}`);
    return true;
  };
  return (
    <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
      <ActionButton label="Pick a random problem" onClick={lib.pickOne} disabled={lib.picking} icon={lib.picking ? <CircularProgress size={FONT_SIZES.heading} /> : <ShuffleRoundedIcon fontSize="small" />} />
      <ActionButton label="Reset filters" onClick={lib.clearAll} disabled={!lib.anyActive} icon={<RestartAltRoundedIcon fontSize="small" />} />
      <ActionButton label="New list" onClick={() => setCreating(true)} disabled={listsApi.lists.length >= listsApi.maxLists} icon={<PlaylistAddRoundedIcon fontSize="small" />} />
      <NameDialog open={creating} title="Create a list" confirmLabel="Create" onClose={() => setCreating(false)} onConfirm={createList} />
    </Stack>
  );
}

// Left card of the Problems page: solved ring, the counts per difficulty, your lists and the quick actions.
export default function ProgressSummaryCard({ lib, progress, listsApi }) {
  const pal = useLibraryPalette();
  return (
    <Box component="section" aria-label="Your progress" sx={{ display: 'grid', gap: 2, p: 2, borderRadius: RADII_PX.dialog, bgcolor: pal.chip, border: `1px solid ${pal.border}` }}>
      <DifficultyGauge solved={progress?.solved} totals={progress?.total} />
      <DifficultyRows progress={progress} />
      <ListPicker listsApi={listsApi} />
      <Actions lib={lib} listsApi={listsApi} />
    </Box>
  );
}
