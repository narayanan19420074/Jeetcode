import { Grid } from '@mui/material';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import StatCard from '../components/StatCard';

const formatCount = (value) => value.toLocaleString();

const buildStatCards = (stats) => [
  {
    key: 'users',
    icon: <GroupRoundedIcon />,
    label: 'Total users',
    value: formatCount(stats.totalUsers),
    hint: `${formatCount(stats.dailyActiveUsers)} active today`,
  },
  {
    key: 'pro',
    icon: <WorkspacePremiumRoundedIcon />,
    label: 'Pro users',
    value: formatCount(stats.proUsers),
    color: 'secondary.main',
  },
  {
    key: 'problems',
    icon: <DescriptionRoundedIcon />,
    label: 'Problems live',
    value: formatCount(stats.totalProblems),
    hint: `${stats.pendingReviews} unpublished`,
    color: 'success.main',
  },
  {
    key: 'submissions',
    icon: <BoltRoundedIcon />,
    label: 'Submissions today',
    value: formatCount(stats.submissionsToday),
    hint: `Queue depth: ${stats.queueDepth}`,
    color: 'warning.main',
  },
];

export default function OverviewStatCards({ stats }) {
  return (
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {buildStatCards(stats).map(({ key, ...cardProps }) => (
        <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard {...cardProps} />
        </Grid>
      ))}
    </Grid>
  );
}
