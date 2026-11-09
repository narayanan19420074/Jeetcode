// Averages section 4: age problems, average speed and weighted averages.
export const specialTopicsSection = {
  id: 'special-topics',
  title: 'Special Topics',
  subsections: [
    {
      id: 'age-problems',
      title: 'Age Problems',
      visualKey: 'ageTimeline',
      pattern:
        'The question gives past or future averages and asks for present ages. Look for "X years ago" or "after X years".',
      formula:
        't years ago: Present Sum = (Past Avg × Count) + (Count × t)\nt years from now: Present Sum = (Future Avg × Count) − (Count × t)',
      examples: [
        {
          question:
            'The average age of a husband, wife, and child 3 years ago was 27. The average of the wife and child 5 years ago was 20. Find the husband\'s present age.',
          steps: [
            '3 yrs ago (H+W+C) sum = 27 × 3 = 81 → present = 81 + 9 = 90',
            '5 yrs ago (W+C) sum = 20 × 2 = 40 → present = 40 + 10 = 50',
            'Husband = 90 − 50 = 40',
          ],
          answer: '40 years',
        },
        {
          question:
            'The average age of 4 members of a family is 30. After 5 years, what will the average be?',
          steps: [
            'Every person ages by 5 years, so the average also rises by 5.',
            'New average = 30 + 5 = 35',
          ],
          answer: '35 years',
        },
      ],
      trap:
        'When everyone ages by t years, the SUM rises by (Count × t), but the AVERAGE rises by just t. Do not multiply the average by the count.',
      checks: [
        {
          id: 'avg-check-10a',
          level: 'quick',
          question: 'The average age of a family of 4 was 30 two years ago. What is the present average?',
          options: ['30', '31', '32', '34'],
          correctIndex: 2,
          explanation: 'Average rises by 2 → present = 32.',
        },
        {
          id: 'avg-check-10b',
          level: 'challenge',
          question:
            'The average age of a group of 8 people is 25 years. 5 years ago, what was their average age?',
          options: ['18', '20', '22', '24'],
          correctIndex: 1,
          explanation: 'Average drops by 5 → 25 − 5 = 20.',
        },
      ],
    },
    {
      id: 'average-speed-equal-distance',
      title: 'Average Speed — Equal Distance',
      visualKey: 'speedDistance',
      pattern:
        'Travelling the same route at two different speeds (going and returning). Question asks for the average speed of the round trip. This is the #1 trap in Averages.',
      formula:
        'Equal distances: Average Speed = (2 · s₁ · s₂) ÷ (s₁ + s₂)\n(= harmonic mean — always smaller than the plain average of s₁ and s₂)',
      examples: [
        {
          question:
            'A car travels at 30 km/h going and 50 km/h returning on the same route. Find its average speed for the round trip.',
          steps: [
            'Equal distances → use the harmonic formula',
            'Avg = (2 × 30 × 50) ÷ (30 + 50) = 3000 ÷ 80',
            'Avg = 37.5 km/h',
          ],
          answer: '37.5 km/h',
        },
        {
          question: 'A train covers a distance at 60 km/h and returns at 40 km/h. Average speed?',
          steps: ['(2 × 60 × 40) ÷ (60 + 40) = 4800 ÷ 100', 'Avg = 48 km/h'],
          answer: '48 km/h',
        },
      ],
      trap:
        'When distances are equal, (s₁ + s₂) ÷ 2 is WRONG. The slower speed occupies more time, so it pulls the average down. (s₁ + s₂) ÷ 2 only applies when TIMES are equal.',
      checks: [
        {
          id: 'avg-check-11a',
          level: 'quick',
          question: 'A car travels at 40 km/h going and 60 km/h returning over the same route. What is its average speed for the round trip?',
          options: ['46 km/h', '47 km/h', '48 km/h', '50 km/h'],
          correctIndex: 2,
          explanation: '(2 × 40 × 60) ÷ 100 = 48 km/h.',
        },
        {
          id: 'avg-check-11b',
          level: 'challenge',
          question:
            'A cyclist covers a distance at 15 km/h and returns at 10 km/h. What is his average speed for the entire journey?',
          options: ['11 km/h', '12 km/h', '12.5 km/h', '13 km/h'],
          correctIndex: 1,
          explanation: '(2 × 15 × 10) ÷ (15 + 10) = 300 ÷ 25 = 12 km/h.',
        },
      ],
    },
    {
      id: 'average-speed-equal-time',
      title: 'Average Speed — Equal Time',
      visualKey: 'speedTime',
      pattern:
        'The question gives speeds for EQUAL durations (e.g. 2 hours at 40, then 2 hours at 60). This is the plain arithmetic mean.',
      formula: 'Equal times: Average Speed = (s₁ + s₂) ÷ 2',
      examples: [
        {
          question: 'A car drives at 40 km/h for 2 hours then 60 km/h for 2 hours. Average speed?',
          steps: ['Equal times → arithmetic mean', 'Avg = (40 + 60) ÷ 2 = 50 km/h'],
          answer: '50 km/h',
        },
        {
          question: 'A boat sails at 12 km/h for 3 hours, then at 18 km/h for 3 hours. Average speed?',
          steps: ['(12 + 18) ÷ 2 = 15 km/h'],
          answer: '15 km/h',
        },
      ],
      trap:
        'Equal time is the "safe" case — plain average works. But equal distance is NOT the same. Always read the question carefully: "same distance" → harmonic mean; "same time" → arithmetic mean.',
      checks: [
        {
          id: 'avg-check-12a',
          level: 'quick',
          question: 'A bus travels at 50 km/h for the first half of the time and 70 km/h for the second half. Find the average speed.',
          options: ['55 km/h', '60 km/h', '62 km/h', '65 km/h'],
          correctIndex: 1,
          explanation: 'Equal times → (50 + 70) ÷ 2 = 60 km/h.',
        },
        {
          id: 'avg-check-12b',
          level: 'challenge',
          question:
            'A man travels at 20 km/h for 2 hours and 30 km/h for 3 hours. Find the average speed of the journey.',
          options: ['24 km/h', '25 km/h', '26 km/h', '27 km/h'],
          correctIndex: 2,
          explanation: 'Distances = 40 km + 90 km = 130 km. Time = 5 h. Average = 130 ÷ 5 = 26 km/h.',
        },
      ],
    },
    {
      id: 'weighted-average',
      title: 'Weighted Average',
      visualKey: 'weightedBalance',
      pattern:
        'Different groups of different sizes are combined, and the question asks for the combined average. Each group\'s average contributes in proportion to its size.',
      formula: 'Combined Average = (n₁ · a₁ + n₂ · a₂ + ...) ÷ (n₁ + n₂ + ...)',
      examples: [
        {
          question:
            'Class A (30 students) has an average of 70. Class B (20 students) has an average of 80. Find the combined average.',
          steps: [
            'Total A = 30 × 70 = 2100',
            'Total B = 20 × 80 = 1600',
            'Combined = (2100 + 1600) ÷ 50 = 3700 ÷ 50 = 74',
          ],
          answer: '74',
        },
      ],
      trap:
        'Do NOT just take the arithmetic mean of the two averages (75 in the example above). The larger group pulls the combined average closer to itself.',
      checks: [
        {
          id: 'avg-check-13a',
          level: 'quick',
          question:
            'Group of 20 has an average of 40. Group of 30 has an average of 50. Find the combined average.',
          options: ['45', '46', '47', '48'],
          correctIndex: 1,
          explanation: '(20×40 + 30×50) ÷ 50 = (800 + 1500) ÷ 50 = 46.',
        },
        {
          id: 'avg-check-13b',
          level: 'challenge',
          question:
            'In a company, 60% of employees earn an average of 40k/month and 40% earn an average of 60k/month. Find the average salary of all employees.',
          options: ['46k', '48k', '50k', '52k'],
          correctIndex: 1,
          explanation: '(60×40 + 40×60) ÷ 100 = (2400 + 2400) ÷ 100 = 48k.',
        },
      ],
    },
  ],
};
