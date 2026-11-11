import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import AppCard from '../../../components/ui/AppCard';
import CompanyAvatar from '../../../components/CompanyAvatar';
import { examDateLabel } from './examSchedule';
import { LIB_TRACKING, libCompactSolidBtnSx, libCompactTintBtnSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

// One exam: logo, name and date, then Apply (the official site) and Mock test.
export default function ExamCard({ exam, examOn }) {
  const navigate = useNavigate();
  return (
    <AppCard component="article">
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <CompanyAvatar name={exam.brand || exam.short} size={SIZES.avatar.lg} />
        <Box sx={{ minWidth: SIZES.flexShrinkMinWidth }}>
          <Typography noWrap sx={{ fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.bold }}>{exam.name}</Typography>
          <Typography noWrap sx={{ color: 'text.secondary', fontSize: FONT_SIZES.body, letterSpacing: LIB_TRACKING }}>{examDateLabel(examOn)}</Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button component="a" href={exam.applyUrl} target="_blank" rel="noopener noreferrer" disableElevation sx={libCompactSolidBtnSx}>Apply</Button>
        <Button onClick={() => navigate('/mocks')} disableElevation sx={libCompactTintBtnSx}>Mock test</Button>
      </Stack>
    </AppCard>
  );
}
