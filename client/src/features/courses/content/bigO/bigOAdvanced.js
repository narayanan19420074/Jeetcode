import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const amortizedAnalysis = lesson('l1', 'Amortized analysis', 20, [
  text('Some operations are usually cheap and occasionally expensive. Amortized analysis averages the cost over a whole sequence of operations, so one rare expensive step does not hide the typical cost.'),
  heading('Appending to a dynamic array'),
  text('A Python list keeps spare room at the end. An append into spare room costs O(1). When the room is full, Python allocates a bigger block, about 12 percent larger in CPython, and copies every item. The copy costs O(n), but it happens rarely.'),
  text('Consider a simpler array that doubles its size when full. For n appends the copies cost 1 + 2 + 4 + ... + n, which is less than 2n. The total is about 3n steps for n appends, so each append costs O(1) amortized.'),
  code('items = []\nfor value in range(1_000_000):\n    items.append(value)   # O(1) amortized'),
  heading('Amortized is not average case'),
  bullets('Average case: the expected cost for a random input, which may rely on probability', 'Amortized: a guaranteed average over a sequence of operations, whatever the input'),
  note('Amortized O(1) means a single call can still be slow. If every call must finish within a strict time limit, as in real-time systems, amortized bounds are not enough.', 'warning'),
], [
  predict('e1', 'What is the amortized cost of one append on a dynamic array that doubles when full?', '', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 0, 'The occasional O(n) copy is spread over many cheap appends, so the average cost per append is constant.'),
  task('e2', 'An array doubles from 1 to 2 to 4 to 8 items. How many items are copied in total over these three resizes, and how does that compare with the 8 items stored at the end?', 'Add the sizes at the moment of each resize.', 'The resizes copy 1 + 2 + 4 = 7 items. That is less than the 8 items stored, so the copying adds only a constant amount of work per item.'),
]);

const masterTheorem = lesson('l2', 'Recurrences and the Master theorem', 30, [
  text('Divide and conquer algorithms are described by a recurrence: T(n) = a x T(n/b) + f(n). The algorithm makes a recursive calls on inputs of size n/b and does f(n) extra work to split and combine.'),
  heading('The three cases'),
  text('Compare f(n) with n^c, where c = log base b of a. This n^c is the total work of the leaves of the call tree.'),
  bullets('Case 1: f(n) grows slower than n^c. The leaves dominate, so T(n) = Theta(n^c)', 'Case 2: f(n) grows like n^c. Every level costs the same, so T(n) = Theta(n^c x log n)', 'Case 3: f(n) grows faster than n^c (and is regular). The top level dominates, so T(n) = Theta(f(n))'),
  heading('Examples'),
  code('Merge sort:    T(n) = 2T(n/2) + n     c = 1, f = n    case 2 -> O(n log n)\nBinary search: T(n) = 1T(n/2) + 1     c = 0, f = 1    case 2 -> O(log n)\nT(n) = 4T(n/2) + n                    c = 2, f = n    case 1 -> O(n²)\nT(n) = 2T(n/2) + n²                   c = 1, f = n²   case 3 -> O(n²)'),
  note('The Master theorem only applies when the subproblems have the same size n/b. Fibonacci, which calls itself with n - 1 and n - 2, needs a different method.', 'warning'),
], [
  predict('e1', 'Which complexity does the recurrence T(n) = 2T(n/2) + n give?', '', ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], 1, 'Here c = log2(2) = 1 and f(n) = n, so f grows like n^c. That is case 2, giving n log n.'),
  task('e2', 'Use the Master theorem to solve T(n) = 8T(n/2) + n².', 'Work out c = log_b a first, then compare with f(n).', 'a = 8 and b = 2, so c = log2(8) = 3.\nf(n) = n² grows slower than n³, so this is case 1.\nT(n) = Theta(n³).'),
]);

const recursionSpace = lesson('l3', 'Space complexity of recursion', 20, [
  text('Every function call that is waiting for a result takes space on the call stack. The space of a recursive function is therefore the deepest chain of calls, not the total number of calls.'),
  code('def count_down(n):\n    if n == 0:\n        return\n    count_down(n - 1)'),
  text('count_down(n) creates a chain n calls deep, so its space complexity is O(n), even though no list is built. A loop that does the same work uses O(1) space.'),
  heading('Naive Fibonacci'),
  text('The naive fib(n) makes 2^n calls, but they are not all active at once. The deepest chain has n calls, so its space complexity is O(n) while its time is O(2^n).'),
  heading('Python limits recursion depth'),
  text('CPython stops a recursion at about 1,000 calls and raises RecursionError. A loop does not have that limit.'),
  note('When a function can be written as a simple loop, the loop is usually the better answer in Python: it uses O(1) space and cannot overflow the stack.'),
], [
  predict('e1', 'What is the space complexity of this function, ignoring the input?', 'def total(n):\n    if n == 0:\n        return 0\n    return n + total(n - 1)', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'The chain of waiting calls is n deep, and each one occupies a stack frame.'),
  task('e2', 'Rewrite total(n) from the question above as a loop so that it uses O(1) space.', 'Keep a running sum in one variable.', 'def total(n):\n    result = 0\n    for value in range(1, n + 1):\n        result += value\n    return result'),
]);

const memoization = lesson('l4', 'Memoization and dynamic programming', 25, [
  text('Naive Fibonacci is slow because it solves the same subproblem again and again: fib(30) calls fib(2) hundreds of thousands of times. Memoization stores each result the first time it is computed, so every subproblem is solved once.'),
  code('from functools import cache\n\n@cache\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(50))', '12586269025'),
  text('There are only n different inputs, and each is computed once with constant extra work, so the time drops from O(2^n) to O(n). The cache holds n results, so the space is O(n).'),
  heading('Bottom-up dynamic programming'),
  text('The same idea without recursion fills the answers from the smallest case up. Because each value needs only the two before it, you can keep just two variables.'),
  code('def fib(n):\n    previous, current = 0, 1\n    for _ in range(n):\n        previous, current = current, previous + current\n    return previous'),
  text('This version is O(n) time and O(1) space.'),
  note('Dynamic programming applies when a problem has overlapping subproblems and an optimal substructure. Typical examples are the knapsack problem, shortest paths and the longest common subsequence.'),
], [
  predict('e1', 'What is the time complexity of fib(n) with the @cache decorator?', '', ['O(1)', 'O(n)', 'O(2^n)', 'O(n²)'], 1, 'Each of the n distinct values is computed once, and every later call is a constant-time cache lookup.'),
  task('e2', 'The function below counts the ways to climb n steps taking 1 or 2 steps at a time, but it is O(2^n). Add memoization to make it O(n).\n\ndef ways(n):\n    if n <= 1:\n        return 1\n    return ways(n - 1) + ways(n - 2)', 'Use functools.cache.', 'from functools import cache\n\n@cache\ndef ways(n):\n    if n <= 1:\n        return 1\n    return ways(n - 1) + ways(n - 2)'),
]);

const hardProblems = lesson('l5', 'Polynomial and exponential problems', 20, [
  text('Computer scientists group problems by the best known running time. The most important line separates polynomial time from exponential time.'),
  bullets('Polynomial time: O(n), O(n²), O(n³) and so on. Practical for large inputs', 'Exponential time: O(2^n), O(n!) and so on. Practical only for small inputs'),
  heading('P and NP'),
  bullets('P: problems that can be solved in polynomial time, such as sorting and shortest path', 'NP: problems whose proposed solution can be checked in polynomial time, such as a filled Sudoku', 'NP-complete: the hardest problems in NP. If one of them had a fast algorithm, all of them would'),
  text('Examples of NP-complete problems are the travelling salesman decision problem and subset sum. Whether P equals NP is the best known open question in computer science.'),
  heading('What to do in practice'),
  bullets('Use brute force only for small n, for example n up to about 20 for 2^n', 'Use a heuristic or approximation algorithm that gives a good answer quickly', 'Use dynamic programming when the numbers involved are small, as in the knapsack problem'),
  note('Exponential is not the same as unusable. A well-pruned search such as backtracking can solve many practical cases of a hard problem.'),
], [
  predict('e1', 'Which of these running times is NOT polynomial?', '', ['O(n)', 'O(n³)', 'O(n log n)', 'O(2^n)'], 3, 'The variable n is in the exponent in 2^n. The others are bounded by a power of n.'),
  task('e2', 'A brute-force algorithm checks all subsets of n items. How many subsets are there, and why does it fail for n = 100?', 'Each item is either in or out of a subset.', 'There are 2^n subsets. For n = 100 that is about 10^30, far more than any computer can check, so a smarter method is needed.'),
]);

export const bigOAdvanced = courseModule('a1', 'advanced', 'Advanced analysis', [amortizedAnalysis, masterTheorem, recursionSpace, memoization, hardProblems]);
