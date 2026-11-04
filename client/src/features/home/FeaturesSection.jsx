import { Container, Grid } from '@mui/material';
import { FeatureCard, SmallCard } from './HomeCards';
import { SectionHeading } from './HomeCommon';
import { anchorOffset } from './homeStyles';

const MAIN_FEATURES = [
  {
    title: 'Aptitude',
    body: 'Learn it, practice it, then test yourself against the clock.',
    points: ['32 patterns, 3,200 questions', 'A short lesson before every topic', 'Timed tests that unlock the next level'],
    shot: '/screens/aptitude.png',
    alt: 'JeetCode aptitude lesson on percentages',
    cta: 'Try aptitude',
    path: '/aptitude',
  },
  {
    title: 'Coding',
    body: 'Write code in the browser and see the result straight away.',
    points: ['290+ problems from Easy to Hard', 'JavaScript, Python and C++', 'Company tags, so you know what gets asked'],
    shot: '/screens/problems.png',
    alt: 'JeetCode coding problem with the code editor',
    cta: 'Try a problem',
    path: '/problems',
  },
];

const EXTRA_FEATURES = [
  { title: 'Company prep', body: 'Follow a track for TCS NQT and other companies, with a readiness score.' },
  { title: 'Practice with a friend', body: 'Share a link. Solve in one editor with chat, voice and video.' },
  { title: 'Stay on track', body: 'Daily streaks, a leaderboard and a dashboard that shows your next step.' },
];

// What you get: aptitude and coding side by side, then the extras.
export default function FeaturesSection({ onNavigate }) {
  return (
    <Container id="features" maxWidth="lg" sx={{ py: { xs: 8, md: 11 }, scrollMarginTop: anchorOffset }}>
      <SectionHeading sub="Aptitude and coding are the two things placement tests ask for. Practice both here.">
        Everything for your placement test
      </SectionHeading>
      <Grid container spacing={{ xs: 2.5, md: 3 }}>
        {MAIN_FEATURES.map(({ path, ...feature }) => (
          <Grid key={feature.title} size={{ xs: 12, md: 6 }}>
            <FeatureCard {...feature} onClick={onNavigate(path)} />
          </Grid>
        ))}
        {EXTRA_FEATURES.map((feature) => (
          <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
            <SmallCard {...feature} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
