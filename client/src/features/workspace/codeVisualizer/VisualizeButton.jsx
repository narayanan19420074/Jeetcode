import { IconButton } from '@mui/material';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { WsIconButton } from '../wsUi';
import { libIconBtnSx } from '../../dashboard/components/libraryStyle';

const LABEL = 'Visualize code';

// Opens the step-by-step visualizer. Phone: the round toolbar style; desktop: the editor toolbar style.
export default function VisualizeButton({ onClick, isMobile, size, active = false }) {
  if (isMobile) {
    return (
      <IconButton onClick={onClick} aria-label={LABEL} sx={libIconBtnSx}>
        <TimelineRoundedIcon />
      </IconButton>
    );
  }
  return (
    <WsIconButton title={LABEL} size={size} active={active} onClick={onClick}>
      <TimelineRoundedIcon />
    </WsIconButton>
  );
}
