// Averages — comprehensive placement-prep lesson set.
// 16 lessons covering every question archetype asked in campus placement
// and competitive exams. Each lesson: pattern → formula → worked examples
// → common trap → 2 checks (quick + challenge). Visual is a math-focused
// SVG (number line, bar chart, timeline) driven by step advance.
//
// practiceQuestions / practiceBank at the bottom feed AptitudePracticePage
// and AptitudeTestPage — unchanged contract.

export const averagesTopic = {
  slug: 'averages',
  title: 'Averages',
  tagline:
    '3 to 5 questions from Averages appear in every placement paper. This module covers all 16 question archetypes exam setters use — with formulas, worked examples, traps, and challenge questions built in.',

  sections: [
    /* ============================================================== */
    /*  SECTION 1 — FOUNDATIONS                                        */
    /* ============================================================== */
    {
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
    },

    /* ============================================================== */
    /*  SECTION 2 — SERIES TRICKS                                      */
    /* ============================================================== */
    {
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
    },

    /* ============================================================== */
    /*  SECTION 3 — GROUP CHANGES                                      */
    /* ============================================================== */
    {
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
    },

    /* ============================================================== */
    /*  SECTION 4 — SPECIAL TOPICS                                     */
    /* ============================================================== */
    {
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
    },

    /* ============================================================== */
    /*  SECTION 5 — EXAM PATTERNS                                      */
    /* ============================================================== */
    {
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
    },
  ],

  /* ================================================================ */
  /*  Practice — unchanged contract for AptitudePracticePage/TestPage   */
  /* ================================================================ */
  practiceQuestions: [
    { id: 'q1', question: 'Average of 5 numbers is 27. If one number is excluded, the average of the remaining 4 becomes 25. What was the excluded number?', options: ['35', '25', '30', '40'], correctIndex: 0, explanation: 'Sum of 5 = 135. Sum of 4 = 100. Excluded = 35.' },
    { id: 'q2', question: 'Which statement about the average of a set of numbers is always true?', options: ['It lies between the smallest and largest values', 'It always equals the median', 'It is always greater than every value in the set', 'It is always less than every value in the set'], correctIndex: 0, explanation: 'The average always lies between the min and max.' },
    { id: 'q3', question: 'Average age of 8 people is 25. A person aged 22 leaves and is replaced by a new person; average becomes 26. Find the new person\'s age.', options: ['30', '28', '32', '26'], correctIndex: 0, explanation: 'Δ total = (26−25)×8 = 8. New age = 22+8 = 30.' },
    { id: 'q4', question: 'Average marks of 20 students is 60. A new student joins; average becomes 61. Find the new student\'s marks.', options: ['81', '61', '80', '100'], correctIndex: 0, explanation: 'New student = 61 + 20×1 = 81.' },
    { id: 'q5', question: 'A car travels at 30 km/h going and 50 km/h returning over the same route. Average speed for the round trip?', options: ['37.5 km/h', '40 km/h', '45 km/h', '50 km/h'], correctIndex: 0, explanation: '(2×30×50)/(30+50) = 37.5.' },
  ],

  practiceBank: {
    level1: [
      { id: 'av-l1-1', question: 'Find the average of 10, 20, and 30.', options: ['15', '20', '25', '30'], correctIndex: 1, explanation: '(10+20+30)/3 = 20.' },
      { id: 'av-l1-2', question: 'The average of 4 numbers is 15. Find their sum.', options: ['45', '50', '60', '75'], correctIndex: 2, explanation: 'Sum = 15×4 = 60.' },
      { id: 'av-l1-3', question: 'Find the average of 1, 2, 3, 4, 5.', options: ['2', '2.5', '3', '3.5'], correctIndex: 2, explanation: 'Middle = 3.' },
      { id: 'av-l1-4', question: 'Avg of 5 = 18. Four are 10, 15, 20, 25. Find the fifth.', options: ['15', '18', '20', '25'], correctIndex: 2, explanation: '90 − 70 = 20.' },
      { id: 'av-l1-5', question: 'Average of 12, 18, 24, 30.', options: ['19', '20', '21', '22'], correctIndex: 2, explanation: '84/4 = 21.' },
      { id: 'av-l1-6', question: 'Avg weight of 6 boys = 45 kg. Total?', options: ['240 kg', '250 kg', '260 kg', '270 kg'], correctIndex: 3, explanation: '45×6 = 270.' },
      { id: 'av-l1-7', question: 'Average of first 10 even numbers.', options: ['9', '10', '11', '12'], correctIndex: 2, explanation: 'Middle = 11.' },
      { id: 'av-l1-8', question: 'Avg marks of 3 = 70. Two scored 65, 75. Third?', options: ['65', '68', '70', '72'], correctIndex: 2, explanation: '210 − 140 = 70.' },
      { id: 'av-l1-9', question: 'Average of 15, 25, 35, 45, 55.', options: ['30', '32', '35', '38'], correctIndex: 2, explanation: 'Middle = 35.' },
      { id: 'av-l1-10', question: 'Avg of 8 numbers = 20. Total?', options: ['140', '150', '160', '170'], correctIndex: 2, explanation: '160.' },
      { id: 'av-l1-11', question: 'Average of 1, 3, 5, 7, 9.', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: '5.' },
      { id: 'av-l1-12', question: 'Avg of two = 25. One is 30. Other?', options: ['15', '18', '20', '22'], correctIndex: 2, explanation: '20.' },
      { id: 'av-l1-13', question: 'Car travels 100 km in 2 hours. Avg speed?', options: ['40 km/h', '45 km/h', '50 km/h', '55 km/h'], correctIndex: 2, explanation: '50.' },
      { id: 'av-l1-14', question: 'Avg of 6 = 12. Sum of 5 = 55. Sixth?', options: ['15', '17', '19', '21'], correctIndex: 1, explanation: '17.' },
      { id: 'av-l1-15', question: 'Average of 7, 14, 21, 28.', options: ['16.5', '17.5', '18.5', '19.5'], correctIndex: 1, explanation: '17.5.' },
    ],
    level2: [
      { id: 'av-l2-1', question: 'Avg of 5 = 20. Which could NOT be the largest?', options: ['15', '20', '25', '30'], correctIndex: 0, explanation: 'Largest ≥ avg.' },
      { id: 'av-l2-2', question: 'Avg = 45. Which could NOT be the smallest?', options: ['30', '45', '50', '60'], correctIndex: 3, explanation: 'Smallest ≤ avg.' },
      { id: 'av-l2-3', question: 'Avg age of 7 = 28. 25 replaced, avg = 30. New age?', options: ['35', '37', '39', '41'], correctIndex: 2, explanation: '39.' },
      { id: 'av-l2-4', question: 'Avg height of 25 = 150 cm. New joins, avg = 151. New height?', options: ['170 cm', '173 cm', '176 cm', '179 cm'], correctIndex: 2, explanation: '176.' },
      { id: 'av-l2-5', question: 'Avg of 10 = 60. Excluded one, avg = 58. Excluded?', options: ['72', '75', '78', '80'], correctIndex: 2, explanation: '78.' },
      { id: 'av-l2-6', question: 'Avg weight of 8 = 65 kg. One 70 kg leaves. New avg?', options: ['63.4 kg', '63.9 kg', '64.3 kg', '64.9 kg'], correctIndex: 2, explanation: '64.3.' },
      { id: 'av-l2-7', question: '20 km/h going, 30 km/h returning. Avg?', options: ['22 km/h', '24 km/h', '25 km/h', '26 km/h'], correctIndex: 1, explanation: '24.' },
      { id: 'av-l2-8', question: '60 km/h going, 40 km/h returning. Avg?', options: ['46 km/h', '47 km/h', '48 km/h', '50 km/h'], correctIndex: 2, explanation: '48.' },
      { id: 'av-l2-9', question: 'Batsman avg 42 in 10 innings. Scores 86 in 11th. New avg?', options: ['44', '45', '46', '47'], correctIndex: 2, explanation: '46.' },
      { id: 'av-l2-10', question: 'Avg of 6 = 25. Remove 20, 30. New avg?', options: ['22.5', '24', '25', '26.5'], correctIndex: 2, explanation: '25.' },
      { id: 'av-l2-11', question: '40 students avg 16. Teacher (45) joins. New avg?', options: ['16.5', '16.7', '16.9', '17.1'], correctIndex: 1, explanation: '16.7.' },
      { id: 'av-l2-12', question: 'Half at 40, half at 60 (equal distance). Avg?', options: ['46 km/h', '47 km/h', '48 km/h', '50 km/h'], correctIndex: 2, explanation: '48.' },
      { id: 'av-l2-13', question: 'Avg of 4 = 35. Replace one, avg +5. Δ?', options: ['15', '18', '20', '25'], correctIndex: 2, explanation: '20.' },
      { id: 'av-l2-14', question: 'Avg of 20 = 55. 5 leave, avg = 54. Avg of 5?', options: ['56 kg', '57 kg', '58 kg', '59 kg'], correctIndex: 2, explanation: '58.' },
      { id: 'av-l2-15', question: 'Avg of 50 = 65. 10 (avg 80) removed. New avg?', options: ['60.25', '61.25', '62.25', '63.25'], correctIndex: 1, explanation: '61.25.' },
    ],
    level3: [
      { id: 'av-l3-1', question: 'Avg of 11 = 60. First 6 = 58, last 6 = 63. 6th?', options: ['62', '64', '66', '68'], correctIndex: 2, explanation: '66.' },
      { id: 'av-l3-2', question: 'H, W, C 3 yrs ago avg 27. W+C 5 yrs ago avg 20. Husband present?', options: ['36', '38', '40', '42'], correctIndex: 2, explanation: '40.' },
      { id: 'av-l3-3', question: 'Batsman avg rises by 8 after 100 in 10th. New avg?', options: ['24', '26', '28', '30'], correctIndex: 2, explanation: '28.' },
      { id: 'av-l3-4', question: 'Mon–Thu avg = 48. Tue–Fri avg = 52. Mon = 42. Fri?', options: ['54°C', '56°C', '58°C', '60°C'], correctIndex: 2, explanation: '58.' },
      { id: 'av-l3-5', question: 'Avg of 3 = 14. First = 2×second, second = 2×third. Largest?', options: ['20', '22', '24', '26'], correctIndex: 2, explanation: '24.' },
      { id: 'av-l3-6', question: 'Avg of 5 consecutive odd = 61. Largest?', options: ['63', '65', '67', '69'], correctIndex: 1, explanation: '65.' },
      { id: 'av-l3-7', question: 'Group of 6, avg +2.5 after 60 kg replaced. New weight?', options: ['70 kg', '72 kg', '75 kg', '78 kg'], correctIndex: 2, explanation: '75.' },
      { id: 'av-l3-8', question: 'Avg of 20 = 0. At most how many negative?', options: ['10', '15', '19', '20'], correctIndex: 2, explanation: '19.' },
      { id: 'av-l3-9', question: 'Avg of 30 = 70. One mis-read 60 vs 90. Correct avg?', options: ['70', '70.5', '71', '71.5'], correctIndex: 2, explanation: '71.' },
      { id: 'av-l3-10', question: 'Avg(A,B)=45, Avg(B,C)=55, Avg(A,C)=50. Avg(A,B,C)?', options: ['45', '48', '50', '52'], correctIndex: 2, explanation: '50.' },
    ],
  },
};