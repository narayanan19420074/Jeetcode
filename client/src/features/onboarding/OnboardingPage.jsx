import { useNavigate } from 'react-router-dom';
import { LibraryFont } from '../dashboard/components/libraryStyle';
import AuroraBackground from './components/AuroraBackground';
import OnboardingShell from './components/OnboardingShell';
import { saveOnboardingProfile } from './onboardingProfileStorage';
import { useOnboardingFlow } from './useOnboardingFlow';

// Prototype of a guided onboarding: one focused card per screen, an assistant line that explains
// each question, and a personalised roadmap at the end. Uses the Library look.
export default function OnboardingPage() {
  const navigate = useNavigate();
  const flow = useOnboardingFlow();

  const finishOnboarding = () => {
    saveOnboardingProfile(flow.getProfile());
    navigate('/dashboard', { replace: true });
  };

  return (
    <LibraryFont sx={{ position: 'relative', minHeight: '100dvh', bgcolor: 'var(--lib-bg)' }}>
      <AuroraBackground isStrong={flow.phase === 'intro'} />
      <OnboardingShell flow={flow} onFinish={finishOnboarding} />
    </LibraryFont>
  );
}
