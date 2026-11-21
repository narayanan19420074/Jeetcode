import { SIZES } from '../../../app/design/designTokens';

// Column widths shared by the table header and every player row, so the numbers line up.
export const statsColumnWidth = (track) => (track === 'coding' ? SIZES.leaderboard.statsCoding : SIZES.leaderboard.statsSingle);

export const STATS_LABEL = { coding: 'Easy / Medium / Hard', aptitude: 'Solved', overall: 'Solved' };
