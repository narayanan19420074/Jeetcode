import { lcmHcfTopic } from './lcmHcfContent';
import { timeWorkTopic } from './timeWorkContent';
import { probabilityTopic } from './probabilityContent';
import { averagesTopic } from './averagesContent';
import { percentageTopic } from './percentageContent';
import { ratioProportionTopic } from './ratioProportionContent';
import { profitLossTopic } from './profitLossContent';
import { simpleCompoundInterestTopic } from './simpleCompoundInterestContent';
import { timeSpeedDistanceTopic } from './timeSpeedDistanceContent';

// New topic? Import it here and add it to this array — LearnHomePage and
// LearnTopicPage both read from this single list.
export const learnTopics = [
  lcmHcfTopic,
  timeWorkTopic,
  probabilityTopic,
  averagesTopic,
  percentageTopic,
  ratioProportionTopic,
  profitLossTopic,
  simpleCompoundInterestTopic,
  timeSpeedDistanceTopic,
];

export function getTopicBySlug(slug) {
  return learnTopics.find((t) => t.slug === slug) || null;
}
