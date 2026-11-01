import { InputBase } from '@mui/material';

// Large centred input for typed answers such as the learner's name. Enter submits when allowed.
export default function TextAnswer({ label, placeholder, maxLength, value, isDisabled, onChange, onEnter }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') onEnter();
  };
  return (
    <InputBase
      fullWidth
      autoFocus
      value={value}
      disabled={isDisabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      inputProps={{ 'aria-label': label, maxLength, autoComplete: 'given-name' }}
      sx={{ '& input': { textAlign: 'center', fontSize: 32, fontWeight: 600, py: 1 } }}
    />
  );
}
