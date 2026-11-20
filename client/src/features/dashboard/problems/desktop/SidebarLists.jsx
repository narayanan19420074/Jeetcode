import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import { NameDialog } from '../../components/ListDialogs';
import { LIB_TRACKING } from '../../components/libraryStyle';
import SidebarTextRow from './SidebarTextRow';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../../app/design/designTokens';

function ListsHeading({ atLimit, onCreate }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 1.5, pb: 0.5, px: 1.5 }}>
      <Typography component="h2" sx={{ fontSize: FONT_SIZES.bodyLg, fontWeight: FONT_WEIGHTS.bold }}>My lists</Typography>
      <Box component="span" title={atLimit ? 'List limit reached' : undefined}>
        <Button size="small" disabled={atLimit} onClick={onCreate} sx={{ textTransform: 'none', letterSpacing: LIB_TRACKING, fontWeight: FONT_WEIGHTS.medium }}>New list</Button>
      </Box>
    </Stack>
  );
}

// The learner's saved lists. A list opens in the dashboard, where its problems are managed.
export default function SidebarLists({ listsApi }) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const openList = (listId) => navigate(`/dashboard?view=list&list=${listId}`);
  const createList = (name) => {
    const listId = listsApi.createList(name);
    if (!listId) return false;
    openList(listId);
    return true;
  };
  return (
    <Box component="nav" aria-label="My lists">
      <ListsHeading atLimit={listsApi.lists.length >= listsApi.maxLists} onCreate={() => setCreating(true)} />
      {listsApi.lists.map((list) => <SidebarTextRow key={list.id} label={list.name} count={list.items.length} onClick={() => openList(list.id)} />)}
      <NameDialog open={creating} title="Create a list" confirmLabel="Create" onClose={() => setCreating(false)} onConfirm={createList} />
    </Box>
  );
}
