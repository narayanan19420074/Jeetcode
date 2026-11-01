import { useCallback, useEffect, useRef, useState } from 'react';
import { nextStepId } from './flowSteps';
import { generateStep } from './onboardingAgent';
import { matchTypedAnswer } from './matchTypedAnswer';

const FIRST_STEP_ID = 'persona';
const UNMATCHED_REPLY = 'I could not match that to an option. Please choose a card, or type one of the option names.';

// Owns the conversation: messages, the card currently on screen, and the answers collected so far.
export function useOnboardingFlow() {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(null);
  const answers = useRef({});
  const nextMessageId = useRef(0);
  const hasStarted = useRef(false);

  const addMessage = useCallback((role, text) => {
    setMessages((previous) => [...previous, { id: nextMessageId.current++, role, text }]);
  }, []);

  // While `step` is null the screen shows the loader instead of a card.
  const showStep = useCallback(async (stepId) => {
    setStep(null);
    const generated = await generateStep(stepId, answers.current);
    addMessage('ai', generated.prompt);
    setStep(generated);
  }, [addMessage]);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    showStep(FIRST_STEP_ID);
  }, [showStep]);

  const commitAnswer = useCallback((choice, userText) => {
    answers.current = { ...answers.current, [step.id]: choice.id };
    addMessage('user', userText);
    showStep(nextStepId(step.id, answers.current));
  }, [step, addMessage, showStep]);

  const selectOption = useCallback((choice) => commitAnswer(choice, choice.label), [commitAnswer]);

  const sendText = useCallback((text) => {
    if (!step?.options) return;
    const choice = matchTypedAnswer(text, step.options);
    if (choice) return commitAnswer(choice, text);
    addMessage('user', text);
    addMessage('ai', UNMATCHED_REPLY);
  }, [step, commitAnswer, addMessage]);

  const getProfile = useCallback(() => ({ answers: answers.current, roadmap: step?.roadmap }), [step]);

  return { messages, step, selectOption, sendText, getProfile };
}
