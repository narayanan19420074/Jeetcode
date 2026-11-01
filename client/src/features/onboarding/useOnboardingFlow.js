import { useCallback, useEffect, useRef, useState } from 'react';
import { PLAN_STEP_ID, TOTAL_QUESTION_STEPS, getStep, nextStepId } from './flowSteps';
import { generateStep, wait } from './onboardingAgent';
import { matchTypedAnswer } from './matchTypedAnswer';

const FIRST_STEP_ID = 'name';
const INTRO_DURATION_MS = 1800;

// Owns the journey. `phase` is 'intro' (welcome screen), 'step' (a question card), 'building'
// (full-screen loader before the plan) or 'plan' (the finished roadmap).
export function useOnboardingFlow() {
  const [phase, setPhase] = useState('intro');
  const [step, setStep] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const answers = useRef({});
  const answeredStepIds = useRef([]);
  const hasStarted = useRef(false);

  const showStep = useCallback(async (stepId) => {
    if (stepId === PLAN_STEP_ID) setPhase('building');
    const generated = await generateStep(stepId, answers.current);
    setStep(generated);
    setPhase(generated.kind === 'roadmap' ? 'plan' : 'step');
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    wait(INTRO_DURATION_MS).then(() => showStep(FIRST_STEP_ID));
  }, [showStep]);

  const submitAnswer = useCallback((value) => {
    setIsSubmitting(true);
    answers.current = { ...answers.current, [step.id]: value };
    answeredStepIds.current.push(step.id);
    showStep(nextStepId(step.id, answers.current));
  }, [step, showStep]);

  // Earlier answers are kept on purpose, so the learner finds their previous choice selected.
  const goBack = useCallback(() => {
    const previousStepId = answeredStepIds.current.pop();
    if (!previousStepId) return;
    setStep(getStep(previousStepId, answers.current));
    setPhase('step');
  }, []);

  const submitTyped = useCallback((text) => {
    const choice = matchTypedAnswer(text, step.options ?? []);
    if (choice) submitAnswer(choice.id);
    return choice;
  }, [step, submitAnswer]);

  return {
    phase,
    step,
    isSubmitting,
    answers: answers.current,
    canGoBack: answeredStepIds.current.length > 0,
    progress: answeredStepIds.current.length / TOTAL_QUESTION_STEPS,
    submitAnswer,
    submitTyped,
    goBack,
    getProfile: () => ({ answers: answers.current, roadmap: step?.roadmap }),
  };
}
