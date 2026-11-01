import CardLoader from './CardLoader';
import ChoiceCard from './ChoiceCard';
import RoadmapCard from './RoadmapCard';

// Picks the card component for the step the assistant produced. New card types (a slider, a
// code puzzle) are added here and in flowSteps.js, without touching the conversation logic.
export default function GeneratedCard({ step, onSelect, onFinish }) {
  if (!step) return <CardLoader />;
  if (step.kind === 'roadmap') return <RoadmapCard roadmap={step.roadmap} onFinish={onFinish} />;
  return <ChoiceCard step={step} onSelect={onSelect} />;
}
