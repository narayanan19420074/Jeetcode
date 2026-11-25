import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import { aiFundamentalsModule } from './aiFundamentals';
import { contextCostModule } from './contextCost';
import { mcpModule } from './mcpAgents';
import { orchestrationModule } from './orchestration';
import { planningModule } from './planning';
import { qualityModule } from './quality';
import { securityModule } from './security';
import { shippingModule } from './shipping';
import { stackModule } from './stack';
import { webFundamentalsModule } from './webFundamentals';
import { workflowModule } from './workflow';

// Order follows how a product is really built: understand the tools, understand the web, plan, choose a stack,
// work with AI in a loop, manage context and cost, connect tools (MCP), orchestrate, secure, test, evaluate and ship.
// It draws on widely used references (Anthropic's Claude Code best practices, the Model Context Protocol
// specification, OWASP Top 10 for LLM Applications). All text is original to JeetCode.
export const AI_DEV_COURSE = {
  slug: 'develop-with-ai',
  name: 'Develop with AI',
  section: 'ai',
  accent: COLOR_PALETTE.indigo[600],
  level: 'Beginner to Advanced',
  blurb: 'Plan, build, test and ship your own app with AI, from first principles.',
  desc: 'Learn how to build a real app with AI the way professional teams do: AI and web fundamentals, planning and design, frameworks, the Explore-Plan-Code-Commit loop, context and token management, MCP, agents and orchestration, security, testing, evaluation and hosting. Topics are grouped into Beginner, Intermediate and Advanced, with exercises beside every lesson. Your progress is saved on this device.',
  modules: [aiFundamentalsModule, webFundamentalsModule, planningModule, stackModule, workflowModule, contextCostModule, mcpModule, orchestrationModule, securityModule, qualityModule, shippingModule],
};
