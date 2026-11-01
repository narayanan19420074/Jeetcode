import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AiAssistantDrawer from './AiAssistantDrawer';
import AiGlow from './AiGlow';
import AiLauncher from './AiLauncher';
import AiLiveOverlay from './AiLiveOverlay';
import useAiFix from './useAiFix';
import { toggleAiDrawer } from './workspaceSlice';

const HINT_PROMPT = 'Give me a hint for this problem.';

// Phone only: the AI menu (Go live / Fix / Hint), the screen glow while Fix works, and the live voice overlay.
function PhoneAiControls({ menuOpen, onCloseMenu, onPick, liveOpen, onCloseLive, fixing, slug, language, code }) {
  return (
    <>
      <AiLauncher open={menuOpen} onClose={onCloseMenu} onPick={onPick} />
      <AiGlow active={fixing} />
      <AiLiveOverlay key={`live-${slug}`} open={liveOpen} onClose={onCloseLive} slug={slug} language={language} code={code} />
    </>
  );
}

// Everything behind the workspace AI icon:
//   Go live  voice conversation with Gemini Live about the code on screen (phone)
//   Fix      silently repairs and completes the code in the editor (phone)
//   Hint     text hint in the chat drawer (phone and desktop)
export default function AiAssistantLayer({ isMobile, menuOpen, onCloseMenu, problemId, slug, language, code, isAuthenticated, onSignIn }) {
  const dispatch = useDispatch();
  const drawerOpen = useSelector((state) => state.workspace.aiDrawerOpen);
  const [liveOpen, setLiveOpen] = useState(false);
  const [hintRequest, setHintRequest] = useState(null); // { id, text }: question the drawer sends once when it opens
  const { fixing, runFix } = useAiFix({ problemId, slug, language, code, isAuthenticated, onSignIn });

  const handlePick = (choice) => {
    onCloseMenu();
    if (choice === 'live') return isAuthenticated ? setLiveOpen(true) : onSignIn();
    if (choice === 'fix') return runFix();
    setHintRequest({ id: Date.now(), text: HINT_PROMPT });
    if (!drawerOpen) dispatch(toggleAiDrawer());
    return undefined;
  };

  return (
    <>
      {isMobile && (
        <PhoneAiControls menuOpen={menuOpen} onCloseMenu={onCloseMenu} onPick={handlePick} liveOpen={liveOpen} onCloseLive={() => setLiveOpen(false)} fixing={fixing} slug={slug} language={language} code={code} />
      )}
      <AiAssistantDrawer
        key={slug}
        autoPrompt={hintRequest}
        open={drawerOpen}
        onClose={() => dispatch(toggleAiDrawer())}
        slug={slug}
        language={language}
        getCode={() => code}
        isAuthenticated={isAuthenticated}
        onSignIn={onSignIn}
      />
    </>
  );
}
