import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const simpleSorts = lesson('l1', 'Simple sorting algorithms', 20, [
  text('Bubble sort, selection sort and insertion sort are the first sorting algorithms most people learn. They are easy to write, and they all use two nested loops, so they share the same worst case.'),
  code('def insertion_sort(items):\n    for i in range(1, len(items)):\n        current = items[i]\n        j = i - 1\n        while j >= 0 and items[j] > current:\n            items[j + 1] = items[j]\n            j -= 1\n        items[j + 1] = current\n    return items\n\nprint(insertion_sort([5, 2, 4, 1]))', '[1, 2, 4, 5]'),
  bullets('Worst case: O(n²), for example when the list is in reverse order', 'Insertion sort on an already sorted list: O(n), because the inner loop never runs', 'Space: O(1), because the list is sorted in place'),
  text('Insertion sort is a good choice for very small or nearly sorted lists. For large random lists, O(n²) is too slow: 100,000 items need about ten billion steps.'),
  note('Selection sort always does O(n²) comparisons, even on a sorted list. Insertion sort is usually the better of the simple sorts.'),
], [
  predict('e1', 'What is the best-case time complexity of insertion sort, on a list that is already sorted?', '', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 2, 'The outer loop runs n - 1 times and the inner while loop stops at once, so the total is linear.'),
  task('e2', 'Explain why bubble sort is O(n²) in the worst case.', 'Think about the number of passes and the work in each pass.', 'Bubble sort makes up to n passes over the list. Each pass compares up to n adjacent pairs. That is about n x n comparisons, so the time is O(n²).'),
]);

const divideAndConquer = lesson('l2', 'Merge sort and quicksort', 25, [
  text('Efficient sorting algorithms use divide and conquer: split the problem into smaller parts, solve each part, then combine the results.'),
  heading('Merge sort'),
  text('Merge sort splits the list in half, sorts each half and merges the two sorted halves. There are about log n levels of splitting, and merging at each level costs O(n) in total.'),
  code('def merge_sort(items):\n    if len(items) <= 1:\n        return items\n    middle = len(items) // 2\n    left = merge_sort(items[:middle])\n    right = merge_sort(items[middle:])\n    return merge(left, right)\n\ndef merge(left, right):\n    result = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            result.append(left[i])\n            i += 1\n        else:\n            result.append(right[j])\n            j += 1\n    return result + left[i:] + right[j:]'),
  bullets('Time: O(n log n) in the best, average and worst cases', 'Space: O(n) for the merged lists'),
  heading('Quicksort'),
  text('Quicksort picks a pivot value, moves smaller values to its left and larger values to its right, then sorts both sides. With a good pivot the two sides are about equal.'),
  bullets('Average time: O(n log n)', 'Worst time: O(n²), when the pivot is always the smallest or largest value', 'Space: O(log n) for the recursion on average, when sorted in place'),
  note('Choosing a random pivot makes the worst case very unlikely on any input.'),
], [
  predict('e1', 'Which sorting algorithm guarantees O(n log n) time even in the worst case?', '', ['Bubble sort', 'Insertion sort', 'Merge sort', 'Quicksort with the first item as pivot'], 2, 'Merge sort always splits in halves, so it always has about log n levels with O(n) work each.'),
  task('e2', 'Merge sort splits a list of 8 items until single items remain. How many levels of splitting are there, and how many items are merged at each level?', 'Halve 8 until you reach 1.', '8 -> 4 -> 2 -> 1 is 3 levels of splitting, and 3 = log2(8).\nAt each level all 8 items are merged once, so the total work is 8 x 3 = 24 steps, which is n log n.'),
]);

const searchingAndSorting = lesson('l3', 'Sorting in practice', 20, [
  text('You almost never write your own sort in Python. The built-in sorted() and list.sort() use Timsort, a hybrid of merge sort and insertion sort.'),
  bullets('Worst and average case: O(n log n)', 'Nearly sorted data: close to O(n)', 'Space: O(n) in the worst case', 'The sort is stable: items that compare equal keep their original order'),
  code('people = [("Asha", 30), ("Ravi", 25), ("Meena", 30)]\nprint(sorted(people, key=lambda person: person[1]))', "[('Ravi', 25), ('Asha', 30), ('Meena', 30)]"),
  heading('Is it worth sorting first?'),
  text('Sorting costs O(n log n). Binary search then costs O(log n) for each query.'),
  bullets('One lookup: linear search at O(n) is cheaper than sorting first', 'Many lookups, for example q of them: sort once and search q times for O(n log n + q log n), instead of O(q x n)'),
  note('Sorting is also a common first step to simplify a problem. After sorting, duplicates sit next to each other and two pointers can scan from both ends.'),
], [
  predict('e1', 'You have to check 1,000,000 different values against a list of 1,000,000 items. Which approach is best?', '', ['Linear search for each value', 'Sort the list once, then binary search for each value', 'Sort the list again before every value', 'Bubble sort the list once'], 1, 'Sorting once costs O(n log n) and each search then costs O(log n), far less than a million linear searches.'),
  task('e2', 'Use sorted() to return the words of a list ordered by length, shortest first. State the time complexity.', 'Pass key=len.', 'def by_length(words):\n    return sorted(words, key=len)\n\n# Time complexity: O(n log n), with O(n) extra space.'),
]);

export const bigOSorting = courseModule('i3', 'intermediate', 'Sorting and searching', [simpleSorts, divideAndConquer, searchingAndSorting]);
