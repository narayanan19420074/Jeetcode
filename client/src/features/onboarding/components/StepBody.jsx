import { Typography } from '@mui/material';
import OptionList from './OptionList';
import TextAnswer from './TextAnswer';
import TypeInstead from './TypeInstead';

// The answer area of a question card: a large input for typed steps, or options plus a
// "type instead" box for choice steps. Placement questions also show the question text.
export default function StepBody({ step, selected, isDisabled, onSelect, onSubmitText, onEnter }) {
  if (step.kind === 'text') {
    return (
      <TextAnswer label={step.title} placeholder={step.placeholder} maxLength={step.maxLength} value={selected} isDisabled={isDisabled} onChange={onSelect} onEnter={onEnter} />
    );
  }
  return (
    <>
      {step.question && <Typography sx={{ mb: 2, fontFamily: '"JetBrains Mono", monospace', fontSize: 15 }}>{step.question}</Typography>}
      <OptionList label={step.title} options={step.options} selectedId={selected} isDisabled={isDisabled} onSelect={onSelect} />
      <TypeInstead isDisabled={isDisabled} onSubmitText={onSubmitText} />
    </>
  );
}
