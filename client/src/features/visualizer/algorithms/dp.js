export const defaultKnapsack = {
  weights: [2, 3, 4, 5],
  values: [3, 4, 5, 6],
  capacity: 5,
};

export function fibonacciSteps(n) {
  const memo = new Array(n + 1).fill(null);
  const steps = [];
  let calls = 0, cacheHits = 0;

  const record = (highlightIdx, description) =>
    steps.push({ memo: [...memo], highlightIdx, opsCount: { calls, cacheHits }, description });

  record(null, `Computing Fibonacci(${n}) with memoization`);

  function fib(i) {
    calls++;
    if (i <= 1) { memo[i] = i; record(i, `Base case: fib(${i}) = ${i}`); return i; }
    if (memo[i] !== null) { cacheHits++; record(i, `Cache hit: fib(${i}) already computed = ${memo[i]}`); return memo[i]; }
    record(i, `Computing fib(${i}) = fib(${i - 1}) + fib(${i - 2})`);
    const result = fib(i - 1) + fib(i - 2);
    memo[i] = result;
    record(i, `Stored fib(${i}) = ${result}`);
    return result;
  }

  fib(n);
  record(null, `Done: fib(${n}) = ${memo[n]}`);
  return steps;
}

export function knapsackSteps(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  const steps = [];
  let cellsComputed = 0;

  const record = (row, col, description) =>
    steps.push({ dp: dp.map((r) => [...r]), currentCell: [row, col], opsCount: { cellsComputed }, description });

  record(-1, -1, `Building DP table: ${n} items, capacity ${capacity}`);

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      cellsComputed++;
      if (weights[i - 1] <= w) {
        const takeValue = values[i - 1] + dp[i - 1][w - weights[i - 1]];
        const skipValue = dp[i - 1][w];
        dp[i][w] = Math.max(takeValue, skipValue);
        record(i, w, `Item ${i} (w=${weights[i - 1]}, v=${values[i - 1]}) fits in ${w} — max(take=${takeValue}, skip=${skipValue}) = ${dp[i][w]}`);
      } else {
        dp[i][w] = dp[i - 1][w];
        record(i, w, `Item ${i} (w=${weights[i - 1]}) too heavy for capacity ${w} — carry forward ${dp[i][w]}`);
      }
    }
  }

  record(-1, -1, `Done: max value with capacity ${capacity} = ${dp[n][capacity]}`);
  return steps;
}
