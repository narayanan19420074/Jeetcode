// Learn content for the Number Series pattern — one lesson per sub-pattern.
// Lesson `id` === the sub-pattern slug used by the question bank, so a lesson
// can deep-link straight into Practice for exactly that topic.
//
// Shape of a lesson:
//   keyIdea   string[]            the "why", in plain words
//   formulas  {label, expr}[]     the rules / pattern types to recognise
//   table     {columns, rows}     optional reference table
//   shortcut  string[]            exam-time tricks
//   examples  {question, steps[], answer}[]   revealed step by step
//   traps     {trap, fix}[]       the mistakes exam setters design options around
//   check     {question, options, correctIndex, explanation}

export const numberSeriesLessons = [
  {
    id: 'arithmetic-geometric-series',
    title: 'Arithmetic & geometric series',
    summary: 'Add the same amount, or multiply by the same amount.',
    minutes: 5,
    keyIdea: [
      'Every number series hides one rule that turns each term into the next. The two simplest rules are "add the same number every step" (arithmetic) and "multiply by the same number every step" (geometric).',
      'Always test these two first. Subtract neighbouring terms: if the gaps are equal, it is arithmetic. If the gaps are not equal, divide neighbouring terms: if the ratios are equal, it is geometric.',
      'Some series combine both in one step, such as "multiply by 2, then add 1". Check this when plain add and multiply both fail.',
    ],
    formulas: [
      { label: 'Arithmetic series', expr: 'Next = previous + d   (d may be negative)' },
      { label: 'Geometric series', expr: 'Next = previous × r   (r may be a fraction)' },
      { label: 'Multiply-and-add', expr: 'Next = previous × a ± b' },
      { label: 'nth term', expr: 'AP: a + (n − 1)d    GP: a × rⁿ⁻¹' },
    ],
    shortcut: [
      'Check the first two gaps and the first two ratios in your head before anything else. This solves most easy questions in under 10 seconds.',
      'If the numbers grow very fast, suspect multiplication. If they grow by a steady amount, suspect addition.',
    ],
    examples: [
      {
        question: 'Find the next term: 7, 12, 17, 22, ?',
        steps: ['Gaps: 12 − 7 = 5, 17 − 12 = 5, 22 − 17 = 5.', 'The gap is constant, so add 5 each time.', '22 + 5 = 27.'],
        answer: '27',
      },
      {
        question: 'Find the next term: 3, 6, 12, 24, ?',
        steps: ['Gaps are 3, 6, 12, which are not equal.', 'Ratios: 6 / 3 = 2, 12 / 6 = 2, 24 / 12 = 2.', 'Multiply by 2: 24 × 2 = 48.'],
        answer: '48',
      },
      {
        question: 'Find the next term: 2, 5, 11, 23, 47, ?',
        steps: [
          'Plain gaps are 3, 6, 12, 24 and ratios are not constant.',
          'Try "double and add 1": 2 × 2 + 1 = 5, 5 × 2 + 1 = 11, 11 × 2 + 1 = 23, 23 × 2 + 1 = 47.',
          'The rule fits every step, so next = 47 × 2 + 1 = 95.',
        ],
        answer: '95',
      },
    ],
    traps: [
      {
        trap: 'Assuming "add" just because the first two numbers suggest it.',
        fix: 'Test the rule on every pair of terms. 2, 4, 8, 16 looks like +2, +4 at first, but the ratio is a constant 2.',
      },
      {
        trap: 'Forgetting that a geometric series can shrink, for example 80, 40, 20, 10.',
        fix: 'A ratio below 1 (here 1/2) is still geometric. Check division when the terms fall.',
      },
    ],
    check: {
      question: 'Find the next term: 4, 12, 36, 108, ?',
      options: ['216', '324', '432', '342'],
      correctIndex: 1,
      explanation: 'Each term is 3 times the previous one (12 / 4 = 3, 36 / 12 = 3, 108 / 36 = 3). So the next term is 108 × 3 = 324.',
    },
  },
  {
    id: 'difference-of-differences',
    title: 'Difference-of-differences',
    summary: 'When the gaps themselves follow a pattern.',
    minutes: 6,
    keyIdea: [
      'If the gaps between terms are not equal, do not give up. Write the gaps in a second row and look at that row as a new series.',
      'The gaps often grow by a steady amount (1, 2, 3, 4 or 2, 4, 6, 8), double each time (1, 2, 4, 8), or run through odd numbers (1, 3, 5, 7).',
      'Once you know the pattern of the gaps, extend the gap row by one place and add it to the last term.',
    ],
    formulas: [
      { label: 'Gaps rise by a constant', expr: 'Gaps: +1, +2, +3, +4 …' },
      { label: 'Second gaps constant', expr: 'Gaps differ by the same step, e.g. 4, 6, 8, 10' },
      { label: 'Gaps in a geometric pattern', expr: 'Gaps: 1, 2, 4, 8 …  (each gap doubles)' },
      { label: 'Sum of previous two', expr: 'Next = last term + term before it' },
    ],
    shortcut: [
      'Write the gap row directly under the series. Seeing both rows together makes the pattern obvious.',
      'If the gap row is also messy, take gaps of the gaps once more. A constant row at that level means a squared-type rule.',
    ],
    examples: [
      {
        question: 'Find the next term: 2, 3, 5, 8, 12, ?',
        steps: ['Gaps: 1, 2, 3, 4.', 'The gaps increase by 1, so the next gap is 5.', '12 + 5 = 17.'],
        answer: '17',
      },
      {
        question: 'Find the next term: 3, 7, 13, 21, 31, ?',
        steps: ['Gaps: 4, 6, 8, 10.', 'The gaps increase by 2, so the next gap is 12.', '31 + 12 = 43.'],
        answer: '43',
      },
      {
        question: 'Find the next term: 2, 3, 5, 9, 17, ?',
        steps: ['Gaps: 1, 2, 4, 8.', 'Each gap is double the one before, so the next gap is 16.', '17 + 16 = 33.'],
        answer: '33',
      },
    ],
    traps: [
      {
        trap: 'Stopping at the first row of gaps when it is not constant.',
        fix: 'Treat the gap row as a new series and look for its own rule (add, double, odd numbers).',
      },
      {
        trap: 'Adding the wrong gap because you counted the rows wrongly.',
        fix: 'Number your gaps. A series with 5 terms has 4 gaps, so the next gap is the 5th one.',
      },
    ],
    check: {
      question: 'Find the next term: 1, 2, 5, 10, 17, ?',
      options: ['25', '26', '27', '28'],
      correctIndex: 1,
      explanation: 'Gaps are 1, 3, 5, 7, so the next gap is 9. 17 + 9 = 26.',
    },
  },
  {
    id: 'squares-cubes-primes',
    title: 'Squares, cubes & primes',
    summary: 'Spot series built from n², n³ and prime numbers.',
    minutes: 7,
    keyIdea: [
      'When terms look unrelated by adding or multiplying, check whether they are perfect squares, perfect cubes or prime numbers, possibly shifted by 1 or 2.',
      'The giveaway is that the gaps grow in a fixed way: gaps of 3, 5, 7, 9 mean squares, and the series is built from n² plus or minus a constant.',
      'Memorise the table below. Recognising 64, 125 or 343 at a glance is what makes these questions quick.',
    ],
    formulas: [
      { label: 'Squares', expr: '1, 4, 9, 16, 25, 36 …  (n²)' },
      { label: 'Cubes', expr: '1, 8, 27, 64, 125, 216 …  (n³)' },
      { label: 'Shifted series', expr: 'n² ± 1, n³ ± 1, n² + n = n(n + 1)' },
      { label: 'Primes', expr: '2, 3, 5, 7, 11, 13, 17, 19, 23 …' },
    ],
    table: {
      columns: ['n', 'n²', 'n³', 'nth prime'],
      rows: [
        [1, 1, 1, 2],
        [2, 4, 8, 3],
        [3, 9, 27, 5],
        [4, 16, 64, 7],
        [5, 25, 125, 11],
        [6, 36, 216, 13],
        [7, 49, 343, 17],
        [8, 64, 512, 19],
        [9, 81, 729, 23],
        [10, 100, 1000, 29],
        [11, 121, 1331, 31],
        [12, 144, 1728, 37],
      ],
    },
    shortcut: [
      'Compare each term with the nearest square or cube. If every term is exactly 1 more or 1 less, you have found the rule.',
      'The only even prime is 2. After that, a prime series never contains an even number, so an even term means the series is not primes.',
    ],
    examples: [
      {
        question: 'Find the next term: 1, 4, 9, 16, 25, ?',
        steps: ['These are 1², 2², 3², 4², 5².', 'The next is 6² = 36.'],
        answer: '36',
      },
      {
        question: 'Find the next term: 2, 3, 5, 7, 11, 13, ?',
        steps: ['Every term is a prime number, listed in order.', 'The prime after 13 is 17 (15 is divisible by 3 and 5, 16 is even).'],
        answer: '17',
      },
      {
        question: 'Find the next term: 2, 9, 28, 65, 126, ?',
        steps: [
          'Compare with cubes: 1, 8, 27, 64, 125.',
          'Each term is the cube plus 1: 1³ + 1 = 2, 2³ + 1 = 9, 3³ + 1 = 28, 4³ + 1 = 65, 5³ + 1 = 126.',
          'Next = 6³ + 1 = 216 + 1 = 217.',
        ],
        answer: '217',
      },
    ],
    traps: [
      {
        trap: 'Missing a shifted square or cube because the terms are not perfect squares themselves.',
        fix: 'Compare each term with the nearest square or cube. A constant difference of 1 or 2 reveals the rule.',
      },
      {
        trap: 'Counting 1 as a prime or 9 and 15 as primes.',
        fix: '1 is not prime, and odd numbers such as 9, 15, 21 are divisible by 3. Test divisibility before choosing.',
      },
    ],
    check: {
      question: 'Find the next term: 3, 8, 15, 24, 35, ?',
      options: ['46', '48', '49', '50'],
      correctIndex: 1,
      explanation: 'Each term is a square minus 1: 2² − 1 = 3, 3² − 1 = 8, 4² − 1 = 15, 5² − 1 = 24, 6² − 1 = 35. Next = 7² − 1 = 48.',
    },
  },
  {
    id: 'alternating-two-pattern-series',
    title: 'Alternating / two-pattern series',
    summary: 'Two series woven together, or two operations taking turns.',
    minutes: 7,
    keyIdea: [
      'If no single rule works from one term to the next, the series may be two separate series shuffled together. The 1st, 3rd, 5th terms follow one rule and the 2nd, 4th, 6th terms follow another.',
      'The other common form uses the same slot for two operations that take turns, such as "multiply by 2, subtract 2, multiply by 2, subtract 2 …".',
      'Your test is simple: split the series into odd positions and even positions and check each half separately.',
    ],
    formulas: [
      { label: 'Interleaved series', expr: 'Odd positions: one rule   Even positions: another rule' },
      { label: 'Alternating operations', expr: 'Step 1: × a   Step 2: − b   then repeat' },
      { label: 'Which term to extend', expr: 'Position odd → odd-series rule   Position even → even-series rule' },
      { label: 'Quick test', expr: 'Compare terms that are two places apart' },
    ],
    shortcut: [
      'When the gaps jump up and down (for example +3, −2, +3, −2), alternating operations are almost certain.',
      'Before solving, decide whether the missing term sits at an odd or even position. Then you need only that half of the series.',
    ],
    examples: [
      {
        question: 'Find the next term: 2, 5, 4, 10, 6, 20, 8, ?',
        steps: [
          'Odd positions: 2, 4, 6, 8 (add 2 each time).',
          'Even positions: 5, 10, 20 (double each time).',
          'The missing term is in the 8th place, which is the next even-position term: 20 × 2 = 40.',
        ],
        answer: '40',
      },
      {
        question: 'Find the next term: 3, 6, 4, 8, 6, 12, 10, ?',
        steps: [
          'The operations take turns: × 2, then − 2.',
          '3 × 2 = 6, 6 − 2 = 4, 4 × 2 = 8, 8 − 2 = 6, 6 × 2 = 12, 12 − 2 = 10.',
          'The next step is × 2: 10 × 2 = 20.',
        ],
        answer: '20',
      },
      {
        question: 'Find the next term: 2, 1, 4, 4, 6, 9, 8, ?',
        steps: [
          'Odd positions: 2, 4, 6, 8 (add 2 each time).',
          'Even positions: 1, 4, 9, which are the squares 1², 2², 3².',
          'The missing term is the 4th even-position term: 4² = 16.',
        ],
        answer: '16',
      },
    ],
    traps: [
      {
        trap: 'Forcing one rule across the whole series and being surprised by an uneven gap.',
        fix: 'If neighbouring terms give no pattern, check terms two places apart before giving up.',
      },
      {
        trap: 'Extending the wrong half of the series.',
        fix: 'Count the position of the "?" first. Odd position means use the odd-position rule, even position means the even one.',
      },
    ],
    check: {
      question: 'Find the next term: 5, 3, 10, 6, 15, 9, 20, ?',
      options: ['10', '12', '14', '15'],
      correctIndex: 1,
      explanation: 'Odd positions: 5, 10, 15, 20 (add 5). Even positions: 3, 6, 9 (add 3), so the next is 9 + 3 = 12.',
    },
  },
  {
    id: 'wrong-number-in-series',
    title: 'Wrong number in series',
    summary: 'Find the one term that breaks an otherwise clean rule.',
    minutes: 7,
    keyIdea: [
      'In these questions every term but one follows a single rule. Your job is to name the rule first, then find the term that does not obey it.',
      'Look at a stretch of the series that is clearly consistent. That stretch gives you the rule. Then walk through the series and find the place where the rule fails.',
      'A genuine wrong term fails the rule on both sides. After you replace it with the correct value, the terms before and after it fit the rule perfectly.',
    ],
    formulas: [
      { label: 'Step 1', expr: 'Find the rule from the most consistent stretch' },
      { label: 'Step 2', expr: 'Rebuild the series from the start with that rule' },
      { label: 'Step 3', expr: 'The first term that differs is the wrong number' },
      { label: 'Confirm', expr: 'Fixing it must make the later terms fit too' },
    ],
    shortcut: [
      'Check the middle of the series first. The wrong number is rarely the first term, and the rule is easiest to see in a long unbroken run.',
      'For sum-of-previous-two series, test the later terms: if they only fit when you use the corrected value, that confirms which term was wrong.',
    ],
    examples: [
      {
        question: 'Find the wrong number: 3, 6, 12, 24, 50, 96, 192',
        steps: [
          'The rule is "× 2": 3, 6, 12, 24 follow it perfectly.',
          'Next should be 24 × 2 = 48, but the series shows 50.',
          '48 × 2 = 96 and 96 × 2 = 192 fit, so 48 is the correct term.',
        ],
        answer: '50 (it should be 48)',
      },
      {
        question: 'Find the wrong number: 5, 9, 13, 17, 22, 25, 29',
        steps: [
          'Most gaps are 4, so the rule is "+ 4".',
          '17 + 4 = 21, but the series shows 22.',
          'With 21, the next terms 25 and 29 also fit the rule. So 22 is the wrong number.',
        ],
        answer: '22 (it should be 21)',
      },
      {
        question: 'Find the wrong number: 4, 5, 9, 14, 23, 38, 60',
        steps: [
          'Each term is the sum of the two before it: 4 + 5 = 9, 5 + 9 = 14, 9 + 14 = 23.',
          '14 + 23 = 37, but the series shows 38.',
          'Check the last term: 23 + 37 = 60, which matches. So 38 is the wrong number and 37 is correct.',
        ],
        answer: '38 (it should be 37)',
      },
    ],
    traps: [
      {
        trap: 'Choosing the term right after the gap that looks odd.',
        fix: 'Rebuild each term from the rule. The first term that differs is wrong, not its neighbour.',
      },
      {
        trap: 'Assuming the first term must be the wrong one because the rule is unclear.',
        fix: 'Find the rule from the longest consistent run in the middle, then test the ends.',
      },
    ],
    check: {
      question: 'Find the wrong number: 2, 6, 12, 20, 30, 42, 55',
      options: ['20', '30', '42', '55'],
      correctIndex: 3,
      explanation: 'The terms are n × (n + 1): 1×2, 2×3, 3×4, 4×5, 5×6, 6×7, so the 7th term must be 7 × 8 = 56, not 55.',
    },
  },
  {
    id: 'missing-number',
    title: 'Missing number',
    summary: 'Find the gap in the middle of a series using both neighbours.',
    minutes: 6,
    keyIdea: [
      'A missing number may sit anywhere, so you can use the terms on both sides of the gap. This makes it easier than finding the next term at the end.',
      'First look at the pairs that are complete. They show the rule. Then apply the rule forward from the left, and check it backward from the right.',
      'The answer must fit both neighbours. If it fits only one side, the rule you guessed is wrong.',
    ],
    formulas: [
      { label: 'Missing term in an AP', expr: 'Middle = (left + right) / 2' },
      { label: 'Missing term in a GP', expr: 'Middle = √(left × right)' },
      { label: 'Using the gap rule', expr: 'Find the rule from complete pairs, then fill the blank' },
      { label: 'Final check', expr: 'Put the answer back and test every step' },
    ],
    shortcut: [
      'In an arithmetic series, the missing middle term is just the average of its two neighbours.',
      'Always substitute your answer back into the series. If every step obeys the rule, you are done.',
    ],
    examples: [
      {
        question: 'Find the missing number: 2, 6, ?, 54, 162',
        steps: ['Ratios of complete pairs: 6 / 2 = 3 and 162 / 54 = 3.', 'The rule is "× 3", so the missing term is 6 × 3 = 18.', 'Check: 18 × 3 = 54. ✓'],
        answer: '18',
      },
      {
        question: 'Find the missing number: 1, 8, 27, ?, 125',
        steps: ['These are the cubes 1³, 2³, 3³, ?, 5³.', 'The missing term is 4³ = 64.'],
        answer: '64',
      },
      {
        question: 'Find the missing number: 5, 6, 8, 11, ?, 20, 26',
        steps: [
          'Known gaps: 1, 2, 3 at the start and 6 at the end (20 to 26).',
          'The gaps rise by 1 each time (1, 2, 3, 4, 5, 6), so the gap after 11 is 4.',
          '11 + 4 = 15. Check: 15 + 5 = 20 ✓ and 20 + 6 = 26 ✓.',
        ],
        answer: '15',
      },
    ],
    traps: [
      {
        trap: 'Guessing a rule from only the first two terms and ignoring the right side.',
        fix: 'Use complete pairs on both sides. The blank must connect to both neighbours.',
      },
      {
        trap: 'Forgetting that one blank hides TWO gaps (the one before it and the one after it).',
        fix: 'Write the full gap row, mark the known gaps, and fill the unknown ones from the pattern. Then check both gaps fit.',
      },
    ],
    check: {
      question: 'Find the missing number: 3, 5, 9, ?, 33, 65',
      options: ['15', '17', '19', '21'],
      correctIndex: 1,
      explanation: 'The gaps are 2, 4, 8, 16, 32 (each doubles). So the missing term is 9 + 8 = 17, and 17 + 16 = 33 fits.',
    },
  },
  {
    id: 'number-pairs-analogies',
    title: 'Number pairs & analogies',
    summary: 'Find the rule that turns the first number of each pair into the second.',
    minutes: 6,
    keyIdea: [
      'In a number analogy, every pair follows the same rule: the first number is turned into the second by the same operation. Your job is to find that operation and apply it to the last pair.',
      'Test your guess on EVERY given pair, not only the first. A rule that works on one pair but fails on another is not the rule.',
      'Typical rules are squaring, cubing, "square plus 1", n × (n + 1), or working with the digits (reversing, adding them).',
    ],
    formulas: [
      { label: 'Square / cube rule', expr: 'a : a²    or    a : a³' },
      { label: 'Shifted rule', expr: 'a : a² ± k    or    a : a³ + a' },
      { label: 'Product rule', expr: 'a : a × (a + 1)' },
      { label: 'Digit rules', expr: 'Reverse the digits, or add / multiply them' },
    ],
    shortcut: [
      'If the second number is much bigger than the first, try squares and cubes before multiplication.',
      'If the multiplier changes from pair to pair (3 to 9 is ×3, but 5 to 25 is ×5), the rule is likely a power of the number itself.',
    ],
    examples: [
      {
        question: 'Find the missing number: 3 : 9, 5 : 25, 8 : 64, 11 : ?',
        steps: ['3 → 9 = 3², 5 → 25 = 5², 8 → 64 = 8².', 'The rule is "square the number".', '11² = 121.'],
        answer: '121',
      },
      {
        question: 'Find the missing number: 4 : 17, 6 : 37, 9 : 82, 12 : ?',
        steps: ['4² + 1 = 17, 6² + 1 = 37, 9² + 1 = 82.', 'The rule is "square plus 1" and it fits all three pairs.', '12² + 1 = 144 + 1 = 145.'],
        answer: '145',
      },
      {
        question: 'Find the missing number: 1 : 2, 2 : 10, 3 : 30, 4 : 68, 5 : ?',
        steps: [
          'Try "cube plus the number": 1³ + 1 = 2, 2³ + 2 = 10, 3³ + 3 = 30, 4³ + 4 = 68.',
          'The rule fits every pair.',
          '5³ + 5 = 125 + 5 = 130.',
        ],
        answer: '130',
      },
    ],
    traps: [
      {
        trap: 'Fixing a simple rule from the first pair alone, such as "multiply by 3".',
        fix: 'Check the rule on every pair. If the second pair breaks it, try powers of the number instead.',
      },
      {
        trap: 'Using the last pair to find the rule and ignoring the first.',
        fix: 'All pairs follow the same rule. The correct rule must reproduce each of them exactly.',
      },
    ],
    check: {
      question: 'Find the missing number: 2 : 6, 3 : 12, 4 : 20, 5 : ?',
      options: ['25', '28', '30', '36'],
      correctIndex: 2,
      explanation: 'The rule is n × (n + 1): 2 × 3 = 6, 3 × 4 = 12, 4 × 5 = 20. So 5 × 6 = 30.',
    },
  },
];
