// Learn content for the Number System pattern — one lesson per sub-pattern.
// Lesson `id` === the sub-pattern slug used by the question bank, so a lesson
// can deep-link straight into Practice for exactly that topic.
// Shape is documented in percentagesLessons.js.

export const numberSystemLessons = [
  {
    id: 'types-of-numbers-classification',
    title: 'Types of numbers & classification',
    summary: 'Natural, whole, integer, rational, irrational, prime, composite, perfect.',
    minutes: 6,
    keyIdea: [
      'Number types are nested boxes: natural numbers sit inside whole numbers, which sit inside integers, which sit inside rational numbers. Irrational numbers are everything on the number line that is NOT rational.',
      'A rational number can be written as p/q with q ≠ 0. Terminating and repeating decimals are rational. Non-terminating, non-repeating decimals (like √2 or π) are irrational.',
      'Prime, composite and perfect are labels for natural numbers only. 1 is neither prime nor composite, and 2 is the only even prime.',
    ],
    formulas: [
      { label: 'Natural / Whole', expr: 'N = 1, 2, 3 …    W = 0, 1, 2, 3 …' },
      { label: 'Integers', expr: 'Z = … −2, −1, 0, 1, 2 …' },
      { label: 'Rational', expr: 'p/q with integers p, q and q ≠ 0  (√16 = 4 is rational)' },
      { label: 'Perfect number', expr: 'Equals the sum of its proper factors: 6, 28, 496 …' },
    ],
    table: {
      columns: ['Number', 'Natural', 'Whole', 'Integer', 'Rational', 'Irrational'],
      rows: [
        ['7', 'Yes', 'Yes', 'Yes', 'Yes', 'No'],
        ['0', 'No', 'Yes', 'Yes', 'Yes', 'No'],
        ['−3', 'No', 'No', 'Yes', 'Yes', 'No'],
        ['3/4', 'No', 'No', 'No', 'Yes', 'No'],
        ['√2', 'No', 'No', 'No', 'No', 'Yes'],
      ],
    },
    shortcut: [
      'Before calling a root irrational, check whether the number under it is a perfect square. √49 and √0.09 are rational; √50 is not.',
      'Memorise the first few of each family: primes 2, 3, 5, 7, 11, 13; composites 4, 6, 8, 9, 10; perfect numbers 6 and 28.',
    ],
    examples: [
      {
        question: 'How many of 5, −2, 0, 3/4, √2, √9, 0.25 are rational?',
        steps: [
          'Only √2 is non-terminating and non-repeating, so it is the only irrational one.',
          '√9 = 3, which is rational. 0.25 = 1/4 is rational. 5, −2, 0 and 3/4 are rational.',
          'Rational count = 7 − 1 = 6.',
        ],
        answer: '6',
      },
      {
        question: 'Find the sum of the smallest prime, the smallest composite and the smallest perfect number.',
        steps: ['Smallest prime = 2. Smallest composite = 4 (1 is neither).', 'Smallest perfect number = 6, since 1 + 2 + 3 = 6.', '2 + 4 + 6 = 12.'],
        answer: '12',
      },
      {
        question: 'How many composite numbers are there from 1 to 30 (inclusive)?',
        steps: [
          'Primes up to 30: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, which is 10 primes.',
          'The number 1 is neither prime nor composite.',
          'Composites = 30 − 10 − 1 = 19.',
        ],
        answer: '19',
      },
    ],
    traps: [
      { trap: 'Calling 1 a prime, or counting it as composite.', fix: '1 has only one factor. It is neither prime nor composite, so subtract it separately when counting.' },
      { trap: 'Saying every root is irrational, or that 22/7 is irrational because π ≈ 22/7.', fix: 'A fraction of two integers is always rational. 22/7 is rational; π is only approximately 22/7.' },
    ],
    check: {
      question: 'Which of the following is irrational?',
      options: ['√49', '22/7', '√50', '0.1212… (repeating)'],
      correctIndex: 2,
      explanation: '√49 = 7 and 22/7 are rational, and a repeating decimal is rational. √50 = 5√2 is not a perfect square root, so it is irrational.',
    },
  },
  {
    id: 'divisibility-rules',
    title: 'Divisibility rules',
    summary: 'Check divisibility by 2 to 13 without dividing.',
    minutes: 8,
    keyIdea: [
      'Divisibility rules let you decide whether N ÷ d leaves zero remainder by looking only at its digits. For 2, 4, 5, 8 and 10 the last few digits decide; for 3 and 9 the digit sum decides.',
      'For composite divisors, test co-prime parts together. 6 = 2 × 3 and 12 = 3 × 4 work, but 12 = 2 × 6 does not, because 2 and 6 share a factor.',
      'For 7, 11 and 13, remember 7 × 11 × 13 = 1001. Splitting a number into groups of three digits from the right and taking the alternating sum tests all three at once.',
    ],
    formulas: [
      { label: 'By 3 / 9', expr: 'Digit sum divisible by 3 / 9' },
      { label: 'By 11', expr: '(Sum of odd-place digits) − (sum of even-place digits) is 0 or a multiple of 11' },
      { label: 'By 7, 11, 13 together', expr: 'Alternating sum of 3-digit groups (from the right) divisible by 7, 11 or 13' },
      { label: 'Composite divisor', expr: 'Divisible by a and b with gcd(a, b) = 1 ⇒ divisible by a × b' },
    ],
    table: {
      columns: ['Divisor', 'Rule', 'Example'],
      rows: [
        ['2', 'Last digit is even', '4,718'],
        ['3', 'Digit sum divisible by 3', '2,481 (sum 15)'],
        ['4', 'Last two digits divisible by 4', '7,316 (16)'],
        ['5', 'Last digit is 0 or 5', '3,865'],
        ['6', 'Divisible by both 2 and 3', '5,142'],
        ['7', 'Remove last digit, subtract double of it from the rest; repeat', '2,583 (258 − 6 = 252)'],
        ['8', 'Last three digits divisible by 8', '91,320 (320)'],
        ['9', 'Digit sum divisible by 9', '6,381 (sum 18)'],
        ['10', 'Last digit is 0', '4,570'],
        ['11', 'Odd-place sum minus even-place sum is 0 or a multiple of 11', '8,129 (10 − 10 = 0)'],
        ['12', 'Divisible by both 3 and 4', '3,456'],
        ['13', 'Remove last digit, add 4 times it to the rest; repeat', '2,145 (214 + 20 = 234)'],
      ],
    },
    shortcut: [
      'If a digit-sum test fails, you already know the remainder by 9: the digit sum mod 9 equals the number mod 9.',
      'For "smallest number divisible by several numbers", take the LCM first, then round up to the target size.',
    ],
    examples: [
      {
        question: 'Is 53,712 divisible by 8 and by 9?',
        steps: ['By 8: last three digits 712 ÷ 8 = 89, exactly.', 'By 9: digit sum = 5 + 3 + 7 + 1 + 2 = 18, which is a multiple of 9.', 'Both tests pass.'],
        answer: 'Yes, divisible by both',
      },
      {
        question: 'Which of 7, 11 and 13 divide 91,377?',
        steps: [
          'Groups of three from the right: 91 and 377. Alternating sum = 377 − 91 = 286.',
          '286 = 2 × 11 × 13, so 11 and 13 divide it, but 7 does not.',
          'The same result holds for 91,377 because 1001 = 7 × 11 × 13.',
        ],
        answer: '11 and 13, not 7',
      },
      {
        question: 'Find the smallest 5-digit number divisible by 6, 8 and 9.',
        steps: [
          'LCM of 6, 8, 9 = 72.',
          'Smallest 5-digit number = 10,000. 10,000 ÷ 72 leaves remainder 64.',
          'Add 72 − 64 = 8 to reach the next multiple: 10,000 + 8 = 10,008.',
          'Check: 72 × 139 = 10,008.',
        ],
        answer: '10,008',
      },
    ],
    traps: [
      { trap: 'Testing 12 by checking 2 and 6, or 24 by checking 4 and 6.', fix: 'Pick co-prime factors only: 12 = 3 × 4, 18 = 2 × 9, 24 = 3 × 8.' },
      { trap: 'Insisting the 11-rule difference must be exactly 0.', fix: 'Any multiple of 11 works: 0, 11, 22 … or the negatives of those.' },
    ],
    check: {
      question: 'Which of these numbers is divisible by 11?',
      options: ['2915', '2916', '2917', '2918'],
      correctIndex: 0,
      explanation: '2915: (2 + 1) and (9 + 5) give 3 and 14, difference 11, so it is divisible. 2915 = 11 × 265. The other three give differences of 12, 13 and 14 (not multiples of 11).',
    },
  },
  {
    id: 'factors-number-of-factors',
    title: 'Factors & number of factors',
    summary: 'Prime factorise, then count and add factors with exponents.',
    minutes: 8,
    keyIdea: [
      'Every number has one prime factorisation, N = p^a × q^b × r^c. Each factor of N is built by choosing a power of p from 0 to a, of q from 0 to b, and so on.',
      'That choice-making is the counting principle, so the number of factors is (a + 1)(b + 1)(c + 1). For the sum of factors, add up each prime\'s powers and multiply the results.',
      'Factors pair up as (f, N/f). Only perfect squares have an odd number of factors, because the square root pairs with itself.',
    ],
    formulas: [
      { label: 'Number of factors', expr: '(a + 1)(b + 1)(c + 1) for N = p^a q^b r^c' },
      { label: 'Sum of factors', expr: '(p^(a+1) − 1)/(p − 1) × (q^(b+1) − 1)/(q − 1) × …' },
      { label: 'Odd factors / square factors', expr: 'Ignore the power of 2 / use (⌊a/2⌋ + 1)(⌊b/2⌋ + 1) …' },
      { label: 'Product of all factors', expr: 'N^(d/2), where d is the number of factors' },
    ],
    shortcut: [
      'For "how many odd factors", cross out every 2 from the factorisation, then use (b + 1)(c + 1) on what remains.',
      'Number of ways to write N as a product of two factors = d/2 (for non-squares). Counting ordered pairs gives d.',
    ],
    examples: [
      {
        question: 'How many factors does 360 have?',
        steps: ['360 = 2³ × 3² × 5¹.', 'Number of factors = (3 + 1)(2 + 1)(1 + 1) = 4 × 3 × 2 = 24.'],
        answer: '24',
      },
      {
        question: 'Find the sum of all factors of 180.',
        steps: [
          '180 = 2² × 3² × 5.',
          'Powers of 2: 1 + 2 + 4 = 7. Powers of 3: 1 + 3 + 9 = 13. Powers of 5: 1 + 5 = 6.',
          'Sum = 7 × 13 × 6 = 546.',
        ],
        answer: '546',
      },
      {
        question: 'How many factors of 720 are perfect squares?',
        steps: [
          '720 = 2⁴ × 3² × 5¹.',
          'A square factor needs even powers: for 2 choose 0, 2 or 4 (3 ways); for 3 choose 0 or 2 (2 ways); for 5 only 0 (1 way).',
          'Count = 3 × 2 × 1 = 6.',
        ],
        answer: '6',
      },
    ],
    traps: [
      { trap: 'Using (a)(b)(c) instead of (a + 1)(b + 1)(c + 1).', fix: 'The exponent 0 is also an allowed choice, so add 1 to every exponent.' },
      { trap: 'Forgetting that 1 and N themselves are factors.', fix: 'The formula already counts them. Subtract 2 only if the question asks for "proper" factors excluding 1 and N.' },
    ],
    check: {
      question: 'How many factors does 1,000 have?',
      options: ['12', '16', '20', '24'],
      correctIndex: 1,
      explanation: '1,000 = 2³ × 5³, so factors = (3 + 1)(3 + 1) = 16.',
    },
  },
  {
    id: 'remainder-theorems-cyclicity',
    title: 'Remainder theorems & cyclicity',
    summary: 'Remainders of sums, products and powers using patterns that repeat.',
    minutes: 9,
    keyIdea: [
      'You can replace any number by its remainder before you add or multiply. The remainder of a product equals the remainder of the product of remainders.',
      'Powers of a number repeat their remainders in a cycle. Find the cycle length, reduce the exponent modulo it, and read off the answer.',
      'Negative remainders are a big shortcut: if a leaves remainder −1 (that is, d − 1) then a^n leaves (−1)^n. So 6^odd ÷ 7 leaves 6 and 6^even ÷ 7 leaves 1.',
    ],
    formulas: [
      { label: 'Sum / product rule', expr: 'R(a × b) = R(R(a) × R(b))' },
      { label: 'Fermat (p prime, p ∤ a)', expr: 'a^(p−1) leaves remainder 1 when divided by p' },
      { label: 'Wilson (p prime)', expr: '(p − 1)! leaves remainder p − 1 when divided by p' },
      { label: 'Powers of (d − 1)', expr: '(d − 1)^n ÷ d leaves 1 if n is even, d − 1 if n is odd' },
    ],
    table: {
      columns: ['Base a', 'Powers a¹, a², a³ … leave (mod 7)', 'Cycle length'],
      rows: [
        ['2', '2, 4, 1', '3'],
        ['3', '3, 2, 6, 4, 5, 1', '6'],
        ['4', '4, 2, 1', '3'],
        ['5', '5, 4, 6, 2, 3, 1', '6'],
        ['6', '6, 1', '2'],
      ],
    },
    shortcut: [
      'Reduce the base first (32 ÷ 7 leaves 4), then find the cycle of the small base, then reduce the exponent by the cycle length.',
      'If the exponent is a multiple of the cycle length, the remainder is the LAST entry of the cycle, not the first.',
    ],
    examples: [
      {
        question: 'Find the remainder when 18 × 25 × 33 is divided by 7.',
        steps: ['Remainders: 18 → 4, 25 → 4, 33 → 5.', '4 × 4 × 5 = 80.', '80 ÷ 7 leaves 3.'],
        answer: '3',
      },
      {
        question: 'Find the remainder when 2^40 is divided by 7.',
        steps: ['Powers of 2 mod 7 repeat as 2, 4, 1 with cycle length 3.', '40 ÷ 3 leaves 1, so 2^40 behaves like 2¹.', 'Remainder = 2.'],
        answer: '2',
      },
      {
        question: 'Find the remainder when 32^(32^32) is divided by 7.',
        steps: [
          '32 leaves 4 when divided by 7, so we need 4^E where E = 32^32.',
          'Powers of 4 mod 7 have cycle length 3 (4, 2, 1), so we need E mod 3.',
          '32 leaves 2 mod 3, and 2^32 (even power) leaves 1 mod 3. So E ≡ 1 (mod 3).',
          '4^E behaves like 4¹ = 4.',
        ],
        answer: '4',
      },
    ],
    traps: [
      { trap: 'Reducing the exponent by the divisor (e.g. 2^40 ÷ 7 using 40 mod 7).', fix: 'Reduce the exponent by the CYCLE length (or p − 1 for Fermat), not by the divisor.' },
      { trap: 'Reading remainder 0 in the cycle when exponent mod cycle = 0.', fix: 'An exponent that is an exact multiple of the cycle lands on the last item of the cycle.' },
    ],
    check: {
      question: 'What is the remainder when 6^77 is divided by 7?',
      options: ['1', '2', '5', '6'],
      correctIndex: 3,
      explanation: '6 ≡ −1 (mod 7), so 6^77 ≡ (−1)^77 = −1, which is remainder 6.',
    },
  },
  {
    id: 'unit-digit-last-two-digits',
    title: 'Unit digit & last two digits',
    summary: 'Unit digits repeat every 4 powers or fewer. Last two digits use patterns of 01, 25, 76.',
    minutes: 8,
    keyIdea: [
      'The unit digit of a power depends only on the unit digit of the base and the exponent\'s position in a short cycle. Every digit has cycle length 1, 2 or 4.',
      'Divide the exponent by 4. If the remainder is 0, use the 4th entry of the cycle; otherwise use the entry numbered by the remainder.',
      'For the last two digits, look for a power that ends in 01 (like 7⁴ = 2401, 3²⁰ ends in 01). Break the exponent into multiples of that power, and the rest is a small calculation.',
    ],
    formulas: [
      { label: 'Unit digit of a^n', expr: 'Cycle of last digit of a; use n mod 4 (0 → 4th)' },
      { label: 'Ends in 5, 6, 0 or 1', expr: 'Any power keeps the same unit digit' },
      { label: 'Numbers ending in 01', expr: '(…01)^n ends in 01' },
      { label: 'Ending in 5 or 76 / 24', expr: '(…5)² ends in 25;  76^n ends in 76;  24^odd ends in 24, 24^even ends in 76' },
    ],
    table: {
      columns: ['Last digit', 'Cycle of unit digits', 'Cycle length'],
      rows: [
        ['0, 1, 5, 6', 'Same digit always', '1'],
        ['2', '2, 4, 8, 6', '4'],
        ['3', '3, 9, 7, 1', '4'],
        ['4', '4, 6', '2'],
        ['7', '7, 9, 3, 1', '4'],
        ['8', '8, 4, 2, 6', '4'],
        ['9', '9, 1', '2'],
      ],
    },
    shortcut: [
      'To get the last two digits of 7^n, remember 7⁴ ends in 01, so only n mod 4 matters: 7¹ = 07, 7² = 49, 7³ = 43.',
      'For a product, find the unit digit of each factor separately, multiply the unit digits and keep the last digit.',
    ],
    examples: [
      {
        question: 'Find the unit digit of 7^123.',
        steps: ['The cycle for 7 is 7, 9, 3, 1.', '123 ÷ 4 leaves 3, so take the 3rd entry.', 'Unit digit = 3.'],
        answer: '3',
      },
      {
        question: 'Find the unit digit of 13^57 × 8^22.',
        steps: [
          '13^57 has the unit digit of 3^57. 57 mod 4 = 1, so the digit is 3.',
          '8^22: 22 mod 4 = 2, so the digit is the 2nd of 8, 4, 2, 6 which is 4.',
          'Product of unit digits: 3 × 4 = 12, so the unit digit is 2.',
        ],
        answer: '2',
      },
      {
        question: 'Find the last two digits of 7^102.',
        steps: [
          '7⁴ = 2401, which ends in 01. So 7^100 = (7⁴)^25 ends in 01.',
          '7^102 = 7^100 × 7², so the last two digits are 01 × 49 → 49.',
        ],
        answer: '49',
      },
    ],
    traps: [
      { trap: 'Writing the 0th entry when n is a multiple of 4.', fix: 'When n mod 4 = 0, use the LAST entry of the cycle. For example 3⁴ ends in 1, not 3.' },
      { trap: 'Assuming 4 or 9 have a cycle of 4.', fix: 'Their cycles are only 2 long: look at whether the exponent is odd or even.' },
    ],
    check: {
      question: 'What is the unit digit of 3^45?',
      options: ['1', '3', '7', '9'],
      correctIndex: 1,
      explanation: 'The cycle of 3 is 3, 9, 7, 1. 45 mod 4 = 1, so the first entry applies: 3.',
    },
  },
  {
    id: 'trailing-zeros-factorials',
    title: 'Trailing zeros & factorials',
    summary: 'Count the 5s: zeros come from pairs of 2 and 5.',
    minutes: 7,
    keyIdea: [
      'A trailing zero is one factor of 10 = 2 × 5. In a factorial, 2s are plentiful, so the number of 5s decides the zero count.',
      'To count the 5s in n!, add up how many multiples of 5, of 25, of 125 … fit in n. This is because a multiple of 25 contributes two 5s, and so on.',
      'The same method (Legendre\'s formula) gives the highest power of any prime in n!. For a composite number, find the limit set by each prime and take the smallest.',
    ],
    formulas: [
      { label: 'Zeros in n!', expr: '⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …' },
      { label: 'Highest power of prime p in n!', expr: '⌊n/p⌋ + ⌊n/p²⌋ + ⌊n/p³⌋ + …' },
      { label: 'Zeros in a product', expr: 'min(total 2s, total 5s)' },
      { label: 'Composite m = p^a q^b', expr: 'Power of m in n! = min(⌊E_p / a⌋, ⌊E_q / b⌋)' },
    ],
    table: {
      columns: ['n', 'Trailing zeros in n!'],
      rows: [
        ['5', '1'],
        ['10', '2'],
        ['25', '6'],
        ['50', '12'],
        ['100', '24'],
        ['125', '31'],
      ],
    },
    shortcut: [
      'For a quick count, repeatedly divide by 5 and add the quotients, ignoring remainders: 100 → 20 → 4 → 0, so 20 + 4 = 24.',
      'The zero count jumps by 2 at multiples of 25, so some counts never occur: no factorial ends in exactly 5 zeros.',
    ],
    examples: [
      {
        question: 'How many trailing zeros are in 50!?',
        steps: ['⌊50/5⌋ = 10.', '⌊50/25⌋ = 2.', 'Total = 10 + 2 = 12.'],
        answer: '12',
      },
      {
        question: 'Find the number of trailing zeros in 12 × 15 × 20 × 25 × 40.',
        steps: [
          'Count 5s: 15 gives 1, 20 gives 1, 25 gives 2, 40 gives 1, and 12 gives 0. Total 5s = 5.',
          'Count 2s: 12 gives 2, 20 gives 2, 40 gives 3, the others give 0. Total 2s = 7.',
          'Zeros = min(7, 5) = 5.',
        ],
        answer: '5',
      },
      {
        question: 'What is the highest power of 12 that divides 30!?',
        steps: [
          '12 = 2² × 3.',
          'Power of 2 in 30! = 15 + 7 + 3 + 1 = 26, so ⌊26 / 2⌋ = 13 copies of 2².',
          'Power of 3 in 30! = 10 + 3 + 1 = 14.',
          'Limit = min(13, 14) = 13.',
        ],
        answer: '13',
      },
    ],
    traps: [
      { trap: 'Using only ⌊n/5⌋ and stopping.', fix: 'Keep dividing by 25, 125 … Numbers like 25 and 50 hide extra 5s.' },
      { trap: 'Counting multiples of 10 instead of multiples of 5.', fix: 'Each multiple of 5 brings a 5, and there are always enough 2s to pair with it. 25! has 6 zeros, not 2.' },
    ],
    check: {
      question: 'How many zeros does 100! end with?',
      options: ['20', '22', '24', '25'],
      correctIndex: 2,
      explanation: '100/5 = 20 and 100/25 = 4, so 20 + 4 = 24 trailing zeros.',
    },
  },
  {
    id: 'base-conversion-binary',
    title: 'Base conversion & binary',
    summary: 'Convert between decimal, binary, octal and hexadecimal.',
    minutes: 8,
    keyIdea: [
      'In base b, each digit position is worth a power of b: units, b, b², b³ … Decimal is just base 10, and binary (base 2) uses only the digits 0 and 1.',
      'To convert FROM another base to decimal, multiply each digit by its place value and add. To convert TO another base, divide repeatedly by the base and read the remainders from bottom to top.',
      'Binary, octal and hexadecimal are related: one octal digit = 3 binary digits and one hex digit = 4 binary digits, so these conversions can be done by grouping.',
    ],
    formulas: [
      { label: 'To decimal', expr: '(d₃d₂d₁d₀) in base b = d₃b³ + d₂b² + d₁b + d₀' },
      { label: 'From decimal', expr: 'Divide by b repeatedly; remainders read bottom → top' },
      { label: 'Binary ↔ octal / hex', expr: 'Group bits in 3s (octal) or 4s (hex) from the right' },
      { label: 'Digits in base b', expr: 'Allowed digits are 0 to b − 1 (hex uses A = 10 … F = 15)' },
    ],
    table: {
      columns: ['Decimal', 'Binary', 'Octal', 'Hex'],
      rows: [
        ['5', '101', '5', '5'],
        ['8', '1000', '10', '8'],
        ['10', '1010', '12', 'A'],
        ['15', '1111', '17', 'F'],
        ['16', '10000', '20', '10'],
        ['31', '11111', '37', '1F'],
        ['32', '100000', '40', '20'],
        ['255', '11111111', '377', 'FF'],
      ],
    },
    shortcut: [
      'Memorise powers of 2 up to 2¹⁰ = 1024. Converting binary to decimal then becomes picking the right terms and adding.',
      'To go hex → octal, convert to binary first, regroup in 3s, and read each group as an octal digit.',
    ],
    examples: [
      {
        question: 'Convert 45 to binary.',
        steps: [
          '45 ÷ 2 = 22 r 1;  22 ÷ 2 = 11 r 0;  11 ÷ 2 = 5 r 1;  5 ÷ 2 = 2 r 1;  2 ÷ 2 = 1 r 0;  1 ÷ 2 = 0 r 1.',
          'Read remainders from bottom to top: 101101.',
          'Check: 32 + 8 + 4 + 1 = 45.',
        ],
        answer: '101101',
      },
      {
        question: 'Convert (1101011) in binary to decimal.',
        steps: ['Place values from the left: 64, 32, 16, 8, 4, 2, 1.', 'Bits 1,1,0,1,0,1,1 pick 64 + 32 + 8 + 2 + 1.', 'Sum = 107.'],
        answer: '107',
      },
      {
        question: 'Convert (2A7) in hexadecimal to octal.',
        steps: [
          'Hex to binary: 2 = 0010, A = 1010, 7 = 0111, giving 001010100111.',
          'Regroup in 3s from the right: 001 010 100 111.',
          'Read as octal digits: 1, 2, 4, 7 → 1247.',
        ],
        answer: '1247',
      },
    ],
    traps: [
      { trap: 'Reading the remainders from top to bottom.', fix: 'The FIRST remainder is the lowest digit. Always read from the last remainder up.' },
      { trap: 'Using a digit that is not allowed in the base, such as 8 in an octal number.', fix: 'Base b allows only digits 0 to b − 1. Check the digits before converting.' },
    ],
    check: {
      question: 'What is the decimal value of the binary number 110101?',
      options: ['51', '53', '55', '57'],
      correctIndex: 1,
      explanation: '110101 = 32 + 16 + 4 + 1 = 53.',
    },
  },
  {
    id: 'prime-numbers',
    title: 'Prime numbers',
    summary: 'Test primality up to the square root and know the primes under 100.',
    minutes: 7,
    keyIdea: [
      'A prime has exactly two factors, 1 and itself. To test whether N is prime, try dividing only by primes up to √N. If none divide it, N is prime.',
      'Every prime above 3 has the form 6k − 1 or 6k + 1. The converse is false: 25 and 35 have that form but are composite, so it only narrows down candidates.',
      'Many questions rest on parity. The sum of two primes is odd only if one of them is 2, since every other prime is odd.',
    ],
    formulas: [
      { label: 'Primality test', expr: 'Check primes p ≤ √N' },
      { label: 'Prime form', expr: 'p > 3 ⇒ p = 6k ± 1' },
      { label: 'Count of primes', expr: '25 primes below 100, 168 below 1000' },
      { label: 'Twin primes', expr: 'Pairs (p, p + 2) such as (11, 13), (17, 19), (29, 31)' },
    ],
    table: {
      columns: ['Range', 'Primes', 'Count'],
      rows: [
        ['1 – 20', '2, 3, 5, 7, 11, 13, 17, 19', '8'],
        ['21 – 40', '23, 29, 31, 37', '4'],
        ['41 – 60', '41, 43, 47, 53, 59', '5'],
        ['61 – 80', '61, 67, 71, 73, 79', '5'],
        ['81 – 100', '83, 89, 97', '3'],
      ],
    },
    shortcut: [
      'To test up to 400 you only need the primes 2, 3, 5, 7, 11, 13, 17, 19. Apply the quick rules for 2, 3, 5, 11 first.',
      'The only prime triplet of consecutive odd numbers is 3, 5, 7. Any other triple includes a multiple of 3.',
    ],
    examples: [
      {
        question: 'Is 391 a prime number?',
        steps: ['√391 is just under 20, so test primes up to 19.', '2, 3, 5, 7, 11, 13 do not divide 391, but 391 ÷ 17 = 23.', '391 = 17 × 23, so it is composite.'],
        answer: 'No, 391 = 17 × 23',
      },
      {
        question: 'How many primes lie between 50 and 80?',
        steps: ['List the odd numbers not divisible by 3, 5 or 7.', 'The primes are 53, 59, 61, 67, 71, 73, 79.', 'Count = 7.'],
        answer: '7',
      },
      {
        question: 'The sum of two primes is 49. Find their product.',
        steps: [
          '49 is odd, so one prime must be even, i.e. 2.',
          'The other prime = 49 − 2 = 47, which is prime.',
          'Product = 2 × 47 = 94.',
        ],
        answer: '94',
      },
    ],
    traps: [
      { trap: 'Believing every odd number is prime, or that 1 is prime.', fix: '9, 15, 21, 91 are odd composites; 1 is not prime.' },
      { trap: 'Stopping the primality test at 10 or 11 because 7 × 7 looks like the limit.', fix: 'Go up to the largest prime not exceeding √N. For 391 that means 19, and 17 is the factor.' },
    ],
    check: {
      question: 'Which of the following is a prime number?',
      options: ['91', '119', '143', '149'],
      correctIndex: 3,
      explanation: '91 = 7 × 13, 119 = 7 × 17 and 143 = 11 × 13. No prime up to 12 divides 149, so it is prime.',
    },
  },
  {
    id: 'recurring-decimals-rational-numbers',
    title: 'Recurring decimals & rational numbers',
    summary: 'Convert repeating decimals to fractions and know when a fraction terminates.',
    minutes: 8,
    keyIdea: [
      'A fraction in lowest terms gives a terminating decimal only if its denominator has no prime factor except 2 and 5. Otherwise the decimal repeats forever.',
      'For a purely recurring decimal, put the repeating block over as many 9s as the block has digits. For a mixed one, subtract the non-repeating part and put zeros after the 9s for each non-repeating digit.',
      'The number of decimal places in a terminating fraction is the larger of the powers of 2 and 5 in the denominator.',
    ],
    formulas: [
      { label: 'Pure recurring', expr: '0.ababab… = ab / 99    (one repeating digit: /9, three: /999)' },
      { label: 'Mixed (one + two digits)', expr: '0.abcbcbc… = (abc − a) / 990' },
      { label: 'General mixed', expr: '(all digits − non-repeating digits) / (9s for repeat, 0s for non-repeat)' },
      { label: 'Decimal places', expr: 'For p/(2^m × 5^n), places = max(m, n)' },
    ],
    table: {
      columns: ['Fraction', 'Decimal', 'Repeating block length'],
      rows: [
        ['1/3', '0.333…', '1'],
        ['1/6', '0.1666…', '1'],
        ['1/7', '0.142857 142857…', '6'],
        ['1/9', '0.111…', '1'],
        ['1/11', '0.0909…', '2'],
        ['1/13', '0.076923 076923…', '6'],
      ],
    },
    shortcut: [
      'Reduce the fraction BEFORE judging the denominator: 21/35 = 3/5 terminates even though 35 contains 7.',
      'Memorise 1/7 = 0.142857 and 1/11 = 0.09. Multiples such as 3/7 reuse the same cycle, just started at a different digit.',
    ],
    examples: [
      {
        question: 'Express 0.363636… as a fraction.',
        steps: ['The repeating block "36" has 2 digits, so divide by 99.', '36/99 = 4/11 after dividing top and bottom by 9.'],
        answer: '4/11',
      },
      {
        question: 'How many digits come after the decimal point in 3/80?',
        steps: ['80 = 2⁴ × 5, only 2s and 5s, so the decimal terminates.', 'Places = max(4, 1) = 4.', 'Check: 3/80 = 0.0375.'],
        answer: '4 digits',
      },
      {
        question: 'Express 1.2181818… (the block 18 repeating) as a fraction.',
        steps: [
          'Fractional part 0.2181818…: non-repeating digit is 2, repeating block is 18.',
          'Numerator = 218 − 2 = 216, denominator = 990, so 216/990 = 12/55.',
          'Add the whole part: 1 + 12/55 = 67/55.',
        ],
        answer: '67/55',
      },
    ],
    traps: [
      { trap: 'Judging termination from the unreduced denominator.', fix: 'Cancel common factors first, then look at the denominator\'s prime factors.' },
      { trap: 'Using 99 or 9 for a mixed decimal like 0.1666…', fix: 'Non-repeating digits add zeros to the denominator: 0.1666… = (16 − 1)/90 = 1/6.' },
    ],
    check: {
      question: 'Which of these fractions has a terminating decimal?',
      options: ['7/12', '5/14', '9/40', '4/15'],
      correctIndex: 2,
      explanation: '40 = 2³ × 5, so 9/40 = 0.225 terminates. 12, 14 and 15 contain the prime 3 or 7, and none of those fractions cancel it away.',
    },
  },
  {
    id: 'sum-of-series-natural-squares-cubes',
    title: 'Sum of series (natural, squares, cubes)',
    summary: 'Closed forms for 1 + 2 + … + n, the sum of squares and the sum of cubes.',
    minutes: 7,
    keyIdea: [
      'Three sums appear again and again: the first n natural numbers, their squares and their cubes. Each has a closed formula so you never add term by term.',
      'The sum of cubes is the square of the sum of natural numbers: 1³ + 2³ + … + n³ = (1 + 2 + … + n)².',
      'To add a block that does not start at 1, find the sum up to the last term and subtract the sum up to the term before the block starts.',
    ],
    formulas: [
      { label: 'Natural numbers', expr: 'Σn = n(n + 1) / 2' },
      { label: 'Squares', expr: 'Σn² = n(n + 1)(2n + 1) / 6' },
      { label: 'Cubes', expr: 'Σn³ = [n(n + 1) / 2]²' },
      { label: 'First n odd / even numbers', expr: 'Odd: n²    Even: n(n + 1)' },
    ],
    table: {
      columns: ['n', 'Σn', 'Σn²', 'Σn³'],
      rows: [
        ['5', '15', '55', '225'],
        ['10', '55', '385', '3025'],
        ['12', '78', '650', '6084'],
        ['15', '120', '1240', '14400'],
        ['20', '210', '2870', '44100'],
        ['25', '325', '5525', '105625'],
      ],
    },
    shortcut: [
      'For an AP, sum = number of terms × average of the first and last term. The count of terms = (last − first) / difference + 1.',
      'If a series is Σ(n² + n), split it: Σn² + Σn. Algebra first, formulas second.',
    ],
    examples: [
      {
        question: 'Find 1 + 2 + 3 + … + 60.',
        steps: ['Use n(n + 1)/2 with n = 60.', '60 × 61 / 2 = 1830.'],
        answer: '1830',
      },
      {
        question: 'Find 1² + 2² + … + 12².',
        steps: ['Use n(n + 1)(2n + 1)/6 with n = 12.', '12 × 13 × 25 / 6 = 3900 / 6 = 650.'],
        answer: '650',
      },
      {
        question: 'Find 11³ + 12³ + … + 20³.',
        steps: [
          'Sum up to 20: (20 × 21 / 2)² = 210² = 44,100.',
          'Sum up to 10: (10 × 11 / 2)² = 55² = 3,025.',
          'Difference = 44,100 − 3,025 = 41,075.',
        ],
        answer: '41,075',
      },
    ],
    traps: [
      { trap: 'Applying the formula to a range that starts above 1 as if it started at 1.', fix: 'Subtract the sum up to (first term − 1), as in 11³ to 20³ = S(20) − S(10).' },
      { trap: 'Mixing up the squares formula with the cubes formula.', fix: 'Squares have a 6 in the denominator and (2n + 1); cubes are the square of n(n + 1)/2.' },
    ],
    check: {
      question: 'What is the sum of all even numbers from 2 to 50?',
      options: ['625', '650', '675', '1275'],
      correctIndex: 1,
      explanation: 'There are 25 even numbers, and the sum of the first n even numbers is n(n + 1) = 25 × 26 = 650. (625 is the sum of the odd numbers, 1275 is 1 to 50.)',
    },
  },
  {
    id: 'digit-missing-digit-problems',
    title: 'Digit & missing-digit problems',
    summary: 'Find unknown digits from divisibility, and count how often a digit appears.',
    minutes: 8,
    keyIdea: [
      'A missing digit is pinned down by a divisibility rule. Write the number with a letter for the unknown digit, apply the rule (digit sum for 3 and 9, alternating sum for 11, last digits for 4, 5, 8) and solve.',
      'A two-digit number with tens digit a and units digit b equals 10a + b. Reversing it gives 10b + a, so the sum is 11(a + b) and the difference is 9(a − b).',
      'To count how often a digit appears in a range, count each place separately: units, tens, hundreds, and add.',
    ],
    formulas: [
      { label: 'Two-digit number', expr: '10a + b;  reversed = 10b + a' },
      { label: 'Number + reverse / number − reverse', expr: '11(a + b)  /  9(a − b)' },
      { label: 'Count of n-digit numbers', expr: '9 × 10^(n − 1)' },
      { label: 'Appearances of a digit in 1–99', expr: '20 for each digit 1–9 (10 as units, 10 as tens)' },
    ],
    shortcut: [
      'For a missing digit and 9 or 3, find the digit sum you have, then the smallest digit that reaches the next multiple of 9 or 3.',
      'When counting a digit up to 100, 200, 300 …, the units and tens places each contribute 10 per hundred. Handle the hundreds place separately.',
    ],
    examples: [
      {
        question: 'Find the digit x so that 4x735 is divisible by 9.',
        steps: ['Digit sum = 4 + x + 7 + 3 + 5 = 19 + x.', 'The next multiple of 9 above 19 is 27, so x = 8.', 'Check: 48,735 ÷ 9 = 5415.'],
        answer: 'x = 8',
      },
      {
        question: 'A two-digit number has digit sum 11 and exceeds its reverse by 27. Find it.',
        steps: [
          'Difference = 9(a − b) = 27, so a − b = 3.',
          'Also a + b = 11. Adding: 2a = 14, a = 7, so b = 4.',
          'The number is 74. Check: 74 − 47 = 27.',
        ],
        answer: '74',
      },
      {
        question: 'How many times does the digit 7 appear in the numbers from 1 to 200?',
        steps: [
          'Units place: 7, 17, 27 … 197 gives 20 numbers.',
          'Tens place: 70 to 79 and 170 to 179 gives 10 + 10 = 20.',
          'No number up to 200 has 7 in the hundreds place. Total = 20 + 20 = 40.',
        ],
        answer: '40',
      },
    ],
    traps: [
      { trap: 'Using the digit-sum rule for 11 or the alternating rule for 9.', fix: '3 and 9 use the plain digit sum. 11 uses the alternating (odd-place minus even-place) sum.' },
      { trap: 'Missing the extra appearances in numbers like 77 where the digit appears twice.', fix: 'Count by place, not by number. 77 contributes once to the units count and once to the tens count.' },
    ],
    check: {
      question: 'Which digit x makes the number 25x3 divisible by 11?',
      options: ['4', '5', '6', '7'],
      correctIndex: 2,
      explanation: 'Places from the right: 3 and 5 sum to 8, and x and 2 sum to x + 2. For divisibility, 8 − (x + 2) = 0, so x = 6. Check: 2563 = 11 × 233.',
    },
  },
];
