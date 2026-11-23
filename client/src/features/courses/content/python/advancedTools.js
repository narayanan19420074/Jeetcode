import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const generators = lesson('l1', 'Iterators and generators', 25, [
  text('A for loop works on anything iterable. Under the hood Python asks the object for an iterator and calls next() on it until it is exhausted.'),
  code('numbers = iter([10, 20])\nprint(next(numbers))\nprint(next(numbers))', '10\n20'),
  heading('Generators'),
  text('A function with yield is a generator. It produces one value at a time and remembers where it stopped, so it can describe very long or endless sequences without building a list in memory.'),
  code('def countdown(start):\n    while start > 0:\n        yield start\n        start -= 1\n\nfor number in countdown(3):\n    print(number)', '3\n2\n1'),
  text('A generator expression is the short form: sum(n * n for n in range(1000000)) never creates the million-item list.'),
  note('A generator can be used once. To loop again, call the generator function again.', 'warning'),
], [
  predict('e1', 'What does this print?', 'def gen():\n    yield 1\n    yield 2\n\ng = gen()\nprint(next(g), next(g))', ['1 2', '[1, 2]', '2 1', 'It raises StopIteration'], 0, 'Each next() resumes the generator and returns the next yielded value.'),
  task('e2', 'Write a generator fibonacci(limit) that yields Fibonacci numbers while they are below limit, then print list(fibonacci(50)).', 'Keep two variables a and b, yield a, then move to a, b = b, a + b.', 'def fibonacci(limit):\n    a, b = 0, 1\n    while a < limit:\n        yield a\n        a, b = b, a + b\n\nprint(list(fibonacci(50)))'),
]);

const decorators = lesson('l2', 'Decorators', 25, [
  text('A decorator wraps a function to add behaviour without changing its code. It relies on two ideas you already know: functions are values, and a function can return another function.'),
  code('import functools\nimport time\n\ndef timed(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")\n        return result\n    return wrapper\n\n@timed\ndef slow_sum(n):\n    return sum(range(n))\n\nslow_sum(1_000_000)'),
  text('The @timed line is shorthand for slow_sum = timed(slow_sum).'),
  note('Always add functools.wraps. It keeps the original name and docstring, which debuggers and documentation tools rely on.'),
  heading('Typical uses'),
  bullets('Logging and timing calls', 'Checking permissions before a function runs', 'Caching results (functools.cache is built in)', 'Registering routes in web frameworks such as Flask and FastAPI'),
], [
  predict('e1', 'What does this print?', 'def double(func):\n    def wrapper(*args):\n        return func(*args) * 2\n    return wrapper\n\n@double\ndef add(a, b):\n    return a + b\n\nprint(add(2, 3))', ['5', '10', '23', 'It raises an error'], 1, 'add(2, 3) is 5 and the wrapper doubles it to 10.'),
  task('e2', 'Write a decorator log_calls that prints "Calling <function name>" before running the function, and apply it to a function of your own.', 'Define wrapper(*args, **kwargs), print func.__name__, then return func(*args, **kwargs).', 'import functools\n\ndef log_calls(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        print(f"Calling {func.__name__}")\n        return func(*args, **kwargs)\n    return wrapper\n\n@log_calls\ndef greet(name):\n    return f"Hello, {name}"\n\nprint(greet("Asha"))'),
]);

const contextManagers = lesson('l3', 'Context managers', 20, [
  text('A context manager guarantees that set-up and clean-up code runs around a block. You have used one already: with open(...) always closes the file.'),
  heading('Writing your own with contextlib'),
  code('from contextlib import contextmanager\nimport time\n\n@contextmanager\ndef stopwatch(label):\n    start = time.perf_counter()\n    try:\n        yield\n    finally:\n        print(f"{label}: {time.perf_counter() - start:.3f}s")\n\nwith stopwatch("loop"):\n    sum(range(1_000_000))'),
  text('Code before yield runs on entering the with block. Code in the finally part runs on leaving it, even when the block raised an error.'),
  heading('The class-based form'),
  code('class Resource:\n    def __enter__(self):\n        print("open")\n        return self\n\n    def __exit__(self, exc_type, exc, traceback):\n        print("close")\n\nwith Resource():\n    print("working")', 'open\nworking\nclose'),
], [
  predict('e1', 'In what order are the lines printed?', 'class Resource:\n    def __enter__(self):\n        print("A")\n        return self\n\n    def __exit__(self, *details):\n        print("C")\n\nwith Resource():\n    print("B")', ['A, B, C', 'B, A, C', 'A, C, B', 'C, B, A'], 0, '__enter__ runs first, then the block body, then __exit__.'),
  task('e2', 'Write a context manager announce(label) with @contextmanager that prints "start <label>" before the block and "end <label>" after it, even if the block fails.', 'Print before yield, and put the closing print inside a finally block after yield.', 'from contextlib import contextmanager\n\n@contextmanager\ndef announce(label):\n    print(f"start {label}")\n    try:\n        yield\n    finally:\n        print(f"end {label}")\n\nwith announce("job"):\n    print("working")'),
]);

const typeHints = lesson('l1', 'Type hints', 20, [
  text('Type hints document what a function expects and returns. Python does not enforce them at run time, but editors and tools such as mypy and Pyright use them to find bugs before you run the code.'),
  code('def average(scores: list[float]) -> float:\n    return sum(scores) / len(scores)\n\ndef find_user(user_id: int) -> str | None:\n    return None'),
  bullets('name: type annotates a parameter or variable', '-> type annotates the return value', 'list[int], dict[str, int] and tuple[int, str] describe collections', 'X | None means a value of type X or nothing'),
  note('Hints are checked by tools, not by Python itself. A type checker flags average(["a"]) before you run the program.'),
], [
  predict('e1', 'What does this print?', 'def f(x: int) -> int:\n    return x\n\nprint(f("a"))', ['It raises a TypeError', 'a', 'None', '0'], 1, 'Type hints are not enforced at run time, so Python simply returns the string. A type checker would report the mistake.'),
  task('e2', 'Add type hints to def join_names(names, separator): return separator.join(names).', 'names is a list of strings, separator is a string and the function returns a string.', 'def join_names(names: list[str], separator: str) -> str:\n    return separator.join(names)'),
]);

const environments = lesson('l2', 'Virtual environments and packages', 20, [
  text('Different projects need different package versions. A virtual environment is a private folder of packages for one project, so projects never conflict. pip installs packages from the Python Package Index (PyPI).'),
  code('python -m venv .venv\nsource .venv/bin/activate        # Windows: .venv\\Scripts\\activate\npip install requests\npip freeze > requirements.txt\npip install -r requirements.txt'),
  bullets('Create one environment per project and never commit the .venv folder', 'Record dependencies in requirements.txt (or pyproject.toml) so others can reproduce your setup', 'Pin versions for applications and use ranges for libraries'),
  note('Always activate the environment first. Otherwise pip installs into your system Python.', 'warning'),
], [
  predict('e1', 'Which command creates a virtual environment in a folder named .venv?', '', ['pip install venv', 'python -m venv .venv', 'python venv create .venv', 'pip freeze .venv'], 1, 'The venv module of the standard library creates the environment: python -m venv .venv.'),
  task('e2', 'Write the shell commands that create an environment named .venv, activate it on Linux or macOS, install the requests package and save the installed packages to requirements.txt.', 'Use python -m venv, source, pip install and pip freeze with a redirect.', 'python -m venv .venv\nsource .venv/bin/activate\npip install requests\npip freeze > requirements.txt'),
]);

const concurrency = lesson('l3', 'Concurrency basics', 30, [
  text('Concurrency lets a program make progress on several tasks at once. Choose the tool that matches the work.'),
  bullets('asyncio: many tasks that mostly wait, such as network calls, on a single thread', 'threading and ThreadPoolExecutor: waiting work with libraries that are not async', 'multiprocessing and ProcessPoolExecutor: heavy calculations that need several CPU cores'),
  heading('asyncio'),
  text('async def defines a coroutine and await pauses it until a result is ready. While one coroutine waits, the event loop runs the others.'),
  code('import asyncio\n\nasync def fetch(name):\n    await asyncio.sleep(1)\n    return f"{name} done"\n\nasync def main():\n    results = await asyncio.gather(fetch("a"), fetch("b"))\n    print(results)\n\nasyncio.run(main())', "['a done', 'b done']"),
  text('Both tasks wait at the same time, so the program takes about one second, not two.'),
  heading('Thread pools'),
  code('from concurrent.futures import ThreadPoolExecutor\n\nwith ThreadPoolExecutor(max_workers=4) as pool:\n    print(list(pool.map(len, ["tea", "coffee", "milk"])))', '[3, 6, 4]'),
  note('Because of the global interpreter lock (GIL), threads do not speed up CPU-heavy Python code. Use processes for that.'),
], [
  predict('e1', 'Roughly how long does main() take?', 'import asyncio\n\nasync def wait():\n    await asyncio.sleep(1)\n\nasync def main():\n    await asyncio.gather(wait(), wait())\n\nasyncio.run(main())', ['About 2 seconds', 'About 1 second', 'About 0 seconds', 'It never finishes'], 1, 'gather runs both coroutines concurrently, so their one-second waits overlap.'),
  task('e2', 'Use ThreadPoolExecutor.map to compute the length of every string in words = ["alpha", "be", "gamma"] and print the list of lengths.', 'Create the pool in a with block and call list(pool.map(len, words)).', 'from concurrent.futures import ThreadPoolExecutor\n\nwords = ["alpha", "be", "gamma"]\nwith ThreadPoolExecutor() as pool:\n    print(list(pool.map(len, words)))'),
]);

export const advancedFunctions = courseModule('a2', 'advanced', 'Advanced functions', [generators, decorators, contextManagers]);
export const professionalPython = courseModule('a3', 'advanced', 'Professional Python', [typeHints, environments, concurrency]);
