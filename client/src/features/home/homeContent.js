import { fmtDuration, inr } from '../contest/contestUtils';

// --- Copy rules for this page -------------------------------------------
// Plain words a student understands in five seconds. One promise (coding +
// aptitude, one place), one action (Start free). No animation that does not
// explain something, no libraries beyond MUI. Hooks may be strong; claims may
// not be false: every number comes from the content in this repo, no invented
// testimonials, no "guaranteed selection". Keep prices in sync with /pricing.
export const START_LABEL = 'Start practicing';

export const STATS = [
  { value: '290+', label: 'coding problems' },
  { value: '3,200', label: 'aptitude questions' },
  { value: '32', label: 'patterns' },
];

export const STEPS = [
  { title: 'Create your account', body: 'It takes about 30 seconds.' },
  { title: 'Pick where to begin', body: 'Aptitude pattern 1, or an Easy coding problem.' },
  { title: 'Practice a little every day', body: 'Streaks and scores show what is done and what is left.' },
];

export const PRO_FEATURES = [
  'Every company-tagged coding problem',
  'Unlimited AI hints',
  'The full TCS NQT aptitude test suite',
  'Priority code judging at peak hours',
];

export const FREE_FEATURES = [
  'Coding problems without company tags',
  'Aptitude patterns with lessons',
  'Dashboard, streaks and the leaderboard',
  'Pair rooms and the algorithm visualizer',
];

// Same prices as the Pricing page. Keep in sync.
export const PRICE_MONTH = 149;
export const PRICE_YEAR = 1199;

export const NAV_ANCHORS = [
  ['What you get', '#features'],
  ['How it works', '#how-it-works'],
  ['Pricing', '#pricing'],
];

export const LEGAL_LINKS = [
  ['Privacy Policy', '/privacy'],
  ['Terms of Service', '/terms'],
  ['Refund & Cancellation', '/refund'],
  ['Help & Support', '/help'],
];

// The contest answer depends on the live contest config, so it is built from the contest instead of stored as text.
const contestAnswer = (contest) =>
  contest && contest.status !== 'ended'
    ? `The ${contest.title} has ${contest.problemCount} ${contest.difficulty.toLowerCase()} problems, ${fmtDuration(contest.durationMinutes)} on the clock and a ${inr(contest.prizePool)} prize pool. AI tools are banned for the whole contest. Read the rules on the contest page before you apply.`
    : 'Contests run on their own page, with the rules and prizes listed up front. Create an account and you will see the next one as soon as it opens.';

const FAQ_ITEMS = [
  {
    q: 'Is JeetCode really free?',
    a: 'Yes. Sign up and start practicing right away. A few extras, like company-tagged problems and unlimited AI hints, are in JeetCode Pro. Add it only if you want it.',
  },
  {
    q: 'Why one place for coding and aptitude?',
    a: 'Placement tests ask for both. When they sit on one dashboard, you can see what you have covered and what is left, so you stop guessing what to do next.',
  },
  {
    q: "I'm just starting. Where do I begin?",
    a: 'Open aptitude pattern 1, or pick an Easy coding problem. Each aptitude topic has a short lesson first, and your dashboard always shows the next step.',
  },
  {
    q: 'Is the aptitude section only for TCS NQT?',
    a: 'The TCS NQT track is live, with its exam sections and a readiness score. The 32 patterns (percentages, time and work, ratios, probability and more) help in other company aptitude rounds too.',
  },
  { q: 'Which languages can I code in?', a: 'JavaScript, Python and C++. Every submission runs against test cases and comes back with a verdict.' },
  {
    q: 'Can I practice with a friend?',
    a: 'Yes. Create a pair room and send the link. You both get one shared editor with chat, voice and video. Your friend can join as a guest.',
  },
  { q: 'Tell me about the contest.', answer: contestAnswer },
  { q: 'Does it work on my phone?', a: 'Yes. JeetCode works well on phones, and you can add it to your home screen to open it like an app.' },
  {
    q: 'Can I cancel Pro?',
    a: 'Yes, anytime from your account. You keep Pro until the end of the period you paid for. Details are on the Refund & Cancellation page.',
  },
];

export const buildFaq = (contest) => FAQ_ITEMS.map(({ q, a, answer }) => ({ q, a: answer ? answer(contest) : a }));
