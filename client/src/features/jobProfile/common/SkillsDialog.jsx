import { useState } from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';
import FormDialogShell from './FormDialogShell';
import useSubmitState from './useSubmitState';
import { JOB_PROFILE_LIMITS } from './jobProfileConfig';

const normalizeSkills = (skills) => skills.map((skill) => skill.trim().slice(0, JOB_PROFILE_LIMITS.skillName)).filter(Boolean);

// Skills are typed and confirmed with Enter; each one becomes a removable chip.
export default function SkillsDialog({ skills, onSubmit, onClose }) {
  const [value, setValue] = useState(skills);
  const { saving, submitError, run } = useSubmitState();
  const limitReached = value.length >= JOB_PROFILE_LIMITS.maxSkills;

  return (
    <FormDialogShell title="Edit skills" onSubmit={() => run(() => onSubmit(value))} onClose={onClose} saving={saving} submitError={submitError}>
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={value}
        onChange={(_, next) => setValue(normalizeSkills(next))}
        renderValue={(items, getItemProps) => items.map((item, index) => <Chip {...getItemProps({ index })} key={item} label={item} />)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Skills"
            helperText={`Press Enter to add a skill. ${value.length}/${JOB_PROFILE_LIMITS.maxSkills}`}
            disabled={limitReached}
          />
        )}
      />
    </FormDialogShell>
  );
}
