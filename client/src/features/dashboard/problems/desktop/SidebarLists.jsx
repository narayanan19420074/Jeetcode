import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { ListButtons } from '../../components/DashboardSidebar';
import { NameDialog } from '../../components/ListDialogs';
import { ListsHeader } from '../../components/SidebarParts';

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
      <ListsHeader atLimit={listsApi.lists.length >= listsApi.maxLists} onCreate={() => setCreating(true)} />
      <ListButtons lists={listsApi.lists} view="" onSelectList={openList} />
      <NameDialog open={creating} title="Create a list" confirmLabel="Create" onClose={() => setCreating(false)} onConfirm={createList} />
    </Box>
  );
}
