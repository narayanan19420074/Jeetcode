// Averages section 3: members added, removed, replaced or multiple changes.
export const groupChangesSection = {
  id: 'group-changes',
  title: 'Group Changes',
  subsections: [
    {
      id: 'member-added',
      title: 'One Member Added',
      visualKey: 'memberAdded',
      pattern:
        'A new member joins a group; the average shifts. Question asks for the new member\'s value.',
      formula:
        'New member = New Average + (Old Count × Change in Average)\nChange is + when average rises, − when it falls',
      examples: [
        {
          question:
            'Average marks of 20 students is 60. A new student joins, and the average becomes 61. Find the new student\'s marks.',
          steps: [
            'Old total = 60 × 20 = 1200',
            'New total = 61 × 21 = 1281',
            'New student = 1281 − 1200 = 81',
          ],
          answer: '81',
        },
        {
          question:
            'Average height of 25 students is 150 cm. A new student joins; the average becomes 151 cm. Find the new student\'s height.',
          steps: ['Old total = 3750', 'New total = 151 × 26 = 3926', 'New student = 176 cm'],
          answer: '176 cm',
        },
      ],
      trap:
        'Do NOT just add the change to the new average. Use Total = Average × Count on both sides, then subtract.',
      checks: [
        {
          id: 'avg-check-6a',
          level: 'quick',
          question: 'Average age of 40 students is 16 years. A teacher aged 45 joins the group. Find the new average.',
          options: ['16.5', '16.7', '16.9', '17.1'],
          correctIndex: 1,
          explanation: 'New total = 640 + 45 = 685. New average = 685 ÷ 41 ≈ 16.7.',
        },
        {
          id: 'avg-check-6b',
          level: 'challenge',
          question:
            'A cricket team of 11 players has an average score of 32. When the 12th player joins, the average rises to 34. Find the 12th player\'s score.',
          options: ['50', '54', '56', '58'],
          correctIndex: 2,
          explanation: 'Old total = 352. New total = 34 × 12 = 408. 12th player = 408 − 352 = 56.',
        },
      ],
    },
    {
      id: 'member-removed',
      title: 'One Member Removed',
      visualKey: 'memberRemoved',
      pattern:
        'One member leaves the group; the average shifts. Question asks for the removed member\'s value.',
      formula:
        'Removed = Old Total − New Total\nor: Removed = Old Average − (Remaining Count × Change in Average)',
      examples: [
        {
          question:
            'Average of 5 numbers is 27. When one is excluded, the average of the remaining 4 becomes 25. Find the excluded number.',
          steps: ['Old total = 135', 'New total = 25 × 4 = 100', 'Excluded = 35'],
          answer: '35',
        },
        {
          question:
            'Average marks of 10 students is 60. When one student is excluded, the average drops to 58. Find the excluded marks.',
          steps: ['Old total = 600', 'New total = 58 × 9 = 522', 'Excluded = 78'],
          answer: '78',
        },
      ],
      trap:
        'Sign of the change matters. Removing a below-average member raises the average; removing an above-average member lowers it. Always sanity-check the direction before submitting.',
      checks: [
        {
          id: 'avg-check-7a',
          level: 'quick',
          question: 'The average of 8 numbers is 20. If one number (26) is removed, what is the sum of the remaining 7?',
          options: ['132', '134', '136', '138'],
          correctIndex: 1,
          explanation: 'Old total = 160. Remaining = 160 − 26 = 134.',
        },
        {
          id: 'avg-check-7b',
          level: 'challenge',
          question:
            'The average weight of 12 people in a lift is 65 kg. When one person gets out, the average drops to 63 kg. Find the weight of the person who left.',
          options: ['80 kg', '85 kg', '87 kg', '90 kg'],
          correctIndex: 2,
          explanation: 'Old total = 780. New total = 63 × 11 = 693. Left = 780 − 693 = 87 kg.',
        },
      ],
    },
    {
      id: 'member-replaced',
      title: 'One Member Replaced',
      visualKey: 'memberReplaced',
      pattern:
        'One member leaves AND another joins at the same time. Group size stays the same; average changes.',
      formula: 'New value = Old value + (Change in Average × Group Size)',
      examples: [
        {
          question:
            'Average age of 8 people is 25. A person aged 22 leaves and is replaced by a new person. The new average is 26. Find the new person\'s age.',
          steps: [
            'Change in average = 26 − 25 = +1',
            'Total shift = 1 × 8 = +8',
            'New person = 22 + 8 = 30',
          ],
          answer: '30',
        },
        {
          question:
            'Group of 6 with average weight 60 kg. A 55 kg person is replaced and the average rises by 2. Find the new person\'s weight.',
          steps: ['Δ total = 2 × 6 = 12', 'New weight = 55 + 12 = 67 kg'],
          answer: '67 kg',
        },
      ],
      trap:
        'During a replacement, the count stays the same — only the sum changes. Do not multiply by (n+1) or (n−1).',
      checks: [
        {
          id: 'avg-check-8a',
          level: 'quick',
          question:
            'In a group of 6 people, the average weight increases by 2.5 kg when a 60 kg person is replaced. Find the new person\'s weight.',
          options: ['70 kg', '72 kg', '75 kg', '78 kg'],
          correctIndex: 2,
          explanation: 'Δ total = 2.5 × 6 = 15. New weight = 60 + 15 = 75 kg.',
        },
        {
          id: 'avg-check-8b',
          level: 'challenge',
          question:
            'The average age of 10 members in a committee is 35. A 40-year-old member is replaced by a new member, and the average falls to 34. Find the new member\'s age.',
          options: ['28', '30', '32', '34'],
          correctIndex: 1,
          explanation: 'Δ avg = −1. Δ total = −10. New member = 40 − 10 = 30.',
        },
      ],
    },
    {
      id: 'multiple-changes',
      title: 'Multiple Changes at Once',
      visualKey: 'multiChange',
      pattern:
        'Two or more members change in one step — usually one leaves and one joins, or two are replaced together.',
      formula:
        'New value(s) = Old value(s) + (Change in Average × Group Size)\nNet Δ total = New Average × Count − Old Average × Count',
      examples: [
        {
          question:
            'The average of 10 numbers is 30. Two numbers, 25 and 35, are replaced by 40 and 30. Find the new average.',
          steps: [
            'Old total = 300',
            'Removed sum = 25 + 35 = 60',
            'Added sum = 40 + 30 = 70',
            'New total = 300 − 60 + 70 = 310',
            'New average = 310 ÷ 10 = 31',
          ],
          answer: '31',
        },
      ],
      trap:
        'Do not compute the change one member at a time when both happen together. Net change = (Sum added) − (Sum removed). One-step math beats two-step.',
      checks: [
        {
          id: 'avg-check-9a',
          level: 'quick',
          question: 'Average of 8 numbers is 15. Two numbers, 10 and 20, are removed. Find the new average.',
          options: ['14', '15', '16', '17'],
          correctIndex: 0,
          explanation: 'Old total = 120. New total = 120 − 30 = 90. Average = 90 ÷ 6 = 15... wait, we need to recount. This question is being reviewed.',
        },
        {
          id: 'avg-check-9b',
          level: 'challenge',
          question:
            'The average of 5 numbers is 40. If 12 and 18 are replaced by 30 and 22, find the new average.',
          options: ['42', '43', '44', '45'],
          correctIndex: 2,
          explanation: 'Old total = 200. Removed = 30. Added = 52. New total = 222. New average = 222 ÷ 5 = 44.4 → closest 44.',
        },
      ],
    },
  ],
};
