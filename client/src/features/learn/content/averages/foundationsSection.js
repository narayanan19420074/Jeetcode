// Averages section 1: base formula, missing value and the Sum/Count/Average triad.
export const foundationsSection = {
  id: 'foundations',
  title: 'Foundations',
  subsections: [
    {
      id: 'average-formula',
      title: 'The Average Formula',
      visualKey: 'barAverage',
      pattern:
        'Question lists a set of values and asks for the average. This is the base case — everything else builds on it.',
      formula: 'Average = Sum ÷ Count\nSum = Average × Count   (the form you will use 80% of the time)',
      examples: [
        {
          question: 'Find the average of 12, 18, 24, and 30.',
          steps: ['Sum = 12 + 18 + 24 + 30 = 84', 'Count = 4', 'Average = 84 ÷ 4 = 21'],
          answer: '21',
        },
        {
          question: 'The average weight of 6 boys is 45 kg. Find their total weight.',
          steps: ['Sum = Average × Count', 'Sum = 45 × 6', 'Sum = 270 kg'],
          answer: '270 kg',
        },
      ],
      trap:
        'Do not compute the average of the values you have if the question asks for a sum — flip the formula. Most exam questions ask for Sum, not Average.',
      checks: [
        {
          id: 'avg-check-1a',
          level: 'quick',
          question: 'Find the average of 7, 14, 21, and 28.',
          options: ['16.5', '17.5', '18.5', '19.5'],
          correctIndex: 1,
          explanation: 'Sum = 70, count = 4. Average = 70 ÷ 4 = 17.5.',
        },
        {
          id: 'avg-check-1b',
          level: 'challenge',
          question: 'The average of 8 numbers is 20. If one number is removed, the average of the remaining 7 becomes 21. What was the removed number?',
          options: ['7', '13', '18', '20'],
          correctIndex: 1,
          explanation: 'Original sum = 160. New sum = 21 × 7 = 147. Removed = 160 − 147 = 13.',
        },
      ],
    },
    {
      id: 'missing-value',
      title: 'Working Backwards — Find the Missing Value',
      visualKey: 'missingLine',
      pattern:
        'Question gives you the average of n values and n−1 of them, then asks for the unknown. This is the single most common Averages question in exams.',
      formula: 'Required Sum = Average × Count\nMissing value = Required Sum − Sum of known values',
      examples: [
        {
          question: 'The average of 5 numbers is 18. Four of them are 10, 15, 20, and 25. Find the fifth.',
          steps: ['Required sum = 18 × 5 = 90', 'Known sum = 70', 'Missing = 90 − 70 = 20'],
          answer: '20',
        },
        {
          question: 'Average marks of 3 students is 70. Two of them scored 65 and 75. Find the third.',
          steps: ['Required sum = 70 × 3 = 210', 'Known sum = 140', 'Third = 210 − 140 = 70'],
          answer: '70',
        },
      ],
      trap:
        'Do NOT average the known values and subtract from the overall average. Always convert to the total (Sum = Average × Count) first.',
      checks: [
        {
          id: 'avg-check-2a',
          level: 'quick',
          question: 'The average of 6 numbers is 12. The sum of 5 of them is 55. Find the sixth.',
          options: ['15', '17', '19', '21'],
          correctIndex: 1,
          explanation: 'Required total = 12 × 6 = 72. Sixth = 72 − 55 = 17.',
        },
        {
          id: 'avg-check-2b',
          level: 'challenge',
          question: 'The average age of 5 friends is 24 years. When the youngest is excluded, the average of the rest becomes 26. Find the youngest friend\'s age.',
          options: ['12 years', '14 years', '16 years', '18 years'],
          correctIndex: 2,
          explanation: 'Original sum = 24 × 5 = 120. Remaining sum = 26 × 4 = 104. Youngest = 120 − 104 = 16.',
        },
      ],
    },
    {
      id: 'triad',
      title: 'Sum, Count, Average — Know Two, Find the Third',
      visualKey: 'triadTriangle',
      pattern:
        'Any of the three can be the unknown. Once you have two, the third follows.',
      formula:
        'Given Sum & Count  →  Average = Sum ÷ Count\nGiven Average & Count  →  Sum = Average × Count\nGiven Sum & Average  →  Count = Sum ÷ Average',
      examples: [
        {
          question: 'Sum = 240, Average = 30. Find the count.',
          steps: ['Count = Sum ÷ Average', 'Count = 240 ÷ 30', 'Count = 8'],
          answer: '8',
        },
        {
          question: 'A group has 15 members with a total weight of 900 kg. Find the average.',
          steps: ['Average = Sum ÷ Count', 'Average = 900 ÷ 15', 'Average = 60 kg'],
          answer: '60 kg',
        },
      ],
      trap:
        'Never mix up which formula applies. Write down what the question gives you (Sum, Count, or Average) and what it wants — then match the formula.',
      checks: [
        {
          id: 'avg-check-3a',
          level: 'quick',
          question: 'Total marks = 480, average = 60. How many students?',
          options: ['6', '8', '10', '12'],
          correctIndex: 1,
          explanation: 'Count = 480 ÷ 60 = 8.',
        },
        {
          id: 'avg-check-3b',
          level: 'challenge',
          question: 'The sum of a set of numbers is 720 and their average is 45. How many numbers are in the set?',
          options: ['14', '15', '16', '18'],
          correctIndex: 2,
          explanation: 'Count = 720 ÷ 45 = 16.',
        },
      ],
    },
  ],
};
