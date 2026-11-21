// Learn content for the Coding and Decoding pattern — one lesson per sub-pattern.
// Lesson `id` === the sub-pattern slug used by the question bank, so a lesson
// can deep-link straight into Practice for exactly that topic.
//
// Shape of a lesson:
//   keyIdea   string[]            the "why", in plain words
//   formulas  {label, expr}[]     the coding rules to recognise
//   table     {columns, rows}     optional reference table
//   shortcut  string[]            exam-time tricks
//   examples  {question, steps[], answer}[]   revealed step by step
//   traps     {trap, fix}[]       the mistakes exam setters design options around
//   check     {question, options, correctIndex, explanation}

export const codingDecodingLessons = [
  {
    id: 'letter-coding',
    title: 'Letter coding',
    summary: 'Spot the shift, the opposite letter or the pattern behind a coded word.',
    minutes: 7,
    keyIdea: [
      'A coded word is made from the original word by one fixed rule applied to every letter. Your job is to discover that rule from the given pair, then repeat it on a new word.',
      'Compare the original and coded word letter by letter. If every letter moves the same distance, it is a shift. If the positions add up to 27, it is the opposite (reverse) alphabet. If the distance grows or alternates, it is a pattern shift.',
    ],
    formulas: [
      { label: 'Forward shift', expr: 'letter at position p → position p + n' },
      { label: 'Backward shift', expr: 'letter at position p → position p − n' },
      { label: 'Opposite letter', expr: 'position p → position 27 − p   (A↔Z, B↔Y, …, M↔N)' },
      { label: 'Pattern shift', expr: '+1, +2, +3, … or +1, −1, +1, −1 …' },
    ],
    table: {
      columns: ['Letter', 'Opposite', 'Positions'],
      rows: [
        ['A', 'Z', '1 + 26'],
        ['B', 'Y', '2 + 25'],
        ['C', 'X', '3 + 24'],
        ['D', 'W', '4 + 23'],
        ['E', 'V', '5 + 22'],
        ['F', 'U', '6 + 21'],
        ['G', 'T', '7 + 20'],
        ['H', 'S', '8 + 19'],
        ['I', 'R', '9 + 18'],
        ['J', 'Q', '10 + 17'],
        ['K', 'P', '11 + 16'],
        ['L', 'O', '12 + 15'],
        ['M', 'N', '13 + 14'],
      ],
    },
    shortcut: [
      'Test the rule on EVERY letter of the given pair, not just the first. Two different rules can agree on one letter.',
      'Remember the anchors E, J, O, T, Y = 5, 10, 15, 20, 25. Count forward or backward from the nearest anchor instead of from A.',
    ],
    examples: [
      {
        question: 'In a code, BAT is written as CBU. How is RAT written in the same code?',
        steps: [
          'B → C, A → B, T → U. Every letter moves one step forward (+1).',
          'Apply +1 to RAT: R → S, A → B, T → U.',
        ],
        answer: 'SBU',
      },
      {
        question: 'In a code, CAT is written as XZG. How is DOG written in that code?',
        steps: [
          'C ↔ X, A ↔ Z, T ↔ G. Each letter is replaced by its opposite, so position p becomes 27 − p.',
          'D (4) → 23 = W. O (15) → 12 = L. G (7) → 20 = T.',
        ],
        answer: 'WLT',
      },
      {
        question: 'In a code, CODE is written as DQGI. How is TEAM written in that code?',
        steps: [
          'C → D (+1), O → Q (+2), D → G (+3), E → I (+4). The shift grows by one for each position.',
          'Apply +1, +2, +3, +4 to TEAM: T → U, E → G, A → D, M → Q.',
        ],
        answer: 'UGDQ',
      },
    ],
    traps: [
      {
        trap: 'Finding the shift from the first letter only and applying it to the whole word.',
        fix: 'Check the rule against all letters of the sample. A growing or alternating shift only shows up from the second letter onwards.',
      },
      {
        trap: 'Using 26 − p for the opposite letter.',
        fix: 'Opposite position is 27 − p. A (1) pairs with Z (26), not with Y.',
      },
    ],
    check: {
      question: 'If every letter is replaced by its opposite letter in the alphabet, how is HELP written?',
      options: ['SUOK', 'TVOK', 'SVOK', 'SVPK'],
      correctIndex: 2,
      explanation: 'H (8) → 19 = S, E (5) → 22 = V, L (12) → 15 = O, P (16) → 11 = K. So HELP becomes SVOK.',
    },
  },
  {
    id: 'number-coding',
    title: 'Number coding',
    summary: 'Turn letters into position values and words into numbers.',
    minutes: 6,
    keyIdea: [
      'In number coding every letter stands for a number, most often its position in the alphabet (A = 1 … Z = 26). A word is then coded as the sum of its letters, or as the numbers written side by side.',
      'Some questions flip the alphabet (A = 26 … Z = 1). Read the question for the numbering first, because every later step depends on it.',
    ],
    formulas: [
      { label: 'Position value', expr: 'A = 1, B = 2, …, Z = 26' },
      { label: 'Reverse value', expr: '27 − position   (A = 26, Z = 1)' },
      { label: 'Word sum', expr: 'add the values of all letters' },
      { label: 'Digit string', expr: 'write each letter value side by side' },
    ],
    table: {
      columns: ['Letters', 'Values'],
      rows: [
        ['A B C D E', '1 2 3 4 5'],
        ['F G H I J', '6 7 8 9 10'],
        ['K L M N O', '11 12 13 14 15'],
        ['P Q R S T', '16 17 18 19 20'],
        ['U V W X Y', '21 22 23 24 25'],
        ['Z', '26'],
      ],
    },
    shortcut: [
      'Learn the anchors E = 5, J = 10, O = 15, T = 20, Y = 25 and count one or two steps from the nearest one.',
      'For a reverse-numbered alphabet, find the normal value first and subtract it from 27.',
    ],
    examples: [
      {
        question: 'If A = 1, B = 2, …, Z = 26, what is the value of the word BAD (sum of its letters)?',
        steps: ['B = 2, A = 1, D = 4.', 'Sum = 2 + 1 + 4 = 7.'],
        answer: '7',
      },
      {
        question: 'In a code, each letter is replaced by its position in the alphabet and the numbers are written side by side. How is FACE coded?',
        steps: ['F = 6, A = 1, C = 3, E = 5.', 'Write them side by side: 6 1 3 5.'],
        answer: '6135',
      },
      {
        question: 'If A = 26, B = 25, …, Z = 1, what is the sum of the values in the word DAY?',
        steps: [
          'Reverse value = 27 − position.',
          'D (4) = 23, A (1) = 26, Y (25) = 2.',
          'Sum = 23 + 26 + 2 = 51.',
        ],
        answer: '51',
      },
    ],
    traps: [
      {
        trap: 'Using 26 − position for the reverse alphabet.',
        fix: 'A is 26 and Z is 1, so the reverse value is 27 − position. Check with A: 27 − 1 = 26.',
      },
      {
        trap: 'Misreading a digit string, such as 1 and 12 written as 112.',
        fix: 'Convert letter by letter and keep the values separate in your working before you join them.',
      },
    ],
    check: {
      question: 'If A = 1, B = 2, …, Z = 26 and a word is coded as the sum of its letter values, what is the code for LION?',
      options: ['46', '48', '50', '52'],
      correctIndex: 2,
      explanation: 'L = 12, I = 9, O = 15, N = 14. The sum is 12 + 9 + 15 + 14 = 50.',
    },
  },
  {
    id: 'symbol-coding',
    title: 'Symbol coding',
    summary: 'Match symbols to letters by comparing coded words.',
    minutes: 6,
    keyIdea: [
      'Here each letter is replaced by an arbitrary symbol. There is no pattern to guess. The only information is the coded words you are given, so you must compare them.',
      'A symbol that appears in two coded words stands for a letter that appears in both original words. Whatever is left over after you remove the common part belongs to the differing letter.',
    ],
    formulas: [
      { label: 'One letter, one symbol', expr: 'the same symbol always means the same letter' },
      { label: 'Common part', expr: 'shared letters ↔ shared symbols' },
      { label: 'Odd one out', expr: 'differing letter ↔ differing symbol' },
      { label: 'Order', expr: 'symbols follow the letter order, unless told otherwise' },
    ],
    shortcut: [
      'Write the words one under the other with their symbols aligned. The columns that differ show you the unknown letters at once.',
      'Make a small letter-to-symbol list as you go, then build the answer from the list instead of from memory.',
    ],
    examples: [
      {
        question: 'In a code, CAT is written as @ # $ and CAR is written as @ # %. How is T written in that code?',
        steps: [
          'CAT and CAR share C and A, so @ # stand for C and A.',
          'The last letters differ: T ↔ $ and R ↔ %.',
        ],
        answer: '$',
      },
      {
        question: 'In a code, BEAT is written as # @ $ & and BEAR is written as # @ $ %. How is TEAR written in that code?',
        steps: [
          'B = #, E = @, A = $ from the shared first three symbols.',
          'T = & (last symbol of BEAT) and R = % (last symbol of BEAR).',
          'TEAR = T, E, A, R = & @ $ %.',
        ],
        answer: '& @ $ %',
      },
      {
        question: 'In a code, LEAF is written as ▲ ■ ● ◆ and LEAK is written as ▲ ■ ● ★. How is FLAK written in that code?',
        steps: [
          'The first three symbols are shared, so L = ▲, E = ■, A = ●.',
          'F = ◆ (last of LEAF) and K = ★ (last of LEAK).',
          'FLAK = F, L, A, K = ◆ ▲ ● ★.',
        ],
        answer: '◆ ▲ ● ★',
      },
    ],
    traps: [
      {
        trap: 'Assuming the symbols follow a pattern, such as increasing or alphabetical order.',
        fix: 'Symbols are arbitrary. Use only what the given coded words prove.',
      },
      {
        trap: 'Writing the symbols in the wrong order for the new word.',
        fix: 'Split the new word into letters first, look up each symbol, then write them in the same order.',
      },
    ],
    check: {
      question: 'In a code, DOT is written as $ # @ and DOG is written as $ # %. How is GOD written in that code?',
      options: ['$ # %', '% # $', '@ # $', '% $ #'],
      correctIndex: 1,
      explanation: 'D = $, O = #, T = @, G = %. GOD is G, O, D = % # $.',
    },
  },
  {
    id: 'fictitious-language-coding',
    title: 'Fictitious language coding',
    summary: 'Decode made-up words by finding what two sentences share.',
    minutes: 8,
    keyIdea: [
      'In a made-up language each word has its own code word, but the code words in a sentence are NOT in the same order as the real words. Never match words by position.',
      'Find a real word that appears in two sentences. The code word that also appears in both is its code. Repeat, and use elimination to settle the rest.',
    ],
    formulas: [
      { label: 'Common word', expr: 'word in two sentences ↔ code word in both' },
      { label: 'Elimination', expr: 'remove the codes already identified, what is left decodes the rest' },
      { label: 'Order', expr: 'code order ≠ word order' },
      { label: 'One word, one code', expr: 'each word keeps the same code in every sentence' },
    ],
    shortcut: [
      'Underline the repeated words in the real sentences and the repeated codes in the coded sentences. Pair the repeats first.',
      'If two words always appear together, look for a third sentence that contains only one of them to separate the pair.',
    ],
    examples: [
      {
        question: 'In a code, "sun is bright" is written as "ka lo mi" and "bright day" is written as "mi su". What is the code for "bright"?',
        steps: [
          'The word "bright" is common to both sentences.',
          'The code word common to both coded sentences is "mi".',
        ],
        answer: 'mi',
      },
      {
        question: 'In a code, "we eat rice" is "po za ne", "rice is good" is "ke po da" and "we are good" is "ri ke za". What is the code for "eat"?',
        steps: [
          '"rice" is common to sentences 1 and 2, and "po" is common to their codes, so rice = po.',
          '"we" is common to sentences 1 and 3, and "za" is common to their codes, so we = za.',
          'Sentence 1 has codes po, za, ne. Removing po (rice) and za (we) leaves ne for "eat".',
        ],
        answer: 'ne',
      },
      {
        question: 'In a code, "cat likes milk" is "ho ru pi", "milk is white" is "se ho ba", "cat is white" is "ba ru se" and "is good" is "mo se". What is the code for "white"?',
        steps: [
          '"is" is common to sentences 2, 3 and 4, and "se" is common to all three codes, so is = se.',
          '"white" is common to sentences 2 and 3, so its code is one of se or ba.',
          'se already belongs to "is", so white = ba.',
        ],
        answer: 'ba',
      },
    ],
    traps: [
      {
        trap: 'Matching words to codes by position, for example first word to first code.',
        fix: 'The order is scrambled on purpose. Match only through common words and common codes.',
      },
      {
        trap: 'Stopping when a word has two possible codes.',
        fix: 'Eliminate the code that already belongs to another word. One candidate always survives.',
      },
    ],
    check: {
      question: 'In a code, "sky is blue" is "ti ro pa", "blue ink" is "ku ro" and "sky high" is "mu pa". What is the code for "is"?',
      options: ['ro', 'ti', 'pa', 'ku'],
      correctIndex: 1,
      explanation: '"blue" is common to sentences 1 and 2, so blue = ro. "sky" is common to sentences 1 and 3, so sky = pa. Removing ro and pa from "ti ro pa" leaves ti for "is".',
    },
  },
  {
    id: 'mixed-substitution-coding',
    title: 'Mixed substitution coding',
    summary: 'Swap names and chain two rules, one step at a time.',
    minutes: 7,
    keyIdea: [
      'Substitution means one thing is "called" something else. You answer with the new name of the real object, not with its normal name.',
      'Mixed questions combine two steps, such as shift and then reverse. Apply the steps in the exact order given, and do not stop until the last step is done.',
    ],
    formulas: [
      { label: 'Name swap', expr: 'real object → the name it is called in the code' },
      { label: 'Substitute once', expr: 'use the code list one time, do not follow the chain further' },
      { label: 'Two-step rule', expr: 'step 1 on the original word, step 2 on the result' },
      { label: 'Reverse a word', expr: 'write the letters from last to first' },
    ],
    shortcut: [
      'Write the substitutions as a small list (A → B, B → C) and cross out each one as you use it.',
      'For two-step letter rules, write the intermediate word on paper. Doing both steps in your head is where slips happen.',
    ],
    examples: [
      {
        question: 'If red is called blue, blue is called green and green is called white, what is the colour of grass called in this code?',
        steps: ['Grass is really green.', 'In this code green is called white.'],
        answer: 'white',
      },
      {
        question: 'If table is called chair, chair is called bed and bed is called desk, what would you call the thing you sleep on?',
        steps: ['The thing you sleep on is a bed.', 'In this code bed is called desk.'],
        answer: 'desk',
      },
      {
        question: 'In a code, each letter is moved one step forward and then the whole word is reversed. How is PEN coded?',
        steps: [
          'Step 1, move each letter one step forward: P → Q, E → F, N → O gives QFO.',
          'Step 2, reverse the word: QFO becomes OFQ.',
        ],
        answer: 'OFQ',
      },
    ],
    traps: [
      {
        trap: 'Following the chain further, for example from bed to desk and then on to the next swap.',
        fix: 'Substitute only once. The real object has one new name in the code.',
      },
      {
        trap: 'Stopping after the first step of a two-step rule and giving QFO.',
        fix: 'Re-read the rule and count the steps. Every stated step must be applied before you answer.',
      },
    ],
    check: {
      question: 'In a code, pen is called book, book is called bag and bag is called box. Which word in this code stands for the thing you write with?',
      options: ['pen', 'book', 'bag', 'box'],
      correctIndex: 1,
      explanation: 'You write with a pen, and in this code a pen is called book.',
    },
  },
  {
    id: 'conditional-coding',
    title: 'Conditional coding',
    summary: 'Apply a different rule depending on the type of letter or word.',
    minutes: 7,
    keyIdea: [
      'A conditional code has an if-then rule: the treatment depends on something about the word, such as its first letter, its length or whether a letter is a vowel.',
      'Decide the condition on the ORIGINAL word, pick the matching rule, and then apply it. Nothing is guessed, so you only have to follow the rule carefully.',
    ],
    formulas: [
      { label: 'Letter swap', expr: 'exchange the first and last letters' },
      { label: 'Vowel rule', expr: 'change only the vowels A, E, I, O, U' },
      { label: 'Length rule', expr: 'even number of letters → rule 1, odd → rule 2' },
      { label: 'First-letter rule', expr: 'vowel start → rule 1, consonant start → rule 2' },
    ],
    table: {
      columns: ['Vowel', 'Next letter'],
      rows: [
        ['A', 'B'],
        ['E', 'F'],
        ['I', 'J'],
        ['O', 'P'],
        ['U', 'V'],
      ],
    },
    shortcut: [
      'Write the condition first (for example "even or odd?"), tick the answer, and only then touch the letters.',
      'Count letters by writing a number under each one. Miscounting is the most common reason the wrong rule is chosen.',
    ],
    examples: [
      {
        question: 'In a code, the first and last letters of a word are swapped. How is PLANET coded?',
        steps: ['The first letter is P and the last letter is T.', 'Swap them: T L A N E P.'],
        answer: 'TLANEP',
      },
      {
        question: 'In a code, every vowel is replaced by the next letter of the alphabet and consonants stay the same. How is EDUCATION coded?',
        steps: [
          'The vowels are E, U, A, I, O. They become F, V, B, J, P.',
          'Replace each vowel and keep the consonants: E → F, D, U → V, C, A → B, T, I → J, O → P, N.',
        ],
        answer: 'FDVCBTJPN',
      },
      {
        question: 'In a code, a word with an even number of letters is reversed, and a word with an odd number of letters has every letter moved one step forward. How are FAN and GOAL coded?',
        steps: [
          'FAN has 3 letters (odd), so move each letter forward one step: F → G, A → B, N → O gives GBO.',
          'GOAL has 4 letters (even), so reverse it: LAOG.',
        ],
        answer: 'GBO and LAOG',
      },
    ],
    traps: [
      {
        trap: 'Checking the condition on the coded word instead of the original word.',
        fix: 'The condition always refers to the word you are given. Decide the rule before you change any letter.',
      },
      {
        trap: 'Applying the rule to every letter when it only covers some of them, such as only vowels.',
        fix: 'Mark the letters the rule covers first and leave all the others exactly as they are.',
      },
    ],
    check: {
      question: 'In a code, a word that starts with a vowel is written reversed. Any other word has its first and last letters swapped. How is ORANGE coded?',
      options: ['ERANGO', 'ORANGE', 'EGNARO', 'EGNORA'],
      correctIndex: 2,
      explanation: 'ORANGE starts with the vowel O, so it is reversed: E G N A R O. The swap rule (ERANGO) is for words that start with a consonant.',
    },
  },
];
