import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import { systemBuildingBlocks, systemFoundations } from './systemBasics';
import { asyncAndEdge, dataAtScale } from './systemData';
import { architectureModule, caseStudies, operatingModule } from './systemArchitecture';

// Lesson order follows how system design is usually learned: requirements and estimation, then the core building blocks,
// then data at scale and asynchronous work, then architecture, case studies and operations. It draws on widely used
// references (Designing Data-Intensive Applications, the System Design Primer, Google SRE). All text is original to JeetCode.
export const SYSTEM_DESIGN_COURSE = {
  slug: 'system-design',
  name: 'System Design',
  section: 'system-design',
  accent: COLOR_PALETTE.teal[600],
  level: 'Beginner to Advanced',
  blurb: 'Scalable systems: building blocks, data, trade-offs and case studies.',
  desc: 'Learn to design scalable, reliable systems. Start with requirements and estimation, learn the building blocks (APIs, databases, caches, load balancers), then data at scale, queues, resilience and full case studies such as a URL shortener, chat and news feed. Topics are grouped into Beginner, Intermediate and Advanced, with exercises beside every lesson. Your progress is saved on this device.',
  modules: [systemFoundations, systemBuildingBlocks, dataAtScale, asyncAndEdge, architectureModule, caseStudies, operatingModule],
};
