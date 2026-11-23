import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const comprehensions = lesson('l1', 'Comprehensions', 20, [
  text('A comprehension builds a list, set or dictionary in one readable expression. It replaces the common "loop and append" pattern.'),
  code('squares = [n * n for n in range(5)]\nprint(squares)\n\nevens = [n for n in range(10) if n % 2 == 0]\nprint(evens)', '[0, 1, 4, 9, 16]\n[0, 2, 4, 6, 8]'),
  heading('Dictionary and set comprehensions'),
  code('words = ["tea", "coffee", "milk"]\nlengths = {word: len(word) for word in words}\nfirst_letters = {word[0] for word in words}\nprint(lengths)\nprint(sorted(first_letters))', "{'tea': 3, 'coffee': 6, 'milk': 4}\n['c', 'm', 't']"),
  note('If a comprehension needs more than one condition or a nested loop, write a normal for loop. Readability comes first.'),
], [
  predict('e1', 'What does this print?', 'print([x * x for x in range(4) if x % 2 == 0])', ['[0, 4]', '[0, 1, 4, 9]', '[1, 9]', '[0, 2]'], 0, 'Only the even values 0 and 2 pass the filter, and their squares are 0 and 4.'),
  task('e2', 'Given words = ["tea", "coffee", "milk"], build a dictionary that maps each word to its length with a dictionary comprehension.', 'The pattern is {key: value for item in items}.', 'words = ["tea", "coffee", "milk"]\nprint({word: len(word) for word in words})'),
]);

const functionalTools = lesson('l2', 'lambda, sorted, map and filter', 20, [
  text('Functions are values, so you can pass them to other functions. A lambda is a tiny unnamed function written in one line.'),
  code('square = lambda n: n * n\nprint(square(6))', '36'),
  heading('Sorting with a key'),
  text('sorted() and list.sort() accept a key function that says what to sort by.'),
  code('words = ["bb", "a", "ccc"]\nprint(sorted(words, key=len, reverse=True))\n\npeople = [("Asha", 31), ("Ravi", 25)]\nprint(sorted(people, key=lambda person: person[1]))', "['ccc', 'bb', 'a']\n[('Ravi', 25), ('Asha', 31)]"),
  heading('map, filter and zip'),
  code('numbers = [1, 2, 3, 4]\nprint(list(map(lambda n: n * 10, numbers)))\nprint(list(filter(lambda n: n % 2 == 0, numbers)))\nprint(list(zip(["a", "b"], [1, 2])))', "[10, 20, 30, 40]\n[2, 4]\n[('a', 1), ('b', 2)]"),
  note('Comprehensions are usually clearer than map and filter with a lambda. Keep lambda for short sort keys.'),
], [
  predict('e1', 'What does this print?', 'print(sorted(["bb", "a", "ccc"], key=len, reverse=True))', ["['a', 'bb', 'ccc']", "['ccc', 'bb', 'a']", "['bb', 'a', 'ccc']", "['ccc', 'a', 'bb']"], 1, 'The key is the length, and reverse=True puts the longest first.'),
  task('e2', 'Sort pairs = [("pen", 5), ("book", 2), ("bag", 9)] by the number in each pair, smallest first, and print the result.', 'Use sorted() with key=lambda pair: pair[1].', 'pairs = [("pen", 5), ("book", 2), ("bag", 9)]\nprint(sorted(pairs, key=lambda pair: pair[1]))'),
]);

const flexibleArguments = lesson('l3', 'Flexible arguments: *args and **kwargs', 15, [
  text('Prefix a parameter with * to accept any number of positional arguments, collected in a tuple. Prefix with ** to accept any keyword arguments, collected in a dictionary.'),
  code('def total(*numbers):\n    return sum(numbers)\n\ndef describe(**details):\n    for key, value in details.items():\n        print(f"{key}={value}")\n\nprint(total(1, 2, 3))\ndescribe(name="Asha", city="Chennai")', '6\nname=Asha\ncity=Chennai'),
  heading('Unpacking when calling'),
  text('The same symbols work in a call: *items spreads a list into positional arguments and **options spreads a dictionary into keyword arguments.'),
  code('values = [4, 5, 6]\nprint(total(*values))\nprint(max(*values))', '15\n6'),
  note('Use *args and **kwargs for wrappers and flexible helpers. For ordinary functions, explicit named parameters are easier to read.'),
], [
  predict('e1', 'What does this print?', 'def total(*nums):\n    return sum(nums)\n\nprint(total(1, 2, 3))', ['6', '(1, 2, 3)', '3', 'It raises an error'], 0, 'nums is the tuple (1, 2, 3) and sum() adds it to 6.'),
  task('e2', 'Write show(**options) that prints every option as key: value on its own line, then call it with theme="dark" and size=14.', 'Loop over options.items().', 'def show(**options):\n    for key, value in options.items():\n        print(f"{key}: {value}")\n\nshow(theme="dark", size=14)'),
]);

const regularExpressions = lesson('l1', 'Regular expressions', 30, [
  text('A regular expression (regex) describes a text pattern. The re module uses it to search, validate and replace text. Write patterns as raw strings, r"...", so backslashes reach the regex engine untouched.'),
  bullets('\\d is a digit, \\w is a letter, digit or underscore, \\s is whitespace', '. is any character, + means one or more, * means zero or more, ? means optional', '^ anchors the start of the text and $ anchors the end', 'Parentheses create a group you can read back'),
  code('import re\n\nprint(re.findall(r"\\d+", "a1b22c333"))\nprint(re.search(r"(\\w+)@(\\w+)\\.com", "mail asha@site.com now").groups())\nprint(re.sub(r"\\s+", " ", "too    many   spaces"))', "['1', '22', '333']\n('asha', 'site')\ntoo many spaces"),
  heading('Validate a whole string'),
  code('import re\n\npattern = r"^[\\w.]+@[\\w.]+\\.\\w+$"\nprint(bool(re.match(pattern, "asha@site.com")))\nprint(bool(re.match(pattern, "not an email")))', 'True\nFalse'),
  note('Regexes are powerful but hard to read. Prefer simple string methods when they are enough, and add a comment that explains each pattern.'),
], [
  predict('e1', 'What does this print?', 'import re\nprint(re.findall(r"\\d+", "a1b22c333"))', ["['1', '22', '333']", "['1', '2', '3']", "['122333']", "['a', 'b', 'c']"], 0, '\\d+ matches each run of digits, so findall returns three separate matches.'),
  task('e2', 'Write has_phone_number(text) that returns True when the text contains a 10-digit number such as 9876543210.', 'Search for \\d{10} with re.search and convert the result to a bool.', 'import re\n\ndef has_phone_number(text):\n    return bool(re.search(r"\\d{10}", text))\n\nprint(has_phone_number("call 9876543210 today"))'),
]);

export const idiomaticPython = courseModule('i3', 'intermediate', 'Idiomatic Python', [comprehensions, functionalTools, flexibleArguments]);
export const textPatterns = courseModule('i4', 'intermediate', 'Text patterns', [regularExpressions]);
