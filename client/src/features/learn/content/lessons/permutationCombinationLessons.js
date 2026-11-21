// Learn content for the Permutation and Combination pattern — one lesson per sub-pattern.
// Lesson `id` === the sub-pattern slug used by the question bank, so a lesson
// can deep-link straight into Practice for exactly that topic.
// Shape is documented in percentagesLessons.js.

export const permutationCombinationLessons = [
  {
    id: 'fundamental-counting-principle',
    title: 'Fundamental counting principle',
    summary: 'Multiply the choices at each stage; add them when the cases are alternatives.',
    minutes: 6,
    keyIdea: [
      'If a job is done in stages and stage 1 can happen in m ways and stage 2 in n ways, the whole job can happen in m × n ways. The word to listen for is "and": one choice AND the next choice.',
      'If you can do the job in one way OR a completely different way, you add the counts instead. Most counting questions are just a careful mix of multiplying and adding.',
    ],
    formulas: [
      { label: 'Multiplication rule (AND)', expr: 'm × n × p × …' },
      { label: 'Addition rule (OR, no overlap)', expr: 'm + n' },
      { label: 'Repetition allowed, n slots, k options', expr: 'kⁿ' },
      { label: 'No repetition, n slots from k options', expr: 'k × (k−1) × (k−2) × …' },
    ],
    shortcut: [
      'Draw one box per position, write the number of options above each box, then multiply. Fill the most restricted box first.',
      'Whenever a question says "at least one" or "not", try counting the total and subtracting the unwanted cases.',
    ],
    examples: [
      {
        question: 'A candidate has 4 shirts and 3 trousers. In how many ways can one shirt and one trouser be chosen?',
        steps: ['Shirt: 4 choices. Trouser: 3 choices.', 'Both are needed, so multiply: 4 × 3 = 12.'],
        answer: '12',
      },
      {
        question: 'A password has one capital letter (A–Z) followed by 3 digits (0–9). Digits can repeat. How many passwords are possible?',
        steps: ['Letter: 26 ways. Each digit: 10 ways.', '26 × 10 × 10 × 10 = 26,000.'],
        answer: '26,000',
      },
      {
        question:
          'Town A and town B are joined by 4 roads, and B and C by 3 roads. A person travels A → B → C → B → A and uses no road twice. In how many ways can the trip be made?',
        steps: [
          'A → B: 4 roads. B → C: 3 roads.',
          'On the way back C → B, one B–C road is used already: 3 − 1 = 2 roads left.',
          'B → A: one A–B road is used already: 4 − 1 = 3 roads left.',
          'Multiply: 4 × 3 × 2 × 3 = 72.',
        ],
        answer: '72',
      },
    ],
    traps: [
      { trap: 'Adding when the stages happen together (4 + 3 = 7 for shirt and trouser).', fix: 'If you need a choice from each group, multiply. Add only when you pick from one group or the other.' },
      { trap: 'Forgetting that a used option disappears when repetition is not allowed.', fix: 'Reduce the count by one at every later position, e.g. 5 × 4 × 3 instead of 5 × 5 × 5.' },
    ],
    check: {
      question: 'How many 3-digit numbers can be formed using only the odd digits (1, 3, 5, 7, 9) if digits may repeat?',
      options: ['60', '100', '125', '150'],
      correctIndex: 2,
      explanation: 'Each of the 3 places has 5 choices, so 5 × 5 × 5 = 125.',
    },
  },
  {
    id: 'permutations',
    title: 'Permutations',
    summary: 'Arrangements where order matters.',
    minutes: 7,
    keyIdea: [
      'A permutation is an arrangement. "ABC" and "CBA" count as different, so order matters. Think of seats, ranks, positions, or codes.',
      'Picking r items in order from n gives nPr. It is only the multiplication rule written compactly: n × (n−1) × … for r places.',
      'For "together" and "not together" questions, glue the items into one block, arrange the block, then arrange inside it.',
    ],
    formulas: [
      { label: 'Arrange r of n', expr: 'ⁿPᵣ = n! / (n − r)!' },
      { label: 'Arrange all n', expr: 'n!' },
      { label: 'Two items always together', expr: '(n − 1)! × 2!' },
      { label: 'Not together', expr: 'Total − Together' },
    ],
    table: {
      columns: ['n', 'n!', 'n', 'n!'],
      rows: [
        ['3', '6', '6', '720'],
        ['4', '24', '7', '5040'],
        ['5', '120', '8', '40320'],
      ],
    },
    shortcut: [
      'nPr is just r factors counting down from n: 8P3 = 8 × 7 × 6 = 336. No need for full factorials.',
      '"Not together" is almost always quicker as Total − Together than as a direct count.',
    ],
    examples: [
      {
        question: 'In how many ways can a president and a secretary be chosen from 5 people?',
        steps: ['The two posts are different, so order matters.', '5P2 = 5 × 4 = 20.'],
        answer: '20',
      },
      {
        question: 'Six friends sit in a row. In how many ways can they sit if A and B must sit together?',
        steps: ['Glue A and B into one block: now 5 units to arrange = 5! = 120.', 'A and B can swap inside the block: × 2.', '120 × 2 = 240.'],
        answer: '240',
      },
      {
        question: 'Seven people stand in a queue. In how many ways can they stand if A and B are NOT together?',
        steps: ['Total = 7! = 5040.', 'Together = 6! × 2 = 1440.', 'Not together = 5040 − 1440 = 3600.'],
        answer: '3600',
      },
    ],
    traps: [
      { trap: 'Forgetting the internal swap of the glued block (answering 5! instead of 5! × 2).', fix: 'After gluing, always multiply by the number of ways to arrange inside the block.' },
      { trap: 'Using permutations when the order does not matter.', fix: 'Ask: does swapping two chosen items give a new outcome? If not, it is a combination.' },
    ],
    check: {
      question: 'How many 3-letter arrangements can be made from 8 different letters (no repetition)?',
      options: ['56', '336', '512', '24'],
      correctIndex: 1,
      explanation: '8P3 = 8 × 7 × 6 = 336.',
    },
  },
  {
    id: 'combinations',
    title: 'Combinations',
    summary: 'Selections where order does not matter.',
    minutes: 7,
    keyIdea: [
      'A combination is a selection: you only care WHICH items are chosen, not the order. A team of {A, B, C} is the same team however you list it.',
      'Take the permutations nPr and divide by r! to remove the repeated orderings. That gives nCr.',
      'Choosing r items to take is the same as choosing n − r items to leave, so nCr = nC(n−r).',
    ],
    formulas: [
      { label: 'Choose r from n', expr: 'ⁿCᵣ = n! / (r! × (n − r)!)' },
      { label: 'Symmetry', expr: 'ⁿCᵣ = ⁿC₍ₙ₋ᵣ₎' },
      { label: 'Special values', expr: 'ⁿC₀ = ⁿCₙ = 1,  ⁿC₁ = n' },
      { label: 'Independent groups', expr: 'ⁿCᵣ × ᵐCₛ' },
    ],
    shortcut: [
      'Always use the smaller of r and n − r: 12C10 = 12C2 = 66.',
      'Compute nCr as r factors down from n, divided by r!: 10C3 = (10 × 9 × 8)/(3 × 2 × 1) = 120.',
    ],
    examples: [
      {
        question: 'In how many ways can 3 students be chosen from 10 for a quiz team?',
        steps: ['Order does not matter, so use 10C3.', '(10 × 9 × 8) / (3 × 2 × 1) = 720 / 6 = 120.'],
        answer: '120',
      },
      {
        question: 'A group has 5 men and 4 women. In how many ways can 3 men and 2 women be selected?',
        steps: ['Men: 5C3 = 10.', 'Women: 4C2 = 6.', 'Both selections happen, so multiply: 10 × 6 = 60.'],
        answer: '60',
      },
      {
        question: 'A team of 5 is chosen from 10 players such that player A is always in and player B is always out. How many teams?',
        steps: ['Fix A in and B out. 4 places remain to fill.', 'The pool left is 10 − 2 = 8 players.', '8C4 = (8 × 7 × 6 × 5)/(4 × 3 × 2 × 1) = 70.'],
        answer: '70',
      },
    ],
    traps: [
      { trap: 'Using nPr for a selection (counting ABC and CBA as different teams).', fix: 'If the problem only asks "choose" or "select", divide by r!.' },
      { trap: 'Adding two independent selections (5C3 + 4C2) instead of multiplying.', fix: 'Choosing from group 1 AND group 2 means multiply.' },
    ],
    check: {
      question: 'What is the value of 12C10?',
      options: ['12', '66', '132', '220'],
      correctIndex: 1,
      explanation: '12C10 = 12C2 = (12 × 11)/2 = 66.',
    },
  },
  {
    id: 'circular-permutations',
    title: 'Circular permutations',
    summary: 'Seating people around a round table.',
    minutes: 7,
    keyIdea: [
      'Around a circle there is no fixed starting point: rotating everyone by one seat gives the same arrangement. So we fix one person and arrange the rest relative to them.',
      'For n different people that gives (n − 1)! arrangements, not n!.',
      'Conditions such as "two together" or "men and women alternate" are handled by fixing one group first, then placing the other.',
    ],
    formulas: [
      { label: 'n people round a table', expr: '(n − 1)!' },
      { label: 'Two particular people together', expr: '2 × (n − 2)!' },
      { label: 'Necklace / garland (can be flipped)', expr: '(n − 1)! / 2' },
      { label: 'Alternate, m men and m women', expr: '(m − 1)! × m!' },
    ],
    shortcut: [
      'Fix one person, then treat the remaining seats as a straight line.',
      'For alternating seating, seat one group first (with one fixed), then the other group has exactly m gaps.',
    ],
    examples: [
      {
        question: 'In how many ways can 6 people sit around a round table?',
        steps: ['Circular arrangement of 6: (6 − 1)! = 5!.', '5! = 120.'],
        answer: '120',
      },
      {
        question: 'Eight people sit around a round table. In how many ways can they sit if two particular people must be adjacent?',
        steps: ['Glue the pair into one unit: 7 units in a circle = 6! = 720.', 'The pair can swap places: × 2.', '720 × 2 = 1440.'],
        answer: '1440',
      },
      {
        question: 'In how many ways can 5 men and 5 women sit around a round table so that no two men are adjacent?',
        steps: [
          'Seat the 5 men first around the table: (5 − 1)! = 24.',
          'This creates 5 gaps between them, one for each woman.',
          'Women can fill the 5 gaps in 5! = 120 ways.',
          '24 × 120 = 2880.',
        ],
        answer: '2880',
      },
    ],
    traps: [
      { trap: 'Using n! for a round table.', fix: 'Rotations are identical. Use (n − 1)!, or fix one person and arrange the rest.' },
      { trap: 'Dividing by 2 for every circle.', fix: 'Divide by 2 only for necklaces or garlands that can be turned over. People at a table cannot be flipped.' },
    ],
    check: {
      question: 'In how many ways can 7 people be seated around a circular table?',
      options: ['5040', '720', '360', '2520'],
      correctIndex: 1,
      explanation: '(7 − 1)! = 6! = 720.',
    },
  },
  {
    id: 'word-arrangements-with-repetition',
    title: 'Word arrangements (with repetition)',
    summary: 'Arranging letters when some are identical.',
    minutes: 7,
    keyIdea: [
      'If all letters are different, n letters give n! words. But swapping two identical letters changes nothing, so those extra orderings must be removed.',
      'Divide n! by the factorial of the count of each repeated letter. Two Ts mean divide by 2!, three Ss mean divide by 3!.',
      'For "same letters not together", count all arrangements, then subtract the ones where they are glued into one block.',
    ],
    formulas: [
      { label: 'n letters, repeats p, q, r', expr: 'n! / (p! × q! × r!)' },
      { label: 'All letters different', expr: 'n!' },
      { label: 'Two same letters together', expr: 'Glue them: (n − 1)! / (other repeats)' },
      { label: 'Not together', expr: 'Total − Together' },
    ],
    shortcut: [
      'Write the letter counts first (e.g. B1 A3 N2), then put them under n! as divisors.',
      'In a "vowels together" question, treat the vowel block as one letter and remember to arrange inside it too.',
    ],
    examples: [
      {
        question: 'How many different arrangements of the letters of the word LEVEL are possible?',
        steps: ['5 letters: L appears 2 times, E appears 2 times, V once.', '5! / (2! × 2!) = 120 / 4 = 30.'],
        answer: '30',
      },
      {
        question: 'How many different words can be formed from the letters of BANANA?',
        steps: ['6 letters: B once, A three times, N twice.', '6! / (3! × 2!) = 720 / 12 = 60.'],
        answer: '60',
      },
      {
        question: 'In how many arrangements of the letters of LETTER do the two T\'s NOT come together?',
        steps: [
          'Total: 6 letters with E twice and T twice = 6! / (2! × 2!) = 180.',
          'Glue the two Ts: 5 units with E twice = 5! / 2! = 60.',
          'Not together = 180 − 60 = 120.',
        ],
        answer: '120',
      },
    ],
    traps: [
      { trap: 'Using n! without dividing for the repeated letters.', fix: 'Scan the word for repeats before touching any factorial.' },
      { trap: 'Dividing only for one repeated letter and missing another.', fix: 'List every letter with its count. LEVEL has two repeats (L and E), not one.' },
    ],
    check: {
      question: 'How many distinct arrangements are there of the letters in SUCCESS?',
      options: ['5040', '840', '420', '210'],
      correctIndex: 2,
      explanation: 'S three times, C twice, U and E once: 7! / (3! × 2!) = 5040 / 12 = 420.',
    },
  },
  {
    id: 'committee-selection',
    title: 'Committee selection',
    summary: 'Selecting teams with gender, inclusion and "at least" conditions.',
    minutes: 8,
    keyIdea: [
      'A committee is a selection, so use combinations. Split the people into groups (men / women, seniors / juniors) and choose from each group separately.',
      '"Exactly" conditions multiply the group selections. "At least" conditions are handled by adding the valid cases, or by Total − the forbidden case.',
      'If a person must be included, put them in and choose the rest from the remaining pool. If they must be excluded, remove them from the pool.',
    ],
    formulas: [
      { label: 'Exactly a from group 1, b from group 2', expr: 'ⁿCₐ × ᵐC_b' },
      { label: 'At least one from group', expr: 'Total − (none from group)' },
      { label: 'Specific person always in', expr: '⁽ⁿ⁻¹⁾C₍ᵣ₋₁₎' },
      { label: 'Specific person always out', expr: '⁽ⁿ⁻¹⁾Cᵣ' },
    ],
    shortcut: [
      'For "at least one", the complement is quicker: Total − all-from-the-other-group.',
      'For "at least 3 women" in a 5-member committee, list only 3 cases (3W, 4W, 5W) and add them.',
    ],
    examples: [
      {
        question: 'A committee of 3 men and 2 women is chosen from 7 men and 5 women. In how many ways?',
        steps: ['Men: 7C3 = 35.', 'Women: 5C2 = 10.', '35 × 10 = 350.'],
        answer: '350',
      },
      {
        question: 'A committee of 4 is chosen from 6 men and 4 women with at least one woman. How many ways?',
        steps: ['Total without restriction: 10C4 = 210.', 'No women (all men): 6C4 = 15.', 'At least one woman = 210 − 15 = 195.'],
        answer: '195',
      },
      {
        question: 'A committee of 5 is chosen from 6 men and 5 women with at least 3 women. How many ways?',
        steps: [
          '3 women + 2 men: 5C3 × 6C2 = 10 × 15 = 150.',
          '4 women + 1 man: 5C4 × 6C1 = 5 × 6 = 30.',
          '5 women + 0 men: 5C5 × 6C0 = 1.',
          'Add the cases: 150 + 30 + 1 = 181.',
        ],
        answer: '181',
      },
    ],
    traps: [
      { trap: 'Treating "at least one" as "exactly one".', fix: 'At least one means one or more. Use Total − none.' },
      { trap: 'Choosing the required person AND then also counting them in the pool.', fix: 'Once a person is fixed in, reduce both n and r by 1.' },
    ],
    check: {
      question: 'A panel of 4 is selected from 5 men and 3 women, with at least one woman. How many panels are possible?',
      options: ['65', '70', '60', '56'],
      correctIndex: 0,
      explanation: 'Total 8C4 = 70. All men: 5C4 = 5. At least one woman = 70 − 5 = 65.',
    },
  },
  {
    id: 'number-formation-from-digits',
    title: 'Number formation from digits',
    summary: 'Forming numbers with and without repetition, even numbers and the zero rule.',
    minutes: 8,
    keyIdea: [
      'Forming a number is filling place values, so use the multiplication rule position by position. Without repetition each digit used reduces the options for later places.',
      'The leading place cannot be zero. When zero is among the digits, fill the most restricted place first: first digit (no zero) or last digit (for even numbers or multiples of 5).',
      'If the question says "even", the last digit must be even. If "divisible by 5", the last digit must be 0 or 5.',
    ],
    formulas: [
      { label: 'n digits, r places, no repeat, no zero issue', expr: 'ⁿPᵣ' },
      { label: 'Repetition allowed, r places', expr: 'nʳ' },
      { label: 'With 0 among digits, no repeat', expr: 'First place: (n − 1) options, then (n − 1), (n − 2), …' },
      { label: 'Even numbers', expr: 'Fix the last digit first, then fill the others' },
    ],
    shortcut: [
      'Start with the restricted place. For "even" fix the units digit, then count the leading digit, then the rest.',
      'If zero is a possible last digit, split into two cases: last digit 0 and last digit non-zero.',
    ],
    examples: [
      {
        question: 'How many 3-digit numbers can be formed from the digits 1, 2, 3, 4, 5 without repetition?',
        steps: ['No zero here, so any digit can lead.', '5 × 4 × 3 = 60 (this is 5P3).'],
        answer: '60',
      },
      {
        question: 'How many 4-digit numbers can be formed from 0, 1, 2, 3, 4, 5 without repetition?',
        steps: ['First digit cannot be 0: 5 options.', 'Next place: 5 left (including 0), then 4, then 3.', '5 × 5 × 4 × 3 = 300.'],
        answer: '300',
      },
      {
        question: 'How many even 4-digit numbers can be formed from 0, 1, 2, 3, 4, 5 without repetition?',
        steps: [
          'Case 1, last digit 0: remaining 3 places from 5 digits = 5 × 4 × 3 = 60.',
          'Case 2, last digit 2 or 4 (2 choices): first digit cannot be 0 or the used digit, so 4 options; then 4 and 3 for the middle places = 2 × (4 × 4 × 3) = 96.',
          'Total = 60 + 96 = 156.',
        ],
        answer: '156',
      },
    ],
    traps: [
      { trap: 'Letting 0 lead, e.g. counting 6 options for the first digit of a 4-digit number.', fix: 'A leading zero makes a shorter number. Give the first place one fewer option.' },
      { trap: 'Filling the first digit before the last digit in an "even" question.', fix: 'Fix the restricted place (units) first, otherwise the choices overlap and you miscount.' },
    ],
    check: {
      question: 'How many 3-digit numbers divisible by 5 can be formed from the digits 1, 2, 3, 4, 5 without repetition?',
      options: ['10', '12', '24', '60'],
      correctIndex: 1,
      explanation: 'The units digit must be 5 (no zero available). The other two places: 4 × 3 = 12.',
    },
  },
  {
    id: 'distribution-stars-bars',
    title: 'Distribution (stars & bars)',
    summary: 'Sharing identical items among people, and counting integer solutions.',
    minutes: 8,
    keyIdea: [
      'To share n identical items among k people, line up the n items as stars and place k − 1 dividers (bars) between them. Each different placement of bars is a different distribution.',
      'That is choosing where the bars go among n + k − 1 positions, which gives (n + k − 1)C(k − 1).',
      'If everyone must get at least some items, hand those out first and then share what remains with the same formula.',
    ],
    formulas: [
      { label: 'x₁ + … + x_k = n, each ≥ 0', expr: '(n + k − 1)C(k − 1)' },
      { label: 'Each ≥ 1', expr: '(n − 1)C(k − 1)' },
      { label: 'Each ≥ m', expr: '(n − k·m + k − 1)C(k − 1)' },
      { label: 'Identical items, people distinct', expr: 'Use the formulas above' },
    ],
    shortcut: [
      'Pre-give the minimum first: if each of k people needs m, subtract k × m from n and then use the "≥ 0" formula.',
      'The bottom number is always (number of people − 1), the same as the number of bars.',
    ],
    examples: [
      {
        question: 'How many non-negative integer solutions does x + y + z = 10 have?',
        steps: ['n = 10 stars, k = 3 variables, so 2 bars.', '(10 + 3 − 1)C2 = 12C2 = 66.'],
        answer: '66',
      },
      {
        question: 'In how many ways can 12 identical chocolates be distributed among 4 children if each gets at least one?',
        steps: ['Each ≥ 1 uses the formula (n − 1)C(k − 1).', '11C3 = (11 × 10 × 9)/6 = 165.'],
        answer: '165',
      },
      {
        question: '15 identical pens are given to 4 students so that each gets at least 2 pens. How many ways?',
        steps: ['Give 2 pens to each first: 4 × 2 = 8 pens used.', '7 pens remain to be shared freely among 4 students.', '(7 + 4 − 1)C3 = 10C3 = 120.'],
        answer: '120',
      },
    ],
    traps: [
      { trap: 'Using the formula with the bar count wrong (e.g. n+kCk).', fix: 'k people need k − 1 bars. The bottom number is k − 1.' },
      { trap: 'Using stars and bars when the items are different.', fix: 'Stars and bars is for IDENTICAL items. For distinct items each item has k choices, so kⁿ.' },
    ],
    check: {
      question: 'In how many ways can 10 identical apples be distributed among 3 people if each gets at least one?',
      options: ['36', '45', '66', '120'],
      correctIndex: 0,
      explanation: 'Each ≥ 1: (10 − 1)C(3 − 1) = 9C2 = 36.',
    },
  },
  {
    id: 'handshakes-diagonals-geometry-counting',
    title: 'Handshakes, diagonals & geometry counting',
    summary: 'Pairs, polygon diagonals and shapes formed from points.',
    minutes: 7,
    keyIdea: [
      'Handshakes, matches in a league and lines joining points are all counting pairs: choose 2 from n, with no order. That is nC2.',
      'A polygon with n vertices has nC2 line segments joining the vertices, but n of them are sides, so diagonals = nC2 − n.',
      'For triangles or quadrilaterals made from points, choose the points, then subtract the choices that fail (such as 3 collinear points that make no triangle).',
    ],
    formulas: [
      { label: 'Handshakes / matches among n', expr: 'ⁿC₂ = n(n − 1)/2' },
      { label: 'Diagonals of n-sided polygon', expr: 'ⁿC₂ − n = n(n − 3)/2' },
      { label: 'Triangles from n points', expr: 'ⁿC₃ − (ᵏC₃ for each collinear group of k)' },
      { label: 'Lines from n points, k collinear', expr: 'ⁿC₂ − ᵏC₂ + 1' },
    ],
    shortcut: [
      'Diagonals: n(n − 3)/2. A hexagon has 6 × 3 / 2 = 9, an octagon has 8 × 5 / 2 = 20.',
      'For a round-robin with both home and away legs, double the nC2 count.',
    ],
    examples: [
      {
        question: 'At a placement drive, 12 candidates shake hands once with every other candidate. How many handshakes take place?',
        steps: ['Each handshake is a pair, order irrelevant: 12C2.', '(12 × 11)/2 = 66.'],
        answer: '66',
      },
      {
        question: 'How many diagonals does a decagon (10-sided polygon) have?',
        steps: ['Diagonals = n(n − 3)/2.', '10 × 7 / 2 = 35.'],
        answer: '35',
      },
      {
        question: 'There are 8 points in a plane, of which 4 are collinear and no other three are collinear. How many triangles can be formed?',
        steps: ['All triples: 8C3 = 56.', 'Triples from the 4 collinear points form no triangle: 4C3 = 4.', 'Triangles = 56 − 4 = 52.'],
        answer: '52',
      },
    ],
    traps: [
      { trap: 'Counting the sides of the polygon as diagonals (answering nC2).', fix: 'Subtract the n sides: diagonals = nC2 − n.' },
      { trap: 'Ignoring collinear points when counting triangles.', fix: 'Subtract kC3 for every group of k collinear points before you answer.' },
    ],
    check: {
      question: '15 teams play a league where every team plays every other team exactly once. How many matches are played?',
      options: ['210', '105', '120', '225'],
      correctIndex: 1,
      explanation: '15C2 = (15 × 14)/2 = 105.',
    },
  },
  {
    id: 'derangements-restrictions',
    title: 'Derangements & restrictions',
    summary: 'Arrangements where nobody lands in their own place.',
    minutes: 8,
    keyIdea: [
      'A derangement is an arrangement in which no item is in its original position, like putting every letter in the wrong envelope. The count for n items is written Dₙ.',
      'Memorise the first few values: D₂ = 1, D₃ = 2, D₄ = 9, D₅ = 44, D₆ = 265. Larger ones follow from the recurrence Dₙ = (n − 1)(Dₙ₋₁ + Dₙ₋₂).',
      'For "exactly r are correct", choose which r are correct with nCr, then derange the rest.',
    ],
    formulas: [
      { label: 'Derangements', expr: 'Dₙ = n! (1 − 1/1! + 1/2! − … ± 1/n!)' },
      { label: 'Recurrence', expr: 'Dₙ = (n − 1)(Dₙ₋₁ + Dₙ₋₂)' },
      { label: 'Exactly r in the right place', expr: 'ⁿCᵣ × Dₙ₋ᵣ' },
      { label: 'At least one in the right place', expr: 'n! − Dₙ' },
    ],
    table: {
      columns: ['n', 'Dₙ', 'n', 'Dₙ'],
      rows: [
        ['2', '1', '5', '44'],
        ['3', '2', '6', '265'],
        ['4', '9', '7', '1854'],
      ],
    },
    shortcut: [
      'Learn D₂ to D₆ by heart (1, 2, 9, 44, 265). Almost every exam question stays within that range.',
      'A single restriction like "A not in first place" is simply Total − (A fixed in first place): n! − (n − 1)!.',
    ],
    examples: [
      {
        question: '4 letters are put into 4 addressed envelopes, one per envelope. In how many ways can all the letters go into the wrong envelopes?',
        steps: ['This is a derangement of 4 items.', 'D₄ = 3 × (D₃ + D₂) = 3 × (2 + 1) = 9.'],
        answer: '9',
      },
      {
        question: '5 letters are put into 5 envelopes. In how many ways can exactly 2 letters land in the correct envelopes?',
        steps: ['Choose the 2 correct letters: 5C2 = 10.', 'The other 3 must all be wrong: D₃ = 2.', '10 × 2 = 20.'],
        answer: '20',
      },
      {
        question: '5 students hand in their caps and each takes one back at random. In how many ways can nobody get their own cap?',
        steps: ['This is D₅.', 'D₅ = 4 × (D₄ + D₃) = 4 × (9 + 2) = 44.'],
        answer: '44',
      },
    ],
    traps: [
      { trap: 'Answering n! − 1 or n! / e roughly for small cases.', fix: 'Use the exact recurrence or the memorised table, never an approximation.' },
      { trap: 'Forgetting nCr when exactly r are correct.', fix: 'First choose WHICH r items are fixed, then derange the other n − r.' },
    ],
    check: {
      question: '4 letters are put into 4 envelopes. In how many ways can exactly 1 letter be in the correct envelope?',
      options: ['6', '8', '9', '12'],
      correctIndex: 1,
      explanation: 'Choose the correct letter: 4C1 = 4. The other 3 are deranged: D₃ = 2. Total 4 × 2 = 8.',
    },
  },
];
