import { Box } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import { MenuCard } from '../../../../components/MenuCard';
import { useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import { buildTopicLines } from '../common/patternLines';
import ActionRow from './ActionRow';

// Practice and Test of the open topic, under the topic's name so it is clear what they cover.
function TopicRows({ topic, testPlan, onPractice, onTest }) {
  const lines = buildTopicLines(topic, testPlan);
  const noQuestions = topic.total === 0;
  return (
    <>
      <ActionRow icon={<CodeRoundedIcon />} accent={COLOR_PALETTE.emerald[500]} name="Practice" meta={lines.practice} onClick={onPractice} disabled={noQuestions} />
      <ActionRow icon={<TimerRoundedIcon />} accent={COLOR_PALETTE.amber[500]} name="Test" meta={lines.test} onClick={onTest} disabled={noQuestions} />
    </>
  );
}

// The only way to the timed paper of the whole pattern, which is what passing it needs to unlock the next pattern.
function FullTestRow({ line, onClick }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${pal.divider}` }}>
      <ActionRow icon={<FactCheckRoundedIcon />} accent={COLOR_PALETTE.indigo[500]} name="Full pattern test" meta={line} onClick={onClick} />
    </Box>
  );
}

// Right column of the desktop topic page: one card named after the open topic with its Practice and Test.
export default function RightColumn({ detail, topic }) {
  const { data, lines, goPractice, goTest } = detail;
  return (
    <MenuCard title={topic?.title ?? data.pattern.title}>
      {topic && <TopicRows topic={topic} testPlan={data.testPlan} onPractice={() => goPractice(topic.slug)} onTest={() => goTest(topic.slug)} />}
      <FullTestRow line={lines.test} onClick={() => goTest()} />
    </MenuCard>
  );
}
