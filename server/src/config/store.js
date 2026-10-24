// JeetCode Store + coin economy. One place to tune it: change a number here and
// both the API and the Store pages follow (the client only renders what the
// server sends back).
//
// Static catalog lives here. Only the *mutable* bits (price, stock, active) are
// kept in the StoreItem collection so an admin can change them without a deploy.
// A missing StoreItem row is created on first request from the defaults below
// and never overwritten afterwards.

// ---------- Earning rules ----------
export const COIN_RULES = {
  solve: { Easy: 10, Medium: 25, Hard: 50 }, // first Accepted solve of a problem
  dailyBase: 5, // daily check-in (needs >= 1 Accepted submission today, UTC)
  dailyStreakBonusCap: 10, // + 1 coin per streak day, up to this many
  weeklyStreakBonus: 25, // extra on every 7th streak day
  questXpToCoins: 1, // quest claim: xp * this
};

// Rows shown on the "Ways to earn" card.
export const EARN_WAYS = [
  { id: 'solve-easy', title: 'Solve an Easy problem', coins: COIN_RULES.solve.Easy, note: 'First Accepted solve only' },
  { id: 'solve-medium', title: 'Solve a Medium problem', coins: COIN_RULES.solve.Medium, note: 'First Accepted solve only' },
  { id: 'solve-hard', title: 'Solve a Hard problem', coins: COIN_RULES.solve.Hard, note: 'First Accepted solve only' },
  { id: 'daily', title: 'Daily check-in', coins: `${COIN_RULES.dailyBase}+`, note: `Solve 1 problem today, then claim. +1 per streak day (max +${COIN_RULES.dailyStreakBonusCap})` },
  { id: 'weekly', title: '7-day streak bonus', coins: COIN_RULES.weeklyStreakBonus, note: 'Added to the check-in on every 7th streak day' },
  { id: 'quests', title: 'Claim a quest reward', coins: 'XP', note: 'Every quest you claim also pays its XP as coins' },
];

// ---------- Shipping ----------
export const SHIP_COUNTRY = 'India';
export const PHYSICAL_MIN_SOLVED = 10; // problems solved before merch can be redeemed
export const LOW_STOCK_AT = 10;

// ---------- Categories ----------
export const CATEGORIES = [
  { id: 'premium', label: 'Premium' },
  { id: 'courses', label: 'Courses' },
  { id: 'merch', label: 'Merch' },
];

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// kind: 'pro' | 'course' | 'physical'
export const CATALOG = [
  // ---- Premium ----
  { slug: 'pro-7d', name: 'Pro · 7 days', category: 'premium', kind: 'pro', days: 7, price: 350, stock: null, art: 'pro', accent: '#F59E0B', blurb: 'A week of every Pro feature.', desc: 'Company-tagged problems, unlimited AI hints and the full aptitude test suite for 7 days. Days are added on top of any Pro time you already have from quests or license keys.' },
  { slug: 'pro-30d', name: 'Pro · 30 days', category: 'premium', kind: 'pro', days: 30, price: 1200, stock: null, art: 'pro', accent: '#F59E0B', popular: true, blurb: 'One full month of Pro.', desc: 'Company-tagged problems, unlimited AI hints and the full aptitude test suite for 30 days. Best value per coin for steady prep.' },
  { slug: 'pro-90d', name: 'Pro · 90 days', category: 'premium', kind: 'pro', days: 90, price: 3000, stock: null, art: 'pro', accent: '#F59E0B', blurb: 'Three months of Pro, 17% cheaper per day.', desc: 'Everything in Pro for a full placement season. Cheapest per-day option.' },

  // ---- Courses (curated guided paths; progress is tracked per lesson) ----
  {
    slug: 'dsa-interview-sprint', name: 'DSA Interview Sprint', category: 'courses', kind: 'course', price: 1500, stock: null, art: 'course', accent: '#6366F1',
    level: 'Beginner → Intermediate', blurb: '8 modules of must-know patterns, in order.',
    desc: 'A guided path through the patterns interviewers ask most: arrays and hashing, two pointers, sliding window, stacks, binary search, greedy, graphs and dynamic programming. Every lesson drops you straight into the matching practice set, and your progress is tracked.',
    modules: [
      { id: 'm1', title: 'Arrays & hashing', lessons: [
        { id: 'l1', title: 'Array warm-up (Easy)', minutes: 40, kind: 'practice', href: '/problems?tag=Array&difficulty=Easy' },
        { id: 'l2', title: 'Hash table patterns', minutes: 45, kind: 'practice', href: '/problems?tag=Hash%20Table' },
        { id: 'l3', title: 'Prefix sums', minutes: 35, kind: 'practice', href: '/problems?tag=Prefix%20Sum' },
      ] },
      { id: 'm2', title: 'Two pointers & sliding window', lessons: [
        { id: 'l1', title: 'Two pointers', minutes: 45, kind: 'practice', href: '/problems?tag=Two%20Pointers' },
        { id: 'l2', title: 'Sliding window', minutes: 45, kind: 'practice', href: '/problems?tag=Sliding%20Window' },
      ] },
      { id: 'm3', title: 'Stacks & strings', lessons: [
        { id: 'l1', title: 'Stack problems', minutes: 40, kind: 'practice', href: '/problems?tag=Stack' },
        { id: 'l2', title: 'String manipulation', minutes: 40, kind: 'practice', href: '/problems?tag=String' },
      ] },
      { id: 'm4', title: 'Searching & sorting', lessons: [
        { id: 'l1', title: 'See sorting in motion', minutes: 20, kind: 'visual', href: '/visualizer' },
        { id: 'l2', title: 'Binary search', minutes: 45, kind: 'practice', href: '/problems?tag=Binary%20Search' },
        { id: 'l3', title: 'Sorting problems', minutes: 35, kind: 'practice', href: '/problems?tag=Sorting' },
      ] },
      { id: 'm5', title: 'Greedy & math', lessons: [
        { id: 'l1', title: 'Greedy choices', minutes: 45, kind: 'practice', href: '/problems?tag=Greedy' },
        { id: 'l2', title: 'Math & bit tricks', minutes: 40, kind: 'practice', href: '/problems?tag=Bit%20Manipulation' },
      ] },
      { id: 'm6', title: 'Recursion & backtracking', lessons: [
        { id: 'l1', title: 'Recursion basics', minutes: 35, kind: 'practice', href: '/problems?tag=Recursion' },
        { id: 'l2', title: 'Backtracking', minutes: 45, kind: 'practice', href: '/problems?tag=Backtracking' },
      ] },
      { id: 'm7', title: 'Graphs', lessons: [
        { id: 'l1', title: 'BFS', minutes: 40, kind: 'practice', href: '/problems?tag=BFS' },
        { id: 'l2', title: 'DFS', minutes: 40, kind: 'practice', href: '/problems?tag=DFS' },
        { id: 'l3', title: 'Graph problems', minutes: 45, kind: 'practice', href: '/problems?tag=Graph' },
      ] },
      { id: 'm8', title: 'Dynamic programming', lessons: [
        { id: 'l1', title: 'DP on the visualizer', minutes: 25, kind: 'visual', href: '/visualizer' },
        { id: 'l2', title: 'DP — Easy', minutes: 45, kind: 'practice', href: '/problems?tag=Dynamic%20Programming&difficulty=Easy' },
        { id: 'l3', title: 'DP — Medium', minutes: 60, kind: 'practice', href: '/problems?tag=Dynamic%20Programming&difficulty=Medium' },
      ] },
    ],
  },
  {
    slug: 'aptitude-mastery', name: 'Aptitude Mastery', category: 'courses', kind: 'course', price: 1200, stock: null, art: 'course', accent: '#10B981',
    level: 'All levels', blurb: 'Quant fundamentals, topic by topic.',
    desc: 'Work through the quant topics placement tests repeat every year. Each lesson opens the topic hub, so you can learn, practise and take a timed test, and tick it off here when you are comfortable.',
    modules: [
      { id: 'm1', title: 'Percentages & ratios', lessons: [
        { id: 'l1', title: 'Percentages', minutes: 50, kind: 'practice', href: '/aptitude/percentages' },
        { id: 'l2', title: 'Ratio & proportion', minutes: 45, kind: 'practice', href: '/aptitude/ratio-and-proportion' },
        { id: 'l3', title: 'Averages', minutes: 40, kind: 'practice', href: '/aptitude/averages' },
        { id: 'l4', title: 'Mixtures & alligations', minutes: 45, kind: 'practice', href: '/aptitude/mixtures-and-alligations' },
      ] },
      { id: 'm2', title: 'Business maths', lessons: [
        { id: 'l1', title: 'Profit & loss', minutes: 50, kind: 'practice', href: '/aptitude/profit-and-loss' },
        { id: 'l2', title: 'Simple & compound interest', minutes: 45, kind: 'practice', href: '/aptitude/simple-and-compound-interest' },
        { id: 'l3', title: 'Partnership', minutes: 35, kind: 'practice', href: '/aptitude/partnership' },
      ] },
      { id: 'm3', title: 'Time, speed & work', lessons: [
        { id: 'l1', title: 'Time & work', minutes: 50, kind: 'practice', href: '/aptitude/time-and-work' },
        { id: 'l2', title: 'Pipes & cisterns', minutes: 35, kind: 'practice', href: '/aptitude/pipes-and-cisterns' },
        { id: 'l3', title: 'Speed, time & distance', minutes: 50, kind: 'practice', href: '/aptitude/speed-time-and-distance' },
        { id: 'l4', title: 'Problems on trains', minutes: 40, kind: 'practice', href: '/aptitude/problems-on-trains' },
        { id: 'l5', title: 'Boats & streams', minutes: 35, kind: 'practice', href: '/aptitude/boats-and-streams' },
      ] },
      { id: 'm4', title: 'Numbers & algebra', lessons: [
        { id: 'l1', title: 'Number system', minutes: 50, kind: 'practice', href: '/aptitude/number-system' },
        { id: 'l2', title: 'HCF & LCM', minutes: 40, kind: 'practice', href: '/aptitude/hcf-and-lcm' },
        { id: 'l3', title: 'Algebra', minutes: 45, kind: 'practice', href: '/aptitude/algebra' },
        { id: 'l4', title: 'Simplification & approximation', minutes: 40, kind: 'practice', href: '/aptitude/simplification-and-approximation' },
      ] },
      { id: 'm5', title: 'Counting & chance', lessons: [
        { id: 'l1', title: 'Permutation & combination', minutes: 55, kind: 'practice', href: '/aptitude/permutation-and-combination' },
        { id: 'l2', title: 'Probability', minutes: 50, kind: 'practice', href: '/aptitude/probability' },
      ] },
    ],
  },
  {
    slug: 'logical-reasoning-pack', name: 'Logical Reasoning Pack', category: 'courses', kind: 'course', price: 900, stock: null, art: 'course', accent: '#EC4899',
    level: 'All levels', blurb: 'Series, coding-decoding, directions & more.',
    desc: 'The reasoning topics that show up in every campus test: series, coding-decoding, blood relations, direction sense and calendar/clock. Short topics, quick wins.',
    modules: [
      { id: 'm1', title: 'Patterns & series', lessons: [
        { id: 'l1', title: 'Number series', minutes: 40, kind: 'practice', href: '/aptitude/number-series' },
        { id: 'l2', title: 'Letter & alphabet series', minutes: 35, kind: 'practice', href: '/aptitude/letter-and-alphabet-series' },
        { id: 'l3', title: 'Coding-decoding', minutes: 35, kind: 'practice', href: '/aptitude/coding-decoding' },
      ] },
      { id: 'm2', title: 'Relations & directions', lessons: [
        { id: 'l1', title: 'Blood relations', minutes: 35, kind: 'practice', href: '/aptitude/blood-relations' },
        { id: 'l2', title: 'Direction sense', minutes: 30, kind: 'practice', href: '/aptitude/direction-sense' },
      ] },
      { id: 'm3', title: 'Time puzzles', lessons: [
        { id: 'l1', title: 'Calendar & clock', minutes: 40, kind: 'practice', href: '/aptitude/calendar-and-clock' },
        { id: 'l2', title: 'Races & circular tracks', minutes: 35, kind: 'practice', href: '/aptitude/races-and-circular-tracks' },
      ] },
    ],
  },
  {
    slug: 'campus-placement-roadmap', name: 'Campus Placement Roadmap', category: 'courses', kind: 'course', price: 1000, stock: null, art: 'course', accent: '#0EA5E9',
    level: 'Beginner', blurb: 'From zero to your first company test.',
    desc: 'A start-to-finish plan for campus drives: pick target companies, build your aptitude base, get your coding fundamentals in place and rehearse with a timed paper.',
    modules: [
      { id: 'm1', title: 'Know the target', lessons: [
        { id: 'l1', title: 'Pick companies & read their pattern', minutes: 25, kind: 'read', href: '/prep' },
        { id: 'l2', title: 'Entrance exams overview', minutes: 20, kind: 'read', href: '/exams' },
      ] },
      { id: 'm2', title: 'Build the base', lessons: [
        { id: 'l1', title: 'Aptitude: percentages', minutes: 50, kind: 'practice', href: '/aptitude/percentages' },
        { id: 'l2', title: 'Aptitude: time & work', minutes: 50, kind: 'practice', href: '/aptitude/time-and-work' },
        { id: 'l3', title: 'Coding: arrays', minutes: 45, kind: 'practice', href: '/problems?tag=Array&difficulty=Easy' },
        { id: 'l4', title: 'Coding: strings', minutes: 45, kind: 'practice', href: '/problems?tag=String&difficulty=Easy' },
      ] },
      { id: 'm3', title: 'Rehearse', lessons: [
        { id: 'l1', title: 'Take a timed aptitude test', minutes: 45, kind: 'practice', href: '/aptitude' },
        { id: 'l2', title: 'Pair up and solve together', minutes: 40, kind: 'practice', href: '/pair' },
        { id: 'l3', title: 'Build a study plan', minutes: 15, kind: 'read', href: '/dashboard?view=plans' },
      ] },
    ],
  },

  // ---- Merch (ships within India) ----
  { slug: 'jeetcode-tee', name: 'JeetCode Dev Tee', category: 'merch', kind: 'physical', price: 2500, stock: 100, perUser: 2, art: 'tee', accent: '#6366F1', popular: true, sizes: SIZES, colors: ['Black', 'Navy', 'White'], blurb: '100% cotton, 220 GSM, printed logo.', desc: 'Unisex regular fit, 100% combed cotton, 220 GSM. Small JeetCode mark on the chest, "Accepted." on the back. Check the size chart before ordering — items cannot be exchanged.' },
  { slug: 'jeetcode-hoodie', name: 'JeetCode Hoodie', category: 'merch', kind: 'physical', price: 5500, stock: 40, perUser: 1, art: 'hoodie', accent: '#8B5CF6', sizes: SIZES, colors: ['Black', 'Charcoal'], blurb: 'Fleece-lined, kangaroo pocket.', desc: 'Heavy 320 GSM fleece hoodie with embroidered JeetCode mark. Warm enough for those 2 a.m. debugging sessions.' },
  { slug: 'jeetcode-mug', name: 'Accepted. Mug', category: 'merch', kind: 'physical', price: 1300, stock: 80, perUser: 2, art: 'mug', accent: '#10B981', blurb: 'Ceramic, 325 ml, dishwasher safe.', desc: 'White ceramic mug that says "Accepted." in green. Because every coffee needs a green tick.' },
  { slug: 'jeetcode-stickers', name: 'Sticker Pack (10)', category: 'merch', kind: 'physical', price: 450, stock: 300, perUser: 3, art: 'stickers', accent: '#F43F5E', blurb: '10 waterproof laptop stickers.', desc: 'Ten die-cut vinyl stickers: JeetCode logo, "Accepted.", "Time Limit Exceeded", "Wrong Answer" and more. Waterproof and scratch resistant.' },
  { slug: 'jeetcode-notebook', name: 'Problem-Solver Notebook', category: 'merch', kind: 'physical', price: 700, stock: 120, perUser: 3, art: 'notebook', accent: '#0EA5E9', blurb: 'A5 dotted, 160 pages.', desc: 'A5 dotted notebook with a hard cover and lay-flat binding. Dry-run your code on paper like it is 2010.' },
  { slug: 'jeetcode-cap', name: 'JeetCode Cap', category: 'merch', kind: 'physical', price: 1500, stock: 60, perUser: 2, art: 'cap', accent: '#F59E0B', colors: ['Black', 'Navy'], blurb: 'Adjustable cotton cap.', desc: 'Six-panel cotton cap with embroidered logo and an adjustable strap. One size fits most.' },
];

export const ITEM_BY_SLUG = new Map(CATALOG.map((i) => [i.slug, i]));

export const COURSE_ITEMS = CATALOG.filter((i) => i.kind === 'course');

// Every lesson id is "<moduleId>.<lessonId>", e.g. "m2.l1".
export const lessonKey = (moduleId, lessonId) => `${moduleId}.${lessonId}`;

export function courseLessonKeys(item) {
  return (item?.modules || []).flatMap((m) => m.lessons.map((l) => lessonKey(m.id, l.id)));
}

// ---------- Order lifecycle ----------
export const ORDER_STATUSES = ['placed', 'processing', 'shipped', 'delivered', 'fulfilled', 'cancelled'];
// Allowed admin moves for physical orders. Cancelling refunds the coins.
export const ORDER_TRANSITIONS = {
  placed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  fulfilled: [],
  cancelled: [],
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];
