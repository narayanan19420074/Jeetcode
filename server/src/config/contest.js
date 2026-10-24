// The one big contest. Everything the page, the dashboard card and the apply flow show comes from here,
// so a date / prize / rule change is a one-file edit. Bump `rulesVersion` when the rules change in a way
// people must re-accept (each application stores the version it accepted).
export const CONTEST = {
  id: 'grand-2026',
  title: 'JeetCode Grand Contest',
  tagline: '10 hard problems. ₹1,00,000 cash prize.',
  prizePool: 100000,
  startsAt: '2026-12-01T10:00:00+05:30', // 1 Dec 2026, 10:00 AM IST
  durationMinutes: 240,
  problemCount: 10,
  difficulty: 'Hard',
  rulesVersion: 1,
  // Fill this in AFTER the contest ends and the top ranks are verified. The contest page then shows the
  // winners on the 3D podium (only once the contest has ended). Rank 1-3, newest edit = one-file change:
  // { rank: 1, name: 'Asha K', handle: 'asha_k', solved: 10, prize: 50000 }
  winners: [],
  rules: [
    {
      id: 'fair-play',
      title: 'Fair play: no AI, no outside help',
      highlight: true,
      items: [
        'Using AI in any form is strictly banned from the moment the contest starts until it ends. This covers chatbots (ChatGPT, Claude, Gemini, Copilot Chat, DeepSeek, Grok, Perplexity and the like), AI code completion or agents (GitHub Copilot, Cursor, Windsurf, Codeium, Tabnine and the like), AI browser extensions, AI search summaries, and JeetCode\'s own AI hints.',
        'You may not ask, pay or let anyone else solve, debug or hint on a problem for you. No groups, no chats, no calls, no screen sharing during the contest.',
        'You may not share, post or discuss the problems or your solutions anywhere (WhatsApp, Telegram, Discord, social media, forums) until the contest is over and results are announced.',
        'Every solution must be written by you, in the contest. Copying from editorials, GitHub, other people\'s code or earlier AI output is cheating, even if you edit it afterwards.',
        'Allowed: official language and library documentation, and notes or code templates that you wrote yourself before the contest.',
        'One person, one account. Using a second account, or letting someone else use yours, gets all linked accounts disqualified.',
      ],
    },
    {
      id: 'verification',
      title: 'How we check',
      items: [
        'We may run plagiarism and similarity checks, look at submission timing and patterns, and read your code. Solutions that look AI-written, copied or shared can be disqualified.',
        'Prize winners must pass verification before any money is paid. We may ask you to explain your solutions live on a short call or video, answer follow-up questions about your code, and solve a similar problem on the spot.',
        'If you decline verification, cannot explain your own solutions, or do not respond within 7 days, you are disqualified and the prize moves to the next eligible rank.',
        'If you see someone cheating, report it to the organizers. Reports are reviewed in confidence.',
      ],
    },
    {
      id: 'format',
      title: 'Contest format',
      items: [
        'The contest has 10 Hard problems (coding) in one timed round of 4 hours, starting 1 December 2026 at 10:00 AM IST.',
        'You solve in the normal JeetCode workspace. Only submissions made during the contest window count.',
        'Ranking: more problems solved ranks higher. Ties are broken by lower total time, which is the time of your last accepted solution plus 5 minutes for every wrong submission on problems you solved.',
        'Time limits, memory limits and test cases are final. Accepted means passing all hidden tests.',
        'The organizers may fix a broken problem or extend the contest if there is a technical fault on our side. Any such change will be announced on this page.',
      ],
    },
    {
      id: 'eligibility',
      title: 'Who can enter',
      items: [
        'Free to enter. No payment is ever needed to apply or to take part.',
        'You must be 18 or older and have a JeetCode account in good standing.',
        'Applications close when the contest starts. You must apply before then to take part.',
        'JeetCode team members and their immediate family cannot win prizes.',
        'By applying you agree to these rules. Applying again or withdrawing before the start is allowed.',
      ],
    },
    {
      id: 'prize',
      title: 'Cash prize',
      items: [
        'Total cash prize pool: ₹1,00,000, paid in Indian rupees.',
        'How the pool is split between top ranks will be announced on this page before the contest starts.',
        'Prizes are paid by bank transfer or UPI to the verified winner, in the winner\'s own name, after verification is complete. You may be asked for a valid ID and bank details.',
        'Any taxes due on prize money are deducted or paid as required by Indian law.',
        'One prize per person. A prize that is not claimed within 30 days of the result announcement goes to the next eligible rank.',
      ],
    },
    {
      id: 'penalties',
      title: 'If you break the rules',
      items: [
        'Cheating or breaking any rule above leads to disqualification, loss of any prize, removal from the rankings, and a ban from future contests. Serious cases can lead to a ban of the account.',
        'If a prize has already been paid and cheating is found later, the prize must be returned.',
        'The organizers\' decision on rules, rankings, disqualification and prizes is final.',
      ],
    },
  ],
};

export const contestWindow = () => {
  const start = Date.parse(CONTEST.startsAt);
  return { start, end: start + CONTEST.durationMinutes * 60000 };
};
