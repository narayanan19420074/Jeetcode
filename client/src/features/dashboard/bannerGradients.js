import { COLOR_PALETTE } from '../../app/design/designTokens';
// Banner colours of the Library look, keyed by promo card. Phone home keeps its own copy until it is next refactored.
export const BANNER_GRADIENT = {
  contest: `linear-gradient(135deg,${COLOR_PALETTE.custom.orangeF7A33B},${COLOR_PALETTE.orange[600]})`,
  daily: `linear-gradient(135deg,${COLOR_PALETTE.custom.purple7E3FA8},${COLOR_PALETTE.custom.purple4A1F8C})`,
  prep: `linear-gradient(135deg,${COLOR_PALETTE.teal[600]},${COLOR_PALETTE.teal[900]})`,
  pro: `linear-gradient(135deg,${COLOR_PALETTE.amber[500]},${COLOR_PALETTE.amber[900]})`,
  aptitude: `linear-gradient(135deg,${COLOR_PALETTE.pink[600]},${COLOR_PALETTE.violet[900]})`,
  visualizer: `linear-gradient(135deg,${COLOR_PALETTE.blue[600]},${COLOR_PALETTE.indigo[950]})`,
};
