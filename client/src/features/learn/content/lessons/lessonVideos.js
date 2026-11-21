// Curated YouTube explainers for lessons, keyed by lesson id (the lesson id is the sub-pattern slug).
// Only the public video id is stored; the player builds the embed and watch links from it.
// Number System is complete. Add the other patterns here as their lessons get videos.

export const LESSON_VIDEOS = {
  'types-of-numbers-classification': { id: 'aDC7uaB0hj0', title: 'Types of numbers: natural, whole, integers, rational and irrational' },
  'divisibility-rules': { id: '98p4lQBfc6E', title: 'Divisibility rules for 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 and 13' },
  'factors-number-of-factors': { id: 'r637OcBHeOU', title: 'Number of factors of a composite number' },
  'remainder-theorems-cyclicity': { id: 'mt-W-Gg-hPo', title: 'Finding remainders: totient method and cyclicity' },
  'unit-digit-last-two-digits': { id: 'u1Am0u97VhI', title: 'How to find the unit digit and last two digits' },
  'trailing-zeros-factorials': { id: 'zpvDctj8mM4', title: 'Number of trailing zeros in a factorial' },
  'base-conversion-binary': { id: 'M6c6Xw5mt90', title: 'Convert decimal to binary, octal and hexadecimal' },
  'prime-numbers': { id: '5liC14kBrQ4', title: 'Prime and composite numbers and how to test a larger number' },
  'recurring-decimals-rational-numbers': { id: 'RLCh8WYsJN0', title: 'Convert recurring decimals into fractions' },
  'sum-of-series-natural-squares-cubes': { id: 'D7o6oHP8vss', title: 'Sum of the first n natural numbers, squares and cubes' },
  'digit-missing-digit-problems': { id: 'uXCcQ55dPEs', title: 'Find the missing digit using divisibility rules' },
};

export const getVideoForLesson = (lessonId) => LESSON_VIDEOS[lessonId];
