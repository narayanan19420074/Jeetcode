import { Box } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import BackIconButton from '../../../../components/BackIconButton';
import { NavButton } from '../../../dashboard/components/SidebarParts';
import { COLOR_PALETTE, SIZES } from '../../../../app/design/designTokens';

const isEmpty = (topic) => topic.total === 0;
const isMastered = (topic) => topic.total > 0 && topic.solved === topic.total;

const topicIcon = (topic) => {
  if (isEmpty(topic)) return HourglassEmptyRoundedIcon;
  return isMastered(topic) ? CheckCircleRoundedIcon : RadioButtonUncheckedRoundedIcon;
};

// Topics with no questions yet stay visible but cannot be opened.
const topicCount = (topic) => (isEmpty(topic) ? 'Soon' : `${topic.solved}/${topic.total}`);

// Left column of the desktop topic page: the back icon, then every topic of the pattern in the Dashboard sidebar style.
export default function TopicsNav({ topics, onPickTopic }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box>
        <BackIconButton to="/aptitude" label="Back to Aptitude" />
      </Box>
      <Box
        component="nav"
        aria-label="Topics"
        sx={(theme) => ({ display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: `calc(100vh - ${SIZES.desktopFrame.stickyTop}px - ${theme.spacing(10)})`, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } })}
      >
        {topics.map((topic) => (
          <NavButton
            key={topic.slug}
            icon={topicIcon(topic)}
            accent={isMastered(topic) ? COLOR_PALETTE.emerald[500] : undefined}
            label={topic.title}
            count={topicCount(topic)}
            disabled={isEmpty(topic)}
            onClick={() => onPickTopic(topic.slug)}
          />
        ))}
      </Box>
    </Box>
  );
}
