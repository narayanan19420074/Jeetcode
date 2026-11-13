import { Stack } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import ActionCard from './ActionCard';
import AlienCard from './AlienCard';

// Right column of the desktop topic page: the two ways to test yourself, then the alien earned in this topic.
export default function RightColumn({ detail }) {
  const { lines, rank, xp, goPractice, goTest } = detail;
  return (
    <Stack spacing={2}>
      <ActionCard icon={<CodeRoundedIcon />} accent={COLOR_PALETTE.emerald[500]} name="Practice" meta={lines.practice} onClick={() => goPractice()} />
      <ActionCard icon={<TimerRoundedIcon />} accent={COLOR_PALETTE.amber[500]} name="Test" meta={lines.test} onClick={goTest} />
      <AlienCard rank={rank} xp={xp} />
    </Stack>
  );
}
