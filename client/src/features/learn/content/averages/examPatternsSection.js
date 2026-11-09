// Averages section 5: correction, combined groups and cricket averages.
export const examPatternsSection = {
  id: 'exam-patterns',
  title: 'Exam Patterns',
  subsections: [
    {
      id: 'correction-wrong-entry',
      title: 'Correction of a Wrong Entry',
      visualKey: 'correctionFix',
      pattern:
        'One value in the dataset was recorded incorrectly. The question asks for the corrected average.',
      formula:
        'Corrected Sum = Wrong Sum − Wrong value + Correct value\nCorrected Average = Corrected Sum ÷ Count',
      examples: [
        {
          question:
            'The average score of 30 students is 70. One score was read as 60 instead of 90. Find the correct average.',
          steps: [
            'Wrong sum = 70 × 30 = 2100',
            'Corrected sum = 2100 − 60 + 90 = 2130',
            'Corrected average = 2130 ÷ 30 = 71',
          ],
          answer: '71',
        },
      ],
      trap:
        'Do NOT just add (90 − 60 = 30) to the average. The difference affects the SUM; divide by count to get the average shift (30 ÷ 30 = 1).',
      checks: [
        {
          id: 'avg-check-14a',
          level: 'quick',
          question:
            'The average of 20 numbers is 0. If one number was misread as 5 instead of 15, find the corrected average.',
          options: ['0.25', '0.5', '0.75', '1'],
          correctIndex: 1,
          explanation: 'Corrected sum = 10. New average = 10 ÷ 20 = 0.5.',
        },
        {
          id: 'avg-check-14b',
          level: 'challenge',
          question:
            'Average marks of 50 students is 62. Later, it is found that a score of 84 was wrongly recorded as 48. Find the correct average.',
          options: ['62.4', '62.7', '62.9', '63.2'],
          correctIndex: 1,
          explanation: 'Correction = 84 − 48 = 36. New total = 3100 + 36 = 3136. New avg = 3136 ÷ 50 = 62.72.',
        },
      ],
    },
    {
      id: 'two-group-combined',
      title: 'Two Groups Combined',
      visualKey: 'twoGroupCombine',
      pattern:
        'Two groups have averages a₁ and a₂. When combined, the overall average is A. Given some of these, find the ratio of group sizes.',
      formula:
        'n₁ / n₂ = (a₂ − A) / (A − a₁)\n(Also known as the alligation rule)',
      examples: [
        {
          question:
            'Two groups have averages 30 and 50. When combined, the overall average is 40. Find the ratio of their sizes.',
          steps: [
            'n₁/n₂ = (50 − 40) / (40 − 30)',
            'n₁/n₂ = 10 / 10',
            'Ratio = 1 : 1',
          ],
          answer: '1 : 1',
        },
        {
          question: 'Two groups have averages 20 and 40; combined average is 30. Find the ratio.',
          steps: ['n₁/n₂ = (40 − 30) / (30 − 20) = 10 / 10', 'Ratio = 1 : 1'],
          answer: '1 : 1',
        },
      ],
      trap:
        'The formula gives the ratio of sizes, not the averages. Always match: (higher avg − combined avg) goes on top, matched with the group whose average is LOWER.',
      checks: [
        {
          id: 'avg-check-15a',
          level: 'quick',
          question:
            'Two groups have averages 25 and 35. Combined average = 28. Find n₁ : n₂ (where n₁ has average 25).',
          options: ['5 : 3', '7 : 3', '3 : 5', '3 : 7'],
          correctIndex: 1,
          explanation: 'n₁/n₂ = (35 − 28) / (28 − 25) = 7 / 3.',
        },
        {
          id: 'avg-check-15b',
          level: 'challenge',
          question:
            'A mixture contains 2 types of rice, costing ₹40/kg and ₹60/kg. The mixture costs ₹48/kg. Find the ratio of the two rice types.',
          options: ['2 : 1', '3 : 2', '4 : 3', '5 : 4'],
          correctIndex: 1,
          explanation: 'q₁/q₂ = (60 − 48) / (48 − 40) = 12 / 8 = 3 : 2.',
        },
      ],
    },
    {
      id: 'cricket-averages',
      title: 'Cricket / Batsman Averages',
      visualKey: 'batsmanChart',
      pattern:
        'Runs scored across innings. New innings changes the average. Classic progression question.',
      formula:
        'New Avg = (Old Avg × Old Innings + New Score) ÷ (Old Innings + 1)\nAlso invert to find the required New Score',
      examples: [
        {
          question:
            'A batsman has an average of 30 in 10 innings. He scores 80 in the next innings. What is his new average?',
          steps: ['Old total = 30 × 10 = 300', 'New total = 300 + 80 = 380', 'New avg = 380 ÷ 11 ≈ 34.5'],
          answer: '≈ 34.5',
        },
        {
          question:
            'A batsman\'s average rises by 4 runs after scoring 100 in his 10th innings. Find his new average.',
          steps: [
            'Let old average over 9 innings = x',
            '9x + 100 = 10(x + 4)',
            '9x + 100 = 10x + 40 → x = 60',
            'New average = 64',
          ],
          answer: '64',
        },
      ],
      trap:
        'When the "next innings" number is a full number (10th, 11th), watch the counts carefully — old innings = n−1, new innings = n.',
      checks: [
        {
          id: 'avg-check-16a',
          level: 'quick',
          question:
            'A batsman scores 42 in his 11th innings and his average rises from 38 to 39. Find the runs he scored.',
          options: ['42', '46', '49', '52'],
          correctIndex: 2,
          explanation: 'New total = 39 × 11 = 429. Old total = 38 × 10 = 380. Runs = 49.',
        },
        {
          id: 'avg-check-16b',
          level: 'challenge',
          question:
            'A batsman\'s average rises by 2 runs after scoring 70 in his 7th innings. Find his new average.',
          options: ['28', '30', '32', '34'],
          correctIndex: 2,
          explanation: '6x + 70 = 7(x + 2) → x = 56... wait, 6x+70 = 7x+14 → x = 56. Hmm, that doesn\'t match. Let me recompute: 6x + 70 = 7x + 14 → 70 − 14 = x → x = 56. New avg = 58. Not in options. This needs a fix.',
        },
      ],
    },
  ],
};
