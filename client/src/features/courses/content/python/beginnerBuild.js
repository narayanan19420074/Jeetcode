import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const definingFunctions = lesson('l1', 'Defining and calling functions', 20, [
  text('A function is a named, reusable block of code. Define it once with def, then call it as often as you like. This is how programs avoid repeating themselves.'),
  code('def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Asha"))\nprint(greet("Ravi"))', 'Hello, Asha!\nHello, Ravi!'),
  heading('Parameters and return values'),
  bullets('Parameters are the names in the definition; arguments are the values you pass in.', 'return sends a value back to the caller and ends the function.', 'A function without a return gives back None.'),
  heading('Default and keyword arguments'),
  code('def power(base, exponent=2):\n    return base ** exponent\n\nprint(power(5))\nprint(power(2, 10))\nprint(power(exponent=3, base=2))', '25\n1024\n8'),
  note('Print inside a function only when printing is its job. Returning a value makes the function reusable and easy to test.'),
], [
  predict('e1', 'What does this print?', 'def greet(name="friend"):\n    return f"Hello, {name}"\n\nprint(greet())', ['Hello, name', 'Hello, friend', 'None', 'It raises an error'], 1, 'No argument is passed, so the default value "friend" is used.'),
  task('e2', 'Write a function is_even(n) that returns True for even numbers and False otherwise, then print is_even(10) and is_even(7).', 'A number is even when the remainder after dividing by 2 is 0. The comparison itself is already a bool.', 'def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(10))\nprint(is_even(7))'),
]);

const scopeAndDocstrings = lesson('l2', 'Scope and docstrings', 15, [
  text('Variables created inside a function are local: they exist only while the function runs. Code outside cannot see them.'),
  code('x = 10\n\ndef change():\n    x = 5\n    return x\n\nprint(change())\nprint(x)', '5\n10'),
  text('Python looks for a name in the local scope first, then in the enclosing scopes, then in the module, then in the built-ins. Reading a global from a function works; assigning to it creates a new local name instead.'),
  note('Avoid the global keyword. Pass values in as arguments and return results instead, so every function is easy to reason about.'),
  heading('Docstrings'),
  text('A string placed first in a function is its docstring. Tools and help() display it, so use it to say what the function does and what it returns.'),
  code('def celsius_to_fahrenheit(celsius):\n    """Return the temperature in degrees Fahrenheit."""\n    return celsius * 9 / 5 + 32\n\nprint(celsius_to_fahrenheit(100))', '212.0'),
], [
  predict('e1', 'What does this print?', 'x = 10\n\ndef f():\n    x = 5\n    return x\n\nf()\nprint(x)', ['5', '10', '15', 'It raises an error'], 1, 'The assignment inside f creates a separate local x. The global x is unchanged.'),
  task('e2', 'Write fahrenheit_to_celsius(f) with a docstring, then print the result for 212.', 'Subtract 32, then multiply by 5/9.', 'def fahrenheit_to_celsius(f):\n    """Return the temperature in degrees Celsius."""\n    return (f - 32) * 5 / 9\n\nprint(fahrenheit_to_celsius(212))'),
]);

const lists = lesson('l1', 'Lists', 25, [
  text('A list holds an ordered collection of items and can be changed after it is created. Lists are the most used data structure in Python.'),
  code('scores = [72, 95, 88]\nprint(scores[0], scores[-1])\nscores.append(60)\nscores.insert(1, 80)\nprint(scores)\nprint(len(scores))', '72 60\n[72, 80, 95, 88, 60]\n5'),
  heading('Changing a list'),
  bullets('append(x) adds to the end and insert(i, x) adds at a position', 'pop() removes and returns the last item; pop(i) removes position i', 'remove(x) deletes the first item equal to x', 'sort() orders the list in place; sorted(list) returns a new sorted list'),
  code('nums = [3, 1, 2]\nnums.sort()\nprint(nums)\nprint(sorted(nums, reverse=True))\nprint(2 in nums)', '[1, 2, 3]\n[3, 2, 1]\nTrue'),
  note('Two names can point at one list. copy = original[:] (or original.copy()) makes an independent copy, so changing one does not change the other.', 'warning'),
], [
  predict('e1', 'What does this print?', 'nums = [3, 1, 2]\nnums.append(5)\nnums.sort()\nprint(nums)', ['[3, 1, 2, 5]', '[1, 2, 3, 5]', '[5, 3, 2, 1]', 'None'], 1, 'append adds 5 to the end, then sort() orders the list in place.'),
  task('e2', 'Given scores = [72, 95, 88, 60], print the highest score, the lowest score and the average.', 'max(), min() and sum() work on lists. Divide the sum by len().', 'scores = [72, 95, 88, 60]\nprint(max(scores))\nprint(min(scores))\nprint(sum(scores) / len(scores))'),
]);

const tuplesAndSets = lesson('l2', 'Tuples and sets', 20, [
  text('A tuple is like a list that cannot be changed. Use it for a fixed group of values, such as coordinates.'),
  code('point = (3, 4)\nx, y = point\nprint(x, y)\nprint(point[0])', '3 4\n3'),
  text('Unpacking, shown above, assigns each tuple item to its own name. It is also how functions return several values at once.'),
  heading('Sets'),
  text('A set stores unique items with no particular order. Checking whether an item is in a set is very fast, and sets support the maths of union and intersection.'),
  code('a = {1, 2, 3, 3}\nb = {3, 4}\nprint(a)\nprint(a | b)\nprint(a & b)\nprint(a - b)', '{1, 2, 3}\n{1, 2, 3, 4}\n{3}\n{1, 2}'),
  note('Write an empty set as set(). The braces {} on their own create an empty dictionary.', 'warning'),
], [
  predict('e1', 'What does this print?', 'print(len({1, 2, 2, 3, 3, 3}))', ['6', '3', '1', '2'], 1, 'A set keeps one copy of each value, so only 1, 2 and 3 remain.'),
  task('e2', 'Given words = ["tea", "coffee", "tea", "milk", "coffee"], print the unique words in alphabetical order.', 'Turn the list into a set to drop the duplicates, then sort it.', 'words = ["tea", "coffee", "tea", "milk", "coffee"]\nprint(sorted(set(words)))'),
]);

const dictionaries = lesson('l3', 'Dictionaries', 25, [
  text('A dictionary stores key-value pairs and finds a value by its key almost instantly. Keys must be unique and unchangeable, such as strings or numbers.'),
  code('student = {"name": "Asha", "age": 21}\nprint(student["name"])\nstudent["city"] = "Chennai"\nprint(student.get("phone", "not set"))\ndel student["age"]\nprint(student)', "Asha\nnot set\n{'name': 'Asha', 'city': 'Chennai'}"),
  text('Reading a missing key with square brackets raises a KeyError. get() returns a default instead.'),
  heading('Looping over a dictionary'),
  code('prices = {"tea": 10, "coffee": 15}\nfor item, price in prices.items():\n    print(item, price)', 'tea 10\ncoffee 15'),
  heading('Counting with a dictionary'),
  code('counts = {}\nfor letter in "banana":\n    counts[letter] = counts.get(letter, 0) + 1\nprint(counts)', "{'b': 1, 'a': 3, 'n': 2}"),
], [
  predict('e1', 'What does this print?', 'd = {"a": 1}\nd["b"] = 2\nprint(d.get("c", 0))', ['None', '0', '2', 'It raises a KeyError'], 1, 'The key "c" does not exist, so get() returns the default value 0.'),
  task('e2', 'Count how many times each word appears in text = "to be or not to be" and print the dictionary.', 'Split the text into words, then use counts.get(word, 0) + 1 in a loop.', 'text = "to be or not to be"\ncounts = {}\nfor word in text.split():\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)'),
]);

export const functionsModule = courseModule('b4', 'beginner', 'Functions', [definingFunctions, scopeAndDocstrings]);
export const collectionsModule = courseModule('b5', 'beginner', 'Collections', [lists, tuplesAndSets, dictionaries]);
