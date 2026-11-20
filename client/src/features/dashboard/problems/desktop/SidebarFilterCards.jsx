import { Box } from '@mui/material';
import SidebarOptionCard from './SidebarOptionCard';

const toOption = (value, label = value) => ({ value, label });
const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'].map((level) => toOption(level));
// Status values are the ones the library query already uses.
const STATUS_OPTIONS = [toOption('All'), toOption('solved', 'Solved'), toOption('unsolved', 'Unsolved')];

// Difficulty and status filters of the Problems page. Status needs an account because solved problems are saved per user.
export default function SidebarFilterCards({ lib, isAuthenticated }) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <SidebarOptionCard title="Difficulty" options={DIFFICULTY_OPTIONS} value={lib.query.difficulty} columns={2} onChange={(difficulty) => lib.patch({ difficulty })} />
      <SidebarOptionCard title="Status" options={STATUS_OPTIONS} value={lib.query.status} columns={3} disabled={!isAuthenticated} disabledHint="Sign in to filter by status" onChange={(status) => lib.patch({ status })} />
    </Box>
  );
}
