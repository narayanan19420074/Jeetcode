import { makeIdArray } from './arrayUtils';

// Pure step-generator functions — no React, no side effects.
// Each returns an array of snapshots the UI just indexes into for play/pause/step.
// Every element carries a stable `id` (its original position) that survives
// swaps/copies, so the UI can animate real position changes instead of
// recoloring values in place.

const snap = (arr, { comparing = [], swapped = [], sorted = [], pivot = null, mid = null, range = null }, comparisons, swaps, description) => ({
  array: arr.map(({ id, value }) => ({ id, value })),
  comparingIndices: comparing,
  swappedIndices: swapped,
  sortedIndices: sorted,
  pivotIndex: pivot,
  midIndex: mid,
  rangeIndices: range,
  opsCount: { comparisons, swaps },
  description,
});

export function bubbleSortSteps(input) {
  const arr = makeIdArray(input);
  const n = arr.length;
  const steps = [];
  let comparisons = 0, swaps = 0;
  const sortedIdx = [];

  steps.push(snap(arr, {}, comparisons, swaps, 'Start: unsorted array'));

  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false;
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      steps.push(snap(arr, { comparing: [j, j + 1], sorted: sortedIdx }, comparisons, swaps, `Comparing index ${j} and ${j + 1}`));
      if (arr[j].value > arr[j + 1].value) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;
        swappedInPass = true;
        steps.push(snap(arr, { swapped: [j, j + 1], sorted: sortedIdx }, comparisons, swaps, `Swapped index ${j} and ${j + 1}`));
      }
    }
    sortedIdx.unshift(n - 1 - i);
    if (!swappedInPass) break;
  }
  const allSorted = Array.from({ length: n }, (_, i) => i);
  steps.push(snap(arr, { sorted: allSorted }, comparisons, swaps, 'Sorted!'));
  return steps;
}

export function mergeSortSteps(input) {
  const arr = makeIdArray(input);
  const steps = [];
  let comparisons = 0, writes = 0;

  const record = (comparing, swapped, description) =>
    steps.push(snap(arr, { comparing, swapped }, comparisons, writes, description));

  record([], [], 'Start: unsorted array');

  function mergeSort(start, end) {
    if (end - start <= 1) return;
    const mid = Math.floor((start + end) / 2);
    mergeSort(start, mid);
    mergeSort(mid, end);
    merge(start, mid, end);
  }

  function merge(start, mid, end) {
    const left = arr.slice(start, mid);
    const right = arr.slice(mid, end);
    let i = 0, j = 0, k = start;
    while (i < left.length && j < right.length) {
      comparisons++;
      record([k], [], `Comparing left[${i}]=${left[i].value} vs right[${j}]=${right[j].value}`);
      arr[k] = left[i].value <= right[j].value ? (i++, left[i - 1]) : (j++, right[j - 1]);
      writes++; k++;
      record([], [k - 1], `Placed ${arr[k - 1].value} at index ${k - 1}`);
    }
    while (i < left.length) { arr[k] = left[i++]; k++; writes++; record([], [k - 1], `Copying remaining left value ${arr[k - 1].value}`); }
    while (j < right.length) { arr[k] = right[j++]; k++; writes++; record([], [k - 1], `Copying remaining right value ${arr[k - 1].value}`); }
  }

  mergeSort(0, arr.length);
  record([], [], 'Sorted!');
  return steps;
}

export function quickSortSteps(input) {
  const arr = makeIdArray(input);
  const steps = [];
  let comparisons = 0, swaps = 0;

  const record = (comparing, swapped, pivot, description) =>
    steps.push(snap(arr, { comparing, swapped, pivot }, comparisons, swaps, description));

  record([], [], null, 'Start: unsorted array');

  function swap(i, j) { [arr[i], arr[j]] = [arr[j], arr[i]]; swaps++; }

  function partition(low, high) {
    const pivotValue = arr[high].value;
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      record([j, high], [], high, `Comparing arr[${j}]=${arr[j].value} with pivot=${pivotValue}`);
      if (arr[j].value < pivotValue) {
        i++;
        if (i !== j) { swap(i, j); record([], [i, j], high, `Swapped index ${i} and ${j}`); }
      }
    }
    swap(i + 1, high);
    record([], [i + 1, high], i + 1, `Placed pivot at index ${i + 1}`);
    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  quickSort(0, arr.length - 1);
  record([], [], null, 'Sorted!');
  return steps;
}

export function heapSortSteps(input) {
  const arr = makeIdArray(input);
  const n = arr.length;
  const steps = [];
  let comparisons = 0, swaps = 0;

  const record = (comparing, swapped, description) =>
    steps.push(snap(arr, { comparing, swapped }, comparisons, swaps, description));

  record([], [], 'Start: unsorted array');

  function heapify(size, root) {
    let largest = root;
    const left = 2 * root + 1, right = 2 * root + 2;
    if (left < size) {
      comparisons++;
      record([left, largest], [], `Comparing left child idx ${left} with idx ${largest}`);
      if (arr[left].value > arr[largest].value) largest = left;
    }
    if (right < size) {
      comparisons++;
      record([right, largest], [], `Comparing right child idx ${right} with idx ${largest}`);
      if (arr[right].value > arr[largest].value) largest = right;
    }
    if (largest !== root) {
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      swaps++;
      record([], [root, largest], `Swapped index ${root} and ${largest}`);
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  record([], [], 'Max-heap built');

  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    swaps++;
    record([], [0, i], `Moved max to index ${i}`);
    heapify(i, 0);
  }

  record([], [], 'Sorted!');
  return steps;
}
