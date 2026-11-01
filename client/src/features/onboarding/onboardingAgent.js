import { getStep } from './flowSteps';

// Simulated thinking time so the loading state is visible while the next card is prepared.
const THINKING_DELAY_MS = 700;
// Building the final plan is the "heavy" step, so it gets a longer, full-screen loading state.
const PLAN_BUILD_DELAY_MS = 2200;

export const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Prototype boundary: this is the only place that decides which card appears next.
// To use a real model, replace the body with a call to the AI API that returns the same step shape.
export async function generateStep(stepId, answers) {
  await wait(stepId === 'roadmap' ? PLAN_BUILD_DELAY_MS : THINKING_DELAY_MS);
  return getStep(stepId, answers);
}
