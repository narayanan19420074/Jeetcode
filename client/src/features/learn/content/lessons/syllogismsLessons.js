// Learn content for the Syllogisms pattern — one lesson per sub-pattern.
// Lesson `id` === the sub-pattern slug used by the question bank, so a lesson
// can deep-link straight into Practice for exactly that topic.
//
// Convention used throughout (same as the question bank):
//   - a conclusion "follows" only if it is true in EVERY Venn diagram that fits the statements;
//   - a "possibility" holds if it is true in AT LEAST ONE such diagram;
//   - "Either I or II" is correct only when the two conclusions are exact
//     complements (exactly one must be true) and neither follows on its own.
//
// Shape of a lesson:
//   keyIdea   string[]            the "why", in plain words
//   formulas  {label, expr}[]     what to memorise
//   table     {columns, rows}     optional reference table
//   shortcut  string[]            exam-time tricks
//   examples  {question, steps[], answer}[]   revealed step by step
//   traps     {trap, fix}[]       the mistakes exam setters design options around
//   check     {question, options, correctIndex, explanation}

export const syllogismsLessons = [
  {
    id: 'all-some-no-statements',
    title: 'All / some / no statements',
    summary: 'What each statement type really says, and what you may safely conclude.',
    minutes: 7,
    keyIdea: [
      'Draw circles, not sentences. "All pens are books" puts the pen circle fully inside the book circle. "No pen is a lamp" keeps the two circles apart. "Some pens are books" means the circles overlap, at least a little.',
      'A conclusion follows only if it is true in EVERY diagram you could draw from the statements. If you can draw even one picture where it fails, it does not follow.',
      'Only some statements can be flipped. "Some" and "No" work both ways round; "All" does not.',
    ],
    formulas: [
      { label: 'Chain of "All"', expr: 'All A are B + All B are C ⇒ All A are C' },
      { label: 'Flip "Some"', expr: 'Some A are B ⇒ Some B are A' },
      { label: 'Flip "No"', expr: 'No A is B ⇒ No B is A' },
      { label: 'Cannot flip "All"', expr: 'All A are B ⇏ All B are A' },
      { label: '"Some" is not "All"', expr: 'Some A are B ⇏ All A are B' },
      { label: 'All then No', expr: 'All A are B + No B is C ⇒ No A is C' },
      { label: 'Some then All', expr: 'Some A are B + All B are C ⇒ Some A are C' },
      { label: 'Some then No', expr: 'Some A are B + No B is C ⇒ Some A are not C' },
    ],
    table: {
      columns: ['Statements', 'Valid conclusion'],
      rows: [
        ['All A are B, All B are C', 'All A are C'],
        ['All A are B, No B is C', 'No A is C'],
        ['Some A are B, All B are C', 'Some A are C'],
        ['Some A are B, No B is C', 'Some A are not C'],
        ['All A are B, Some B are C', 'None (A and C may not meet)'],
        ['Some A are B, Some B are C', 'None'],
        ['No A is B, No B is C', 'None (A and C may overlap)'],
      ],
    },
    shortcut: [
      'Two "Some" statements, or two "No" statements, never join into a certain conclusion. You need at least one "All" to carry the link.',
      'Before judging a conclusion, ask: can I draw one picture where it is false? One counter-picture is enough to reject it.',
    ],
    examples: [
      {
        question: 'Statement: Some cups are plates.\nI. Some plates are cups.\nII. All cups are plates.',
        steps: [
          '"Some" statements can be flipped, so I follows.',
          'The circles only overlap. Some cups may sit outside the plate circle, so II does not follow.',
        ],
        answer: 'Only I follows',
      },
      {
        question: 'Statements: All roses are flowers. No flower is a stone.\nI. No rose is a stone.\nII. No stone is a rose.',
        steps: [
          'The rose circle is inside the flower circle, which is far from the stone circle.',
          'So roses and stones cannot meet: I follows.',
          '"No" can be flipped, so II follows as well.',
        ],
        answer: 'Both follow',
      },
      {
        question: 'Statements: All tables are desks. Some desks are wooden.\nI. Some tables are wooden.\nII. All tables are wooden.',
        steps: [
          'The wooden desks might all be outside the small table circle.',
          'So no overlap between tables and wooden things is forced: I fails.',
          'II fails too, since even I does not follow.',
        ],
        answer: 'Neither follows',
      },
    ],
    traps: [
      {
        trap: 'Reading "All A are B" as "All B are A".',
        fix: 'The inner circle does not fill the outer one. Never flip an "All" statement.',
      },
      {
        trap: 'Linking two statements through a middle term that is only "Some" in both.',
        fix: 'Different parts of the middle circle may be involved, so no link is certain. Look for an "All" to carry it.',
      },
    ],
    check: {
      question: 'Statements: Some pens are books. No book is a lamp.\nI. Some pens are not lamps.\nII. No pen is a lamp.',
      options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'],
      correctIndex: 0,
      explanation: 'The pens that are books cannot be lamps, so some pens are not lamps (I follows). Other pens, which are not books, could still be lamps, so II does not follow.',
    },
  },
  {
    id: 'possibility-cases',
    title: 'Possibility cases',
    summary: 'A possibility only needs ONE diagram where it works.',
    minutes: 6,
    keyIdea: [
      'A "possibility" conclusion is the opposite test to "follows". It is correct if at least one Venn diagram fits the statements and also makes it true.',
      'So a possibility is wrong only when the statements directly contradict it. Ask: do the statements forbid it? If not, it is possible.',
      'Statements can be "stretched" in different ways: "Some" can grow to "All", and "All" can grow until the two circles match exactly.',
    ],
    formulas: [
      { label: 'Some A are B', expr: 'Possible: All A are B, or Some A are not B' },
      { label: 'Some A are B', expr: 'Impossible: No A is B' },
      { label: 'All A are B', expr: 'Possible: All B are A, or Some B are not A' },
      { label: 'All A are B', expr: 'Impossible: Some A are not B' },
      { label: 'No A is B', expr: 'Impossible: Some A are B' },
    ],
    table: {
      columns: ['Statement', 'Possible', 'Not possible'],
      rows: [
        ['All A are B', 'All B are A; Some B are not A', 'Some A are not B'],
        ['Some A are B', 'All A are B; Some A are not B', 'No A is B'],
        ['No A is B', 'Some A are not B; Some B are not A', 'Some A are B'],
      ],
    },
    shortcut: [
      'Test a possibility by trying to sketch it. If it breaks a statement, reject it. If it fits, accept it.',
      'A conclusion that "follows" is automatically possible too. The reverse is not true.',
    ],
    examples: [
      {
        question: 'Statement: All pens are books.\nI. It is a possibility that all books are pens.\nII. It is a possibility that some books are not pens.',
        steps: [
          'Draw the pen circle exactly on the book circle: I works.',
          'Draw the pen circle smaller than the book circle: II works.',
        ],
        answer: 'Both are possible',
      },
      {
        question: 'Statements: All pens are books. No book is a lamp.\nI. It is a possibility that some pens are lamps.\nII. It is a possibility that some lamps are not books.',
        steps: [
          'Pens sit inside books, and books are kept away from lamps, so pens cannot be lamps: I is out.',
          'Lamps are completely outside books, so some lamps are not books in every picture. II is possible.',
        ],
        answer: 'Only II is possible',
      },
      {
        question: 'Statements: Some tables are chairs. All chairs are wood.\nI. It is a possibility that no table is wood.\nII. It is a possibility that no chair is wood.',
        steps: [
          'Some tables are chairs, and every chair is wood, so those tables are wood. I is contradicted.',
          'The chairs that exist are all wood, so "no chair is wood" is contradicted too.',
        ],
        answer: 'Neither is possible',
      },
    ],
    traps: [
      {
        trap: 'Rejecting a possibility because it is not stated.',
        fix: 'A possibility needs only to be consistent with the statements, not to be given by them.',
      },
      {
        trap: 'Accepting a possibility that directly clashes with a "No" or an "All" statement.',
        fix: 'Test it by drawing. If the picture breaks a given statement, the possibility fails.',
      },
    ],
    check: {
      question: 'Statements: All pens are books. Some books are lamps.\nI. It is a possibility that some pens are lamps.\nII. It is a possibility that no book is a lamp.',
      options: ['Only I is possible', 'Only II is possible', 'Both are possible', 'Neither is possible'],
      correctIndex: 0,
      explanation: 'The lamp-books could be pens, so I works in some diagram. "Some books are lamps" is given, so "no book is a lamp" is impossible.',
    },
  },
  {
    id: 'either-or-conclusions',
    title: 'Either-or conclusions',
    summary: 'When two doubtful conclusions are exact opposites.',
    minutes: 7,
    keyIdea: [
      'Sometimes neither conclusion follows by itself, yet one of them has to be true. That happens only when the two are exact complements: in every diagram exactly one of them holds.',
      'Two pairs are complements: "Some A are B" with "No A is B", and "All A are B" with "Some A are not B".',
      'Before choosing "Either I or II", check three things: same two terms, complement pair, and neither conclusion follows alone. If one of them follows, that one is the answer.',
    ],
    formulas: [
      { label: 'Complement pair 1', expr: 'Some A are B ⟷ No A is B' },
      { label: 'Complement pair 2', expr: 'All A are B ⟷ Some A are not B' },
      { label: 'NOT a complement pair', expr: 'Some A are B and Some A are not B can both be true' },
      { label: 'NOT a complement pair', expr: 'All A are B and No A is B can both be false' },
    ],
    table: {
      columns: ['Conclusion I', 'Conclusion II', 'Relation'],
      rows: [
        ['Some A are B', 'No A is B', 'Either-or'],
        ['All A are B', 'Some A are not B', 'Either-or'],
        ['Some A are B', 'Some A are not B', 'Not either-or'],
        ['All A are B', 'No A is B', 'Not either-or'],
      ],
    },
    shortcut: [
      'The pair must use the SAME two terms in the SAME order, for example both about pens and books.',
      'Order of checks: does I follow? does II follow? Only if both fail, test for an either-or pair.',
    ],
    examples: [
      {
        question: 'Statements: Some pens are tools. All books are tools.\nI. Some pens are books.\nII. No pen is a book.',
        steps: [
          'The pens that are tools may or may not be books, so I does not follow.',
          'They may also be books, so II does not follow.',
          'But the pair is "Some" and "No": in any picture, exactly one is true.',
        ],
        answer: 'Either I or II',
      },
      {
        question: 'Statement: Some pens are books.\nI. All pens are books.\nII. No pen is a book.',
        steps: [
          'I fails: some pens may lie outside the book circle.',
          'II is false, since the statement says some pens are books.',
          '"All" and "No" can both be false at once, so they are not complements.',
        ],
        answer: 'Neither follows',
      },
      {
        question: 'Statements: All pens are books. Some books are tools.\nI. Some pens are tools.\nII. No pen is a tool.',
        steps: [
          'The tool-books might be pens, or might not. So I does not follow.',
          'Likewise II does not follow.',
          'The pair is "Some" and "No" on the same terms, and exactly one of them holds in every picture.',
        ],
        answer: 'Either I or II',
      },
    ],
    traps: [
      {
        trap: 'Choosing "Either I or II" when one of the conclusions already follows.',
        fix: 'If either conclusion follows definitely, answer "Only" that one. Either-or is only for two doubtful opposites.',
      },
      {
        trap: 'Treating "Some A are B" and "Some A are not B" as opposites.',
        fix: 'Both can be true together, so they are not complements. The answer is Neither unless one follows on its own.',
      },
    ],
    check: {
      question: 'Statements: Some pens are books. No book is a lamp.\nI. All pens are lamps.\nII. Some pens are not lamps.',
      options: ['Only I follows', 'Only II follows', 'Either I or II', 'Neither follows'],
      correctIndex: 1,
      explanation: 'The pens that are books are not lamps, so II definitely follows. Since one of the pair follows by itself, the answer is "Only II", not either-or.',
    },
  },
  {
    id: 'three-statement-syllogisms',
    title: 'Three-statement syllogisms',
    summary: 'Chain three statements and read the link carefully.',
    minutes: 8,
    keyIdea: [
      'Join the statements one link at a time, always using the shared term as the bridge. Work out the first two, then join the result with the third.',
      'Each link follows the same rules as two-statement questions. A chain of "All" stays "All". A "No" anywhere turns the result negative. A single "Some" at the start turns the result into "Some".',
      'Two "Some" statements, or a "Some" in the middle of the chain, usually break the chain for the end terms. Still check the pairs that do link up directly.',
    ],
    formulas: [
      { label: 'All-all-all', expr: 'All A are B + All B are C + All C are D ⇒ All A are D' },
      { label: 'Some first, then All', expr: 'Some A are B + All B are C + All C are D ⇒ Some A are D' },
      { label: 'All, All, No', expr: 'All A are B + All B are C + No C is D ⇒ No A is D' },
      { label: 'Some, All, No', expr: 'Some A are B + All B are C + No C is D ⇒ Some A are not D' },
      { label: 'Break in the chain', expr: 'All A are B + Some B are C + All C are D ⇒ Some B are D, but nothing certain about A and D' },
    ],
    shortcut: [
      'Write the terms in a row in the order the bridges connect them, for example pens, books, files, boxes. Conclusions that jump over a missing bridge are suspect.',
      'Pairs that are directly joined by a statement can always be used on their own, even when the end terms cannot be linked.',
    ],
    examples: [
      {
        question: 'Statements: All pens are books. All books are files. All files are boxes.\nI. All pens are boxes.\nII. All boxes are pens.',
        steps: [
          'Pens fit in books, books fit in files, files fit in boxes: pens fit in boxes. I follows.',
          'That runs only one way. The box circle can be much larger, so II does not follow.',
        ],
        answer: 'Only I follows',
      },
      {
        question: 'Statements: Some pens are books. All books are files. No file is a box.\nI. Some pens are not boxes.\nII. No book is a box.',
        steps: [
          'Books are inside files, and files are apart from boxes: no book is a box. II follows.',
          'Some pens are books, so those pens are not boxes. I follows.',
        ],
        answer: 'Both follow',
      },
      {
        question: 'Statements: Some pens are books. Some books are files. All files are boxes.\nI. Some pens are boxes.\nII. Some books are boxes.',
        steps: [
          'Some books are files, and all files are boxes, so some books are boxes. II follows.',
          'The pens that are books and the books that are files may be different groups of books. No link joins pens to boxes.',
          'I does not follow.',
        ],
        answer: 'Only II follows',
      },
    ],
    traps: [
      {
        trap: 'Joining pens to boxes across a "Some" link in the middle.',
        fix: 'A "Some" does not carry membership onward to the same group. Chain only through "All" bridges.',
      },
      {
        trap: 'Ignoring the pair of statements that do link, because the full chain fails.',
        fix: 'Conclusions about any two directly joined terms can still follow. Check each adjacent pair too.',
      },
    ],
    check: {
      question: 'Statements: All pens are books. Some books are lamps. All lamps are boxes.\nI. Some pens are boxes.\nII. All books are boxes.',
      options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'],
      correctIndex: 3,
      explanation: 'Some books are lamps and all lamps are boxes, so some books are boxes, but not necessarily the books that are pens. I fails, and II fails because only some books are known to be boxes.',
    },
  },
  {
    id: 'reverse-syllogism',
    title: 'Reverse syllogism',
    summary: 'Given the conclusion, pick the statements that guarantee it.',
    minutes: 7,
    keyIdea: [
      'Here the conclusion is fixed and you choose the pair of statements that makes it follow. Read each option and test whether the conclusion would be true in every picture.',
      'Match the kind of conclusion to the kind of statements it needs. A universal conclusion ("All" or "No") needs universal statements. A "Some" conclusion needs a "Some" statement to start the chain.',
      'The bridge term must appear in both statements and must connect the two end terms in the right direction.',
    ],
    formulas: [
      { label: 'To get "All A are C"', expr: 'All A are B + All B are C' },
      { label: 'To get "No A is C"', expr: 'All A are B + No B is C' },
      { label: 'To get "Some A are C"', expr: 'Some A are B + All B are C' },
      { label: 'To get "Some A are not C"', expr: 'Some A are B + No B is C' },
    ],
    table: {
      columns: ['Wanted conclusion', 'Pair that gives it', 'Looks right but fails'],
      rows: [
        ['All A are C', 'All A are B, All B are C', 'All A are B, Some B are C'],
        ['No A is C', 'All A are B, No B is C', 'Some A are B, No B is C'],
        ['Some A are C', 'Some A are B, All B are C', 'Some A are B, Some B are C'],
        ['Some A are not C', 'Some A are B, No B is C', 'All A are B, All B are C'],
      ],
    },
    shortcut: [
      'Eliminate options by strength: if the conclusion is "All", throw away any option with a "Some" or "No". If it is "No", the options need a "No".',
      'If two options both look right, check the bridge direction. "All B are A" and "All A are B" are very different.',
    ],
    examples: [
      {
        question: 'Which statements guarantee "All pens are files"?\n(A) All pens are books. Some books are files.\n(B) All pens are books. All books are files.\n(C) All books are pens. All books are files.\n(D) Some pens are books. All books are files.',
        steps: [
          'We need a universal chain from pens to files.',
          '(A) has "Some" in the second statement and (D) in the first, so they give only "Some" at best.',
          '(C) has the arrow reversed: books fit inside pens, not the other way round.',
          '(B) is a clean chain: pens fit in books, books fit in files.',
        ],
        answer: 'Option (B)',
      },
      {
        question: 'Which statements guarantee "No pen is a box"?\n(A) All pens are books. No book is a box.\n(B) Some pens are books. No book is a box.\n(C) All pens are books. All boxes are books.\n(D) No pen is a book. All books are boxes.',
        steps: [
          'A "No" conclusion needs a "No" statement, so (C) is out.',
          '(B) only covers the pens that are books, so it gives "Some pens are not boxes", not "No pen".',
          '(D) says pens are apart from books, but boxes lie outside books too, so pens might be boxes.',
          '(A): pens fit inside books, books are apart from boxes. No pen is a box.',
        ],
        answer: 'Option (A)',
      },
      {
        question: 'Which statements guarantee "Some pens are not boxes"?\n(A) All pens are books. All books are boxes.\n(B) Some pens are books. All books are boxes.\n(C) Some pens are books. No book is a box.\n(D) All books are pens. Some books are boxes.',
        steps: [
          'The conclusion needs a "No" link and a "Some" start. (A) and (B) put boxes around the books, the opposite of what we want.',
          '(D) gives "Some pens are boxes", the opposite direction.',
          '(C): the pens that are books are not boxes, so some pens are not boxes.',
        ],
        answer: 'Option (C)',
      },
    ],
    traps: [
      {
        trap: 'Choosing the option that merely contains the right words.',
        fix: 'Words are not enough. Draw the chain and check the strength and the direction of each link.',
      },
      {
        trap: 'Accepting two "Some" statements for a "Some" conclusion.',
        fix: 'You need at least one "All" or "No" to carry the link between the end terms.',
      },
    ],
    check: {
      question: 'Which statements guarantee "Some pens are boxes"?\n(A) All pens are books. No book is a box.\n(B) Some pens are books. Some books are boxes.\n(C) Some pens are books. All books are boxes.\n(D) All pens are books. All boxes are books.',
      options: ['(A)', '(B)', '(C)', '(D)'],
      correctIndex: 2,
      explanation: 'Some pens are books, and every book is a box, so those pens are boxes. (A) gives the opposite, (B) breaks the link with two "Some" statements, and (D) says boxes are inside books but nothing forces any of them to be pens.',
    },
  },
]
