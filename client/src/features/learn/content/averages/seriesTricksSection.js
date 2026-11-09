// Averages section 2: consecutive numbers and series-sum shortcuts.
export const seriesTricksSection = {
  id: 'series-tricks',
  title: 'Series Tricks',
  subsections: [
    {
      id: 'consecutive-numbers',
      title: 'Consecutive Numbers',
      visualKey: 'consecutiveDots',
      pattern:
        'The numbers are separated by a fixed gap — "consecutive", "consecutive odd/even", "multiples of 5", or any arithmetic sequence.',
      formula:
        'For an arithmetic sequence:\nAverage = (First + Last) ÷ 2\nIf count is odd, Average = middle term',
      examples: [
        {
          question: 'The average of 5 consecutive odd numbers is 61. Find the largest.',
          steps: [
            'Middle term = average = 61 (this is the 3rd number)',
            'Largest = 61 + 2 + 2 = 65 (skip 2 per step in odds)',
          ],
          answer: '65',
        },
        {
          question: 'Find the average of 15, 25, 35, 45, 55.',
          steps: ['Evenly spaced with 5 terms → middle term is the average', 'Average = 35'],
          answer: '35',
        },
      ],
      trap:
        'Only works when numbers are evenly spaced. If the gap changes (e.g. 2, 5, 9, 14), you must use Sum ÷ Count.',
      checks: [
        {
          id: 'avg-check-4a',
          level: 'quick',
          question: 'The average of 5 consecutive even numbers is 42. Find the smallest.',
          options: ['34', '36', '38', '40'],
          correctIndex: 2,
          explanation: 'Middle = 42. Smallest = 42 − 4 = 38.',
        },
        {
          id: 'avg-check-4b',
          level: 'challenge',
          question: 'The average of 7 consecutive integers is 25. Find the largest integer.',
          options: ['28', '30', '32', '34'],
          correctIndex: 0,
          explanation: 'Middle term = 25. Largest = 25 + 3 = 28.',
        },
      ],
    },
    {
      id: 'sum-of-series',
      title: 'Sum of a Series — Quick Formula',
      visualKey: 'seriesSum',
      pattern:
        'Question asks for the sum of the first n natural numbers, odd numbers, or even numbers.',
      formula:
        'Sum of first n natural numbers  = n × (n+1) ÷ 2\nSum of first n odd numbers  = n²\nSum of first n even numbers  = n × (n+1)\nAverage of these series = Sum ÷ n',
      examples: [
        {
          question: 'Find the sum of the first 10 natural numbers.',
          steps: ['Sum = n × (n+1) ÷ 2', 'Sum = 10 × 11 ÷ 2', 'Sum = 55'],
          answer: '55',
        },
        {
          question: 'Find the average of the first 20 odd numbers.',
          steps: ['Sum of first 20 odd numbers = 20² = 400', 'Average = 400 ÷ 20', 'Average = 20'],
          answer: '20',
        },
      ],
      trap:
        'n² gives SUM, not average. If the question asks for the average, always divide by n.',
      checks: [
        {
          id: 'avg-check-5a',
          level: 'quick',
          question: 'Find the sum of the first 15 natural numbers.',
          options: ['110', '115', '120', '125'],
          correctIndex: 2,
          explanation: '15 × 16 ÷ 2 = 120.',
        },
        {
          id: 'avg-check-5b',
          level: 'challenge',
          question: 'Find the average of the first 50 even numbers.',
          options: ['50', '51', '52', '100'],
          correctIndex: 1,
          explanation: 'Sum = 50 × 51 = 2550. Average = 2550 ÷ 50 = 51.',
        },
      ],
    },
  ],
};
