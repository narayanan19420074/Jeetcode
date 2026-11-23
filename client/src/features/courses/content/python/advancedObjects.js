import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const classesAndObjects = lesson('l1', 'Classes and objects', 25, [
  text('A class is a blueprint that bundles data (attributes) with the functions that work on it (methods). An object is one instance built from that blueprint.'),
  code('class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n\naccount = BankAccount("Asha")\naccount.deposit(500)\nprint(account.owner, account.balance)', 'Asha 500'),
  bullets('__init__ runs when an object is created and sets up its attributes', 'self is the object the method was called on; it is always the first parameter', 'Attributes set on self belong to that one object'),
  heading('Readable output'),
  text('Define __repr__ so printing an object, or inspecting it while debugging, shows something useful. Define __str__ for a friendlier text version.'),
  code('class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __repr__(self):\n        return f"Point({self.x}, {self.y})"\n\nprint(Point(1, 2))', 'Point(1, 2)'),
], [
  predict('e1', 'What does this print?', 'class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def add(self):\n        self.value += 1\n\na = Counter()\nb = Counter()\na.add()\na.add()\nprint(a.value, b.value)', ['2 2', '2 0', '0 0', '2 1'], 1, 'Each object has its own value attribute. Calling add() on a does not change b.'),
  task('e2', 'Add a withdraw(amount) method to BankAccount that raises a ValueError when the amount is more than the balance, and otherwise reduces the balance.', 'Compare amount with self.balance before subtracting.', 'class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise ValueError("insufficient funds")\n        self.balance -= amount'),
]);

const inheritance = lesson('l2', 'Inheritance and special methods', 25, [
  text('A class can inherit from another to reuse and extend its behaviour. The child class gets every attribute and method of the parent and can override any of them. super() calls the parent version.'),
  code('class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        return f"{self.name} makes a sound"\n\nclass Dog(Animal):\n    def speak(self):\n        return super().speak() + ": woof"\n\nprint(Dog("Rex").speak())', 'Rex makes a sound: woof'),
  text('isinstance(obj, Class) is true for the class and for its parents. Calling the same method on different classes and getting class-specific behaviour is called polymorphism.'),
  heading('Special (dunder) methods'),
  text('Methods whose names have double underscores let your objects work with Python syntax: __len__ for len(), __eq__ for ==, __add__ for + and __iter__ for loops.'),
  code('class Vector:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def __add__(self, other):\n        return Vector(self.x + other.x, self.y + other.y)\n\n    def __repr__(self):\n        return f"Vector({self.x}, {self.y})"\n\nprint(Vector(1, 2) + Vector(3, 4))', 'Vector(4, 6)'),
  note('Prefer composition (an object that holds another object) when the relationship is "has a" rather than "is a".'),
], [
  predict('e1', 'What does this print?', 'class A:\n    def hi(self):\n        return "A"\n\nclass B(A):\n    def hi(self):\n        return "B" + super().hi()\n\nprint(B().hi())', ['A', 'B', 'BA', 'AB'], 2, 'B.hi builds "B" and then adds the result of the parent method, "A".'),
  task('e2', 'Give the Point class an __eq__ method so that Point(1, 2) == Point(1, 2) is True.', 'Compare the x and y attributes of self and other.', 'class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def __eq__(self, other):\n        return self.x == other.x and self.y == other.y\n\nprint(Point(1, 2) == Point(1, 2))'),
]);

const dataclassesAndProperties = lesson('l3', 'Dataclasses and properties', 20, [
  text('A dataclass writes __init__, __repr__ and __eq__ for you, so classes that mainly hold data stay short.'),
  code('from dataclasses import dataclass, field\n\n@dataclass\nclass Student:\n    name: str\n    marks: list = field(default_factory=list)\n\nasha = Student("Asha")\nasha.marks.append(90)\nprint(asha)', "Student(name='Asha', marks=[90])"),
  note('Never use a mutable default such as marks=[] directly. Use field(default_factory=list) so each object gets its own list.', 'warning'),
  heading('Properties'),
  text('A property looks like an attribute but runs code. Use it to validate a value or to compute one from other attributes.'),
  code('class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    @property\n    def diameter(self):\n        return self.radius * 2\n\nprint(Circle(4).diameter)', '8'),
  text('Add frozen=True to @dataclass when the objects should not change after creation.'),
], [
  predict('e1', 'What does this print?', 'from dataclasses import dataclass\n\n@dataclass\nclass P:\n    x: int\n    y: int\n\nprint(P(1, 2) == P(1, 2))', ['True', 'False', 'P(1, 2)', 'It raises an error'], 0, 'A dataclass compares its fields, so two objects with the same values are equal.'),
  task('e2', 'Create a dataclass Book with title (str) and pages (int, default 100), then print Book("Python").', 'Use @dataclass and give pages a default value in the class body.', 'from dataclasses import dataclass\n\n@dataclass\nclass Book:\n    title: str\n    pages: int = 100\n\nprint(Book("Python"))'),
]);

export const objectOrientedPython = courseModule('a1', 'advanced', 'Object-oriented programming', [classesAndObjects, inheritance, dataclassesAndProperties]);
