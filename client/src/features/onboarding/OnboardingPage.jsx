import { useNavigate } from 'react-router-dom';
import { LibraryFont } from '../dashboard/components/libraryStyle';
import AiWindow from './components/AiWindow';
import { saveOnboardingProfile } from './onboardingProfileStorage';
import { useOnboardingFlow } from './useOnboardingFlow';

// Prototype of a conversational onboarding: an assistant asks questions as popup cards and ends
// with a personalised roadmap. Uses the Library look so it matches the phone pages.
export default function OnboardingPage() {
  const navigate = useNavigate();
  const flow = useOnboardingFlow();

  const finishOnboarding = () => {
    saveOnboardingProfile(flow.getProfile());
    navigate('/dashboard', { replace: true });
  };

  return (
    <LibraryFont sx={{ bgcolor: 'var(--lib-bg)', minHeight: '100dvh' }}>
      <AiWindow flow={flow} onFinish={finishOnboarding} />
    </LibraryFont>
  );
}
