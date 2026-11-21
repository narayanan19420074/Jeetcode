// Learn content for the Seating Arrangement pattern — one lesson per sub-pattern.
// Lesson `id` === the sub-pattern slug used by the question bank, so a lesson
// can deep-link straight into Practice for exactly that topic.
//
// Shape of a lesson:
//   keyIdea   string[]            the "why", in plain words
//   formulas  {label, expr}[]     what to memorise
//   table     {columns, rows}     optional reference table
//   shortcut  string[]            exam-time tricks
//   examples  {question, steps[], answer}[]   revealed step by step
//   traps     {trap, fix}[]       the mistakes exam setters design options around
//   check     {question, options, correctIndex, explanation}

export const seatingArrangementLessons = [
  {
    id: 'linear-arrangement',
    title: 'Linear arrangement',
    summary: 'People in a row: left and right depend on which way they face.',
    minutes: 8,
    keyIdea: [
      '"Left" and "right" always belong to the PERSON, not to the page. A person facing north has west on the left; a person facing south has east on the left.',
      'Draw the row once from the compass point of view (west → east) and convert each clue into that frame. Never mix the two ways of looking.',
      'Start with the most definite clues (ends, middle, fixed gaps), place them, and only then use the "not next to" style clues to split the leftovers.',
    ],
    formulas: [
      { label: 'Facing north', expr: 'Left = west side, Right = east side (same as the page)' },
      { label: 'Facing south', expr: 'Left = east side, Right = west side (flipped)' },
      { label: 'Row of n, k-th from the left end', expr: 'It is (n − k + 1)-th from the right end' },
      { label: 'Persons between X and Y', expr: '|position of X − position of Y| − 1' },
      { label: 'Solving order', expr: 'Ends / middle → fixed gaps → "between" → negative clues' },
    ],
    table: {
      columns: ['Facing', 'Left of a person', 'Right of a person'],
      rows: [
        ['North', 'West neighbour', 'East neighbour'],
        ['South', 'East neighbour', 'West neighbour'],
      ],
    },
    shortcut: [
      'Before reading any clue, write the facing direction on top of your sketch. If it is south, flip every left/right once while placing, not on every clue.',
      'Draw empty slots first (_ _ _ _ _), fill the certain ones in pen, and keep the doubtful ones as small notes beside the slot.',
    ],
    examples: [
      {
        question:
          'Arun, Bala, Chitra, Divya and Ezhil sit in a row facing north. Arun sits at the extreme left. Chitra sits to the immediate right of Arun. Ezhil sits at the extreme right. Bala does not sit next to Chitra. Who sits in the middle?',
        steps: [
          'Facing north, left is west, so slot 1 is the left end: Arun _ _ _ _.',
          'Chitra is immediately right of Arun: Arun, Chitra, _, _, _. Ezhil is at the right end: Arun, Chitra, _, _, Ezhil.',
          'Bala and Divya remain for slots 3 and 4. Slot 3 is next to Chitra, and Bala may not be there, so Bala takes slot 4 and Divya slot 3.',
          'Row (left → right): Arun, Chitra, Divya, Bala, Ezhil. The middle is slot 3.',
        ],
        answer: 'Divya',
      },
      {
        question:
          'Mohan, Nithya, Omar, Pooja and Qadir sit in a row facing south. Pooja sits at the extreme left end. Mohan sits to the immediate left of Nithya. Omar sits third to the right of Pooja. Who sits at the extreme right end?',
        steps: [
          'Facing south, left is EAST and right is WEST. Number the slots 1 to 5 from west to east.',
          'Pooja is at the extreme left, which is the east end: slot 5.',
          'Omar is third to the right of Pooja. Right means west, so move 3 slots west from slot 5: Omar is in slot 2.',
          'Mohan is to the immediate left of Nithya, so Mohan is on Nithya\'s east side. From slots 1, 3, 4 the only adjacent pair is 3 and 4: Nithya in 3, Mohan in 4. Qadir gets slot 1.',
          'West → east: Qadir, Omar, Nithya, Mohan, Pooja. The extreme right for south-facing people is the west end, slot 1.',
        ],
        answer: 'Qadir',
      },
      {
        question:
          'Rohit, Sneha, Tarun, Uma, Vikram, Waseem and Yamini sit in a row facing north. Rohit sits exactly in the middle. Sneha sits at one end of the row and is third to the left of Rohit. Uma sits to the immediate left of Rohit. Vikram sits second to the right of Rohit. Yamini sits at the other end. Waseem does not sit next to Sneha. Who sits to the immediate right of Rohit?',
        steps: [
          'Seven people, so the middle is slot 4: Rohit in slot 4.',
          'Third to the left of Rohit is slot 1, and it is an end: Sneha in slot 1. Uma is immediately left of Rohit: slot 3.',
          'Second to the right of Rohit: Vikram in slot 6. Yamini is at the other end: slot 7.',
          'Tarun and Waseem fill slots 2 and 5. Slot 2 is next to Sneha, and Waseem may not sit there, so Waseem takes slot 5 and Tarun slot 2.',
          'Row: Sneha, Tarun, Uma, Rohit, Waseem, Vikram, Yamini. Immediate right of Rohit is slot 5.',
        ],
        answer: 'Waseem',
      },
    ],
    traps: [
      {
        trap: 'Reading "left" as the left of the page when the row faces south.',
        fix: 'Note the facing direction first. For south-facing people, left is east, so reverse the page direction before placing.',
      },
      {
        trap: 'Counting positions "to the left of X" including X himself, or being off by one on "third to the left".',
        fix: 'Third to the left of X means 3 slots away, so slots between them number 2. Mark slot numbers and count steps, not names.',
      },
    ],
    check: {
      question:
        'A and B sit in a row facing north, with A to the immediate left of B. If both turn about to face south without changing seats, which statement is now true?',
      options: [
        'A is still to the immediate left of B',
        'A is now to the immediate right of B',
        'A and B are now opposite each other',
        'Nothing can be said',
      ],
      correctIndex: 1,
      explanation:
        'Seats do not change, but left and right belong to the person. Turning from north to south swaps them, so A, who was on B\'s left, is now on B\'s right.',
    },
  },
  {
    id: 'circular-arrangement-facing-in',
    title: 'Circular arrangement (facing in)',
    summary: 'Everyone faces the centre: left is clockwise, right is anticlockwise.',
    minutes: 8,
    keyIdea: [
      'When everyone faces the centre, a person\'s left hand points CLOCKWISE and the right hand points ANTICLOCKWISE. This is the opposite of what your eyes expect when you look down at the page.',
      'There is no "end" in a circle, so fix one person as the anchor, call that seat 1, and number the others clockwise.',
      '"Opposite" in a circle of n people is exactly n/2 seats away. It only exists when n is even.',
    ],
    formulas: [
      { label: 'Facing in: immediate left of X', expr: 'Next seat CLOCKWISE from X' },
      { label: 'Facing in: immediate right of X', expr: 'Next seat ANTICLOCKWISE from X' },
      { label: 'k-th to the left / right', expr: 'Seat of X + k (left)  or  seat of X − k (right), counted mod n' },
      { label: 'Opposite of seat s (n even)', expr: 'Seat s + n/2' },
      { label: 'Solving order', expr: 'Anchor → opposite pairs → adjacent pairs → "between" → negatives' },
    ],
    table: {
      columns: ['Clue about X', 'Where to look (all facing centre)'],
      rows: [
        ['Immediate left', '1 seat clockwise'],
        ['Immediate right', '1 seat anticlockwise'],
        ['Second to the left', '2 seats clockwise'],
        ['Third to the right', '3 seats anticlockwise'],
        ['Opposite', 'n/2 seats either way'],
      ],
    },
    shortcut: [
      'Draw seats as a clock face and write "L → clockwise" beside it before reading any clue. One glance prevents most mistakes.',
      'Opposite and "second to the left of" clues give the cleanest anchors. Place them before the immediate-neighbour clues.',
    ],
    examples: [
      {
        question:
          'Anand, Bhavna, Charan, Deepa, Eswar and Farida sit around a circular table, all facing the centre. Bhavna sits to the immediate left of Anand. Charan sits to the immediate left of Bhavna. Farida sits to the immediate right of Anand. Deepa sits opposite Anand. Who sits opposite Bhavna?',
        steps: [
          'Facing the centre, left is clockwise. Anchor Anand in seat 1.',
          'Bhavna is on Anand\'s left: seat 2. Charan is on Bhavna\'s left: seat 3.',
          'Farida is on Anand\'s right, which is anticlockwise: seat 6. Deepa is opposite Anand, 3 seats away: seat 4.',
          'Eswar takes seat 5. Clockwise: Anand, Bhavna, Charan, Deepa, Eswar, Farida.',
          'Opposite Bhavna (seat 2) is seat 5.',
        ],
        answer: 'Eswar',
      },
      {
        question:
          'Ganesh, Hema, Imran, Jaya, Kiran, Lakshmi, Manoj and Nalini sit around a circular table facing the centre. Imran sits second to the left of Ganesh. Hema sits between Ganesh and Imran. Kiran sits opposite Ganesh. Lakshmi sits to the immediate left of Kiran. Nalini sits to the immediate right of Ganesh. Jaya does not sit next to Nalini. Who sits third to the right of Kiran?',
        steps: [
          'Anchor Ganesh in seat 1. Left is clockwise, so Imran, second to the left, is in seat 3, and Hema between them is in seat 2.',
          'Kiran is opposite Ganesh, 4 seats away: seat 5. Lakshmi is on Kiran\'s left: seat 6.',
          'Nalini is on Ganesh\'s right, anticlockwise: seat 8.',
          'Jaya and Manoj remain for seats 4 and 7. Seat 7 is next to Nalini (seat 8), so Jaya is in seat 4 and Manoj in seat 7.',
          'Third to the right of Kiran means 3 seats anticlockwise from seat 5: seat 2.',
        ],
        answer: 'Hema',
      },
      {
        question:
          'Prakash, Qamar, Revathi, Sunita, Thomas, Usha, Vijay and Wilson sit around a circular table facing the centre. Thomas sits third to the left of Prakash. Usha sits to the immediate left of Thomas. Qamar sits to the immediate left of Usha. Revathi sits to the immediate right of Thomas. Vijay sits to the immediate left of Prakash. Sunita sits to the immediate right of Prakash. Who sits opposite Vijay?',
        steps: [
          'Anchor Prakash in seat 1. Left is clockwise: Thomas, third to the left, is in seat 4.',
          'Usha is on Thomas\'s left: seat 5. Qamar is on Usha\'s left: seat 6.',
          'Revathi is on Thomas\'s right (anticlockwise): seat 3. Vijay is on Prakash\'s left: seat 2.',
          'Sunita is on Prakash\'s right, anticlockwise from seat 1: seat 8. Wilson gets seat 7.',
          'Vijay is in seat 2, so the opposite seat is 2 + 4 = 6.',
        ],
        answer: 'Qamar',
      },
    ],
    traps: [
      {
        trap: 'Treating "left of X" as anticlockwise because it looks like left on the page.',
        fix: 'Facing the centre flips it: left is clockwise. Write the rule beside the diagram before you start.',
      },
      {
        trap: 'Counting "second to the left" as 2 seats but starting from the wrong person, or forgetting to wrap around past seat n.',
        fix: 'Compute seat numbers modulo n. Seat 8 + 2 clockwise lands on seat 2, not seat 10.',
      },
    ],
    check: {
      question:
        'Eight people sit around a circular table facing the centre. P sits third to the right of Q. Counting clockwise from Q, how many seats away is P?',
      options: ['3', '4', '5', '6'],
      correctIndex: 2,
      explanation:
        'Right is anticlockwise for people facing the centre, so P is 3 seats anticlockwise from Q. In a circle of 8 that is 8 − 3 = 5 seats clockwise.',
    },
  },
  {
    id: 'circular-arrangement-mixed-facing',
    title: 'Circular arrangement (mixed facing)',
    summary: 'Some face in, some face out: decide the rule for each person.',
    minutes: 9,
    keyIdea: [
      'The left/right rule is decided PERSON BY PERSON. Someone facing the centre has left = clockwise; someone facing outside has left = anticlockwise.',
      'The seat positions never move. Only the meaning of "left of X" and "right of X" changes with X\'s own facing. Opposite and "between" clues are unaffected by facing.',
      'Write each person\'s facing (in / out) next to their name as soon as it is given, and look at that tag before using any left/right clue about them.',
    ],
    formulas: [
      { label: 'X faces in', expr: 'Left of X = clockwise, Right of X = anticlockwise' },
      { label: 'X faces out', expr: 'Left of X = anticlockwise, Right of X = clockwise' },
      { label: 'Clue "A is left of B"', expr: 'Use B\'s facing (the person whose left it is), not A\'s' },
      { label: 'Opposite / between', expr: 'Pure seat geometry: independent of anyone\'s facing' },
      { label: 'Solving order', expr: 'Tag facings → anchor → opposite → left/right clues using the owner\'s rule' },
    ],
    table: {
      columns: ['X faces', 'Left of X', 'Right of X'],
      rows: [
        ['Centre (in)', 'Clockwise neighbour', 'Anticlockwise neighbour'],
        ['Outside (out)', 'Anticlockwise neighbour', 'Clockwise neighbour'],
      ],
    },
    shortcut: [
      'A person facing out sees the same room as you looking at the diagram from above, so for them left is simply anticlockwise on your page. Only the inward-facing ones need the flip.',
      'If a clue is about someone facing out, convert it to a clockwise/anticlockwise statement first, then place it. Never place a left/right clue directly.',
    ],
    examples: [
      {
        question:
          'Aditya, Bindu, Chandru, Devika, Elango and Fathima sit around a circular table. Aditya, Chandru and Devika face the centre; Bindu, Elango and Fathima face outside. Bindu sits to the immediate left of Aditya. Chandru sits second to the left of Aditya. Devika sits opposite Aditya. Fathima sits to the immediate right of Elango. Who sits to the immediate right of Fathima?',
        steps: [
          'Aditya faces in, so his left is clockwise. Anchor Aditya in seat 1: Bindu is in seat 2 and Chandru, second to the left, in seat 3.',
          'Devika is opposite Aditya: seat 4. Elango and Fathima share seats 5 and 6.',
          'Elango faces out, so his right is clockwise. Fathima is on his right: Elango in seat 5, Fathima in seat 6. (Elango in 6 would push Fathima into seat 1, which is taken.)',
          'Fathima also faces out, so her right is clockwise: seat 1.',
        ],
        answer: 'Aditya',
      },
      {
        question:
          'Gopal, Hari, Indu, Jeeva, Kamala, Latha, Murali and Nisha sit around a circular table. Gopal, Indu, Kamala and Murali face the centre; the other four face outside. Hari sits to the immediate left of Gopal. Indu sits second to the left of Gopal. Jeeva sits to the immediate left of Indu. Murali sits opposite Indu. Latha sits to the immediate left of Kamala. Who sits second to the right of Jeeva?',
        steps: [
          'Gopal faces in, so left is clockwise. Gopal in seat 1, Hari in seat 2, Indu (second to the left) in seat 3.',
          'Indu faces in: Jeeva, on her left, is in seat 4. Murali is opposite Indu: seat 7.',
          'Seats 5, 6, 8 remain for Kamala, Latha, Nisha. Kamala faces in, so Latha on her left is the next seat clockwise. Kamala in 8 puts Latha in seat 1 and Kamala in 6 puts Latha in seat 7, both taken. So Kamala is in seat 5, Latha in seat 6, Nisha in seat 8.',
          'Jeeva faces out, so his right is clockwise. Second to the right of seat 4 is seat 6.',
        ],
        answer: 'Latha',
      },
      {
        question:
          'Pavan, Qureshi, Rani, Sudha, Tilak and Uday sit around a circular table. Pavan, Qureshi, Rani and Sudha face the centre; Tilak and Uday face outside. Qureshi sits to the immediate left of Pavan. Tilak sits to the immediate left of Qureshi. Uday sits to the immediate right of Tilak. Rani sits second to the right of Pavan. Who sits opposite the person who is to the immediate left of Uday?',
        steps: [
          'Pavan faces in, so left is clockwise. Pavan in seat 1, Qureshi in seat 2. Qureshi also faces in, so Tilak, on his left, is in seat 3.',
          'Tilak faces out, so his right is clockwise. Uday is in seat 4.',
          'Rani is second to the right of Pavan, so 2 seats anticlockwise from seat 1: seat 5. Sudha takes seat 6.',
          'Uday faces out, so his left is anticlockwise: seat 3, which is Tilak.',
          'Opposite seat 3 in a circle of 6 is seat 6.',
        ],
        answer: 'Sudha',
      },
    ],
    traps: [
      {
        trap: 'Using one left/right rule for the whole table once you have learned "left is clockwise".',
        fix: 'That rule is only for people facing the centre. Check the facing tag of the person who OWNS the left or right.',
      },
      {
        trap: 'Applying the facing of the person named first in the clue ("A is to the left of B" uses A\'s facing).',
        fix: 'In "A sits to the left of B", the left belongs to B. Use B\'s facing to decide which neighbour A is.',
      },
    ],
    check: {
      question:
        'At a circular table, Meera faces outside and Nitin sits in the next seat clockwise from her. Is Nitin on Meera\'s left or right?',
      options: ['Her left', 'Her right', 'Directly opposite her', 'It depends on where Nitin faces'],
      correctIndex: 1,
      explanation:
        'For an outward-facing person, the right hand points clockwise. Nitin\'s own facing does not matter, because the left or right belongs to Meera.',
    },
  },
  {
    id: 'square-rectangular-table',
    title: 'Square / rectangular table',
    summary: 'Corners, sides and ends: sort out who sits where, then who faces what.',
    minutes: 9,
    keyIdea: [
      'A square or rectangular table is a circle with a shape. Seats still form a loop, so the same clockwise rule applies: facing the centre, left is clockwise.',
      'What is new is the TYPE of seat. Corners and middle-of-side seats can face different ways, and a rectangle has long sides and short ends. First learn how many seats of each type there are.',
      '"Opposite" means the seat directly across the table. For 4 or 8 seats around a square it is 2 or 4 seats away. On a rectangle the long sides mirror each other, so the first seat of one side faces the LAST seat of the other, and the two ends face each other.',
    ],
    formulas: [
      { label: 'Square, 4 people (one per side)', expr: 'Treat as a circle of 4: opposite = 2 seats away' },
      { label: 'Square, 8 people', expr: '4 corners + 4 side-middles, alternate around the loop; opposite = 4 seats away' },
      { label: 'Rectangle, 6 people (2 + 1 + 2 + 1)', expr: 'Seats 1-5, 2-4 (long sides, mirrored) and 3-6 (the two ends) are opposite pairs' },
      { label: 'Facing rule at each seat', expr: 'Faces in: left = clockwise.  Faces out: left = anticlockwise' },
      { label: 'Solving order', expr: 'Seat types → facings → opposite pairs → left/right clues' },
    ],
    table: {
      columns: ['Table', 'Seat count and types', 'Opposite is'],
      rows: [
        ['Square, 4 people', '1 per side, all face centre', '2 seats away'],
        ['Square, 8 people', '4 corners + 4 side-middles', '4 seats away'],
        ['Rectangle, 6 people', '2 per long side + 1 per short end', 'Seats 1-5, 2-4, 3-6'],
        ['Rectangle, 8 people', '3 per long side + 1 per short end', 'Seats 1-7, 2-6, 3-5, 4-8'],
      ],
    },
    shortcut: [
      'Number the seats clockwise from 1 and write the seat type beside each number once. After that it is just the circular-table method.',
      'On a rectangle the two ends of the table are identical, so rotating the whole answer by half a turn gives the same seating. Use that freedom to place your anchor wherever is convenient.',
    ],
    examples: [
      {
        question:
          'Ramesh, Sangeetha, Tamil and Uthra sit at a square table, one on each side, all facing the centre. Sangeetha sits to the immediate left of Ramesh. Tamil sits opposite Sangeetha. Who sits to the immediate right of Ramesh?',
        steps: [
          'Four seats, all facing the centre, so left is clockwise. Anchor Ramesh in seat 1.',
          'Sangeetha is on Ramesh\'s left: seat 2.',
          'Tamil is opposite Sangeetha, 2 seats away: seat 4. Uthra takes seat 3.',
          'Ramesh\'s right is anticlockwise, which is seat 4.',
        ],
        answer: 'Tamil',
      },
      {
        question:
          'Anbu, Balu, Cheran, Divya, Elavarasi and Fazil sit around a rectangular table: two on each long side and one at each short end, all facing the centre. Cheran and Fazil sit at the two short ends. Anbu and Balu sit on the same long side. Cheran sits to the immediate left of Balu. Elavarasi sits opposite Balu. Who sits opposite Anbu?',
        steps: [
          'Going clockwise the seats are: long side (2 seats), short end, long side (2 seats), short end. Number them 1 to 6, with seats 3 and 6 as the short ends. Seats 1 and 2 are the first long side (west to east), 4 and 5 the second (east to west), so the opposite pairs are 1-5, 2-4 and 3-6.',
          'Everyone faces the centre, so Cheran, on Balu\'s left, is the next seat clockwise from Balu. The only long-side seat followed by a short end is the second seat of a side, so Balu is in seat 2 and Cheran in seat 3.',
          'Anbu is on the same long side as Balu: seat 1. Fazil is the other short end: seat 6.',
          'Elavarasi is opposite Balu (seat 2): seat 4. Divya takes seat 5.',
          'Opposite Anbu (seat 1) is seat 5.',
        ],
        answer: 'Divya',
      },
      {
        question:
          'Pavan, Rekha, Satish, Tara, Umesh, Veena, Wasim and Yogesh sit around a square table. Pavan, Satish, Umesh and Wasim sit at the corners and face outside; Rekha, Tara, Veena and Yogesh sit at the middle of the sides and face the centre. Yogesh sits to the immediate left of Pavan. Satish sits second to the right of Pavan. Tara sits opposite Yogesh. Wasim sits opposite Satish. Veena sits to the immediate right of Umesh. Who sits to the immediate left of Veena?',
        steps: [
          'Corners and side-middles alternate around the table. Number clockwise from Pavan in seat 1, so corners are the odd seats and side-middles the even seats.',
          'Pavan faces out, so his left is anticlockwise: Yogesh in seat 8. His right is clockwise, so Satish, second to the right, is in seat 3.',
          'Tara is opposite Yogesh (seat 8): seat 4. Wasim is opposite Satish (seat 3): seat 7. The remaining corner, Umesh, takes seat 5.',
          'Umesh faces out, so his right is clockwise: Veena is in seat 6. Rekha takes seat 2.',
          'Veena faces the centre, so her left is clockwise: seat 7.',
        ],
        answer: 'Wasim',
      },
    ],
    traps: [
      {
        trap: 'Treating corner and side-middle people as if they always face the same way.',
        fix: 'Read the facing for each seat type from the question. A common set-up is corners facing out and side-middles facing the centre.',
      },
      {
        trap: 'Taking "opposite" to mean the seat on the other side regardless of table shape.',
        fix: 'On a square, count n/2 seats around the loop. On a rectangle, mirror the long sides (first seat faces the last seat of the other side) and pair the two ends with each other.',
      },
    ],
    check: {
      question:
        'A rectangular table has two people on each long side and one at each short end, all facing the centre. P sits at a short end. Who sits opposite P?',
      options: [
        'The other person at a short end',
        'A person on one of the long sides',
        'Nobody, because P is at an end',
        'Both long-side persons on that side',
      ],
      correctIndex: 0,
      explanation:
        'The short ends are seats 3 and 6 around the loop, and they face each other across the table. Long-side seats pair up with each other (1-5 and 2-4), never with an end seat.',
    },
  },
  {
    id: 'multi-variable-arrangement',
    title: 'Multi-variable arrangement',
    summary: 'Seats plus a second attribute: colours, jobs, cities.',
    minutes: 10,
    keyIdea: [
      'Here every person has a seat AND one or more attributes (colour, profession, city). The clues mix both: "the Doctor sits in the middle", "Meena is from Salem".',
      'Treat it as a grid: seats down the side, attributes across the top. The aim is to link each attribute to a seat, and each seat to a name.',
      'Fix seats first wherever you can, using the position-only clues. Then glue attributes on with the clues that name a person and an attribute together.',
    ],
    formulas: [
      { label: 'Setup', expr: 'Draw the seats; make one line per attribute (Name / Colour / City) under each seat' },
      { label: 'Direct clue', expr: '"X is from Y": write Y under X at once, in pen' },
      { label: 'Positional clue on an attribute', expr: '"The Doctor sits at the left end": the seat is fixed, the name is not yet' },
      { label: 'Elimination', expr: 'Each name and each attribute value is used exactly once, so cross off as you place' },
      { label: 'Solving order', expr: 'Fixed seats → direct links → attribute-position clues → elimination → verify every clue' },
    ],
    table: {
      columns: ['Clue type', 'What it gives'],
      rows: [
        ['Name at a fixed seat', 'A seat number for a name'],
        ['Attribute at a fixed seat', 'A seat number for an attribute (name still unknown)'],
        ['"X is the Doctor"', 'A direct link, so merge the two'],
        ['"Not" clue', 'Only a cross; use it last to split two leftovers'],
      ],
    },
    shortcut: [
      'Whenever one clue gives a seat to an attribute and another clue gives the same seat to a name, merge them: you now know that name has that attribute.',
      'When you finish, read every clue once more against the final table. Multi-clue puzzles reward a ten-second verification.',
    ],
    examples: [
      {
        question:
          'Arjun, Bhuvan, Charu and Dev sit in a row facing north. Each wears a different colour: Red, Blue, Green or Yellow. Bhuvan sits at the right end. Dev sits to the immediate left of Bhuvan. The person in Red sits at the left end. Arjun wears Blue. The person in Green sits next to Arjun. What colour does Bhuvan wear?',
        steps: [
          'Facing north, left is west. Bhuvan is at the right end (seat 4) and Dev is immediately to his left (seat 3).',
          'Arjun and Charu fill seats 1 and 2. The person in Red sits at the left end (seat 1). Arjun wears Blue, so he cannot be there: Charu is in seat 1 in Red, and Arjun is in seat 2.',
          'The person in Green sits next to Arjun. Arjun\'s neighbours are Charu (already Red) and Dev, so Dev wears Green.',
          'Only Yellow is left, and the only person without a colour is Bhuvan.',
        ],
        answer: 'Yellow',
      },
      {
        question:
          'Esha, Farhan, Geetha, Harish and Indira sit in a row facing north. Their professions are Doctor, Engineer, Teacher, Lawyer and Pilot, one each. The Doctor sits exactly in the middle. Geetha, the Teacher, sits at the left end. Farhan, the Engineer, sits at the right end. The Pilot sits to the immediate right of the Teacher. Esha sits to the immediate left of Indira. Harish sits to the immediate left of Farhan. Who is the Pilot?',
        steps: [
          'Seats 1 to 5, left to right. Geetha (Teacher) is in seat 1 and Farhan (Engineer) in seat 5. The Doctor is in seat 3.',
          'The Pilot is immediately right of the Teacher: seat 2. Harish is immediately left of Farhan: seat 4.',
          'Esha and Indira have seats 2 and 3, with Esha immediately left of Indira: Esha in seat 2, Indira in seat 3.',
          'So Esha, in seat 2, is the Pilot. Indira (seat 3) is the Doctor and Harish (seat 4) is the Lawyer.',
        ],
        answer: 'Esha',
      },
      {
        question:
          'Jagan, Kavya, Lokesh, Madhu, Naveen and Oviya sit around a circular table facing the centre. They come from six different cities: Chennai, Madurai, Salem, Trichy, Erode and Theni. Kavya sits to the immediate left of Jagan. Lokesh sits second to the left of Jagan. Madhu sits opposite Jagan. Oviya sits to the immediate right of Jagan. Kavya is from Madurai. The person from Chennai sits to the immediate right of Kavya. The person from Trichy sits opposite the person from Chennai. The person from Theni sits to the immediate left of Naveen. Naveen is not from Salem. Who is from Salem?',
        steps: [
          'Facing the centre, left is clockwise. Anchor Jagan in seat 1: Kavya in seat 2, Lokesh in seat 3, Madhu opposite in seat 4, Oviya on his right (anticlockwise) in seat 6. Naveen takes seat 5.',
          'Cities: Kavya (seat 2) is from Madurai. Chennai is on Kavya\'s right, anticlockwise, which is seat 1: Jagan is from Chennai.',
          'Trichy is opposite Chennai: seat 4, so Madhu is from Trichy.',
          'Theni is on Naveen\'s left, clockwise from seat 5: seat 6, so Oviya is from Theni.',
          'Lokesh and Naveen share Salem and Erode. Naveen is not from Salem, so Lokesh is from Salem and Naveen from Erode.',
        ],
        answer: 'Lokesh',
      },
    ],
    traps: [
      {
        trap: 'Guessing when two attributes seem to fit and then forcing later clues to match.',
        fix: 'Only place what a clue forces. Keep doubtful cases as a short list beside the slot and let elimination settle them.',
      },
      {
        trap: 'Mixing up an attribute-position clue ("the Doctor is in the middle") with a name-position clue.',
        fix: 'Write the clue under the seat as an attribute, not a name. Merge it with a name only when another clue connects them.',
      },
    ],
    check: {
      question:
        'Four people sit in a row facing north, wearing Red, Blue, Green and Yellow, one each. The Red wearer is at the left end and the Blue wearer is at the right end. Green is not next to Red. What colour does the person in the second seat from the left wear?',
      options: ['Red', 'Blue', 'Green', 'Yellow'],
      correctIndex: 3,
      explanation:
        'Red is in seat 1 and Blue in seat 4. Green is not next to Red, so it cannot be in seat 2: Green is in seat 3 and Yellow in seat 2.',
    },
  },
];
