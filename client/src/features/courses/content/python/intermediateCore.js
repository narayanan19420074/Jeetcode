import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const exceptions = lesson('l1', 'Handling exceptions', 20, [
  text('When Python cannot continue, it raises an exception and stops with an error message. A try block lets you catch the exception, respond and keep the program running.'),
  code('try:\n    age = int(input("Age: "))\nexcept ValueError:\n    print("Please enter digits only.")\nelse:\n    print(f"Next year you will be {age + 1}.")\nfinally:\n    print("Done.")'),
  bullets('except runs when the named error happens', 'else runs only when no error happened', 'finally always runs, which makes it the place to release resources'),
  heading('Catch specific errors'),
  text('Name the exact exception you expect. A bare except hides real bugs, including typing mistakes in your own code.'),
  heading('Raising your own errors'),
  code('def set_age(age):\n    if age < 0:\n        raise ValueError("age cannot be negative")\n    return age\n\ntry:\n    set_age(-1)\nexcept ValueError as error:\n    print(error)', 'age cannot be negative'),
  note('Common built-in exceptions: ValueError, TypeError, KeyError, IndexError, ZeroDivisionError and FileNotFoundError.'),
], [
  predict('e1', 'What does this print?', 'try:\n    int("x")\nexcept ValueError:\n    print("bad")\nfinally:\n    print("done")', ['bad', 'done', 'bad then done on two lines', 'It stops with an error'], 2, 'int("x") raises ValueError, the except block prints bad and finally always runs afterwards.'),
  task('e2', 'Write safe_int(text) that returns the integer in text, or None when the text is not a valid integer.', 'Put int(text) in a try block and return None from the except ValueError block.', 'def safe_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\nprint(safe_int("42"))\nprint(safe_int("abc"))'),
]);

const testing = lesson('l2', 'Testing your code', 20, [
  text('A test is a small program that checks another piece of code. Tests catch mistakes early and let you change code later without fear.'),
  heading('assert'),
  text('assert raises an AssertionError when its condition is false. It is the building block of every test.'),
  code('def add(a, b):\n    return a + b\n\nassert add(2, 3) == 5\nassert add(-1, 1) == 0\nprint("All good")', 'All good'),
  heading('Testing with pytest'),
  text('pytest, the most popular Python test tool, finds functions whose names start with test_ in files whose names start with test_. Install it with pip install pytest and run it with the pytest command.'),
  code('# test_math_tools.py\nfrom math_tools import add\n\ndef test_add_positive_numbers():\n    assert add(2, 3) == 5\n\ndef test_add_negative_numbers():\n    assert add(-2, -3) == -5'),
  note('Write one test per behaviour, name it after that behaviour and cover edge cases such as empty input, zero and negative numbers.'),
], [
  predict('e1', 'What happens when this line runs?', 'assert 2 + 2 == 5', ['Nothing happens', 'It prints False', 'It raises an AssertionError', 'It prints 4'], 2, 'The condition is false, so assert raises an AssertionError. A passing assert does nothing.'),
  task('e2', 'Write two pytest-style test functions for is_even(n): one for an even number and one for an odd number.', 'Name the functions test_... and assert the expected True or False.', 'def is_even(n):\n    return n % 2 == 0\n\ndef test_is_even_for_even_number():\n    assert is_even(10)\n\ndef test_is_even_for_odd_number():\n    assert not is_even(7)'),
]);

const modules = lesson('l1', 'Modules and the standard library', 20, [
  text('A module is a Python file whose code you can reuse. The standard library ships with Python and covers maths, dates, random numbers, file paths, JSON and much more, with no installation.'),
  code('import math\nfrom random import choice\nfrom collections import Counter\n\nprint(math.sqrt(16), math.floor(2.7), math.ceil(2.1))\nprint(choice(["red", "green", "blue"]))\nprint(Counter("banana").most_common(1))', "4.0 2 3\ngreen\n[('a', 3)]"),
  heading('Import styles'),
  bullets('import math gives you math.sqrt(...)', 'from math import sqrt lets you write sqrt(...)', 'import numpy as np gives a module a shorter alias'),
  heading('Your own modules'),
  text('Save functions in tools.py and write from tools import add in another file in the same folder. Guard code that should run only when the file is started directly:'),
  code('def main():\n    print("Running as a script")\n\nif __name__ == "__main__":\n    main()'),
  note('Do not name your own file after a standard module (for example random.py). Python would import yours instead.', 'warning'),
], [
  predict('e1', 'What does this print?', 'import math\nprint(math.floor(2.7), math.ceil(2.1))', ['2 2', '3 3', '2 3', '3 2'], 2, 'floor rounds down to 2 and ceil rounds up to 3.'),
  task('e2', 'Use collections.Counter to print the most common word in text = "to be or not to be".', 'Counter(text.split()) counts the words. most_common(1) returns a list with the top pair.', 'from collections import Counter\n\ntext = "to be or not to be"\nprint(Counter(text.split()).most_common(1))'),
]);

const files = lesson('l2', 'Reading and writing files', 25, [
  text('Programs save and load data with files. Always open a file with a with block: Python then closes it for you, even when an error happens.'),
  code('with open("notes.txt", "w", encoding="utf-8") as file:\n    file.write("first line\\n")\n    file.write("second line\\n")\n\nwith open("notes.txt", encoding="utf-8") as file:\n    for line in file:\n        print(line.strip())', 'first line\nsecond line'),
  heading('File modes'),
  bullets('"r" reads (the default) and fails if the file does not exist', '"w" writes and erases anything already in the file', '"a" appends to the end of the file'),
  heading('Paths with pathlib'),
  code('from pathlib import Path\n\nfolder = Path("data")\nfolder.mkdir(exist_ok=True)\nreport = folder / "report.txt"\nprint(report.exists())\nreport.write_text("ready", encoding="utf-8")\nprint(report.read_text(encoding="utf-8"))', 'False\nready'),
  note('Set encoding="utf-8" explicitly so text files behave the same on every operating system.'),
], [
  predict('e1', 'A file contains two lines, "a" and "b". What does this print?', 'with open("letters.txt") as file:\n    print(len(file.readlines()))', ['1', '2', '3', '0'], 1, 'readlines() returns a list with one item per line, so the length is 2.'),
  task('e2', 'Write count_lines(path) that returns the number of lines in a text file.', 'Open the file with a with block and count the lines you loop over, or take len(file.readlines()).', 'def count_lines(path):\n    with open(path, encoding="utf-8") as file:\n        return sum(1 for _ in file)'),
]);

const jsonAndCsv = lesson('l3', 'Working with JSON and CSV', 25, [
  text('JSON and CSV are the two formats you meet most often when exchanging data. Python reads and writes both with the standard library.'),
  heading('JSON'),
  text('json.dumps turns Python data into a JSON string and json.loads does the reverse. json.dump and json.load do the same with files.'),
  code('import json\n\nprofile = {"name": "Asha", "skills": ["python", "sql"]}\ntext = json.dumps(profile, indent=2)\nprint(json.loads(text)["skills"][0])', 'python'),
  heading('CSV'),
  text('csv.DictReader turns each row into a dictionary keyed by the header row.'),
  code('import csv\n\nwith open("orders.csv", newline="", encoding="utf-8") as file:\n    total = 0\n    for row in csv.DictReader(file):\n        total += float(row["price"])\nprint(total)'),
  note('Values read from a CSV file are always strings. Convert them with int() or float() before doing arithmetic.', 'warning'),
], [
  predict('e1', 'What does this print?', 'import json\nprint(json.dumps({"a": 1}))', ['{"a": 1}', "{'a': 1}", '{a: 1}', 'a=1'], 0, 'JSON uses double quotes. dumps returns the string {"a": 1}.'),
  task('e2', 'Given a JSON string text = \'{"items": [3, 4, 5]}\', print the sum of the items.', 'Parse the string with json.loads, then take sum() of the list under "items".', 'import json\n\ntext = \'{"items": [3, 4, 5]}\'\ndata = json.loads(text)\nprint(sum(data["items"]))'),
]);

export const robustCode = courseModule('i1', 'intermediate', 'Writing robust code', [exceptions, testing]);
export const modulesAndFiles = courseModule('i2', 'intermediate', 'Modules, files and data', [modules, files, jsonAndCsv]);
