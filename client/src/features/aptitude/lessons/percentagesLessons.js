// Learn content for the Percentages pattern — one lesson per sub-pattern.
// Lesson `id` === the sub-pattern slug used by the question bank, so a lesson
// can deep-link straight into Practice for exactly that topic.
//
// Shape of a lesson:
//   keyIdea   string[]            the "why", in plain words
//   formulas  {label, expr}[]     what to memorise
//   table     {columns, rows}     optional reference table
//   widget    string              optional interactive visual (see LessonWidgets.jsx)
//   shortcut  string[]            exam-time tricks
//   examples  {question, steps[], answer}[]   revealed step by step
//   traps     {trap, fix}[]       the mistakes exam setters design options around
//   check     {question, options, correctIndex, explanation}

export const percentagesLessons = [
  {
    id: 'basic-percentage-conversions',
    title: 'Basic percentage & conversions',
    summary: 'x% of N, "what percent", and finding the whole.',
    minutes: 6,
    widget: 'percentGrid',
    keyIdea: [
      '"Percent" means "per hundred". 25% is just 25 out of every 100, i.e. 25/100.',
      'Almost every basic question is one of three shapes: find x% of a number, find what percent A is of B, or find the whole when a part is known.',
    ],
    formulas: [
      { label: 'x% of N', expr: '(x × N) / 100' },
      { label: 'A is what % of B', expr: '(A / B) × 100' },
      { label: 'Percentage change', expr: '(change / ORIGINAL) × 100' },
      { label: 'Find the whole', expr: 'If x% of N = A, then N = A × 100 / x' },
    ],
    shortcut: [
      'Build any percentage from blocks: 10% = shift the decimal one place, 5% = half of that, 1% = shift two places. 15% of 360 → 36 + 18 = 54.',
      'x% of y = y% of x. So 8% of 25 is just 25% of 8 = 2.',
    ],
    examples: [
      {
        question: 'What is 15% of 360?',
        steps: ['10% of 360 = 36.', '5% of 360 = half of 36 = 18.', '15% = 36 + 18 = 54.'],
        answer: '54',
      },
      {
        question: 'The price of a book fell from ₹1100 to ₹825. What is the percentage decrease?',
        steps: [
          'Decrease = 1100 − 825 = 275.',
          'Divide by the ORIGINAL price: 275 / 1100 = 0.25.',
          'As a percentage: 0.25 × 100 = 25%.',
        ],
        answer: '25% decrease',
      },
      {
        question: '45% of a number is 90. Find the number.',
        steps: ['45% of N = 90, so N = 90 × 100 / 45.', '90 × 100 = 9000, and 9000 / 45 = 200.'],
        answer: '200',
      },
    ],
    traps: [
      {
        trap: 'Dividing the change by the NEW value.',
        fix: 'Percentage change is always measured against the starting (original) value.',
      },
      {
        trap: 'Confusing "20% more than 50" with "20% of 50".',
        fix: '20% of 50 = 10, but 20% more than 50 = 50 + 10 = 60.',
      },
    ],
    check: {
      question: 'What is 12% of 250?',
      options: ['25', '30', '32', '35'],
      correctIndex: 1,
      explanation: '12 × 250 / 100 = 30. (10% = 25, 2% = 5, total 30.)',
    },
  },
  {
    id: 'successive-percentage-change',
    title: 'Successive percentage change',
    summary: 'Why +20% then −20% is NOT zero.',
    minutes: 8,
    widget: 'successiveChange',
    keyIdea: [
      'When a value changes twice, the second percentage is applied to the NEW value, not the original. That is why changes never simply add up.',
      'Think in multipliers: +20% means ×1.20, −20% means ×0.80. Multiply them and read off the net result.',
    ],
    formulas: [
      { label: 'Two changes x% and y%', expr: 'Net % = x + y + (x·y)/100   (use − for decreases)' },
      { label: 'Multiplier method', expr: '(1 + x/100) × (1 + y/100) × …' },
      { label: 'Up x% then down x%', expr: 'Net = − x² / 100 %' },
      { label: 'Two successive discounts a, b', expr: 'Single discount = a + b − (a·b)/100' },
    ],
    shortcut: [
      'For three or more changes, always use multipliers: +10%, +20%, −10% → 1.1 × 1.2 × 0.9 = 1.188 → +18.8%.',
      'Same percentage up then down always loses: x²/100 %. 25% up and 25% down loses 6.25%.',
    ],
    examples: [
      {
        question: 'A price rises by 20% and then falls by 20%. What is the net change?',
        steps: ['Use x + y + xy/100 with x = 20, y = −20.', '20 − 20 + (20 × −20)/100 = −4.'],
        answer: '4% decrease',
      },
      {
        question: 'Two successive discounts of 10% and 20% equal a single discount of?',
        steps: ['Single discount = a + b − ab/100.', '10 + 20 − (10 × 20)/100 = 30 − 2 = 28.'],
        answer: '28%',
      },
      {
        question: 'A value goes up 10%, up 20%, then down 10%. Net change?',
        steps: ['Multipliers: 1.10 × 1.20 × 0.90.', '1.10 × 1.20 = 1.32, and 1.32 × 0.90 = 1.188.', '1.188 means +18.8%.'],
        answer: '18.8% increase',
      },
    ],
    traps: [
      { trap: 'Adding the percentages (+20% − 20% = 0).', fix: 'The second change works on a different base. Always include the xy/100 term.' },
      { trap: 'Treating 10% + 20% discounts as 30% off.', fix: 'Successive discounts give less than the sum: 28% here.' },
    ],
    check: {
      question: 'A price rises by 25% and then falls by 25%. What is the net change?',
      options: ['0%', '6.25% decrease', '6.25% increase', '12.5% decrease'],
      correctIndex: 1,
      explanation: '1.25 × 0.75 = 0.9375, i.e. a 6.25% decrease (x²/100 = 625/100).',
    },
  },
  {
    id: 'population-growth-decrease',
    title: 'Population growth & decrease',
    summary: 'Compounding a percentage year after year.',
    minutes: 7,
    keyIdea: [
      'Population (or any quantity growing by a fixed percentage every year) compounds: each year\'s change is calculated on the previous year\'s value.',
      'It is successive percentage change with the same rate repeated, so the same multiplier method applies.',
    ],
    formulas: [
      { label: 'Growth for n years', expr: 'P × (1 + r/100)ⁿ' },
      { label: 'Decrease for n years', expr: 'P × (1 − r/100)ⁿ' },
      { label: 'Different rates each year', expr: 'P × (1 + r₁/100) × (1 + r₂/100)' },
      { label: 'Value n years ago', expr: 'Present ÷ (1 + r/100)ⁿ' },
    ],
    shortcut: [
      'Turn the rate into a fraction: 10% → ×11/10, 20% → ×6/5, 25% → ×5/4. Numbers often cancel cleanly.',
      'Two years at r%: total change = 2r + r²/100 %. At 10% that is 21%.',
    ],
    examples: [
      {
        question: 'A town of 20,000 grows 10% every year. Population after 2 years?',
        steps: ['Year 1: 20,000 × 1.10 = 22,000.', 'Year 2: 22,000 × 1.10 = 24,200.'],
        answer: '24,200',
      },
      {
        question: 'A population of 62,500 falls 20% every year. What is it after 2 years?',
        steps: ['Multiplier per year = 0.8.', '62,500 × 0.8 × 0.8 = 62,500 × 0.64 = 40,000.'],
        answer: '40,000',
      },
      {
        question: 'The population is now 1,100 after growing 10% in the last year. What was it a year ago?',
        steps: ['Going back means dividing by the multiplier.', '1,100 ÷ 1.10 = 1,000.'],
        answer: '1,000',
      },
    ],
    traps: [
      { trap: 'Applying the rate to the original number every year (simple growth).', fix: 'Each year\'s base is the previous year\'s result.' },
      { trap: 'Subtracting the percentage to find a past value.', fix: 'Divide by (1 + r/100); subtracting uses the wrong base.' },
    ],
    check: {
      question: 'A population of 8,000 rises 25% in year 1 and falls 20% in year 2. What is it after 2 years?',
      options: ['8,000', '8,200', '7,800', '8,500'],
      correctIndex: 0,
      explanation: '8,000 × 1.25 = 10,000; 10,000 × 0.80 = 8,000. The multipliers 5/4 and 4/5 cancel exactly.',
    },
  },
  {
    id: 'price-consumption-relation',
    title: 'Price-consumption relation',
    summary: 'Keep spending constant when price changes.',
    minutes: 6,
    widget: 'priceConsumption',
    keyIdea: [
      'Expenditure = price × consumption. To keep expenditure the same, price and consumption must move in opposite directions.',
      'The cut in consumption is calculated on the NEW, higher price, so it is smaller than the price rise.',
    ],
    formulas: [
      { label: 'Price ↑ by x%', expr: 'Consumption ↓ by x/(100 + x) × 100 %' },
      { label: 'Price ↓ by x%', expr: 'Consumption ↑ by x/(100 − x) × 100 %' },
      { label: 'Expenditure change', expr: 'a + b + (a·b)/100   (a = price %, b = consumption %)' },
    ],
    shortcut: [
      'Fraction rule: price up by 1/n → consumption down by 1/(n+1). Price down by 1/n → consumption up by 1/(n−1).',
      '25% = 1/4, so a 25% price rise needs a 1/5 = 20% cut in consumption.',
    ],
    examples: [
      {
        question: 'Sugar becomes 25% costlier. By what percent must a family cut consumption to keep spending the same?',
        steps: ['Use x/(100 + x) × 100 with x = 25.', '25/125 × 100 = 20.'],
        answer: '20% reduction',
      },
      {
        question: 'Rice gets 20% cheaper. By what percent can consumption rise for the same spending?',
        steps: ['Use x/(100 − x) × 100 with x = 20.', '20/80 × 100 = 25.'],
        answer: '25% increase',
      },
      {
        question: 'Price rises 20% and consumption falls 10%. What happens to expenditure?',
        steps: ['a = +20, b = −10.', 'a + b + ab/100 = 20 − 10 − 2 = +8.'],
        answer: '8% increase',
      },
    ],
    traps: [
      { trap: 'Answering "25% rise needs 25% cut".', fix: 'Divide by the NEW price: 25/125 = 20%.' },
      { trap: 'Adding price and consumption changes directly.', fix: 'Expenditure is a product, so include the ab/100 term.' },
    ],
    check: {
      question: 'The price of an item rises by 50%. By what percent must consumption fall so expenditure is unchanged?',
      options: ['50%', '33.33%', '25%', '40%'],
      correctIndex: 1,
      explanation: '50/(100 + 50) × 100 = 33.33%. (Fraction rule: up 1/2 → down 1/3.)',
    },
  },
  {
    id: 'election-votes',
    title: 'Election & votes',
    summary: 'Margins, invalid votes and shares of the total.',
    minutes: 6,
    keyIdea: [
      'Only valid votes are shared between candidates. Total votes = valid votes + invalid votes.',
      'With two candidates, the winning margin is the difference of their shares. If the winner has w%, the margin is (2w − 100)% of valid votes.',
    ],
    formulas: [
      { label: 'Valid votes', expr: 'Total − invalid' },
      { label: 'Margin (two candidates)', expr: '(winner % − loser %) of valid votes = (2w − 100)%' },
      { label: 'Candidate\'s votes', expr: 'share % × valid votes' },
    ],
    shortcut: [
      'Winner 60% → loser 40% → margin 20% of valid votes. Convert the given margin into votes to get the total in one step.',
      'If x% of total votes are invalid, valid votes = (100 − x)% of total. Do this before sharing.',
    ],
    examples: [
      {
        question: 'The winner got 60% of the votes and won by 4,000 votes. Total votes?',
        steps: ['Loser got 40%, so margin = 60% − 40% = 20%.', '20% of total = 4,000, so total = 4,000 × 100 / 20 = 20,000.'],
        answer: '20,000',
      },
      {
        question: 'Of 20,000 votes cast, 10% are invalid. A gets 55% of the valid votes. How many does A get, and what is the margin?',
        steps: ['Valid votes = 90% of 20,000 = 18,000.', 'A = 55% of 18,000 = 9,900; B = 45% = 8,100.', 'Margin = 9,900 − 8,100 = 1,800.'],
        answer: 'A gets 9,900; margin 1,800',
      },
      {
        question: 'A candidate got 35% of the votes and lost by 1,200 votes (two candidates). Total votes?',
        steps: ['Winner got 65%, so margin = 65% − 35% = 30%.', '30% of total = 1,200, so total = 1,200 × 100 / 30 = 4,000.'],
        answer: '4,000',
      },
    ],
    traps: [
      { trap: 'Using the winner\'s percentage as the margin.', fix: 'Margin = winner% − loser%.' },
      { trap: 'Forgetting that invalid votes are not shared.', fix: 'Subtract invalid votes first, then apply the shares.' },
    ],
    check: {
      question: 'A candidate got 45% of the votes and lost by 2,000 votes (two candidates, no invalid votes). Total votes?',
      options: ['10,000', '20,000', '22,000', '18,000'],
      correctIndex: 1,
      explanation: 'Winner 55%, margin 10% of total = 2,000, so total = 20,000.',
    },
  },
  {
    id: 'exam-marks-pass-percentage',
    title: 'Exam marks & pass percentage',
    summary: 'Pass marks, "failed by" and maximum marks.',
    minutes: 6,
    keyIdea: [
      'The pass mark is one fixed number of marks. "Failed by 30" means 30 marks below it; "passed by 20" means 20 above it.',
      'The gap in marks between two students is exactly the gap in their percentages × maximum marks. That one idea solves nearly every question.',
    ],
    formulas: [
      { label: 'Pass marks', expr: 'obtained + short   (or obtained − extra)' },
      { label: 'Maximum marks', expr: 'marks gap × 100 / percentage gap' },
      { label: 'Using the pass %', expr: 'Max = pass marks × 100 / pass %' },
    ],
    shortcut: [
      'Two students: add "failed by" and "passed by" to get the marks gap, divide by the % gap, multiply by 100.',
      'Convert "short by k marks" into: obtained + k = pass marks before touching percentages.',
    ],
    examples: [
      {
        question: 'A student scores 40% and fails by 30 marks. Another scores 50% and passes by 20 marks. Maximum marks?',
        steps: ['Marks gap = 30 + 20 = 50.', 'Percentage gap = 50% − 40% = 10%.', '10% of max = 50, so max = 500. (Pass mark = 250 − 20 = 230.)'],
        answer: '500',
      },
      {
        question: 'Pass mark is 40%. A student got 180 and failed by 20 marks. Maximum marks?',
        steps: ['Pass marks = 180 + 20 = 200.', '40% of max = 200, so max = 200 × 100 / 40 = 500.'],
        answer: '500',
      },
      {
        question: 'A student needs 35% to pass, got 140 and failed by 21 marks. Maximum marks?',
        steps: ['Pass marks = 140 + 21 = 161.', 'Max = 161 × 100 / 35 = 460.'],
        answer: '460',
      },
    ],
    traps: [
      { trap: 'Reading "failed by 30 marks" as "failed by 30%".', fix: 'It is 30 marks, not percent. Convert marks to marks.' },
      { trap: 'Taking the student\'s own percentage as the pass percentage.', fix: 'The pass mark is a separate fixed value; use the gap method.' },
    ],
    check: {
      question: 'The pass mark is 35%. A student got 120 and failed by 20 marks. Maximum marks?',
      options: ['350', '400', '450', '500'],
      correctIndex: 1,
      explanation: 'Pass marks = 120 + 20 = 140. Max = 140 × 100 / 35 = 400.',
    },
  },
  {
    id: 'fraction-percentage-equivalents',
    title: 'Fraction-percentage equivalents',
    summary: 'The table that makes mental maths instant.',
    minutes: 5,
    keyIdea: [
      'Many percentages are really simple fractions. 12.5% is 1/8, so "12.5% of 640" is just 640 ÷ 8.',
      'Memorising this small table removes multiplication from most exam questions.',
    ],
    table: {
      columns: ['Fraction', 'Percent', 'Fraction', 'Percent'],
      rows: [
        ['1/2', '50%', '1/9', '11.11%'],
        ['1/3', '33.33%', '1/10', '10%'],
        ['1/4', '25%', '1/11', '9.09%'],
        ['1/5', '20%', '1/12', '8.33%'],
        ['1/6', '16.67%', '1/15', '6.67%'],
        ['1/7', '14.28%', '1/16', '6.25%'],
        ['1/8', '12.5%', '1/20', '5%'],
      ],
    },
    formulas: [
      { label: 'Fraction → percent', expr: '(1/n) × 100 = (100/n)%' },
      { label: 'Increase by 1/n', expr: 'multiply by (n + 1) / n' },
      { label: 'Decrease by 1/n', expr: 'multiply by (n − 1) / n' },
    ],
    shortcut: [
      'Build the rest from the table: 37.5% = 3/8, 62.5% = 5/8, 87.5% = 7/8, 83.33% = 5/6.',
      'To increase a number by 16.67% (1/6), multiply by 7/6. To decrease by 12.5% (1/8), multiply by 7/8.',
    ],
    examples: [
      {
        question: 'Find 12.5% of 640.',
        steps: ['12.5% = 1/8.', '640 ÷ 8 = 80.'],
        answer: '80',
      },
      {
        question: 'Find 37.5% of 480.',
        steps: ['37.5% = 3/8.', '480 ÷ 8 = 60, then × 3 = 180.'],
        answer: '180',
      },
      {
        question: 'A salary of ₹6,000 is increased by 16.67%. New salary?',
        steps: ['16.67% = 1/6, so multiply by 7/6.', '6,000 ÷ 6 = 1,000, then × 7 = 7,000.'],
        answer: '₹7,000',
      },
    ],
    traps: [
      { trap: 'Rounding 1/7 to 17%.', fix: '1/7 = 14.28%. 16.67% is 1/6 — keep the two apart.' },
      { trap: 'Converting every percentage with long multiplication.', fix: 'Spot the fraction first; the arithmetic usually becomes one division.' },
    ],
    check: {
      question: 'What is 62.5% of 240?',
      options: ['140', '150', '160', '120'],
      correctIndex: 1,
      explanation: '62.5% = 5/8. 240 ÷ 8 = 30, and 30 × 5 = 150.',
    },
  },
  {
    id: 'income-expenditure-savings',
    title: 'Income, expenditure & savings',
    summary: 'Savings = income − expenditure, and the base-100 trick.',
    minutes: 7,
    keyIdea: [
      'Savings = Income − Expenditure. Savings is small compared with income, so a modest income change can change savings a lot.',
      'Assume income = 100. Then every percentage is directly the number of rupees, and the algebra disappears.',
    ],
    formulas: [
      { label: 'Savings', expr: 'Income − Expenditure' },
      { label: 'Savings %', expr: '(Savings / Income) × 100' },
      { label: 'Income ↑, expenditure fixed', expr: 'Extra income all goes to savings' },
    ],
    shortcut: [
      'Set income = 100 (or 100 × something convenient), write expenditure and savings, apply the changes, then compare.',
      'If income and expenditure change by the SAME percentage, savings changes by that same percentage too.',
    ],
    examples: [
      {
        question: 'A person saves 10% of income. Income rises 25%, expenditure stays the same. By what percent do savings increase?',
        steps: ['Income 100, savings 10, expenditure 90.', 'New income 125, expenditure 90, savings 35.', 'Increase = 25/10 × 100 = 250%.'],
        answer: '250%',
      },
      {
        question: 'A family spends 80% of income. Income rises 20% and expenditure rises 10%. New savings as a % of income?',
        steps: ['Income 100, expenditure 80, savings 20.', 'New income 120, new expenditure 88, savings 32.', '32/120 × 100 = 26.67%.'],
        answer: '26.67%',
      },
      {
        question: 'Ravi spends 75% of his income and saves ₹5,000 a month. His monthly income?',
        steps: ['Savings = 25% of income.', 'Income = 5,000 × 100 / 25 = ₹20,000.'],
        answer: '₹20,000',
      },
    ],
    traps: [
      { trap: 'Assuming the savings percentage stays the same after a change.', fix: 'Recompute savings from the new income and new expenditure.' },
      { trap: 'Applying the income growth rate to savings.', fix: 'Savings is the difference; recalculate it, do not scale it.' },
    ],
    check: {
      question: 'A person spends 70% of income. Income and expenditure both rise by 10%. What happens to savings?',
      options: ['No change', '10% increase', '7% increase', '30% increase'],
      correctIndex: 1,
      explanation: 'Income 100 → 110, expenditure 70 → 77, savings 30 → 33. That is +10%.',
    },
  },
  {
    id: 'percentage-comparison-a-more-than-b',
    title: 'Percentage comparison (A more than B)',
    summary: 'Why "A is 25% more" does not mean "B is 25% less".',
    minutes: 6,
    keyIdea: [
      'A percentage comparison always uses the thing you compare WITH as the base. "A is 25% more than B" uses B as 100. The reverse comparison uses A as 100, so the percentage is different.',
      'Convert to a ratio: A is 25% more than B means A : B = 125 : 100 = 5 : 4.',
    ],
    formulas: [
      { label: 'A is x% more than B', expr: 'B is x/(100 + x) × 100 % less than A' },
      { label: 'A is x% less than B', expr: 'B is x/(100 − x) × 100 % more than A' },
      { label: 'As a ratio', expr: 'A : B = (100 + x) : 100' },
    ],
    shortcut: [
      'Ratio method: 25% more → 5 : 4. The smaller one is 1 part short of 5, so 1/5 = 20% less.',
      'For chains (A vs B, C vs A), use multipliers and compare C with B at the end.',
    ],
    examples: [
      {
        question: 'A\'s salary is 25% more than B\'s. B\'s salary is what percent less than A\'s?',
        steps: ['A : B = 125 : 100 = 5 : 4.', 'B is 1 part less out of A\'s 5 parts: 1/5 = 20%.'],
        answer: '20% less',
      },
      {
        question: 'A is 20% less than B. B is what percent more than A?',
        steps: ['A : B = 80 : 100 = 4 : 5.', 'B is 1 part more than A\'s 4 parts: 1/4 = 25%.'],
        answer: '25% more',
      },
      {
        question: 'A is 50% more than B, and C is 20% less than A. How does C compare with B?',
        steps: ['Let B = 100, so A = 150.', 'C = 0.8 × 150 = 120.', 'C is 20% more than B.'],
        answer: 'C is 20% more than B',
      },
    ],
    traps: [
      { trap: 'Giving the same percentage in both directions.', fix: 'The base changes. Re-derive with the new base (or use the ratio method).' },
      { trap: 'Adding +50% and −20% in a chain.', fix: 'Multiply: 1.5 × 0.8 = 1.2.' },
    ],
    check: {
      question: 'A\'s income is 40% more than B\'s. B\'s income is what percent less than A\'s?',
      options: ['40%', '28.57%', '25%', '30%'],
      correctIndex: 1,
      explanation: 'A : B = 140 : 100. B is 40 less out of 140: 40/140 × 100 = 28.57%.',
    },
  },
];

export default percentagesLessons;
