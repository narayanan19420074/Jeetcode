import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import DashboardViewContent from './DashboardViewContent';

const FADE_IN = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.18 } };

// Fades between the non-library views. People who prefer reduced motion get no animation.
export default function DashboardViewSwitch({ dashboard }) {
  const reduceMotion = useReducedMotion();
  const { currentView, activeList } = dashboard;
  if (currentView === 'library') return null;
  return (
    <AnimatePresence mode="wait">
      <motion.div key={`${currentView}:${activeList?.id ?? ''}`} {...(reduceMotion ? {} : FADE_IN)}>
        <DashboardViewContent dashboard={dashboard} />
      </motion.div>
    </AnimatePresence>
  );
}
