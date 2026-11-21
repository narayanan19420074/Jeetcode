// Learn content for the Blood Relations pattern — one lesson per sub-pattern.
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
//
// Convention used in every lesson: siblings are full siblings (they share both
// parents), and a married couple's children are the children of both.

export const bloodRelationsLessons = [
  {
    id: "direct-relations",
    title: "Direct relations",
    summary: "Chain 'father's brother's son' one link at a time.",
    minutes: 7,
    keyIdea: [
      "Every blood-relation sentence is a chain of simple links: father, mother, brother, sister, son, daughter, husband, wife. Start at the person named first and walk the chain one link at a time, writing the gender of each person you reach.",
      "Most answers come from a small set of fixed terms. Father's side and mother's side give different words in Indian languages (chacha vs mama, bua vs mausi), so always note which parent the chain passes through.",
      "Words such as cousin, sibling, child, parent and spouse do not reveal gender. Only terms like uncle, aunt, brother, sister, son and daughter do. Use a gender only when the question gives it or the term fixes it.",
    ],
    formulas: [
      { label: "Father's brother / sister", expr: "Chacha (uncle) / Bua (aunt)" },
      { label: "Mother's brother / sister", expr: "Mama (uncle) / Mausi (aunt)" },
      { label: "Child of uncle or aunt", expr: "Cousin (gender of the child decides brother or sister)" },
      { label: "Spouse's family", expr: "Wife's brother = Saala. Spouse's parents = in-laws" },
    ],
    table: {
      columns: ["Phrase", "Relation"],
      rows: [
        ["Father's brother", "Chacha (paternal uncle)"],
        ["Father's sister", "Bua (paternal aunt)"],
        ["Mother's brother", "Mama (maternal uncle)"],
        ["Mother's sister", "Mausi (maternal aunt)"],
        ["Wife's brother", "Saala (brother-in-law)"],
        ["Sister's husband", "Brother-in-law"],
        ["Wife's mother", "Mother-in-law"],
        ["Brother's son / daughter", "Nephew / Niece"],
      ],
    },
    shortcut: [
      "Write the chain as a list of single steps and shrink it from the left: father's brother's son = (uncle)'s son = cousin. Never try to solve it in one jump.",
      "A relative of your parent who is not your parent is one generation up (uncle or aunt). Their children are on your level (cousins). Their grandchildren are one generation down.",
    ],
    examples: [
      {
        question: "Deepa is the mother of Karthik. Karthik's wife is Meena. How is Deepa related to Meena?",
        steps: [
          "Deepa is the mother of Karthik, and Karthik is the husband of Meena.",
          "So Deepa is the mother of Meena's husband.",
          "A husband's mother is a mother-in-law.",
        ],
        answer: "Mother-in-law",
      },
      {
        question: "Kavin's wife's brother is Mohan. Mohan's mother is Revathi. How is Revathi related to Kavin?",
        steps: [
          "Mohan is the brother of Kavin's wife, so Mohan and Kavin's wife are siblings.",
          "Siblings share a mother, so Revathi is the mother of Kavin's wife.",
          "A wife's mother is Kavin's mother-in-law.",
        ],
        answer: "Mother-in-law",
      },
      {
        question: "Lakshmi is a girl. Her mother's brother is Gopal, and Gopal's daughter is Priya. How is Priya related to Lakshmi?",
        steps: [
          "Lakshmi's mother's brother is Lakshmi's mama, so Gopal is her maternal uncle.",
          "Priya is the daughter of Lakshmi's mama, which makes her Lakshmi's cousin.",
          "Priya is a daughter, so she is a female cousin: a cousin sister.",
        ],
        answer: "Cousin sister (maternal cousin)",
      },
    ],
    traps: [
      {
        trap: "Calling 'my father's only brother' my father or my brother.",
        fix: "A brother of your father is one generation above you: he is your uncle (chacha). 'Only' just says there is exactly one such person.",
      },
      {
        trap: "Assuming a gender for neutral words such as cousin, sibling or child.",
        fix: "Give a gender only when the question states it. Priya the daughter of an uncle is a cousin sister; an unnamed child of an uncle is just a cousin.",
      },
    ],
    check: {
      question: "Priya says, 'Anil is the son of my mother's only sister.' How is Anil related to Priya?",
      options: ["Maternal uncle (mama)", "Nephew", "Cousin brother", "Brother"],
      correctIndex: 2,
      explanation: "Priya's mother's sister is her mausi. Her mausi's son is a cousin, and Anil is male, so he is a cousin brother.",
    },
  },
  {
    id: "coded-relations",
    title: "Coded relations",
    summary: "Decode symbols such as + and − into links, then chain them.",
    minutes: 8,
    keyIdea: [
      "In a coded question each symbol stands for one relation. The question defines the code every time, so never rely on a code you remember from another question.",
      "Read the expression in pairs from left to right. Each pair (X symbol Y) means 'X is the ___ of Y'. Write every pair out as a plain sentence, build the small family, and then answer for the FIRST and LAST person.",
      "Siblings share parents. If Q is the brother of R and P is the mother of Q, then P is also the mother of R.",
    ],
    formulas: [
      { label: "Pair rule", expr: "X symbol Y = 'X is the ___ of Y'" },
      { label: "Order", expr: "Decode left to right, one pair at a time" },
      { label: "Asked relation", expr: "Relation of the FIRST letter to the LAST letter" },
      { label: "Siblings share parents", expr: "Q is a sibling of R, P is a parent of Q, so P is a parent of R" },
    ],
    table: {
      columns: ["Sample code", "Meaning"],
      rows: [
        ["A + B", "A is the father of B"],
        ["A − B", "A is the sister of B"],
        ["A × B", "A is the wife of B"],
        ["A ÷ B", "A is the brother of B"],
      ],
    },
    shortcut: [
      "Rewrite each pair as 'X → Y: relation' on rough paper before building anything. Five seconds of decoding prevents most mistakes.",
      "A brother or sister link keeps the generation the same; father, mother, son and daughter links move one generation. Count the moves to sanity-check your answer.",
    ],
    examples: [
      {
        question: "In a code, A + B means 'A is the mother of B' and A − B means 'A is the brother of B'. In P + Q − R, how is P related to R?",
        steps: [
          "P + Q means P is the mother of Q.",
          "Q − R means Q is the brother of R, so Q and R are siblings.",
          "A mother of one sibling is the mother of the other, so P is the mother of R.",
        ],
        answer: "P is the mother of R",
      },
      {
        question: "In a code, A $ B means 'A is the father of B', A % B means 'A is the sister of B' and A & B means 'A is the wife of B'. In M $ N % O & P, how is M related to P?",
        steps: [
          "M $ N: M is the father of N.",
          "N % O: N is the sister of O, so O is a child of M as well.",
          "O & P: O is the wife of P, so O is a woman and P is her husband.",
          "M is the father of O, and O is the wife of P. M is therefore P's father-in-law.",
        ],
        answer: "Father-in-law",
      },
      {
        question: "In a code, A @ B means 'A is the daughter of B', A # B means 'A is the brother of B' and A * B means 'A is the mother of B'. In R @ S # T * U, how is R related to U?",
        steps: [
          "R @ S: R is the daughter of S, so R is female.",
          "S # T: S is the brother of T, so S is male and T's sibling.",
          "T * U: T is the mother of U.",
          "S is the brother of U's mother, so S is U's mama. R is S's daughter, so R is U's cousin, and R is female.",
        ],
        answer: "Cousin sister",
      },
    ],
    traps: [
      {
        trap: "Reading the symbols with a meaning from a different question.",
        fix: "Codes change from question to question. Copy the definition of each symbol before you start.",
      },
      {
        trap: "Reversing a pair: reading 'A − B' as 'B is the sister of A'.",
        fix: "The left letter is always the one described. 'A − B' (sister) says A is the sister of B. Check the direction on every pair.",
      },
    ],
    check: {
      question: "In a code, A + B means 'A is the father of B' and A − B means 'A is the sister of B'. In P − Q + R, how is P related to R?",
      options: ["Mother", "Aunt (father's sister)", "Sister", "Grandmother"],
      correctIndex: 1,
      explanation: "P − Q: P is the sister of Q. Q + R: Q is the father of R. P is the sister of R's father, so she is R's bua (paternal aunt).",
    },
  },
  {
    id: "family-tree-puzzles",
    title: "Family tree puzzles",
    summary: "Draw the tree from several clues, then read the answer off it.",
    minutes: 8,
    keyIdea: [
      "When a puzzle names many people, do not hold the relations in your head. Draw a tree: couples side by side joined by =, children one row below, and people of the same generation on the same row.",
      "Place each clue on the tree exactly as stated. Add no extra people. The answer should be a path between two points of the tree that you can trace with a finger.",
      "Mark gender next to each name (+ male, − female) the moment a clue reveals it, for example from 'wife', 'son' or 'only daughter'.",
    ],
    formulas: [
      { label: "Couple", expr: "Husband (+) = Wife (−) on the same row" },
      { label: "Children", expr: "Drawn one row below the couple" },
      { label: "Siblings", expr: "Same row, same parents" },
      { label: "Gender marks", expr: "+ male, − female" },
    ],
    table: {
      columns: ["Clue", "What to draw"],
      rows: [
        ["X and Y are married", "Side by side, joined with ="],
        ["X's only son", "One male child below X"],
        ["X's brother", "Same row as X, same parents"],
        ["X's wife", "Next to X, joined with =, female"],
      ],
    },
    shortcut: [
      "Start from the clue that names the oldest generation and build downward. Later clues then attach to people already on the page.",
      "To find a relation between two people, climb to their nearest common ancestor, then count the steps down each side. Equal steps on both sides means cousins or siblings.",
    ],
    examples: [
      {
        question: "Mohan is married to Sita. Ravi is the son of Mohan and Sita. Anu is Ravi's wife, and Kiran is the son of Ravi and Anu. Devi is the daughter of Mohan and Sita. How is Devi related to Kiran?",
        steps: [
          "Top row: Mohan (+) = Sita (−). Below them: Ravi (+) and Devi (−), who are siblings.",
          "Ravi = Anu (−), and their son is Kiran (+) one row further down.",
          "Devi is the sister of Kiran's father Ravi, so she is Kiran's bua (paternal aunt).",
        ],
        answer: "Paternal aunt (bua)",
      },
      {
        question: "Arun and Bhavani are a married couple; Arun is the husband. Chandru is their only son. Divya is Chandru's wife, and Esha is the daughter of Chandru and Divya. Who is Esha's paternal grandmother?",
        steps: [
          "Arun (+) = Bhavani (−) on the top row. Their only son Chandru (+) is on the second row.",
          "Chandru = Divya (−), and Esha (−) is their daughter on the third row.",
          "Esha's paternal grandmother is her father's mother. Her father is Chandru, whose mother is Bhavani.",
        ],
        answer: "Bhavani",
      },
      {
        question: "Gopal is the husband of Hema. Ilan is their only son. Jaya is Ilan's wife. Kumar is Jaya's brother, and Latha is Kumar's daughter. Mani is the only child of Ilan and Jaya, and Mani is a boy. How is Latha related to Mani?",
        steps: [
          "Gopal (+) = Hema (−); below them Ilan (+). Ilan = Jaya (−) with child Mani (+).",
          "Kumar (+) is Jaya's brother, so Kumar is on Jaya's row. Latha (−), his daughter, is one row below.",
          "Mani's mother Jaya is the sister of Kumar, so Kumar is Mani's mama.",
          "Latha is the daughter of Mani's mama, which makes her Mani's cousin. She is a daughter, so she is a cousin sister.",
        ],
        answer: "Cousin sister (maternal cousin)",
      },
    ],
    traps: [
      {
        trap: "Adding people the puzzle never mentions, such as a mother for someone with no stated mother.",
        fix: "Draw only what the clues give. A relation that needs an unstated person cannot be asked.",
      },
      {
        trap: "Putting a brother's wife on the same row as the brother's parents.",
        fix: "A wife joins her husband's row, joined to him by =. Her own parents are not part of the tree unless a clue names them.",
      },
    ],
    check: {
      question: "Sundar is the only son of Raman and Uma. Sundar's wife is Vani, and their daughter is Anitha. How is Raman related to Anitha?",
      options: ["Maternal grandfather", "Paternal grandfather", "Father", "Uncle"],
      correctIndex: 1,
      explanation: "Raman is the father of Sundar, and Sundar is the father of Anitha. Raman is Anitha's father's father: her paternal grandfather.",
    },
  },
  {
    id: "pointing-to-photo-problems",
    title: "Pointing-to-photo problems",
    summary: "'Her mother is my mother's only daughter': who is the speaker really talking about?",
    minutes: 8,
    keyIdea: [
      "In these problems a speaker points at a person and describes them through the speaker's own family: 'He is the son of my mother's only son'. Resolve the phrase that involves the speaker first.",
      "Phrases such as 'my mother's only daughter' often loop back to the speaker. That depends on the speaker's gender: a female speaker is her mother's only daughter, while a male speaker means his sister.",
      "The answer is the relation of the pointed person TO the speaker. Reversing the direction swaps the term (a son becomes a mother, a nephew becomes an uncle).",
    ],
    formulas: [
      { label: "Resolve first", expr: "Replace 'my mother's only daughter' by the real person" },
      { label: "Direction", expr: "Answer = pointed person's relation to the speaker" },
      { label: "Only child", expr: "'Only' means exactly one such child: the speaker can be that one" },
      { label: "Speaker's gender", expr: "Decides whether the phrase points back to the speaker" },
    ],
    table: {
      columns: ["Phrase", "Female speaker", "Male speaker"],
      rows: [
        ["My mother's only daughter", "Myself", "My sister"],
        ["My mother's only son", "My brother", "Myself"],
        ["My father's only son", "My brother", "Myself"],
        ["My father's only daughter", "Myself", "My sister"],
      ],
    },
    shortcut: [
      "Underline the part of the sentence that mentions 'my'. Solve that part first and give it a name on paper. The rest is an ordinary chain.",
      "If the sentence works only when the phrase equals the speaker, the question is built around that loop. Test it before looking for a new person.",
    ],
    examples: [
      {
        question: "Pointing to a boy in a photograph, Meena says, 'He is the son of my mother's only son.' How is the boy related to Meena?",
        steps: [
          "Meena is female. Her mother's only son is a male child of Meena's mother, so he is Meena's brother.",
          "The boy is the son of Meena's brother.",
          "A brother's son is a nephew.",
        ],
        answer: "Nephew",
      },
      {
        question: "Pointing to a man in a photograph, Sunita says, 'His mother is the only daughter of my mother.' How is the man related to Sunita?",
        steps: [
          "Sunita is female and a daughter of her mother. If her mother has only one daughter, that daughter is Sunita herself.",
          "So the man's mother is Sunita.",
          "The man is Sunita's son.",
        ],
        answer: "Son",
      },
      {
        question: "Pointing to a man in a photograph, Latha says, 'He is the brother of the daughter of my mother's only brother.' How is the man related to Latha? (Latha is female.)",
        steps: [
          "Latha's mother's brother is her mama. His daughter is Latha's cousin.",
          "The man is a brother of that daughter, so he is also a child of Latha's mama.",
          "He is male, so he is Latha's cousin brother (maternal cousin).",
        ],
        answer: "Cousin brother (maternal cousin)",
      },
    ],
    traps: [
      {
        trap: "Treating 'my mother's only daughter' as a different person even when the speaker is female.",
        fix: "A female speaker who is the only daughter is that person. Check the speaker's gender and the word 'only' before searching for a new relative.",
      },
      {
        trap: "Answering the relation of the speaker to the photo instead of the photo to the speaker.",
        fix: "Read the question's direction. 'How is the man related to Sunita?' asks what the man is to her: her son, not her mother.",
      },
    ],
    check: {
      question: "Pointing to a man, Rekha says, 'He is the husband of my mother's only daughter.' (Rekha is female.) How is the man related to Rekha?",
      options: ["Brother-in-law", "Husband", "Brother", "Son-in-law"],
      correctIndex: 1,
      explanation: "Rekha is female, so her mother's only daughter is Rekha herself. The man is the husband of Rekha.",
    },
  },
  {
    id: "generation-chain",
    title: "Generation chain",
    summary: "Count generations up and down to name the relation.",
    minutes: 7,
    keyIdea: [
      "Give every person a generation level relative to the person in the question. Moving to a parent adds one level up, moving to a child adds one level down, and moving to a brother, sister or spouse stays on the same level.",
      "The final level tells you the family of the answer: two up is a grandparent, one up is a parent or an uncle or aunt, level zero is a sibling or cousin, one down is a child or nephew or niece, two down is a grandchild.",
      "Level alone does not give the exact term. Add the side (father's or mother's) and the gender stated in the question to pick the exact word.",
    ],
    formulas: [
      { label: "Grandparents", expr: "+2 levels" },
      { label: "Parents, uncles, aunts", expr: "+1 level" },
      { label: "You, siblings, cousins, spouse", expr: "0 levels" },
      { label: "Children, nephews, nieces", expr: "−1 level" },
    ],
    table: {
      columns: ["Relative", "Level"],
      rows: [
        ["Great-grandfather", "+3"],
        ["Grandfather / Grandmother", "+2"],
        ["Father / Mother / Mama / Bua", "+1"],
        ["Brother / Cousin / Husband / Wife", "0"],
        ["Son / Nephew / Niece", "−1"],
        ["Grandson / Granddaughter", "−2"],
      ],
    },
    shortcut: [
      "Write the chain as +1, +1, 0, −1 and so on. Add the numbers, then match the total with the table. A total of 0 reached by going up and down through different families means cousin.",
      "If a sibling link sits between two people, treat both as the same generation and give them the same parents. The sibling's child is one level down from you.",
    ],
    examples: [
      {
        question: "A is the father of B. B is the mother of C. C is the brother of D. How is A related to D?",
        steps: [
          "C and D are siblings, so B is the mother of D as well as of C.",
          "A is the father of B, and B is D's mother. So A is D's mother's father.",
          "That is two levels up on the mother's side: a maternal grandfather.",
        ],
        answer: "Maternal grandfather",
      },
      {
        question: "Ganesh is the father of Hari's father. Hari's sister is Indu, and Indu's son is Jagan. How is Ganesh related to Jagan?",
        steps: [
          "Ganesh is Hari's father's father: two levels above Hari and Indu.",
          "Indu is Hari's sister, so she is on Hari's level. Her son Jagan is one level below her.",
          "Ganesh is two levels above Indu and Jagan is one below Indu, which makes three levels between them. Ganesh is male.",
        ],
        answer: "Great-grandfather",
      },
      {
        question: "Pooja is a girl. Pooja's mother's father has only one son, and that son's daughter is Reena. How is Reena related to Pooja?",
        steps: [
          "Pooja → mother: +1. Mother → mother's father: +1 (now at +2).",
          "Mother's father → his only son: −1 (now at +1). That son is Pooja's mama.",
          "His son → daughter Reena: −1 (now at 0). Level 0 through an uncle's family means cousin.",
          "Reena is a daughter, so she is Pooja's cousin sister.",
        ],
        answer: "Cousin sister (maternal cousin)",
      },
    ],
    traps: [
      {
        trap: "Counting siblings as a generation step.",
        fix: "A brother or sister is on your own level. Only parent and child links move the level.",
      },
      {
        trap: "Saying plain 'grandfather' without the side when the options distinguish paternal and maternal.",
        fix: "Note whether the chain goes through a father or a mother. The first link from the starting person decides the side.",
      },
    ],
    check: {
      question: "P is the mother of Q. Q is the father of R. R is the sister of S. How is P related to S?",
      options: ["Paternal grandmother", "Maternal grandmother", "Mother", "Aunt"],
      correctIndex: 0,
      explanation: "R and S are siblings, so Q is also S's father. P is the mother of Q, which makes her S's father's mother: the paternal grandmother.",
    },
  },
];
