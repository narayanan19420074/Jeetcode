import { makeIdArray } from './arrayUtils';

export function linearSearchSteps(input, target) {
  const arr = makeIdArray(input);
  const steps = [];
  let comparisons = 0;

  const record = (comparing, foundIndex, description) =>
    steps.push({ array: arr.map(({ id, value }) => ({ id, value })), comparingIndices: comparing, foundIndex, opsCount: { comparisons }, description });

  record([], null, `Searching for ${target}`);

  for (let i = 0; i < arr.length; i++) {
    comparisons++;
    record([i], null, `Checking index ${i} (value ${arr[i].value})`);
    if (arr[i].value === target) {
      record([i], i, `Found ${target} at index ${i}!`);
      return steps;
    }
  }
  record([], -1, `${target} not found in array`);
  return steps;
}

export function binarySearchSteps(input, target) {
  const arr = makeIdArray(input).sort((a, b) => a.value - b.value);
  const steps = [];
  let comparisons = 0;

  const record = (comparing, range, mid, foundIndex, description) =>
    steps.push({ array: arr.map(({ id, value }) => ({ id, value })), comparingIndices: comparing, rangeIndices: range, midIndex: mid, foundIndex, opsCount: { comparisons }, description });

  record([], null, null, null, 'Array sorted first — binary search needs sorted input');

  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;
    record([mid], [low, high], mid, null, `Checking mid index ${mid} (value ${arr[mid].value})`);
    if (arr[mid].value === target) {
      record([mid], [low, high], mid, mid, `Found ${target} at index ${mid}!`);
      return steps;
    }
    if (arr[mid].value < target) low = mid + 1;
    else high = mid - 1;
  }
  record([], [low, high], null, -1, `${target} not found in array`);
  return steps;
}
