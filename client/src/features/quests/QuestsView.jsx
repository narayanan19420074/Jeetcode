import { useRef } from 'react';
import { useSelector } from 'react-redux';
import { useReducedMotion } from 'framer-motion';
import { Alert, Box, Button, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import useViewportFill from '../dashboard/useViewportFill';
import useQuestsData from './common/useQuestsData';
import questsProps from './common/questsProps';
import MobileQuests from './MobileQuests';

const BOTTOM_GAP = 24;

function QuestsContent({ isAuthenticated, onPick }) {
  const quests = useQuestsData(isAuthenticated);
  const wallet = useSelector((store) => store.auth.user);
  const dark = useTheme().palette.mode === 'dark';
  const reduce = Boolean(useReducedMotion());
  if (quests.error && !quests.state) {
    return <Alert severity="error" sx={{ m: 1.75 }} action={<Button color="inherit" size="small" onClick={quests.load}>Retry</Button>}>{quests.error}</Alert>;
  }
  if (!quests.state) return <Skeleton variant="rounded" sx={{ m: 1.75, height: 360, borderRadius: '26px' }} />;
  return <MobileQuests {...questsProps({ quests, isAuthenticated, wallet, dark, reduce, onPick })} />;
}

// Quests uses the Library layout (the one the phone has) on every screen size: level and check-in, check-in rewards,
// your butterfly. On wide screens the dashboard gives this view no height, so it fills the room left under the navbar
// and scrolls by itself.
export default function QuestsView({ isAuthenticated, onPick }) {
  const rootRef = useRef(null);
  const isPhone = useMediaQuery(useTheme().breakpoints.down('md'), { noSsr: true });
  const fillHeight = useViewportFill(rootRef, !isPhone);
  return (
    <Box ref={rootRef} className="autohide-scroll" sx={fillHeight ? { height: fillHeight - BOTTOM_GAP, overflowY: 'auto' } : undefined}>
      <QuestsContent isAuthenticated={isAuthenticated} onPick={onPick} />
    </Box>
  );
}
