import { Box } from '@mui/material';
import BuildingScreen from './BuildingScreen';
import IntroScreen from './IntroScreen';
import QuestionStep from './QuestionStep';
import RoadmapCard from './RoadmapCard';
import ScreenTransition from './ScreenTransition';
import TopBar from './TopBar';

const CARD_MAX_WIDTH = 440;

function CardScreen({ flow, onFinish }) {
  const { step, phase, progress, goBack } = flow;
  return (
    <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <TopBar progress={progress} />
      <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', p: 2, pb: 6 }}>
        <ScreenTransition key={step.id} maxWidth={CARD_MAX_WIDTH}>
          {phase === 'plan' ? <RoadmapCard roadmap={step.roadmap} onBack={goBack} onFinish={onFinish} /> : <QuestionStep flow={flow} />}
        </ScreenTransition>
      </Box>
    </Box>
  );
}

// Chooses what is on screen for the current phase: welcome, question or plan card, or the plan loader.
export default function OnboardingShell({ flow, onFinish }) {
  if (flow.phase === 'intro') return <IntroScreen />;
  if (flow.phase === 'building') return <BuildingScreen />;
  return <CardScreen flow={flow} onFinish={onFinish} />;
}
