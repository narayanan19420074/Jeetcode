import { Box } from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { NavButton } from '../../dashboard/components/SidebarParts';
import { CATEGORIES } from '../examsData';

const CATEGORY_ICONS = { all: AssignmentRoundedIcon, hiring: BusinessCenterRoundedIcon, higher: SchoolRoundedIcon };

// Left column of the desktop Exams page: the exam types, in the same style as the Dashboard sidebar.
export default function ExamTypeNav({ category, onChange }) {
  return (
    <Box component="nav" aria-label="Exam types" sx={{ display: 'flex', flexDirection: 'column' }}>
      {CATEGORIES.map(({ key, label }) => (
        <NavButton key={key} active={category === key} icon={CATEGORY_ICONS[key]} label={label} onClick={() => onChange(key)} />
      ))}
    </Box>
  );
}
