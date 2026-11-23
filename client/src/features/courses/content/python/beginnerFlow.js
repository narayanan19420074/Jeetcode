import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const comparisonsAndIf = lesson('l1', 'Comparisons and if statements', 20, [
  text('Programs make decisions by asking yes/no questions. A comparison produces a bool: True or False.'),
  code('print(5 == 5)   # equal\nprint(5 != 3)   # not equal\nprint(5 > 3, 5 <= 3)\nprint(1 < 5 < 10)  # chained comparison', 'True\nTrue\nTrue False\nTrue'),
  heading('if, elif and else'),
  text('The block under an if runs only when its condition is true. elif adds more conditions, checked in order, and else catches everything left. The indented lines belong to the block.'),
  code('score = 72\nif score >= 90:\n    grade = "A"\nelif score >= 75:\n    grade = "B"\nelif score >= 60:\n    grade = "C"\nelse:\n    grade = "F"\nprint(grade)', 'C'),
  heading('Truthiness'),
  text('Any value can be used as a condition. 0, 0.0, "", [], {} and None count as false. Everything else counts as true.'),
  code('name = ""\nif not name:\n    print("Name is required")', 'Name is required'),
  note('One equals sign assigns, two compare. Writing if x = 5 is a syntax error.', 'warning'),
], [
  predict('e1', 'What does this print?', 'n = 75\nif n > 90:\n    print("A")\nelif n > 70:\n    print("B")\nelif n > 50:\n    print("C")', ['A', 'B', 'C', 'BC'], 1, 'Python stops at the first true branch. n > 70 is true, so only B is printed.'),
  task('e2', 'Read a number with int(input()) and print "positive", "negative" or "zero".', 'Use if for one case, elif for the second and else for the last.', 'n = int(input())\nif n > 0:\n    print("positive")\nelif n < 0:\n    print("negative")\nelse:\n    print("zero")'),
]);

const logicalOperatorsAndMatch = lesson('l2', 'Logical operators and match', 20, [
  text('Combine conditions with and, or and not. and needs both sides true, or needs at least one, and not flips the result.'),
  code('age = 25\nhas_id = True\nif age >= 18 and has_id:\n    print("Entry allowed")\nprint(not has_id)', 'Entry allowed\nFalse'),
  text('Python stops evaluating as soon as the answer is known (short-circuiting), so in a and b the right side is skipped when a is false.'),
  heading('The in operator and conditional expressions'),
  code('vowels = "aeiou"\nprint("e" in vowels)\nage = 16\nstatus = "adult" if age >= 18 else "minor"\nprint(status)', 'True\nminor'),
  heading('match statements'),
  text('Python 3.10 added match for choosing between many fixed cases. The underscore is the catch-all.'),
  code('command = "stop"\nmatch command:\n    case "go":\n        print("Moving")\n    case "stop" | "halt":\n        print("Stopping")\n    case _:\n        print("Unknown command")', 'Stopping'),
], [
  predict('e1', 'What does this print?', 'print(not (3 > 2 and 5 < 4))', ['True', 'False', '3', 'It raises an error'], 0, '3 > 2 is True and 5 < 4 is False, so the and gives False. not False is True.'),
  task('e2', 'Given year = 2024, print True when it is a leap year. A leap year is divisible by 4, except century years, which must be divisible by 400.', 'Combine the rules with and, or and parentheses.', 'year = 2024\nprint((year % 4 == 0 and year % 100 != 0) or year % 400 == 0)'),
]);

const whileLoops = lesson('l1', 'while loops', 15, [
  text('A loop repeats a block of code. A while loop keeps going as long as its condition is true, so something inside the loop must eventually make it false.'),
  code('count = 3\nwhile count > 0:\n    print(count)\n    count -= 1\nprint("Liftoff!")', '3\n2\n1\nLiftoff!'),
  heading('Repeat until the user is done'),
  code('total = 0\nwhile True:\n    entry = input("Add a number (or q to quit): ")\n    if entry == "q":\n        break\n    total += int(entry)\nprint(f"Total: {total}")'),
  note('If the condition never becomes false the program runs forever. Press Ctrl+C to stop it, then check that the loop changes the variable it tests.', 'warning'),
], [
  predict('e1', 'What does this print?', 'i = 1\ntotal = 0\nwhile i <= 4:\n    total += i\n    i += 1\nprint(total)', ['4', '10', '15', '6'], 1, 'The loop adds 1, 2, 3 and 4, which gives 10. When i reaches 5 the condition fails.'),
  task('e2', 'Use a while loop to print the powers of 2 that are below 100: 1, 2, 4, 8 and so on.', 'Start with n = 1 and double it on every pass.', 'n = 1\nwhile n < 100:\n    print(n)\n    n *= 2'),
]);

const forLoops = lesson('l2', 'for loops and range', 20, [
  text('A for loop visits each item of a sequence once. It is the right choice when you know what to loop over.'),
  code('for letter in "abc":\n    print(letter)', 'a\nb\nc'),
  heading('range()'),
  bullets('range(5) gives 0, 1, 2, 3, 4', 'range(2, 6) gives 2, 3, 4, 5', 'range(10, 0, -3) gives 10, 7, 4, 1'),
  code('total = 0\nfor number in range(1, 6):\n    total += number\nprint(total)', '15'),
  heading('enumerate'),
  text('When you need the position as well as the item, enumerate() hands you both.'),
  code('for index, fruit in enumerate(["apple", "mango"], start=1):\n    print(index, fruit)', '1 apple\n2 mango'),
], [
  predict('e1', 'What does this print?', 'for i in range(3, 0, -1):\n    print(i, end=" ")', ['1 2 3', '3 2 1', '3 2 1 0', '2 1 0'], 1, 'The range starts at 3, steps by -1 and stops before 0, so it yields 3, 2, 1.'),
  task('e2', 'Print the multiplication table of 7 from 7 x 1 to 7 x 10, one line each, such as "7 x 3 = 21".', 'Loop over range(1, 11) and use an f-string.', 'for i in range(1, 11):\n    print(f"7 x {i} = {7 * i}")'),
]);

const breakContinueNested = lesson('l3', 'break, continue and nested loops', 20, [
  text('break leaves the loop immediately. continue skips the rest of the current pass and moves to the next item.'),
  code('for n in range(1, 10):\n    if n % 2 == 0:\n        continue\n    if n > 7:\n        break\n    print(n, end=" ")', '1 3 5 7'),
  heading('Nested loops'),
  text('A loop inside a loop runs the inner loop completely for every pass of the outer one. This is how you work with grids and tables.'),
  code('for row in range(1, 4):\n    for col in range(1, 4):\n        print(row * col, end=" ")\n    print()', '1 2 3\n2 4 6\n3 6 9'),
  heading('Searching with for ... else'),
  text('The else block of a loop runs only when the loop finished without hitting break. It is handy for "not found" cases.'),
  code('for n in [4, 8, 15]:\n    if n % 5 == 0:\n        print("found", n)\n        break\nelse:\n    print("no multiple of 5")', 'found 15'),
], [
  predict('e1', 'What does this print?', 'for n in range(1, 8):\n    if n % 2 == 0:\n        continue\n    if n > 5:\n        break\n    print(n, end=" ")', ['1 3 5', '1 3 5 7', '2 4 6', '1 3'], 0, 'Even numbers are skipped. At 7 the break fires before the print, so the output is 1 3 5.'),
  task('e2', 'Print a right triangle of stars with 4 rows: one star on the first row, four on the last.', 'The row number tells you how many stars to print. "*" * 3 gives three stars.', 'for row in range(1, 5):\n    print("*" * row)'),
]);

export const makingDecisions = courseModule('b2', 'beginner', 'Making decisions', [comparisonsAndIf, logicalOperatorsAndMatch]);
export const repeatingCode = courseModule('b3', 'beginner', 'Loops', [whileLoops, forLoops, breakContinueNested]);
