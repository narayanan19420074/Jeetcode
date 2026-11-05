import { useMemo } from 'react';
import { findChangedVariables, outputUpToStep } from './traceHelpers';
import { literalsFor } from './valueLiterals';

// Everything the panes draw for the current step, derived once so mobile and desktop views stay identical.
export default function useVisualizerModel(trace, stepIndex) {
  return useMemo(() => {
    const steps = trace?.steps ?? [];
    const step = steps[stepIndex] ?? null;
    const previousStep = steps[stepIndex - 1] ?? null;
    return {
      step,
      literals: literalsFor(trace?.language),
      changed: findChangedVariables(previousStep, step),
      output: outputUpToStep(trace, step),
      isLastStep: steps.length > 0 && stepIndex === steps.length - 1,
    };
  }, [trace, stepIndex]);
}
