import { useState } from 'react';
import useSubmitState from './useSubmitState';
import { normalizeValues, validateEntry } from './jobProfileValidation';

export default function useEntryForm({ fields, initialValues, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const { saving, submitError, run } = useSubmitState();

  const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const submit = () => {
    const found = validateEntry(fields, values);
    setErrors(found);
    if (Object.keys(found).length === 0) run(() => onSubmit(normalizeValues(fields, values)));
  };

  return { values, errors, saving, submitError, setValue, submit };
}
