import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Alert, Slider,
  FormControl, InputLabel, Select, MenuItem, ListSubheader,
} from '@mui/material';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import VisualizerCanvas from './components/VisualizerCanvas';
import ControlPanel from './components/ControlPanel';
import ComplexityPanel from './components/ComplexityPanel';
import { COMPLEXITY_DATA } from './visualizerConstants';
import { bubbleSortSteps, mergeSortSteps, quickSortSteps, heapSortSteps } from './algorithms/sorting';
import { linearSearchSteps, binarySearchSteps } from './algorithms/searching';
import { bfsSteps, dfsSteps, dijkstraSteps, defaultGraph } from './algorithms/graph';
import { bstInsertSteps, bstTraversalSteps } from './algorithms/trees';
import { fibonacciSteps, knapsackSteps, defaultKnapsack } from './algorithms/dp';

const ALGO_GROUPS = [
  { label: 'Sorting', algos: ['bubbleSort', 'mergeSort', 'quickSort', 'heapSort'] },
  { label: 'Searching', algos: ['linearSearch', 'binarySearch'] },
  { label: 'Graph', algos: ['bfs', 'dfs', 'dijkstra'] },
  { label: 'Trees', algos: ['bstInsert', 'bstInorder', 'bstPreorder', 'bstPostorder'] },
  { label: 'Dynamic Programming', algos: ['fibonacci', 'knapsack'] },
];

const randomArray = (size = 12) => Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
const SPEED_MS = { 1: 900, 2: 650, 3: 400, 4: 220, 5: 100 };
const MIN_SIZE = 5;
const MAX_SIZE = 30;

// Parses "5, 2, 8, 1" style input. Returns { values, error } — never throws,
// so the caller can just check `error` and decide whether to apply it.
function parseCustomArray(input) {
  const parts = input.split(',').map((p) => p.trim()).filter((p) => p !== '');
  if (parts.length < 2) return { values: null, error: `Enter at least 2 numbers, comma-separated` };
  if (parts.length > MAX_SIZE) return { values: null, error: `Max ${MAX_SIZE} numbers allowed` };
  const values = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return { values: null, error: `"${p}" is not a whole number` };
    if (n < 0 || n > 999) return { values: null, error: `Numbers must be between 0 and 999` };
    values.push(n);
  }
  return { values, error: '' };
}

export default function VisualizerPage() {
  const [array, setArray] = useState(() => randomArray());
  const [arraySize, setArraySize] = useState(12);
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');
  const [target, setTarget] = useState('');
  const [targetError, setTargetError] = useState('');
  const [dpN, setDpN] = useState('10');
  const [dpNError, setDpNError] = useState('');
  const [algoKey, setAlgoKey] = useState('bubbleSort');
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const timerRef = useRef(null);

  const algo = COMPLEXITY_DATA[algoKey];
  const category = algo.category;
  const isSearchAlgo = algoKey === 'linearSearch' || algoKey === 'binarySearch';
  const isFibonacci = algoKey === 'fibonacci';
  const showArrayControls = category === 'sorting' || category === 'searching' || category === 'tree';

  const runAlgorithm = useCallback(() => {
    setIsPlaying(false);

    if (isSearchAlgo) {
      if (target.trim() === '' || isNaN(Number(target))) {
        setTargetError(target.trim() === '' ? '' : 'Enter a valid number');
        setSteps([]);
        setStepIndex(0);
        return;
      }
      setTargetError('');
    }

    if (isFibonacci) {
      const n = Number(dpN);
      if (dpN.trim() === '' || !Number.isInteger(n) || n < 0 || n > 25) {
        setDpNError('Enter a whole number between 0 and 25');
        setSteps([]);
        setStepIndex(0);
        return;
      }
      setDpNError('');
    }

    let generated = [];
    if (algoKey === 'bubbleSort') generated = bubbleSortSteps(array);
    else if (algoKey === 'mergeSort') generated = mergeSortSteps(array);
    else if (algoKey === 'quickSort') generated = quickSortSteps(array);
    else if (algoKey === 'heapSort') generated = heapSortSteps(array);
    else if (algoKey === 'linearSearch') generated = linearSearchSteps(array, Number(target));
    else if (algoKey === 'binarySearch') generated = binarySearchSteps(array, Number(target));
    else if (algoKey === 'bfs') generated = bfsSteps(defaultGraph, 'A');
    else if (algoKey === 'dfs') generated = dfsSteps(defaultGraph, 'A');
    else if (algoKey === 'dijkstra') generated = dijkstraSteps(defaultGraph, 'A');
    else if (algoKey === 'bstInsert') generated = bstInsertSteps(array);
    else if (algoKey === 'bstInorder') generated = bstTraversalSteps(array, 'inorder');
    else if (algoKey === 'bstPreorder') generated = bstTraversalSteps(array, 'preorder');
    else if (algoKey === 'bstPostorder') generated = bstTraversalSteps(array, 'postorder');
    else if (algoKey === 'fibonacci') generated = fibonacciSteps(Number(dpN));
    else if (algoKey === 'knapsack') generated = knapsackSteps(defaultKnapsack.weights, defaultKnapsack.values, defaultKnapsack.capacity);
    setSteps(generated);
    setStepIndex(0);
  }, [algoKey, array, target, isSearchAlgo, dpN, isFibonacci]);

  useEffect(() => {
    runAlgorithm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algoKey, array]);

  useEffect(() => {
    if (!isPlaying) { clearTimeout(timerRef.current); return; }
    if (stepIndex >= steps.length - 1) { setIsPlaying(false); return; }
    timerRef.current = setTimeout(() => setStepIndex((i) => i + 1), SPEED_MS[speed]);
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, stepIndex, steps.length, speed]);

  const currentStep = steps[stepIndex];

  const applyCustomArray = () => {
    const { values, error } = parseCustomArray(customInput);
    if (error) { setCustomError(error); return; }
    setCustomError('');
    setArraySize(values.length);
    setArray(values);
  };

  const handleSizeCommit = (e, newSize) => {
    setArraySize(newSize);
    setArray(randomArray(newSize));
    setCustomInput('');
    setCustomError('');
  };

  return (
    // Fixed to the viewport on md+ so the whole tool fits on one screen —
    // no scrolling to see the canvas, controls, and complexity panel together.
    // On small screens (xs/sm) it falls back to natural scroll: cramming this
    // many controls into one fixed-height screen on a phone would make
    // everything too small to use.
    <Box
      sx={{
        height: { xs: 'auto', md: 'calc(100vh - 64px)' },
        display: 'flex',
        flexDirection: 'column',
        overflow: { xs: 'visible', md: 'hidden' },
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 2 },
        maxWidth: 1400,
        mx: 'auto',
        width: '100%',
      }}
    >
      {/* Compact header + all controls in one row */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Algorithm Visualizer</Typography>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="algo-select-label">Algorithm</InputLabel>
            <Select
              labelId="algo-select-label"
              value={algoKey}
              label="Algorithm"
              onChange={(e) => setAlgoKey(e.target.value)}
              MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
            >
              {ALGO_GROUPS.flatMap((group) => [
                <ListSubheader key={group.label}>{group.label}</ListSubheader>,
                ...group.algos.map((key) => (
                  <MenuItem key={key} value={key}>{COMPLEXITY_DATA[key].name}</MenuItem>
                )),
              ])}
            </Select>
          </FormControl>

          {showArrayControls && (
            <Button startIcon={<ShuffleRoundedIcon />} onClick={() => setArray(randomArray(arraySize))} variant="outlined" size="small" sx={{ fontWeight: 600, height: 40 }}>
              New array
            </Button>
          )}

          {showArrayControls && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TuneRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Slider
                size="small"
                value={arraySize}
                min={MIN_SIZE}
                max={MAX_SIZE}
                step={1}
                valueLabelDisplay="auto"
                onChange={(e, val) => setArraySize(val)}
                onChangeCommitted={handleSizeCommit}
                sx={{ width: 110 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 20 }}>{arraySize}</Typography>
            </Box>
          )}

          {showArrayControls && (
            <TextField
              size="small"
              label={category === 'tree' ? 'Custom values' : 'Custom array'}
              placeholder="5, 2, 8, 1"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyCustomArray()}
              error={Boolean(customError)}
              helperText={customError || ' '}
              sx={{ width: 190 }}
            />
          )}
          {showArrayControls && (
            <Button onClick={applyCustomArray} variant="text" size="small" sx={{ fontWeight: 600, height: 40 }}>
              Apply
            </Button>
          )}

          {isSearchAlgo && (
            <TextField
              size="small"
              label="Target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onBlur={runAlgorithm}
              onKeyDown={(e) => e.key === 'Enter' && runAlgorithm()}
              error={Boolean(targetError)}
              helperText={targetError || ' '}
              sx={{ width: 110 }}
            />
          )}
          {isFibonacci && (
            <TextField
              size="small"
              label="n (0–25)"
              value={dpN}
              onChange={(e) => setDpN(e.target.value)}
              onBlur={runAlgorithm}
              onKeyDown={(e) => e.key === 'Enter' && runAlgorithm()}
              error={Boolean(dpNError)}
              helperText={dpNError || ' '}
              sx={{ width: 120 }}
            />
          )}
          {algoKey === 'knapsack' && (
            <Alert severity="info" sx={{ py: 0, alignItems: 'center' }}>
              Demo items — weights [2,3,4,5], values [3,4,5,6], capacity 5.
            </Alert>
          )}
        </Box>
      </Box>

      {/* Main area — fills remaining height, no page scroll on md+ */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Paper variant="outlined" sx={{ flex: 2, minHeight: 0, display: 'flex', flexDirection: 'column', p: 2, borderRadius: 3 }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', alignItems: 'center', width: '100%' }}>
            {currentStep ? (
              <VisualizerCanvas category={category} step={currentStep} graph={defaultGraph} />
            ) : isSearchAlgo ? (
              <Alert severity="info" sx={{ width: '100%' }}>Enter a target value to search for.</Alert>
            ) : isFibonacci ? (
              <Alert severity="info" sx={{ width: '100%' }}>Enter a value of n to compute.</Alert>
            ) : (
              <Alert severity="info" sx={{ width: '100%' }}>Preparing visualization…</Alert>
            )}
          </Box>
          <Box sx={{ flexShrink: 0, mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <ControlPanel
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying((p) => !p)}
              onNext={() => setStepIndex((i) => Math.min(i + 1, steps.length - 1))}
              onPrev={() => setStepIndex((i) => Math.max(i - 1, 0))}
              onReset={() => { setIsPlaying(false); setStepIndex(0); }}
              stepIndex={stepIndex}
              totalSteps={steps.length || 1}
              speed={speed}
              onSpeedChange={setSpeed}
            />
          </Box>
        </Paper>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', minWidth: { md: 280 } }}>
          <ComplexityPanel algo={algo} opsCount={currentStep?.opsCount} description={currentStep?.description} />
        </Box>
      </Box>
    </Box>
  );
}
