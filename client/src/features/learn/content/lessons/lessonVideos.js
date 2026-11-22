// Curated YouTube explainers for lessons, keyed by lesson id (the lesson id is the sub-pattern slug).
// Only the public video id is stored; the player builds the embed and watch links from it.
// Every video is English-language. Picks favour established English-language channels; YouTube view counts could not be checked
// when these were chosen, so re-rank by views here if needed.

export const LESSON_VIDEOS = {
  'types-of-numbers-classification': { id: 'aDC7uaB0hj0', title: 'Types of numbers: natural, whole, integers, rational and irrational' },
  'divisibility-rules': { id: '98p4lQBfc6E', title: 'Divisibility rules for 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 and 13' },
  'factors-number-of-factors': { id: 'r637OcBHeOU', title: 'Number of factors of a composite number' },
  'remainder-theorems-cyclicity': { id: 'mt-W-Gg-hPo', title: 'Finding remainders: totient method and cyclicity' },
  'unit-digit-last-two-digits': { id: 'u1Am0u97VhI', title: 'How to find the unit digit and last two digits' },
  'trailing-zeros-factorials': { id: 'zpvDctj8mM4', title: 'Number of trailing zeros in a factorial' },
  'base-conversion-binary': { id: 'M6c6Xw5mt90', title: 'Convert decimal to binary, octal and hexadecimal' },
  'prime-numbers': { id: '5liC14kBrQ4', title: 'Prime and composite numbers and how to test a larger number' },
  'recurring-decimals-rational-numbers': { id: 'RLCh8WYsJN0', title: 'Convert recurring decimals into fractions' },
  'sum-of-series-natural-squares-cubes': { id: 'D7o6oHP8vss', title: 'Sum of the first n natural numbers, squares and cubes' },
  'digit-missing-digit-problems': { id: 'uXCcQ55dPEs', title: 'Find the missing digit using divisibility rules' },

  // Percentages
  'basic-percentage-conversions': { id: 'RWdNhJWwzSs', title: 'Percentage: shortcuts and tricks for placement tests' },
  'successive-percentage-change': { id: '1nL96x6OC-w', title: 'Successive percentage and its applications' },
  'population-growth-decrease': { id: 'RG4DYfA2QiA', title: 'Percent increase and decrease, population growth problems' },
  'price-consumption-relation': { id: 'H8yxwCxkuBQ', title: 'Percentage change in consumption when the price changes' },
  'election-votes': { id: 'mlp1cAiHoJY', title: 'Solved aptitude problem: election vote majority' },
  'exam-marks-pass-percentage': { id: 'TfjlZ2WnfhA', title: 'Percentage questions in aptitude tests: exam marks' },
  'fraction-percentage-equivalents': { id: 'XTri2ZTH_HA', title: 'Equivalent fractions, decimals and percentages' },
  'income-expenditure-savings': { id: 'pZgz3zTS_zI', title: 'Percentage: expenses and savings solved example' },
  'percentage-comparison-a-more-than-b': { id: 'Y_9XXdLw67Q', title: 'If A is 10% more than B, how much less is B than A?' },
  // Permutations and combinations
  'fundamental-counting-principle': { id: 'XJnIdRXUi7A', title: 'Permutations and combinations tutorial' },
  permutations: { id: '1stIqr0FGiE', title: 'Permutations: counting principle and factorials' },
  combinations: { id: '0NfiEaE4LlU', title: 'Combinations: using the nCr equation' },
  'circular-permutations': { id: 'TgJMVLSjpOc', title: 'Permutations in a circle' },
  'word-arrangements-with-repetition': { id: 'qAj8MTIZZ3Y', title: 'Permutations with repeated symbols' },
  'committee-selection': { id: 'RpudCeY0aBg', title: 'How many ways to select a committee' },
  'number-formation-from-digits': { id: 'rSSTtWJ1iDo', title: 'How many 3-digit numbers can be formed from given digits' },
  'distribution-stars-bars': { id: 'TLJ7JbqP5XA', title: 'Stars and bars' },
  'handshakes-diagonals-geometry-counting': { id: 'q-8-WR22wws', title: 'Combination problems: handshakes, collinear points and diagonals' },
  'derangements-restrictions': { id: 'LCKMZCtwNI4', title: 'Derangements and the subfactorial' },
  // Number series
  'arithmetic-geometric-series': { id: 'r614AD021n0', title: 'Number series reasoning tricks' },
  'difference-of-differences': { id: '5NY6CpB2Mog', title: 'Quadratic sequences: the difference method' },
  'squares-cubes-primes': { id: '04kytaxzjic', title: 'Prime, square, cube and triangular numbers' },
  'alternating-two-pattern-series': { id: 'aFmqIEBFJyQ', title: 'Number patterns: alternating patterns' },
  'wrong-number-in-series': { id: 'XSsU5IbHvwM', title: 'How to find the next, missing or incorrect term in a series' },
  'missing-number': { id: 'XSsU5IbHvwM', title: 'How to find the next, missing or incorrect term in a series' },
  'number-pairs-analogies': { id: '4zyeJzttDOc', title: 'Number analogy' },
  // Blood relations
  'direct-relations': { id: 'LRdLhfDupMU', title: 'Blood relations: tricks and shortcuts for placement tests' },
  'coded-relations': { id: 'lAZQrnS9Mgo', title: 'Coded blood relation reasoning tricks' },
  'family-tree-puzzles': { id: 'iKtii74tTDU', title: 'Cracking blood relation questions' },
  'pointing-to-photo-problems': { id: 'ASevN8jZf5A', title: 'Blood relations: pointing to a photograph' },
  'generation-chain': { id: 'sYTKthZ7_J4', title: 'Logical reasoning: blood relation questions' },
  // Coding and decoding
  'letter-coding': { id: '2G3Tochj5q0', title: 'Coding and decoding: alphabet coding' },
  'number-coding': { id: '4Sj32yO0Pcs', title: 'Verbal reasoning: number codes' },
  'symbol-coding': { id: 'YmKyyQo5DQs', title: 'Coding and decoding with numbers and symbols' },
  'fictitious-language-coding': { id: 'LqLtN9B8xyU', title: 'Easy tricks to solve fictitious language coding' },
  'mixed-substitution-coding': { id: 'hSbSYkX967c', title: 'Letter, substitution and mixed coding' },
  'conditional-coding': { id: 'uCcEh0fqzhE', title: 'Conditional coding: solved problems' },
  // Seating arrangement
  'linear-arrangement': { id: 'BQ6DXxSZNl8', title: 'Linear seating arrangement basics' },
  'circular-arrangement-facing-in': { id: 'zVNoI14cgKU', title: 'Circular seating arrangement reasoning tricks' },
  'circular-arrangement-mixed-facing': { id: '0Ans5yXCkCc', title: 'Circular seating arrangement: different directions (inside and outside)' },
  'square-rectangular-table': { id: 'RjNe75pSXe4', title: 'Seating arrangement: rectangular based' },
  'multi-variable-arrangement': { id: 'YRT6C_ay1BA', title: 'How to solve arrangement puzzles' },
  // Syllogisms
  'all-some-no-statements': { id: 'TVtQcTjf8ac', title: 'Solving syllogism problems with Venn diagrams' },
  'possibility-cases': { id: 'A55EGABGHyg', title: 'Syllogism possibility cases: the 100-50 method' },
  'either-or-conclusions': { id: 'y7zinv0lqZY', title: 'Syllogism: either/or cases' },
  'three-statement-syllogisms': { id: 'VxKDNG3K_zU', title: 'Syllogism: three statements and four conclusions' },
  'reverse-syllogism': { id: 'Og0Sucg-yEA', title: 'Reverse syllogism' },
};

export const getVideoForLesson = (lessonId) => LESSON_VIDEOS[lessonId];
