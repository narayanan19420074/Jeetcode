import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const helloPython = lesson('l1', 'Hello, Python', 10, [
  text('Python is a general-purpose language that is designed to be easy to read. It is used for automation, web back ends, data analysis and machine learning, which makes it a good first language and a useful one for years.'),
  heading('Your first program'),
  text('A program is a list of instructions that Python runs from top to bottom. The print() function shows a value on the screen.'),
  code('print("Hello, world!")', 'Hello, world!'),
  text('The text between quotes is a string. Every print() call ends the line, so the next call starts on a new one.'),
  code('print("Python", "is", "fun")\nprint("Python", "is", "fun", sep="-")', 'Python is fun\nPython-is-fun'),
  heading('Comments'),
  text('Anything after a # is ignored by Python. Use comments to explain why the code exists, not to repeat what it does.'),
  code('# Greet the learner\nprint("Welcome")  # shown on screen', 'Welcome'),
  note('Python groups code by indentation (four spaces by convention). You will use that from the lesson on if statements.'),
], [
  predict('e1', 'What does this program print?', 'print("Hi", "there")', ['Hi there', 'Hithere', 'Hi, there', 'It raises an error'], 0, 'print() separates its arguments with a single space by default. The sep argument changes that.'),
  task('e2', 'Print your name on the first line and your city on the second line, using two print() calls.', 'Each print() call writes one line.', 'print("Asha")\nprint("Chennai")'),
]);

const variablesAndTypes = lesson('l2', 'Variables and data types', 15, [
  text('A variable is a name that points to a value. You create one by assigning with a single equals sign.'),
  code('age = 21\nprice = 19.99\nname = "Asha"\nis_student = True\nprint(type(age), type(price), type(name), type(is_student))', "<class 'int'> <class 'float'> <class 'str'> <class 'bool'>"),
  heading('The core types'),
  bullets('int: whole numbers such as 7 or -3', 'float: numbers with a decimal point such as 2.5', 'str: text such as "hello"', 'bool: True or False', 'NoneType: the single value None, meaning "nothing here"'),
  heading('Naming rules'),
  text('Names can contain letters, digits and underscores, cannot start with a digit and are case-sensitive. The community style (PEP 8) uses lowercase words joined by underscores, such as total_price.'),
  text('Python is dynamically typed: the type belongs to the value, so a name can be pointed at a different kind of value later.'),
  code('x = 5\nprint(x)\nx = "five"\nprint(x)', '5\nfive'),
  note('Choose names that say what the value means. seconds_per_day is clearer than s.'),
], [
  predict('e1', 'What does this print?', 'a = 3\nb = a\na = 10\nprint(b)', ['10', '3', '13', 'None'], 1, 'b received the value 3 when it was assigned. Changing a afterwards points a at a new value and does not touch b.'),
  task('e2', 'Swap the values of a and b without using a third variable. Start with a = 1 and b = 2, then print both.', 'Python can assign two names in one statement: x, y = y, x.', 'a = 1\nb = 2\na, b = b, a\nprint(a, b)'),
]);

const numbersAndOperators = lesson('l3', 'Numbers and operators', 15, [
  text('Python works as a calculator. The operators you need most are below, shown with the result of each expression.'),
  code('print(7 + 2)   # 9\nprint(7 - 2)   # 5\nprint(7 * 2)   # 14\nprint(7 / 2)   # 3.5 (true division, always a float)\nprint(7 // 2)  # 3 (floor division)\nprint(7 % 2)   # 1 (remainder)\nprint(7 ** 2)  # 49 (power)'),
  heading('Order of operations'),
  text('Python follows the usual maths rules: parentheses first, then **, then * / // %, then + and -. Add parentheses whenever the order is not obvious to a reader.'),
  code('print(2 + 3 * 4)\nprint((2 + 3) * 4)', '14\n20'),
  heading('Useful built-in functions'),
  code('print(round(3.14159, 2))\nprint(abs(-5))\nprint(max(4, 9, 2), min(4, 9, 2))\nprint(divmod(17, 5))', '3.14\n5\n9 2\n(3, 2)'),
  note('Floats are stored in binary, so 0.1 + 0.2 gives 0.30000000000000004. Round money for display, or use the decimal module when exact cents matter.', 'warning'),
], [
  predict('e1', 'What does this print?', 'print(17 // 5, 17 % 5)', ['3.4 2', '3 2', '3 3', '2 3'], 1, '17 divided by 5 is 3 with a remainder of 2. // gives the 3 and % gives the 2.'),
  task('e2', 'Convert 500 minutes into hours and remaining minutes, then print "8 hours 20 minutes" using your variables.', 'Floor division gives the hours and the remainder gives the minutes. divmod() returns both at once.', 'hours, minutes = divmod(500, 60)\nprint(hours, "hours", minutes, "minutes")'),
]);

const strings = lesson('l4', 'Strings', 20, [
  text('A string is a sequence of characters. Each character has a position, starting at 0. Negative positions count from the end.'),
  code('word = "python"\nprint(word[0])\nprint(word[-1])\nprint(word[1:4])\nprint(word[::-1])', 'p\nn\nyth\nnohtyp'),
  text('A slice [start:stop] includes start and excludes stop. A third number is the step, and -1 walks backwards.'),
  heading('String methods'),
  text('Strings are immutable: methods return a new string and leave the original unchanged.'),
  code('title = "  learn Python  "\nprint(title.strip())\nprint(title.strip().title())\nprint("a,b,c".split(","))\nprint("-".join(["x", "y", "z"]))\nprint("banana".replace("a", "o"))\nprint("banana".count("a"))', 'learn Python\nLearn Python\n[\'a\', \'b\', \'c\']\nx-y-z\nbonono\n3'),
  heading('f-strings'),
  text('Put an f before the quotes and write expressions inside braces. A format specifier after a colon controls the output.'),
  code('name = "Asha"\nprice = 19.5\nprint(f"{name} paid {price:.2f}")\nprint(f"{1234567:,}")', 'Asha paid 19.50\n1,234,567'),
], [
  predict('e1', 'What does this print?', 's = "programming"\nprint(s[3:7])', ['gram', 'ogra', 'gramm', 'rogr'], 0, 'The characters at positions 3, 4, 5 and 6 are g, r, a and m. Position 7 is excluded.'),
  task('e2', 'Turn name = "  ada lovelace  " into "Ada Lovelace" and print it.', 'Remove the surrounding spaces first, then capitalise each word.', 'name = "  ada lovelace  "\nprint(name.strip().title())'),
]);

const inputAndConversion = lesson('l5', 'Input and type conversion', 15, [
  text('input() pauses the program, shows a prompt and returns what the user typed. The result is always a string, even when the user types digits.'),
  code('name = input("Your name: ")\nprint(f"Nice to meet you, {name}!")', 'Your name: Asha\nNice to meet you, Asha!'),
  heading('Converting between types'),
  code('print(int("42") + 1)\nprint(float("3.5") * 2)\nprint(str(10) + " items")\nprint(bool(0), bool("text"))', '43\n7.0\n10 items\nFalse True'),
  text('To do arithmetic on typed numbers, convert first: age = int(input("Age: ")).'),
  note('int("abc") raises a ValueError. You will learn to handle that cleanly in the lesson on exceptions.', 'warning'),
], [
  predict('e1', 'The user types 5 for each prompt. What does this print?', 'x = input("x: ")\ny = input("y: ")\nprint(x + y)', ['10', '55', '5 5', 'It raises an error'], 1, 'input() returns strings, and + joins two strings. Convert with int() first to add them as numbers.'),
  task('e2', 'Ask the user for two whole numbers and print their sum as: The sum is 12.', 'Wrap each input() call in int(), then use an f-string.', 'a = int(input("First number: "))\nb = int(input("Second number: "))\nprint(f"The sum is {a + b}.")'),
]);

export const gettingStarted = courseModule('b1', 'beginner', 'Getting started', [helloPython, variablesAndTypes, numbersAndOperators, strings, inputAndConversion]);
