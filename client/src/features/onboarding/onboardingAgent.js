import { getStep } from './flowSteps';

// Simulated thinking time so the loader is visible while the next card is prepared.
const THINKING_DELAY_MS = 900;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

// Prototype boundary: this is the only place that decides which card appears next.
// To use a real model, replace the body with a call to the AI API that returns the same step shape.
export async function generateStep(stepId, answers) {
  await wait(THINKING_DELAY_MS);
  return getStep(stepId, answers);
}
