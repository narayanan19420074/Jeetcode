import { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography, alpha } from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import RadarRoundedIcon from '@mui/icons-material/RadarRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AcUnitRoundedIcon from '@mui/icons-material/AcUnitRounded';

// kind: 'parity' = LeetCode already has it (we need it to be taken seriously)
//       'edge'   = something LeetCode doesn't do well (how we beat it)
const KIND = {
  parity: { label: 'Match LeetCode', color: '#3B82F6' },
  edge: { label: 'Beat LeetCode', color: '#8B5CF6' },
};

export const UPCOMING_FEATURES = [
  // ---- Match LeetCode ----
  { id: 'study-plans', kind: 'parity', category: 'Practice', icon: MenuBookRoundedIcon, title: 'Study Plans', description: 'Guided day-by-day plans like Blind 75, Top Interview 150 and a 30-day placement sprint.' },
  { id: 'daily-calendar', kind: 'parity', category: 'Practice', icon: CalendarMonthRoundedIcon, title: 'Daily Challenge Calendar', description: 'A monthly calendar of daily problems with streak badges for every month you complete.' },
  { id: 'problem-lists', kind: 'parity', category: 'Practice', icon: BookmarkBorderRoundedIcon, title: 'Custom Lists & Favorites', description: 'Save problems into your own lists, reorder them and share a list with friends.' },
  { id: 'notes', kind: 'parity', category: 'Practice', icon: EditNoteRoundedIcon, title: 'Private Notes', description: 'Markdown notes saved per problem, shown right next to your code.' },
  { id: 'contests', kind: 'parity', category: 'Compete', icon: EmojiEventsRoundedIcon, title: 'Weekly Contests', description: 'Timed weekly contests with a rating system and live global ranking.' },
  { id: 'leaderboard', kind: 'parity', category: 'Compete', icon: LeaderboardRoundedIcon, title: 'Leaderboards', description: 'Global, weekly and per-topic rankings so you can see where you stand.' },
  { id: 'badges', kind: 'parity', category: 'Compete', icon: MilitaryTechRoundedIcon, title: 'Badges & Achievements', description: 'Unlock badges for streak milestones, first solves, topic mastery and contests.' },
  { id: 'editorials', kind: 'parity', category: 'Learn', icon: OndemandVideoRoundedIcon, title: 'Editorials & Video Solutions', description: 'Official write-ups and short videos with brute force to optimal approaches and complexity.' },
  { id: 'discuss', kind: 'parity', category: 'Community', icon: ForumRoundedIcon, title: 'Discussions & Community Solutions', description: 'Share your solution, upvote the best ones and ask doubts under each problem.' },
  { id: 'public-profile', kind: 'parity', category: 'Community', icon: PersonRoundedIcon, title: 'Public Profile', description: 'A shareable profile with your heatmap, badges and solved stats for recruiters.' },
  { id: 'mock-assessments', kind: 'parity', category: 'Compete', icon: TimerRoundedIcon, title: 'Timed Mock Assessments', description: 'Full timed mock tests in the exact format of company online assessments.' },

  // ---- Beat LeetCode ----
  { id: 'tamil-mode', kind: 'edge', category: 'Learn', icon: TranslateRoundedIcon, title: 'Explain in Tamil / Hindi', description: 'Editorials and AI hints in your own language. Concepts click faster when you think in your mother tongue.' },
  { id: 'ai-review', kind: 'edge', category: 'AI', icon: AutoAwesomeRoundedIcon, title: 'AI Code Review', description: 'After you pass, get time and space complexity, missed edge cases and a cleaner version of your code.' },
  { id: 'ai-why-failed', kind: 'edge', category: 'AI', icon: BugReportRoundedIcon, title: '"Why did I fail?" Explainer', description: 'Explains the failing test case in plain words and nudges you to the fix without spoiling it.' },
  { id: 'ai-interviewer', kind: 'edge', category: 'AI', icon: RecordVoiceOverRoundedIcon, title: 'AI Mock Interviewer', description: 'Talk through a problem with an AI interviewer that asks follow-ups and scores your communication.' },
  { id: 'daily-plan', kind: 'edge', category: 'AI', icon: EventAvailableRoundedIcon, title: 'Personalised Daily Plan', description: 'Tell us your drive date and daily time. We plan what to solve each day based on your weak topics.' },
  { id: 'skill-map', kind: 'edge', category: 'Practice', icon: RadarRoundedIcon, title: 'Skill Map', description: 'A radar of your strength in every topic, with one-click practice for your weakest areas.' },
  { id: 'revision', kind: 'edge', category: 'Practice', icon: ReplayRoundedIcon, title: 'Smart Revision Queue', description: 'Spaced repetition brings back problems right before you would forget them.' },
  { id: 'readiness', kind: 'edge', category: 'Career', icon: InsightsRoundedIcon, title: 'Placement Readiness Score', description: 'One score combining coding, aptitude and CS fundamentals, compared across target companies.' },
  { id: 'drive-alerts', kind: 'edge', category: 'Career', icon: NotificationsActiveRoundedIcon, title: 'Campus Drive Alerts', description: 'Get notified about upcoming company drives that match the prep tracks you follow.' },
  { id: 'resume', kind: 'edge', category: 'Career', icon: DescriptionRoundedIcon, title: 'Resume / ATS Checker', description: 'Upload your resume and get ATS-style feedback tailored to fresher placement roles.' },
  { id: 'college-boards', kind: 'edge', category: 'Community', icon: SchoolRoundedIcon, title: 'College Leaderboards', description: 'Compete inside your college and city so friends push each other to practise daily.' },
  { id: 'pair', kind: 'edge', category: 'Community', icon: PeopleAltRoundedIcon, title: 'Pair Programming Rooms', description: 'A shared live editor with voice chat to solve problems together with a friend.' },
  { id: 'streak-freeze', kind: 'edge', category: 'Practice', icon: AcUnitRoundedIcon, title: 'Streak Freeze & Reminders', description: 'Protect your streak on busy days and get a gentle reminder at the time you pick.' },
];

const INITIAL_COUNT = 6;

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  const kind = KIND[feature.kind];
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: '100%',
        borderRadius: 3,
        borderStyle: 'dashed',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        transition: 'border-color .15s ease, transform .15s ease',
        '&:hover': { borderColor: kind.color, transform: 'translateY(-2px)' },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: kind.color,
            bgcolor: alpha(kind.color, 0.12),
          }}
        >
          <Icon fontSize="small" />
        </Box>
        <Chip size="small" label="Coming soon" variant="outlined" sx={{ height: 22 }} />
      </Stack>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {feature.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {feature.description}
        </Typography>
      </Box>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip size="small" label={feature.category} sx={{ height: 22 }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: kind.color }}>
          {kind.label}
        </Typography>
      </Stack>
    </Paper>
  );
}

// "What we're building next" — pure UI cards, no backend yet. Each card
// is tagged by whether it brings us level with LeetCode or goes beyond it.
export default function UpcomingFeatures() {
  const [kind, setKind] = useState('all');
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => (kind === 'all' ? UPCOMING_FEATURES : UPCOMING_FEATURES.filter((f) => f.kind === kind)), [kind]);
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Coming soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            What we&apos;re building next. First we match LeetCode, then we go beyond it.
          </Typography>
        </Box>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={kind}
          onChange={(_e, v) => {
            if (v) {
              setKind(v);
              setExpanded(false);
            }
          }}
          sx={{ flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' }, '& .MuiToggleButton-root': { textTransform: 'none', flex: { xs: 1, sm: 'initial' } } }}
        >
          <ToggleButton value="all">All ({UPCOMING_FEATURES.length})</ToggleButton>
          <ToggleButton value="parity">Match LeetCode</ToggleButton>
          <ToggleButton value="edge">Beat LeetCode</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Grid container spacing={2}>
        {visible.map((f) => (
          <Grid key={f.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <FeatureCard feature={f} />
          </Grid>
        ))}
      </Grid>

      {filtered.length > INITIAL_COUNT && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            onClick={() => setExpanded((v) => !v)}
            endIcon={expanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {expanded ? 'Show less' : `Show all ${filtered.length}`}
          </Button>
        </Box>
      )}
    </Box>
  );
}
