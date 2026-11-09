import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

export const DESC_TABS = [
  { value: 0, label: 'Description', icon: <ArticleOutlinedIcon /> },
  { value: 1, label: 'Solutions', icon: <LightbulbOutlinedIcon /> },
  { value: 2, label: 'Discussion', icon: <ForumOutlinedIcon /> },
  { value: 3, label: 'Submissions', icon: <HistoryRoundedIcon /> },
];

export const MOBILE_TABS = [
  { value: 'code', label: 'Code' },
  { value: 'solutions', label: 'Solutions' },
  { value: 'discussion', label: 'Discussion' },
  { value: 'submissions', label: 'Submissions' },
];
