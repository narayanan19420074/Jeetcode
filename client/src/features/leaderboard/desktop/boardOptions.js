import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

// Names and icons used by common leaderboards: infinity for all-time, week and month calendars.
export const TRACKS = [
  { value: 'overall', label: 'Overall', title: 'Overall', Icon: StarsRoundedIcon },
  { value: 'coding', label: 'Coding', title: 'Coding', Icon: CodeRoundedIcon },
  { value: 'aptitude', label: 'Aptitude', title: 'Aptitude', Icon: PsychologyRoundedIcon },
];

export const PERIODS = [
  { value: 'all', label: 'All-time', title: 'All-time ranking', Icon: AllInclusiveRoundedIcon },
  { value: 'week', label: 'Weekly', title: 'This week', Icon: DateRangeRoundedIcon },
  { value: 'month', label: 'Monthly', title: 'This month', Icon: CalendarMonthRoundedIcon },
];

export const SCOPES = [
  { value: 'global', label: 'Everyone', title: 'Everyone', Icon: PublicRoundedIcon },
  { value: 'friends', label: 'Friends', title: 'Friends', Icon: PeopleAltRoundedIcon },
];
