// Registry mapping a lesson's `visualKey` to its Averages visual.
// The visuals themselves live in ./averages, grouped by lesson section.
import { BarAverageVisual, MissingLineVisual, TriadTriangleVisual } from './averages/foundationVisuals';
import { ConsecutiveDotsVisual, SeriesSumVisual } from './averages/seriesVisuals';
import { MemberAddedVisual, MemberRemovedVisual, MemberReplacedVisual, MultiChangeVisual } from './averages/groupChangeVisuals';
import { AgeTimelineVisual, SpeedDistanceVisual, SpeedTimeVisual, WeightedBalanceVisual } from './averages/specialTopicVisuals';
import { CorrectionFixVisual, TwoGroupCombineVisual, BatsmanChartVisual } from './averages/examPatternVisuals';

export const AVERAGES_VISUAL_REGISTRY = {
  barAverage: BarAverageVisual,
  missingLine: MissingLineVisual,
  triadTriangle: TriadTriangleVisual,
  consecutiveDots: ConsecutiveDotsVisual,
  seriesSum: SeriesSumVisual,
  memberAdded: MemberAddedVisual,
  memberRemoved: MemberRemovedVisual,
  memberReplaced: MemberReplacedVisual,
  multiChange: MultiChangeVisual,
  ageTimeline: AgeTimelineVisual,
  speedDistance: SpeedDistanceVisual,
  speedTime: SpeedTimeVisual,
  weightedBalance: WeightedBalanceVisual,
  correctionFix: CorrectionFixVisual,
  twoGroupCombine: TwoGroupCombineVisual,
  batsmanChart: BatsmanChartVisual,
};
