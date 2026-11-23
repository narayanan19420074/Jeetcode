import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const constantTime = lesson('l1', 'Constant time: O(1)', 10, [
  text('An algorithm is O(1) when the number of steps does not depend on the input size. It takes the same effort for a list of 10 items and a list of 10 million items.'),
  code('def first_and_last(items):\n    return items[0], items[-1]\n\ndef is_even(number):\n    return number % 2 == 0\n\nprices = {"tea": 20, "coffee": 30}\nprint(prices["tea"])', '20'),
  bullets('Reading a list item by its index', 'Arithmetic, comparisons and assignments', 'Looking up a key in a dictionary (on average)', 'Appending to the end of a list (on average)'),
  note('O(1) does not mean "one step". It means a fixed number of steps that does not grow with n. A function with 50 fixed steps is still O(1).'),
], [
  predict('e1', 'What is the time complexity of this function?', 'def middle(items):\n    return items[len(items) // 2]', ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], 0, 'len() and index access take the same time for any list size, so there is no loop that grows with n.'),
  task('e2', 'Write a function swap_ends(items) that swaps the first and last items of a list in O(1) time.', 'Use tuple assignment with index 0 and index -1.', 'def swap_ends(items):\n    items[0], items[-1] = items[-1], items[0]\n    return items'),
]);

const linearTime = lesson('l2', 'Linear time: O(n)', 15, [
  text('A function is O(n) when it looks at each item a fixed number of times. If the input doubles, the work doubles.'),
  code('def contains(items, target):\n    for item in items:\n        if item == target:\n            return True\n    return False'),
  text('In the worst case the target is missing or last, so every item is checked once.'),
  heading('Sequential loops add up'),
  code('def stats(numbers):\n    smallest = min(numbers)   # n steps\n    largest = max(numbers)    # n steps\n    return largest - smallest'),
  text('Two separate passes cost n + n = 2n steps. Dropping the constant gives O(n). Loops that run one after another add together. They do not multiply.'),
  note('Built-in functions are loops too. sum(), min(), max(), len() on a generator, sorted() and the in operator on a list all do work that grows with the input.', 'warning'),
], [
  predict('e1', 'What is the time complexity of this function?', 'def double_all(numbers):\n    for value in numbers:\n        print(value * 2)\n    for value in numbers:\n        print(value * 3)', ['O(1)', 'O(n)', 'O(n²)', 'O(2n²)'], 1, 'Two loops one after another cost n + n steps. That is O(2n), which simplifies to O(n).'),
  task('e2', 'Write a function average(numbers) for a non-empty list. State its time complexity.', 'You need the sum and the length.', 'def average(numbers):\n    return sum(numbers) / len(numbers)\n\n# Time complexity: O(n), because sum() visits every number.'),
]);

const quadraticTime = lesson('l3', 'Quadratic time: O(n²)', 20, [
  text('Nested loops that both depend on n multiply their work. A loop that runs n times, with an inner loop that also runs n times, does n x n = n² steps.'),
  code('def has_duplicate(items):\n    for i in range(len(items)):\n        for j in range(len(items)):\n            if i != j and items[i] == items[j]:\n                return True\n    return False'),
  text('For 1,000 items this can make about 1,000,000 comparisons. For 100,000 items it can make ten billion.'),
  heading('When the inner loop starts later'),
  code('def has_duplicate_pairs(items):\n    for i in range(len(items)):\n        for j in range(i + 1, len(items)):\n            if items[i] == items[j]:\n                return True\n    return False'),
  text('This version compares each pair only once. The inner loop runs n-1, n-2, ... 1 times, which adds up to n(n-1)/2 steps. That is about half of n², and dropping the constant 1/2 leaves O(n²) again.'),
  note('Count the loops that depend on n and multiply them. Two nested loops give O(n²), three nested loops give O(n³).'),
], [
  predict('e1', 'How many times does print run when n is 4?', 'for i in range(n):\n    for j in range(n):\n        print(i, j)', ['4', '8', '16', '64'], 2, 'The outer loop runs 4 times and the inner loop runs 4 times for each of those, which is 4 x 4 = 16.'),
  task('e2', 'Write a function count_pairs(items, total) that counts the pairs of different positions whose values add up to total, using two nested loops. State its time complexity.', 'Let the inner loop start at i + 1 so each pair is counted once.', 'def count_pairs(items, total):\n    count = 0\n    for i in range(len(items)):\n        for j in range(i + 1, len(items)):\n            if items[i] + items[j] == total:\n                count += 1\n    return count\n\n# Time complexity: O(n²).'),
]);

const logarithmicTime = lesson('l4', 'Logarithmic time: O(log n)', 20, [
  text('An algorithm is O(log n) when each step cuts the remaining work by a constant fraction, usually in half. Doubling the input adds only one extra step.'),
  heading('Binary search'),
  text('Binary search finds a value in a sorted list. It looks at the middle item and then discards the half that cannot contain the target.'),
  code('def binary_search(items, target):\n    low, high = 0, len(items) - 1\n    while low <= high:\n        middle = (low + high) // 2\n        if items[middle] == target:\n            return middle\n        if items[middle] < target:\n            low = middle + 1\n        else:\n            high = middle - 1\n    return -1\n\nprint(binary_search([2, 5, 8, 12, 16, 23, 38], 23))', '5'),
  text('A list of 1,000,000 items needs at most about 20 steps, because 2^20 is a little over one million. A list of 1,000,000,000 items needs at most about 30 steps.'),
  note('Binary search only works on sorted data. If the list is not sorted, you must sort it first, and sorting costs more than one linear search.', 'warning'),
], [
  predict('e1', 'About how many steps does binary search need, at most, for a sorted list of 1,000,000 items?', '', ['About 20', 'About 1,000', 'About 500,000', 'About 1,000,000'], 0, 'The list can be halved about 20 times before one item is left, since 2^20 is about one million.'),
  task('e2', 'Write a loop that counts how many times a number n can be halved with integer division before it reaches 1. What is its time complexity?', 'Use while n > 1 and n //= 2.', 'def halvings(n):\n    steps = 0\n    while n > 1:\n        n //= 2\n        steps += 1\n    return steps\n\n# Time complexity: O(log n).'),
]);

const countingLoops = lesson('l5', 'Counting loop patterns', 20, [
  text('Most loops fall into a few patterns. Learn to recognise how the loop variable changes and you can read the complexity at a glance.'),
  code('# O(n): the variable grows by a fixed amount\nfor i in range(0, n, 2):\n    work()\n\n# O(log n): the variable is multiplied each time\ni = 1\nwhile i < n:\n    work()\n    i *= 2\n\n# O(log n): the variable is divided each time\ni = n\nwhile i > 1:\n    work()\n    i //= 2'),
  text('Adding or subtracting a constant leads to O(n). Multiplying or dividing by a constant leads to O(log n).'),
  heading('Combining loops'),
  code('# O(n log n): a linear loop around a logarithmic loop\nfor i in range(n):\n    j = 1\n    while j < n:\n        work()\n        j *= 2\n\n# O(n²): an inner loop that depends on the outer variable\nfor i in range(n):\n    for j in range(i):\n        work()'),
  note('Stepping by 2 or by 10 still gives O(n). The constant step only changes the constant factor.'),
], [
  predict('e1', 'What is the time complexity of this loop?', 'i = 1\nwhile i < n:\n    print(i)\n    i *= 3', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 1, 'The variable is multiplied by 3 on each pass, so it reaches n after about log base 3 of n steps. The base does not change the Big O class.'),
  task('e2', 'State the time complexity of each snippet: (a) for i in range(n): for j in range(n): work(), (b) for i in range(n): j = n; while j > 1: j //= 2, (c) i = n; while i > 0: i -= 5.', 'Check whether each variable is added to or multiplied.', '(a) O(n²)\n(b) O(n log n)\n(c) O(n)'),
]);

export const bigOReadingCode = courseModule('b2', 'beginner', 'Reading complexity in code', [constantTime, linearTime, quadraticTime, logarithmicTime, countingLoops]);
