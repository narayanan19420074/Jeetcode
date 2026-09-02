import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Box,
  Typography,
  IconButton,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TYPES = ['int', 'float', 'string', 'bool', 'int[]', 'float[]', 'string[]', 'bool[]', 'int[][]'];

const emptyExample = { input: '', output: '', explanation: '' };
const emptyParam = { name: '', type: 'int' };
const emptyTestCase = { stdin: '', expectedOutput: '', isSample: false };

const initialForm = {
  title: '',
  difficulty: 'Easy',
  tags: '',
  companies: '',
  description: '',
  isPublished: false,
  functionName: '',
  returnType: 'int',
};

// Admin "Add Question" form — this IS the UI counterpart to
// POST /api/admin/problems. Uses the spec-based authoring path
// (functionName + params + returnType) since that's the path the backend
// prefers and auto-generates starterCode/driverCode for all 3 languages —
// no need to hand-write JS/Python/C++ harnesses in this form. Problems
// needing custom data structures (linked lists, trees) still have to go
// through the API directly with manual starterCode/driverCode, same as
// today.
export default function AddProblemDialog({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [examples, setExamples] = useState([{ ...emptyExample }]);
  const [constraints, setConstraints] = useState(['']);
  const [params, setParams] = useState([{ ...emptyParam }]);
  const [testCases, setTestCases] = useState([{ ...emptyTestCase }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setForm(initialForm);
    setExamples([{ ...emptyExample }]);
    setConstraints(['']);
    setParams([{ ...emptyParam }]);
    setTestCases([{ ...emptyTestCase }]);
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // --- Examples ---
  const updateExample = (i, key, value) =>
    setExamples((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, [key]: value } : ex)));
  const addExample = () => setExamples((prev) => [...prev, { ...emptyExample }]);
  const removeExample = (i) => setExamples((prev) => prev.filter((_, idx) => idx !== i));

  // --- Constraints ---
  const updateConstraint = (i, value) => setConstraints((prev) => prev.map((c, idx) => (idx === i ? value : c)));
  const addConstraint = () => setConstraints((prev) => [...prev, '']);
  const removeConstraint = (i) => setConstraints((prev) => prev.filter((_, idx) => idx !== i));

  // --- Params ---
  const updateParam = (i, key, value) =>
    setParams((prev) => prev.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));
  const addParam = () => setParams((prev) => [...prev, { ...emptyParam }]);
  const removeParam = (i) => setParams((prev) => prev.filter((_, idx) => idx !== i));

  // --- Test cases ---
  const updateTestCase = (i, key, value) =>
    setTestCases((prev) => prev.map((tc, idx) => (idx === i ? { ...tc, [key]: value } : tc)));
  const addTestCase = () => setTestCases((prev) => [...prev, { ...emptyTestCase }]);
  const removeTestCase = (i) => setTestCases((prev) => prev.filter((_, idx) => idx !== i));

  const isValid =
    form.title.trim().length >= 3 &&
    form.description.trim().length >= 10 &&
    form.functionName.trim().length > 0 &&
    params.every((p) => p.name.trim().length > 0) &&
    examples.every((ex) => ex.input.trim() && ex.output.trim()) &&
    testCases.every((tc) => tc.stdin.trim() !== '' && tc.expectedOutput.trim() !== '');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        difficulty: form.difficulty,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        companies: form.companies.split(',').map((c) => c.trim()).filter(Boolean),
        description: form.description.trim(),
        isPublished: form.isPublished,
        examples: examples.map((ex) => ({
          input: ex.input.trim(),
          output: ex.output.trim(),
          ...(ex.explanation.trim() ? { explanation: ex.explanation.trim() } : {}),
        })),
        constraints: constraints.map((c) => c.trim()).filter(Boolean),
        functionName: form.functionName.trim(),
        params: params.map((p) => ({ name: p.name.trim(), type: p.type })),
        returnType: form.returnType,
        testCases: testCases.map((tc) => ({
          stdin: tc.stdin,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
        })),
      };

      await adminApi.createProblem(payload);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Add Question</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* --- Basics --- */}
          <Stack spacing={2}>
            <TextField label="Title" value={form.title} onChange={setField('title')} fullWidth size="small" required />
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Difficulty"
                value={form.difficulty}
                onChange={setField('difficulty')}
                sx={{ minWidth: 160 }}
                size="small"
              >
                {DIFFICULTIES.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Tags (comma separated)"
                value={form.tags}
                onChange={setField('tags')}
                fullWidth
                size="small"
                placeholder="Array, Two Pointers"
              />
            </Stack>
            <TextField
              label="Companies (comma separated, optional — makes this a Pro/premium problem)"
              value={form.companies}
              onChange={setField('companies')}
              fullWidth
              size="small"
              placeholder="Google, Amazon"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={setField('description')}
              fullWidth
              multiline
              minRows={3}
              size="small"
              required
            />
            <FormControlLabel
              control={<Checkbox checked={form.isPublished} onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))} />}
              label="Publish immediately (otherwise saved as draft)"
            />
          </Stack>

          <Divider />

          {/* --- Examples --- */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Examples
              </Typography>
              <Button size="small" startIcon={<AddRoundedIcon fontSize="small" />} onClick={addExample}>
                Add example
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              {examples.map((ex, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <TextField
                      label="Input"
                      size="small"
                      value={ex.input}
                      onChange={(e) => updateExample(i, 'input', e.target.value)}
                    />
                    <TextField
                      label="Output"
                      size="small"
                      value={ex.output}
                      onChange={(e) => updateExample(i, 'output', e.target.value)}
                    />
                    <TextField
                      label="Explanation (optional)"
                      size="small"
                      value={ex.explanation}
                      onChange={(e) => updateExample(i, 'explanation', e.target.value)}
                    />
                  </Stack>
                  <IconButton size="small" onClick={() => removeExample(i)} disabled={examples.length === 1}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* --- Constraints --- */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Constraints
              </Typography>
              <Button size="small" startIcon={<AddRoundedIcon fontSize="small" />} onClick={addConstraint}>
                Add constraint
              </Button>
            </Stack>
            <Stack spacing={1}>
              {constraints.map((c, i) => (
                <Stack key={i} direction="row" spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="1 <= n <= 10^5"
                    value={c}
                    onChange={(e) => updateConstraint(i, e.target.value)}
                  />
                  <IconButton size="small" onClick={() => removeConstraint(i)} disabled={constraints.length === 1}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* --- Function signature (auto-generates starter/driver code) --- */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Function Signature
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Starter code and the hidden test-case driver are auto-generated for JavaScript, Python, and C++ from
              this signature.
            </Typography>
            <Stack spacing={1.5}>
              <TextField
                label="Function name"
                size="small"
                value={form.functionName}
                onChange={setField('functionName')}
                placeholder="twoSum"
                required
              />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Parameters
                </Typography>
                <Button size="small" startIcon={<AddRoundedIcon fontSize="small" />} onClick={addParam}>
                  Add parameter
                </Button>
              </Stack>
              {params.map((p, i) => (
                <Stack key={i} direction="row" spacing={1}>
                  <TextField
                    size="small"
                    label="Name"
                    value={p.name}
                    onChange={(e) => updateParam(i, 'name', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Type"
                    value={p.type}
                    onChange={(e) => updateParam(i, 'type', e.target.value)}
                    sx={{ minWidth: 140 }}
                  >
                    {TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                  <IconButton size="small" onClick={() => removeParam(i)} disabled={params.length === 1}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              <TextField
                select
                label="Return type"
                size="small"
                value={form.returnType}
                onChange={setField('returnType')}
                sx={{ maxWidth: 200 }}
              >
                {TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Box>

          <Divider />

          {/* --- Test cases --- */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Test Cases
              </Typography>
              <Button size="small" startIcon={<AddRoundedIcon fontSize="small" />} onClick={addTestCase}>
                Add test case
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              {testCases.map((tc, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    <TextField
                      label="stdin"
                      size="small"
                      value={tc.stdin}
                      onChange={(e) => updateTestCase(i, 'stdin', e.target.value)}
                    />
                    <TextField
                      label="Expected output"
                      size="small"
                      value={tc.expectedOutput}
                      onChange={(e) => updateTestCase(i, 'expectedOutput', e.target.value)}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={tc.isSample}
                          onChange={(e) => updateTestCase(i, 'isSample', e.target.checked)}
                        />
                      }
                      label="Show to user before submit (sample case)"
                    />
                  </Stack>
                  <IconButton size="small" onClick={() => removeTestCase(i)} disabled={testCases.length === 1}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" disableElevation disabled={!isValid || submitting} onClick={handleSubmit}>
          {submitting ? 'Creating…' : 'Create Problem'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
