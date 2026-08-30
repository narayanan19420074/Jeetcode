import { ANIMATION_REGISTRY as LCM_HCF_ANIMATIONS } from './LcmHcfAnimations';
import { ANIMATION_REGISTRY as TIME_WORK_ANIMATIONS } from './TimeWorkAnimations';
import { ANIMATION_REGISTRY as PROBABILITY_ANIMATIONS } from './ProbabilityAnimations';
import { ANIMATION_REGISTRY as AVERAGES_ANIMATIONS } from './AveragesAnimations';
import { ANIMATION_REGISTRY as PERCENTAGE_ANIMATIONS } from './PercentageAnimations';
import { ANIMATION_REGISTRY as RATIO_PROPORTION_ANIMATIONS } from './RatioProportionAnimations';
import { ANIMATION_REGISTRY as PROFIT_LOSS_ANIMATIONS } from './ProfitLossAnimations';
import { ANIMATION_REGISTRY as SIMPLE_COMPOUND_INTEREST_ANIMATIONS } from './SimpleCompoundInterestAnimations';
import { ANIMATION_REGISTRY as TIME_SPEED_DISTANCE_ANIMATIONS } from './TimeSpeedDistanceAnimations';

// New topic? Import its ANIMATION_REGISTRY here and spread it in below —
// LearnTopicPage never needs to change.
export const ANIMATION_REGISTRY = {
  ...LCM_HCF_ANIMATIONS,
  ...TIME_WORK_ANIMATIONS,
  ...PROBABILITY_ANIMATIONS,
  ...AVERAGES_ANIMATIONS,
  ...PERCENTAGE_ANIMATIONS,
  ...RATIO_PROPORTION_ANIMATIONS,
  ...PROFIT_LOSS_ANIMATIONS,
  ...SIMPLE_COMPOUND_INTEREST_ANIMATIONS,
  ...TIME_SPEED_DISTANCE_ANIMATIONS,
};
