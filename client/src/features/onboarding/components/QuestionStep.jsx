import { useState } from 'react';
import { Box } from '@mui/material';
import { isValidName } from '../flowSteps';
import ContinueButton from './ContinueButton';
import StepBody from './StepBody';
import StepCard from './StepCard';

// One question screen. The current selection lives here; the flow only hears about the final answer.
export default function QuestionStep({ flow }) {
  const { step, isSubmitting, canGoBack, answers, submitAnswer, submitTyped, goBack } = flow;
  const [selected, setSelected] = useState(answers[step.id] ?? '');
  const isTextStep = step.kind === 'text';
  const isReady = isTextStep ? isValidName(selected) : Boolean(selected);

  const handleContinue = () => submitAnswer(isTextStep ? selected.trim() : selected);

  // A typed answer that matches an option is selected and submitted in one go.
  const handleTypedText = (text) => {
    const choice = submitTyped(text);
    if (choice) setSelected(choice.id);
    return Boolean(choice);
  };

  return (
    <StepCard title={step.title} assistantLine={step.prompt} footnote={step.footnote} onBack={canGoBack ? goBack : undefined}>
      <StepBody step={step} selected={selected} isDisabled={isSubmitting} onSelect={setSelected} onSubmitText={handleTypedText} onEnter={() => isReady && handleContinue()} />
      <Box sx={{ mt: 3 }}>
        <ContinueButton isLoading={isSubmitting} isDisabled={!isReady} onClick={handleContinue} />
      </Box>
    </StepCard>
  );
}
