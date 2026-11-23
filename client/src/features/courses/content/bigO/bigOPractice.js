import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const constraintsGuide = lesson('l1', 'Choosing an algorithm from the input size', 20, [
  text('Before you write code, estimate how many steps your idea needs and compare it with what the machine can do. A rule of thumb for Python is about 10 million simple operations per second, and compiled languages manage roughly ten times more.'),
  heading('Largest practical input for each complexity'),
  code('n up to 10          ->  O(n!) is fine\nn up to 20          ->  O(2^n)\nn up to 500         ->  O(n³)\nn up to 5,000       ->  O(n²)\nn up to 1,000,000   ->  O(n log n) or O(n)\nn above 10^8        ->  O(log n) or O(1)'),
  text('This table is a guide, not a law. Constant factors and the language matter, but the order of magnitude is reliable.'),
  heading('Using the table'),
  text('A problem says the list has up to 100,000 items. An O(n²) idea needs about 10 billion steps, which is far too slow, so you must look for O(n log n) or O(n). The input limit points you towards the intended solution.'),
  note('Always read the limits in a problem statement first. They tell you which complexity the problem setter expects.'),
], [
  predict('e1', 'A problem allows n up to 200,000. Which approach is the most likely to finish in time in Python?', '', ['O(n²) nested loops', 'O(n log n) sorting', 'O(2^n) brute force', 'O(n³) triple loop'], 1, 'n log n is about 3.5 million steps. n² would be 40 billion steps, which is far too slow.'),
  task('e2', 'A problem says 1 <= n <= 20 and asks for the best subset of items. Which complexity can you afford, and what approach does it suggest?', 'Look at the first row of the table that allows n = 20.', 'O(2^n) is affordable: 2^20 is about one million subsets. This suggests checking every subset with brute force or backtracking.'),
]);

const optimisationPatterns = lesson('l2', 'Patterns that lower complexity', 25, [
  text('A few patterns appear again and again when a slow solution has to become fast.'),
  heading('Use a hash set or dictionary to avoid an inner loop'),
  text('Two Sum asks for two numbers in a list that add up to a target. The nested loop is O(n²). Storing the numbers already seen makes it O(n).'),
  code('def two_sum(numbers, target):\n    seen = {}\n    for index, value in enumerate(numbers):\n        needed = target - value\n        if needed in seen:\n            return seen[needed], index\n        seen[value] = index\n    return None\n\nprint(two_sum([2, 7, 11, 15], 9))', '(0, 1)'),
  heading('Sort first, then use two pointers'),
  text('On a sorted list, one pointer at the start and one at the end can find a pair in a single O(n) pass. The sort costs O(n log n), so the total is O(n log n) with O(1) extra space.'),
  heading('Precompute with prefix sums'),
  text('If you must answer many range-sum questions, build a list of running totals once in O(n). Each range sum is then one subtraction, which is O(1).'),
  code('numbers = [3, 1, 4, 1, 5]\nprefix = [0]\nfor value in numbers:\n    prefix.append(prefix[-1] + value)\n\nprint(prefix[4] - prefix[1])   # sum of numbers[1:4]', '6'),
  heading('Slide a window'),
  text('To find the best run of k consecutive items, add the new item and remove the old one as the window moves, instead of re-adding k items each time. This turns O(n x k) into O(n).'),
], [
  predict('e1', 'Which pattern turns the O(n²) Two Sum into O(n)?', '', ['Sorting the list twice', 'Storing the values already seen in a dictionary', 'Using recursion', 'Using a list instead of a dictionary'], 1, 'The dictionary answers "have I seen the number I need?" in O(1), which replaces the inner loop.'),
  task('e2', 'Write a function max_window_sum(numbers, k) that returns the largest sum of k consecutive items in O(n) time. Assume len(numbers) >= k.', 'Compute the first window, then add one item and remove one item per step.', 'def max_window_sum(numbers, k):\n    window = sum(numbers[:k])\n    best = window\n    for i in range(k, len(numbers)):\n        window += numbers[i] - numbers[i - k]\n        best = max(best, window)\n    return best'),
]);

const timeSpaceTradeoff = lesson('l3', 'Trading space for time', 15, [
  text('Many speed-ups cost memory. Knowing both sides lets you pick the right trade for the situation.'),
  bullets('Hash set for duplicates: O(n) time, O(n) space, instead of O(n²) time and O(1) space', 'Memoization: O(n) time and space, instead of O(2^n) time', 'Prefix sums: O(n) extra space, then O(1) per range query', 'Sorting in place: O(1) extra space, but slower than a hash for some tasks'),
  text('There is no universal winner. A phone app with limited memory may prefer the slower, smaller solution. A server answering millions of requests usually prefers the faster one.'),
  heading('Questions to ask'),
  bullets('How large can the input be?', 'Is memory limited, or is speed limited?', 'Is the work repeated many times, so that precomputation pays off?', 'Is the input already sorted, or can it be sorted once and reused?'),
  note('Premature optimisation wastes effort. Measure first. Choose a better growth rate when the data is large, and keep clear code when it is small.'),
], [
  predict('e1', 'A hash set finds duplicates in O(n) time. What does it cost in return?', '', ['Nothing', 'O(n) extra space', 'O(n²) time', 'The list must be sorted'], 1, 'The set may hold every item, so memory grows with n.'),
  task('e2', 'A program answers 100,000 questions of the form "what is the sum of items from position a to b?" on a list of 100,000 numbers. Compare summing each range directly with using prefix sums.', 'Count the steps for all the questions in each approach.', 'Summing directly costs O(n) per question, so about 100,000 x 100,000 = 10 billion steps in total.\nPrefix sums cost O(n) once and O(1) per question, so about 200,000 steps in total, for O(n) extra space.'),
]);

const hiddenCosts = lesson('l4', 'Hidden costs in Python code', 20, [
  text('Some single lines of Python hide a loop. Spotting them is a key skill, because they quietly change the complexity of your code.'),
  bullets('x in my_list, my_list.index(x), my_list.count(x): O(n)', 'my_list.insert(0, x) and my_list.pop(0): O(n)', 'Slicing, such as items[1:] or items[::-1]: O(k) for the k items copied', 'sorted(), min(), max(), sum(): at least O(n)', 'text + other inside a loop: building a string this way can become O(n²)'),
  heading('String building'),
  code('# Slow in the worst case: every + may copy the whole string\nresult = ""\nfor word in words:\n    result += word\n\n# Better: collect the parts and join once, O(n)\nresult = "".join(words)'),
  heading('Sorting inside a loop'),
  code('for item in items:\n    ordered = sorted(items)   # O(n log n) on every pass, O(n² log n) in total\n    use(ordered, item)'),
  text('Move work that does not change out of the loop. Sort once before the loop and reuse the result.'),
  note('CPython sometimes optimises string concatenation, but the language does not promise it. Use join when you build a large string from many parts.', 'warning'),
], [
  predict('e1', 'What is the time complexity of this code?', 'def count_common(first, second):\n    total = 0\n    for item in first:\n        if item in second:\n            total += 1\n    return total', ['O(a)', 'O(a + b)', 'O(a x b)', 'O(log a)'], 2, 'The in operator on a list scans the list, which is O(b), and it runs for each of the a items.'),
  task('e2', 'Rewrite count_common from the question above so that it runs in O(a + b) time.', 'Put the second list in a set once, before the loop.', 'def count_common(first, second):\n    second_items = set(second)\n    total = 0\n    for item in first:\n        if item in second_items:\n            total += 1\n    return total'),
]);

const analysisMethod = lesson('l5', 'A method for analysing any function', 20, [
  text('Use the same steps each time and you will get the right answer for most functions.'),
  bullets('1. Name the inputs and their sizes, for example n, or a and b', '2. Mark every loop, recursive call and built-in that scans data', '3. Nested work multiplies, sequential work adds', '4. Drop constants and keep the dominant term', '5. Repeat the process for space: count what you store and the deepest recursion'),
  heading('A worked example'),
  code('def most_common(items):\n    counts = {}\n    for item in items:               # n times\n        counts[item] = counts.get(item, 0) + 1   # O(1) on average\n    best = None\n    for item, count in counts.items():           # at most n times\n        if best is None or count > counts[best]:\n            best = item\n    return best'),
  text('Time: the first loop costs O(n) and the second costs at most O(n). They run one after another, so the total is O(n). Space: the dictionary may hold n different items, so the space is O(n).'),
  heading('Quick reference'),
  code('O(1)        index, dict lookup, append\nO(log n)    binary search, balanced tree, heap push/pop\nO(n)        one pass, sum, min, max, in on a list\nO(n log n)  sorted(), merge sort, n heap operations\nO(n²)       nested loops over the same input\nO(2^n)      naive recursion with two calls, all subsets\nO(n!)       all permutations'),
  note('When in doubt, count operations for a small input by hand and then for an input twice as large. The ratio shows the growth rate.'),
], [
  predict('e1', 'What are the time and space complexity of most_common above?', '', ['Time O(n²), space O(1)', 'Time O(n), space O(n)', 'Time O(n log n), space O(1)', 'Time O(n), space O(1)'], 1, 'Two sequential passes give O(n) time, and the dictionary can hold up to n different items, which is O(n) space.'),
  task('e2', 'Analyse this function and give its time and space complexity.\n\ndef unique_sorted(items):\n    return sorted(set(items))', 'Count the cost of set() and the cost of sorted().', 'set(items) takes O(n) time and O(n) space.\nsorted() on up to n items takes O(n log n) time and O(n) space.\nTotal: O(n log n) time, because the sort dominates, and O(n) space.'),
]);

export const bigOPractice = courseModule('a2', 'advanced', 'Complexity in practice', [constraintsGuide, optimisationPatterns, timeSpaceTradeoff, hiddenCosts, analysisMethod]);
