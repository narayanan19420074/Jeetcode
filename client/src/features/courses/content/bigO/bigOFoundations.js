import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const whatIsBigO = lesson('l1', 'What is Big O notation?', 15, [
  text('Big O notation describes how the work an algorithm does grows as its input grows. It does not measure seconds. It answers one question: if the input becomes ten times bigger, how much slower does the code get?'),
  heading('Why seconds are not enough'),
  text('The running time of a program depends on the computer, the language and what else is running. A fast machine can hide a slow algorithm on a small input. Big O removes those details and compares the algorithms themselves.'),
  code('def find_first(items, target):\n    for index, item in enumerate(items):\n        if item == target:\n            return index\n    return -1'),
  text('If the list has 10 items, this function checks at most 10 of them. If it has 1,000,000 items, it checks at most 1,000,000. The work grows in step with the size of the list, so we say the function is O(n), where n is the number of items.'),
  heading('How to read the notation'),
  bullets('O( ) is read as "on the order of"', 'The letter inside the brackets, usually n, is the size of the input', 'The expression inside is the growth rate: O(n) grows in a straight line, O(n²) grows much faster'),
  note('Big O ignores small inputs on purpose. It tells you what happens when the input gets large, which is when slow algorithms cause real problems.'),
], [
  predict('e1', 'What does Big O notation describe?', '', ['The exact running time in seconds', 'How the number of steps grows as the input grows', 'The number of lines of code', 'The amount of memory in megabytes'], 1, 'Big O describes the growth rate of the work, not a measured time. That is why it is the same on every computer.'),
  task('e2', 'Explain in one or two sentences why measuring a function with a stopwatch is not a good way to compare two algorithms.', 'Think about different computers and different input sizes.', 'A stopwatch result depends on the computer, the language and the input that was tested. Big O compares how the number of steps grows with the input size, so the answer holds on any machine.'),
]);

const timeComplexity = lesson('l2', 'Time complexity', 15, [
  text('Time complexity counts the basic steps an algorithm performs, as a function of the input size n. A basic step is one simple operation: an addition, a comparison, an assignment or reading one list item.'),
  code('def total(numbers):\n    result = 0            # 1 step\n    for value in numbers: # repeats n times\n        result += value   # 1 step each time\n    return result         # 1 step'),
  text('The loop body runs n times, so the function does about n + 2 steps. For large n the extra 2 steps do not matter, and we call the function O(n).'),
  heading('Counting loops'),
  code('def pairs_with_three(numbers):\n    count = 0\n    for value in numbers:        # n times\n        for offset in range(3):  # 3 times\n            count += value + offset\n    return count'),
  text('The inner loop always runs exactly 3 times, whatever n is. The total is 3 x n steps, which is still O(n). Only loops that depend on the input make the complexity grow.'),
  note('Count how many times each line runs, then look at which count grows with n. Lines that run a fixed number of times are constant.'),
], [
  predict('e1', 'How many times does the innermost statement run?', 'for i in range(n):\n    for j in range(3):\n        work()', ['n + 3', '3n', 'n³', '3'], 1, 'For each of the n values of i, the inner loop runs 3 times, so the statement runs 3 x n times.'),
  task('e2', 'Write a function count_even(numbers) that returns how many even numbers are in a list, then state its time complexity.', 'Visit each item once and use the % operator.', 'def count_even(numbers):\n    count = 0\n    for value in numbers:\n        if value % 2 == 0:\n            count += 1\n    return count\n\n# Time complexity: O(n), one pass over the list.'),
]);

const spaceComplexity = lesson('l3', 'Space complexity', 15, [
  text('Space complexity describes how much extra memory an algorithm needs as the input grows. It is measured the same way as time: as a function of n, written in Big O.'),
  text('Most courses count auxiliary space, which is the extra memory the algorithm creates. The input itself is not counted.'),
  code('def total(numbers):\n    result = 0\n    for value in numbers:\n        result += value\n    return result'),
  text('This function stores one number, result, whatever the size of the list. Its space complexity is O(1), also called constant space.'),
  code('def squares(numbers):\n    return [value * value for value in numbers]'),
  text('This function builds a new list with one item for every input item. The memory grows with n, so the space complexity is O(n).'),
  heading('Time and space together'),
  text('A full description gives both. The first function above is O(n) time and O(1) space. The second is O(n) time and O(n) space. Often you can trade one for the other, which you will see in later lessons.'),
  note('Variables inside loops are reused on every pass, so they do not add up. Memory grows only when you store something for every item, such as a new list, a dictionary or a deep chain of recursive calls.'),
], [
  predict('e1', 'What is the auxiliary space complexity of reversing a list by building a new reversed list?', 'def reversed_copy(items):\n    return items[::-1]', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'The new list holds all n items, so the extra memory grows with n.'),
  task('e2', 'Write a function largest(numbers) that returns the biggest number in a non-empty list using O(1) extra space.', 'Keep only one variable for the best value so far.', 'def largest(numbers):\n    best = numbers[0]\n    for value in numbers:\n        if value > best:\n            best = value\n    return best'),
]);

const growthRates = lesson('l4', 'Common growth rates', 20, [
  text('A small set of growth rates covers almost every algorithm you will meet. They are listed here from the slowest growth, which is best, to the fastest growth, which is worst.'),
  bullets('O(1) constant: the work does not depend on n', 'O(log n) logarithmic: the work grows very slowly, as the input is halved each step', 'O(n) linear: the work grows in step with n', 'O(n log n) linearithmic: typical for efficient sorting', 'O(n²) quadratic: every item is compared with every other item', 'O(2^n) exponential: the work doubles when n grows by one', 'O(n!) factorial: the work multiplies by n for each extra item'),
  heading('How fast they grow'),
  text('The numbers below show the approximate number of steps when n is 1,000.'),
  code('O(1)        ->  1\nO(log n)    ->  10\nO(n)        ->  1,000\nO(n log n)  ->  10,000\nO(n²)       ->  1,000,000\nO(2^n)      ->  more than the number of atoms in the universe'),
  text('This is why the growth rate matters more than the speed of the computer. An O(n²) algorithm on a very fast machine is still beaten by an O(n log n) algorithm on a slow one once n is large enough.'),
  note('In Big O, log n means the number of times you can halve n until you reach 1. The base of the logarithm does not change the Big O class.'),
], [
  predict('e1', 'Which list shows the growth rates from fastest to slowest algorithm?', '', ['O(n), O(1), O(log n), O(n²)', 'O(1), O(log n), O(n), O(n²)', 'O(log n), O(1), O(n²), O(n)', 'O(1), O(n), O(log n), O(n²)'], 1, 'Constant is best, then logarithmic, then linear, then quadratic.'),
  task('e2', 'An algorithm takes 1 second for n = 1,000. Roughly how long will it take for n = 2,000 if it is O(n), and if it is O(n²)?', 'Doubling n doubles a linear cost and quadruples a quadratic cost.', 'O(n): about 2 seconds, because the work doubles.\nO(n²): about 4 seconds, because 2 x 2 = 4 times the work.'),
]);

const simplificationRules = lesson('l5', 'Simplifying Big O expressions', 20, [
  text('When you count steps you get an exact formula such as 3n² + 5n + 20. Big O keeps only the part that matters for large n. Two rules do almost all of the work.'),
  heading('Rule 1: drop the constants'),
  text('Multiplying by a fixed number does not change the growth rate class. 5n and n are both linear, so O(5n) is written O(n). Two passes over a list are still O(n).'),
  heading('Rule 2: keep only the dominant term'),
  text('As n grows, the fastest-growing term overwhelms the others. In n² + n, when n is 1,000,000 the n² part is a million times larger than the n part, so the expression is O(n²).'),
  code('3n² + 5n + 20   ->  O(n²)\nn + log n        ->  O(n)\n100              ->  O(1)\n2n + n log n     ->  O(n log n)\n2^n + n³        ->  O(2^n)'),
  heading('A worked example'),
  code('def example(items):\n    print(items[0])        # O(1)\n    for item in items:      # O(n)\n        print(item)\n    for a in items:         # O(n²)\n        for b in items:\n            print(a, b)'),
  text('The steps are 1 + n + n². The dominant term is n², so the whole function is O(n²).'),
  note('Dropping constants does not mean constants are unimportant in practice. It means they do not change how the algorithm scales.', 'warning'),
], [
  predict('e1', 'What is the simplified Big O of 4n² + 10n + 7?', '', ['O(4n²)', 'O(n² + n)', 'O(n²)', 'O(n)'], 2, 'Drop the constant 4, then keep only the dominant term n².'),
  task('e2', 'Simplify each expression to Big O: (a) 7n + 3, (b) n² + n log n, (c) 500, (d) 2n + 2^n.', 'Keep the term that grows fastest and drop its constant factor.', '(a) O(n)\n(b) O(n²)\n(c) O(1)\n(d) O(2^n)'),
]);

export const bigOFoundations = courseModule('b1', 'beginner', 'Big O foundations', [whatIsBigO, timeComplexity, spaceComplexity, growthRates, simplificationRules]);
