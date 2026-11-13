import { Alert, Box, Skeleton } from '@mui/material';
import BackIconButton from '../../../../components/BackIconButton';
import DesktopPageFrame from '../../../../components/DesktopPageFrame';
import { LibraryFont } from '../../../dashboard/components/libraryStyle';
import { RADII_PX } from '../../../../app/design/designTokens';
import LearnCard from './LearnCard';
import RightColumn from './RightColumn';
import TopicsNav from './TopicsNav';

function PatternLoadingState({ error }) {
  return (
    <DesktopPageFrame left={<BackIconButton to="/aptitude" label="Back to Aptitude" />}>
      {error ? <Alert severity="error">{error}</Alert> : <Skeleton variant="rounded" height={260} sx={{ borderRadius: RADII_PX.card }} />}
    </DesktopPageFrame>
  );
}

// Desktop topic page in the shared page frame (same margins, column widths and hairlines as the Dashboard):
// topics and the back icon on the left, Learn in the middle, Practice, Test and the alien on the right.
export default function PatternDesktopView({ detail }) {
  const { data, error, learn, lines, goLearn, goPractice } = detail;
  if (!data) return <LibraryFont><PatternLoadingState error={error} /></LibraryFont>;
  return (
    <LibraryFont>
      <DesktopPageFrame left={<TopicsNav topics={data.practice.bySubPattern} onPickTopic={goPractice} />} right={<RightColumn detail={detail} />}>
        <Box>
          <LearnCard title={data.pattern.title} meta={lines.learn} learn={learn} onLearn={goLearn} />
        </Box>
      </DesktopPageFrame>
    </LibraryFont>
  );
}
