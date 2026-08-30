// Content is plain data on purpose — no backend model yet. Curated
// aptitude content changes rarely, so a JS/DB roundtrip isn't worth it
// for now; if an admin-editable CMS is needed later, this shape can be
// lifted into Mongo without changing how LearnTopicPage consumes it.

export const lcmHcfTopic = {
  slug: 'lcm-hcf',
  title: 'LCM & HCF',
  tagline: 'Lowest Common Multiple and Highest Common Factor, explained visually — step by step.',
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      subsections: [
        {
          id: 'what-are-lcm-hcf',
          title: 'What are LCM and HCF?',
          type: 'concept',
          videoUrl: '',
          explanation: [
            'LCM (Lowest Common Multiple) of two numbers is the smallest number that both numbers divide into exactly.',
            'HCF (Highest Common Factor), also called GCD, is the largest number that divides both numbers exactly.',
            'Example: for 12 and 18 — 12\'s multiples are 12, 24, 36...; 18\'s multiples are 18, 36...; the first common one is 36, so LCM(12, 18) = 36. 12\'s factors include 1, 2, 3, 4, 6, 12; 18\'s factors include 1, 2, 3, 6, 9, 18; the largest common one is 6, so HCF(12, 18) = 6.',
          ],
        },
      ],
    },
    {
      id: 'finding-lcm',
      title: 'Finding LCM',
      subsections: [
        {
          id: 'lcm-prime-factorization',
          title: 'Prime Factorization Method',
          type: 'animation',
          animationKey: 'primeFactorization',
          videoUrl: '',
          explanation: [
            'Break each number down into its prime factors, then take every prime at the HIGHEST power it appears in either number, and multiply those together.',
          ],
        },
        {
          id: 'lcm-division-method',
          title: 'Division Method',
          type: 'concept',
          videoUrl: '',
          explanation: [
            'Write both numbers side by side. Divide both by any prime number that divides at least one of them, bringing down numbers unchanged where a prime doesn\'t divide evenly. Keep dividing by successive primes until both rows reach 1.',
            'The LCM is the product of every divisor used, down the left-hand column.',
            '(Full animated walkthrough for this method coming in a future update.)',
          ],
        },
      ],
    },
    {
      id: 'finding-hcf',
      title: 'Finding HCF',
      subsections: [
        {
          id: 'hcf-prime-factorization',
          title: 'Prime Factorization Method',
          type: 'concept',
          videoUrl: '',
          explanation: [
            'Break each number into prime factors, then take only the primes common to BOTH numbers, each at its LOWEST shared power, and multiply those together.',
            '(Full animated walkthrough for this method coming in a future update.)',
          ],
        },
        {
          id: 'hcf-division-method',
          title: 'Division Method (Euclidean Algorithm)',
          type: 'concept',
          videoUrl: '',
          explanation: [
            'Divide the larger number by the smaller one and note the remainder. Then divide the previous divisor by that remainder. Repeat until the remainder is 0 — the last non-zero divisor is the HCF.',
            'This method is much faster than prime factorization for large numbers.',
            '(Full animated walkthrough for this method coming in a future update.)',
          ],
        },
      ],
    },
    {
      id: 'relationship',
      title: 'LCM–HCF Relationship',
      subsections: [
        {
          id: 'product-relation',
          title: 'Product Relation: a × b = LCM × HCF',
          type: 'animation',
          animationKey: 'hcfLcmRelation',
          videoUrl: '',
          explanation: [
            'For any two numbers a and b: a × b = LCM(a, b) × HCF(a, b). This is a shortcut — if you already know any three of the four values, you can find the fourth without recalculating from scratch.',
          ],
        },
      ],
    },
  ],
  practiceQuestions: [
    {
      id: 'q1',
      question: 'What is the LCM of 4 and 6?',
      options: ['10', '12', '24', '2'],
      correctIndex: 1,
      explanation: '4 = 2², 6 = 2×3. Highest powers: 2² × 3 = 12.',
    },
    {
      id: 'q2',
      question: 'What is the HCF of 18 and 24?',
      options: ['3', '6', '9', '12'],
      correctIndex: 1,
      explanation: '18 = 2×3², 24 = 2³×3. Common lowest powers: 2¹ × 3¹ = 6.',
    },
    {
      id: 'q3',
      question: 'If a × b = 96 and HCF(a, b) = 4, what is LCM(a, b)?',
      options: ['20', '24', '96', '4'],
      correctIndex: 1,
      explanation: 'a × b = LCM × HCF, so LCM = 96 ÷ 4 = 24.',
    },
    {
      id: 'q4',
      question: 'LCM of two co-prime numbers (HCF = 1) is always:',
      options: ['Their sum', 'Their product', 'The larger number', 'The smaller number'],
      correctIndex: 1,
      explanation: 'When HCF = 1, a × b = LCM × 1, so LCM = a × b — their product.',
    },
    {
      id: 'q5',
      question: 'What is the LCM of 12 and 18?',
      options: ['6', '30', '36', '216'],
      correctIndex: 2,
      explanation: '12 = 2²×3, 18 = 2×3². Highest powers: 2² × 3² = 4 × 9 = 36.',
    },
  ],
  practiceBank: {
    level1: [
      { id: 'lh-l1-1', question: 'What is the LCM of 4 and 6?', options: ['10', '12', '24', '8'], correctIndex: 1, explanation: 'Multiples of 4: 4,8,12; multiples of 6: 6,12. First common = 12.' },
      { id: 'lh-l1-2', question: 'What is the HCF of 8 and 12?', options: ['2', '4', '6', '8'], correctIndex: 1, explanation: 'Factors of 8: 1,2,4,8. Factors of 12: 1,2,3,4,6,12. Largest common = 4.' },
      { id: 'lh-l1-3', question: 'What is the LCM of 5 and 10?', options: ['5', '10', '15', '50'], correctIndex: 1, explanation: '10 is already a multiple of 5, so LCM = 10.' },
      { id: 'lh-l1-4', question: 'What is the HCF of 15 and 20?', options: ['5', '10', '15', '4'], correctIndex: 0, explanation: 'Factors of 15: 1,3,5,15. Factors of 20: 1,2,4,5,10,20. Largest common = 5.' },
      { id: 'lh-l1-5', question: 'What is the LCM of 3 and 7?', options: ['10', '14', '21', '21'], correctIndex: 2, explanation: '3 and 7 are co-prime (HCF=1), so LCM = 3 × 7 = 21.' },
      { id: 'lh-l1-6', question: 'What is the HCF of 9 and 27?', options: ['3', '9', '27', '1'], correctIndex: 1, explanation: '27 is a multiple of 9, so HCF = 9.' },
      { id: 'lh-l1-7', question: 'What is the LCM of 6 and 8?', options: ['14', '24', '48', '12'], correctIndex: 1, explanation: '6 = 2×3, 8 = 2³. LCM = 2³ × 3 = 24.' },
      { id: 'lh-l1-8', question: 'What is the HCF of 24 and 36?', options: ['6', '8', '12', '18'], correctIndex: 2, explanation: '24 = 2³×3, 36 = 2²×3². Common lowest powers: 2² × 3 = 12.' },
      { id: 'lh-l1-9', question: 'What is the LCM of 2, 3, and 4?', options: ['8', '12', '24', '6'], correctIndex: 1, explanation: 'LCM(2,3,4): 2²×3 = 12.' },
      { id: 'lh-l1-10', question: 'What is the HCF of 18, 24, and 30?', options: ['3', '6', '9', '12'], correctIndex: 1, explanation: 'All three share 2×3 = 6 as their largest common factor.' },
      { id: 'lh-l1-11', question: 'What is the LCM of 9 and 12?', options: ['24', '36', '48', '18'], correctIndex: 1, explanation: '9=3², 12=2²×3. LCM = 2²×3² = 36.' },
      { id: 'lh-l1-12', question: 'What is the HCF of 16 and 40?', options: ['4', '8', '16', '2'], correctIndex: 1, explanation: '16=2⁴, 40=2³×5. Common lowest power: 2³ = 8.' },
      { id: 'lh-l1-13', question: 'What is the LCM of 10 and 15?', options: ['30', '45', '60', '150'], correctIndex: 0, explanation: '10=2×5, 15=3×5. LCM = 2×3×5 = 30.' },
      { id: 'lh-l1-14', question: 'What is the HCF of 21 and 28?', options: ['3', '7', '14', '21'], correctIndex: 1, explanation: '21=3×7, 28=2²×7. Common factor: 7.' },
      { id: 'lh-l1-15', question: 'What is the LCM of 7 and 14?', options: ['7', '14', '21', '98'], correctIndex: 1, explanation: '14 is a multiple of 7, so LCM = 14.' },
    ],
    level2: [
      { id: 'lh-l2-1', question: 'If the HCF of two numbers is 6 and their product is 216, find their LCM.', options: ['24', '30', '36', '42'], correctIndex: 2, explanation: 'LCM = product ÷ HCF = 216 ÷ 6 = 36.' },
      { id: 'lh-l2-2', question: 'Two numbers are in the ratio 2:3, and their LCM is 48. Find the two numbers.', options: ['12, 18', '16, 24', '14, 21', '20, 30'], correctIndex: 1, explanation: 'Let numbers be 2x, 3x. LCM = 6x = 48 → x = 8. Numbers: 16, 24.' },
      { id: 'lh-l2-3', question: 'Find the smallest number exactly divisible by 6, 9, and 12.', options: ['24', '30', '36', '48'], correctIndex: 2, explanation: 'LCM(6,9,12) = 36.' },
      { id: 'lh-l2-4', question: 'Find the largest number that divides both 70 and 125, leaving remainders 5 and 8 respectively.', options: ['13', '15', '17', '19'], correctIndex: 0, explanation: 'HCF(70−5, 125−8) = HCF(65, 117) = 13.' },
      { id: 'lh-l2-5', question: 'Three bells ring at intervals of 4, 6, and 8 minutes. If they ring together at 9:00 AM, when will they next ring together?', options: ['9:12 AM', '9:24 AM', '9:36 AM', '9:48 AM'], correctIndex: 1, explanation: 'LCM(4,6,8) = 24 minutes → they ring together again at 9:24 AM.' },
      { id: 'lh-l2-6', question: 'Find the largest number that divides 245 and 1029, leaving remainder 5 in each case.', options: ['8', '12', '16', '20'], correctIndex: 2, explanation: 'HCF(245−5, 1029−5) = HCF(240, 1024) = 16.' },
      { id: 'lh-l2-7', question: 'The HCF and LCM of two numbers are 12 and 336. If one number is 48, find the other.', options: ['72', '84', '96', '108'], correctIndex: 1, explanation: 'Other number = (HCF × LCM) ÷ 48 = (12×336)÷48 = 84.' },
      { id: 'lh-l2-8', question: 'Find the smallest number which, when increased by 5, is exactly divisible by 12, 15, and 20.', options: ['45', '50', '55', '60'], correctIndex: 2, explanation: 'LCM(12,15,20) = 60. Number = 60 − 5 = 55.' },
      { id: 'lh-l2-9', question: 'Find the HCF of 36, 60, and 84.', options: ['6', '12', '18', '24'], correctIndex: 1, explanation: 'HCF(36,60,84) = 12.' },
      { id: 'lh-l2-10', question: 'Find the LCM of 15, 25, and 30.', options: ['100', '125', '150', '175'], correctIndex: 2, explanation: 'LCM(15,25,30) = 150.' },
      { id: 'lh-l2-11', question: 'Two numbers have HCF 15 and LCM 300. If one number is 75, find the other.', options: ['45', '50', '55', '60'], correctIndex: 1, explanation: 'Other = (HCF×LCM)÷75 = (15×300)÷75 = 60.' },
      { id: 'lh-l2-12', question: 'Find the smallest number greater than 100 which, when divided by 8, 12, and 16, leaves a remainder of 3 in each case.', options: ['99', '147', '195', '51'], correctIndex: 1, explanation: 'LCM(8,12,16)=48. Numbers of the form 48k+3 greater than 100: 48×3+3 = 147.' },
      { id: 'lh-l2-13', question: 'Find the greatest 4-digit number exactly divisible by 12, 15, and 18.', options: ['9720', '9840', '9900', '9960'], correctIndex: 2, explanation: 'LCM(12,15,18)=180. Greatest 4-digit multiple: 180 × 55 = 9900.' },
      { id: 'lh-l2-14', question: 'Find the smallest 4-digit number exactly divisible by 16, 24, and 36.', options: ['1008', '1044', '1080', '1152'], correctIndex: 0, explanation: 'LCM(16,24,36)=144. Smallest 4-digit multiple: 144 × 7 = 1008.' },
      { id: 'lh-l2-15', question: 'The product of two numbers is 1600 and their HCF is 8. Find their LCM.', options: ['150', '175', '200', '225'], correctIndex: 2, explanation: 'LCM = product ÷ HCF = 1600 ÷ 8 = 200.' },
    ],
    level3: [
      { id: 'lh-l3-1', question: 'Three numbers are in the ratio 3:4:5, and their LCM is 2400. Find their HCF.', options: ['20', '30', '40', '50'], correctIndex: 2, explanation: 'Numbers = 3x,4x,5x. LCM = 60x = 2400 → x = 40. Since HCF(3,4,5)=1, HCF of the numbers = 40.' },
      { id: 'lh-l3-2', question: 'Find the least number which, when divided by 6, 7, 8, 9, and 10, leaves remainder 1 in each case, but is exactly divisible by 11.', options: ['2521', '25201', '2311', '25211'], correctIndex: 1, explanation: 'LCM(6,7,8,9,10)=2520. Numbers of form 2520k+1; testing k=10 gives 25201, which is exactly divisible by 11.' },
      { id: 'lh-l3-3', question: 'Two numbers are in the ratio 4:5. Their LCM is 140. Find their sum.', options: ['54', '58', '63', '70'], correctIndex: 2, explanation: 'Numbers = 4x,5x. LCM = 20x = 140 → x=7. Numbers: 28, 35. Sum = 63.' },
      { id: 'lh-l3-4', question: 'Find the HCF of two numbers whose LCM is 180 and product is 2160.', options: ['8', '10', '12', '15'], correctIndex: 2, explanation: 'HCF = product ÷ LCM = 2160 ÷ 180 = 12.' },
      { id: 'lh-l3-5', question: 'Find the smallest 3-digit number that leaves remainder 2 when divided by 5, 6, 4, and 3.', options: ['102', '112', '122', '132'], correctIndex: 2, explanation: 'LCM(5,6,4,3)=60. Numbers of form 60k+2, smallest 3-digit one: 60×2+2 = 122.' },
      { id: 'lh-l3-6', question: 'A, B, and C run around a circular track, completing a round in 12, 18, and 24 minutes respectively. After how many minutes will all three meet again at the starting point?', options: ['36', '48', '60', '72'], correctIndex: 3, explanation: 'LCM(12,18,24) = 72 minutes.' },
      { id: 'lh-l3-7', question: 'The HCF of two numbers is 23, and the other two factors of their LCM are 13 and 14. Find the larger of the two numbers.', options: ['299', '308', '322', '345'], correctIndex: 2, explanation: 'The two numbers are 23×13=299 and 23×14=322. The larger is 322.' },
      { id: 'lh-l3-8', question: 'Find the greatest number that divides 43, 91, and 183, leaving the same remainder in each case.', options: ['2', '4', '6', '8'], correctIndex: 1, explanation: 'Differences: 91−43=48, 183−91=92, 183−43=140. HCF(48,92,140) = 4.' },
      { id: 'lh-l3-9', question: 'Three pieces of timber 42m, 49m, and 63m long must be divided into planks of the same maximum possible length. Find that length.', options: ['5m', '6m', '7m', '9m'], correctIndex: 2, explanation: 'HCF(42,49,63) = 7m.' },
      { id: 'lh-l3-10', question: 'The ratio of two numbers is 3:4 and their HCF is 4. Find their LCM.', options: ['36', '42', '48', '54'], correctIndex: 2, explanation: 'Numbers = 12, 16. LCM = 4 × LCM(3,4) = 4 × 12 = 48.' },
    ],
  },
};
