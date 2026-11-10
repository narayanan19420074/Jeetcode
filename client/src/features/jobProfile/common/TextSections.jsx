import { Chip, Stack, Typography } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ProfileCard, { IconAction } from './ProfileCard';

const EmptyHint = ({ children }) => (
  <Typography variant="body2" color="text.secondary">
    {children}
  </Typography>
);

export function AboutSection({ editor }) {
  const { about } = editor.profile;
  return (
    <ProfileCard title="About" actions={<IconAction label="Edit about" icon={EditRoundedIcon} onClick={editor.editIntro} />}>
      {about ? <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{about}</Typography> : <EmptyHint>Summarise your background, strengths and what you are looking for.</EmptyHint>}
    </ProfileCard>
  );
}

export function SkillsSection({ editor }) {
  const { skills } = editor.profile;
  return (
    <ProfileCard title="Skills" actions={<IconAction label="Edit skills" icon={EditRoundedIcon} onClick={editor.editSkills} />}>
      {skills.length ? (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {skills.map((skill) => (
            <Chip key={skill} label={skill} size="small" />
          ))}
        </Stack>
      ) : (
        <EmptyHint>Add the tools and technologies you work with.</EmptyHint>
      )}
    </ProfileCard>
  );
}
