import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const listCosts = lesson('l1', 'Python lists', 20, [
  text('A Python list is stored as a block of memory, so jumping to any position is fast. Changing the front or the middle is slow, because every item after that position must move.'),
  bullets('items[i], len(items), items[-1]: O(1)', 'items.append(x) and items.pop(): O(1) on average', 'items.insert(0, x), items.pop(0), items.remove(x): O(n)', 'x in items and items.index(x): O(n)', 'items[a:b] slice: O(b - a), because it copies', 'items.sort() and sorted(items): O(n log n)'),
  heading('A hidden quadratic loop'),
  code('result = []\nfor value in values:\n    result.insert(0, value)   # O(n) each time, O(n²) in total'),
  text('Each insert at the front shifts the whole list. Appending and reversing once at the end costs O(n) in total.'),
  code('result = []\nfor value in values:\n    result.append(value)      # O(1) each time\nresult.reverse()               # O(n) once'),
  note('The in operator on a list is a linear search. Writing it inside a loop turns an O(n) loop into O(n²).', 'warning'),
], [
  predict('e1', 'Which list operation is O(n) rather than O(1)?', '', ['items[3]', 'items.append(9)', 'items.pop(0)', 'len(items)'], 2, 'Removing the first item shifts every other item one place to the left.'),
  task('e2', 'The loop below builds a list of squares but is O(n²). Rewrite it so it is O(n).\n\nsquares = []\nfor value in range(n):\n    squares.insert(0, value * value)', 'Append at the end instead, then reverse once if the order matters.', 'squares = []\nfor value in range(n):\n    squares.append(value * value)\nsquares.reverse()'),
]);

const dictionariesAndSets = lesson('l2', 'Dictionaries and sets', 20, [
  text('Dictionaries and sets use a hash table. A hash function turns the key into a position, so Python can jump straight to the right place instead of searching.'),
  bullets('Add, read, update and delete by key: O(1) on average', 'key in my_dict and value in my_set: O(1) on average', 'Looping over all keys or items: O(n)', 'Worst case when many keys collide: O(n), which is rare with a good hash function'),
  heading('Sets make membership checks cheap'),
  code('def has_duplicate(items):\n    seen = set()\n    for item in items:\n        if item in seen:     # O(1) on average\n            return True\n        seen.add(item)       # O(1) on average\n    return False'),
  text('This version is O(n) in time and O(n) in space. The nested-loop version from an earlier lesson is O(n²) in time and O(1) in space. You pay memory to save time.'),
  note('Only hashable values can be dictionary keys or set members. Numbers, strings and tuples of those work. Lists and dictionaries do not.'),
], [
  predict('e1', 'What is the average time complexity of checking whether a key is in a dictionary?', '', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 0, 'Hashing jumps straight to the location of the key, so the cost does not grow with the size of the dictionary.'),
  task('e2', 'Write a function count_letters(text) that returns a dictionary with the number of times each character appears. State its time complexity.', 'Use dict.get(character, 0) + 1 on each character.', 'def count_letters(text):\n    counts = {}\n    for character in text:\n        counts[character] = counts.get(character, 0) + 1\n    return counts\n\n# Time complexity: O(n), with O(k) space for k different characters.'),
]);

const stacksAndQueues = lesson('l3', 'Stacks, queues and linked lists', 20, [
  text('A stack removes the item added last (last in, first out). A queue removes the item added first (first in, first out). The way you build them decides their cost.'),
  heading('Stack'),
  code('stack = []\nstack.append("a")   # push, O(1)\nstack.append("b")\nprint(stack.pop())  # pop, O(1)', 'b'),
  heading('Queue'),
  text('Using a list as a queue is slow, because pop(0) is O(n). Use collections.deque, which is built for adding and removing at both ends.'),
  code('from collections import deque\n\nqueue = deque()\nqueue.append("a")      # O(1)\nqueue.append("b")\nprint(queue.popleft()) # O(1)', 'a'),
  heading('Linked list'),
  text('A linked list stores each item in a node that points to the next node. Adding or removing at the head is O(1), but reaching the item at position k means following k links, which is O(n).'),
  bullets('Insert or delete at the head: O(1)', 'Insert after a node you already hold: O(1)', 'Search by value or by position: O(n)'),
  note('A Python list is usually faster than a linked list in practice, because its items sit next to each other in memory. Linked lists matter for understanding and for specific problems.'),
], [
  predict('e1', 'Which structure gives O(1) removal from the front of a queue in Python?', '', ['list with pop(0)', 'list with remove()', 'collections.deque with popleft()', 'set with discard()'], 2, 'deque removes from either end in constant time, while pop(0) on a list shifts every other item.'),
  task('e2', 'A program processes 100,000 jobs with while jobs: job = jobs.pop(0). Explain the problem and give a fix.', 'Look at the cost of pop(0) and how many times it runs.', 'pop(0) is O(n), and it runs n times, so the loop is O(n²).\nFix: create jobs = deque(jobs) and call jobs.popleft(), which is O(1), for a total of O(n).'),
]);

const treesAndHeaps = lesson('l4', 'Trees and heaps', 20, [
  text('A binary search tree keeps its values in order. Every node has a smaller value on its left and a larger value on its right, so each comparison discards half of the remaining tree.'),
  bullets('Balanced tree: search, insert and delete are O(log n)', 'Badly unbalanced tree (a chain): the same operations degrade to O(n)', 'Self-balancing trees such as AVL and red-black trees keep the height at O(log n)'),
  heading('Heaps'),
  text('A heap keeps the smallest (or largest) item at the top. It is the standard structure for a priority queue. Python provides it in the heapq module, as a min-heap built on a list.'),
  code('import heapq\n\nheap = []\nfor value in [5, 1, 8, 3]:\n    heapq.heappush(heap, value)   # O(log n)\nprint(heap[0])                    # peek at the smallest, O(1)\nprint(heapq.heappop(heap))        # remove the smallest, O(log n)', '1\n1'),
  bullets('Push and pop: O(log n)', 'Peek at the top: O(1)', 'Build a heap from a list with heapify: O(n)'),
  note('To find the k largest items of n values, keeping a heap of size k costs O(n log k), which beats sorting everything when k is small.'),
], [
  predict('e1', 'What is the time complexity of searching a balanced binary search tree with n nodes?', '', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 1, 'Each step moves down one level, and a balanced tree has about log n levels.'),
  task('e2', 'Use heapq to write a function smallest_three(numbers) that returns the three smallest numbers in a list. State the time complexity of your solution.', 'heapq.nsmallest(3, numbers) does the work.', 'import heapq\n\ndef smallest_three(numbers):\n    return heapq.nsmallest(3, numbers)\n\n# Time complexity: O(n log k) with k = 3, which is O(n) for a fixed k.'),
]);

export const bigODataStructures = courseModule('i2', 'intermediate', 'Data structures and their costs', [listCosts, dictionariesAndSets, stacksAndQueues, treesAndHeaps]);
