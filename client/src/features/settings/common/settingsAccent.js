import { COLOR_PALETTE } from '../../../app/design/designTokens';
// Each settings group has its own accent colour, like the sections on the phone home screen.
const GROUP_ACCENT = { Access: COLOR_PALETTE.indigo[500], Preferences: COLOR_PALETTE.orange[500], Security: COLOR_PALETTE.teal[500] };

export const accentFor = (groupLabel) => GROUP_ACCENT[groupLabel] || GROUP_ACCENT.Access;
