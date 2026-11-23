import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const bestWorstAverage = lesson('l1', 'Best, worst and average case', 15, [
  text('The same algorithm can do very different amounts of work on different inputs of the same size. We describe three cases.'),
  code('def linear_search(items, target):\n    for index, item in enumerate(items):\n        if item == target:\n            return index\n    return -1'),
  bullets('Best case: the target is the first item. One comparison, O(1)', 'Worst case: the target is last or missing. n comparisons, O(n)', 'Average case: the target is somewhere in the middle. About n/2 comparisons, which is O(n)'),
  heading('Which case is quoted?'),
  text('Unless a lesson says otherwise, Big O means the worst case. It is a guarantee: the algorithm will never do more work than this, whatever the input. Engineers prefer guarantees because the worst case is what makes a system slow or fail under load.'),
  note('Some algorithms have a famous gap between cases. Quicksort is O(n log n) on average but O(n²) in the worst case, and the choice of pivot decides which one you get.'),
], [
  predict('e1', 'What is the worst-case time complexity of linear search?', '', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'In the worst case the target is last or missing, so all n items are compared.'),
  task('e2', 'A function returns True as soon as it finds a negative number in a list. Give its best-case and worst-case time complexity.', 'The best case ends the loop immediately.', 'Best case: O(1), the first item is negative.\nWorst case: O(n), there is no negative number so every item is checked.'),
]);

const bigOmegaTheta = lesson('l2', 'Big O, Omega and Theta', 20, [
  text('Three symbols describe bounds on the growth of a function. Together they let you say exactly how an algorithm behaves.'),
  bullets('Big O (upper bound): the algorithm grows no faster than this', 'Big Omega (lower bound): the algorithm grows at least as fast as this', 'Big Theta (tight bound): the upper and lower bounds are the same'),
  text('Linear search is O(n) in the worst case and Omega(1) in the best case, so there is no single Theta for all inputs. Summing a list always does n steps, so it is Theta(n).'),
  heading('Big O is an upper bound, not an exact value'),
  text('Formally, an algorithm that is O(n) is also O(n²) and O(2^n), because it does not grow faster than those either. Nobody says this in practice. When people write O(n) they mean the tightest bound they can prove, which is what the Theta symbol states.'),
  note('In interviews and in everyday engineering, Big O normally means the tightest worst-case bound. Use Theta and Omega when you need to be precise, for example in a written proof.'),
], [
  predict('e1', 'A function always loops over its input exactly once and does nothing else. Which statement is the most precise?', '', ['It is Omega(n²)', 'It is Theta(n)', 'It is O(1)', 'It is Theta(log n)'], 1, 'The work is both at most and at least proportional to n, so the tight bound is Theta(n).'),
  task('e2', 'Explain in your own words the difference between Big O and Big Omega.', 'One is a ceiling and the other is a floor.', 'Big O is an upper bound: the work never grows faster than this. Big Omega is a lower bound: the work always grows at least this fast. When both match, the bound is Theta.'),
]);

const multipleInputs = lesson('l3', 'Functions with more than one input', 15, [
  text('When a function takes two separate inputs, their sizes are independent. Do not call both of them n. Use a different letter for each, such as a and b.'),
  heading('Add when the loops are separate'),
  code('def print_both(first, second):\n    for item in first:    # a steps\n        print(item)\n    for item in second:   # b steps\n        print(item)'),
  text('The loops run one after another, so the cost is O(a + b).'),
  heading('Multiply when the loops are nested'),
  code('def all_pairs(first, second):\n    for x in first:        # a times\n        for y in second:   # b times for each x\n            print(x, y)'),
  text('The inner loop runs fully for every item of the outer loop, so the cost is O(a x b).'),
  note('If a function loops over the same list twice in a nested way, it is O(n²). If it loops over two different lists in a nested way, it is O(a x b). Mixing the letters up is one of the most common mistakes in interviews.', 'warning'),
], [
  predict('e1', 'What is the time complexity of this function, where a and b are the lengths of the two lists?', 'def common(first, second):\n    result = []\n    for x in first:\n        for y in second:\n            if x == y:\n                result.append(x)\n    return result', ['O(a + b)', 'O(a x b)', 'O(n)', 'O(a)'], 1, 'The inner loop over second runs completely for each item in first.'),
  task('e2', 'Write a function that prints every item of list a, then every item of list b. State its time complexity using the lengths a and b.', 'Use two loops that are not nested.', 'def print_all(first, second):\n    for item in first:\n        print(item)\n    for item in second:\n        print(item)\n\n# Time complexity: O(a + b).'),
]);

const recursionCost = lesson('l4', 'Complexity of recursive functions', 25, [
  text('A recursive function calls itself. To find its time complexity, count how many calls are made in total and how much work each call does besides calling itself.'),
  heading('One recursive call: usually O(n)'),
  code('def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)'),
  text('Each call makes one more call with n reduced by 1, so there are n calls, each doing a constant amount of work. The time is O(n).'),
  heading('One call that halves the input: O(log n)'),
  code('def count_halvings(n):\n    if n <= 1:\n        return 0\n    return 1 + count_halvings(n // 2)'),
  heading('Two calls that shrink slowly: O(2^n)'),
  code('def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)'),
  text('Each call makes two more calls, so the number of calls roughly doubles at every level of the call tree. The tree has about 2^n calls, so the time is exponential. Fibonacci(40) with this version already makes hundreds of millions of calls.'),
  note('Draw the call tree for a small n. The depth of the tree times the number of calls at each level gives the total.'),
], [
  predict('e1', 'What is the time complexity of this function?', 'def count_down(n):\n    if n == 0:\n        return\n    print(n)\n    count_down(n - 1)', ['O(1)', 'O(log n)', 'O(n)', 'O(2^n)'], 2, 'There is one call for each value from n down to 0, and each call does constant work.'),
  task('e2', 'Write a recursive function total(numbers) that returns the sum of a list by adding the first item to the sum of the rest. What is its time complexity? (Hint: look at what the slice costs.)', 'The slice numbers[1:] copies the remaining items.', 'def total(numbers):\n    if not numbers:\n        return 0\n    return numbers[0] + total(numbers[1:])\n\n# There are n calls, and each slice copies up to n items, so the time is O(n²).\n# Passing an index instead of a slice brings it back to O(n).'),
]);

export const bigOAnalysis = courseModule('i1', 'intermediate', 'Analysing algorithms', [bestWorstAverage, bigOmegaTheta, multipleInputs, recursionCost]);
