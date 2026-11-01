import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';

// Maps the icon key used in flowSteps.js to a component, so step data stays free of UI imports.
const OPTION_ICONS = {
  student: SchoolRoundedIcon,
  professional: WorkRoundedIcon,
  exam: AssignmentRoundedIcon,
  code: CodeRoundedIcon,
  trophy: EmojiEventsRoundedIcon,
  schedule: ScheduleRoundedIcon,
  time: TimerRoundedIcon,
  math: CalculateRoundedIcon,
  verbal: MenuBookRoundedIcon,
};

export const getOptionIcon = (key) => OPTION_ICONS[key] ?? null;
