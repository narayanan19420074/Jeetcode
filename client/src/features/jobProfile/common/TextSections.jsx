import { useState } from 'react';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';
import ProfileCard, { IconAction } from './ProfileCard';

const TOP_SKILL_COUNT = 8;
const COLLAPSED_SKILL_COUNT = 4;

const EmptyHint = ({ children }) => (
  <Typography variant="body2" color="text.secondary">
    {children}
  </Typography>
);

// The first skills in the About block, with an arrow that leads to the full list.
function TopSkills({ skills, onOpen }) {
  if (skills.length === 0) return null;
  const isEditable = Boolean(onOpen);
  return (
    <Box component={isEditable ? 'button' : 'div'} type={isEditable ? 'button' : undefined} onClick={onOpen} aria-label={isEditable ? 'Edit skills' : undefined} sx={{ all: 'unset', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 2, mt: 2, p: 2, cursor: isEditable ? 'pointer' : 'default', border: '1px solid', borderColor: 'divider', borderRadius: RADII_PX.card }}>
      <DiamondOutlinedIcon />
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>Top skills</Typography>
        {skills.slice(0, TOP_SKILL_COUNT).map((skill) => (
          <Typography key={skill}>{skill}</Typography>
        ))}
      </Box>
      {isEditable && <ArrowForwardRoundedIcon />}
    </Box>
  );
}

export function AboutSection({ editor }) {
  const { about, skills } = editor.profile;
  return (
    <ProfileCard title="About" actions={editor.readOnly ? null : <IconAction label="Edit about" icon={EditRoundedIcon} onClick={editor.editIntro} />}>
      {about ? <Typography sx={{ whiteSpace: 'pre-line' }}>{about}</Typography> : <EmptyHint>Summarise your background, strengths and what you are looking for.</EmptyHint>}
      <TopSkills skills={skills} onOpen={editor.readOnly ? undefined : editor.editSkills} />
    </ProfileCard>
  );
}

// Skills as a plain list, four at first and the rest behind "Show all".
export function SkillsSection({ editor }) {
  const { skills } = editor.profile;
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? skills : skills.slice(0, COLLAPSED_SKILL_COUNT);
  const actions = editor.readOnly ? null : (
    <>
      <IconAction label="Add skills" icon={AddRoundedIcon} onClick={editor.editSkills} />
      <IconAction label="Edit skills" icon={EditRoundedIcon} onClick={editor.editSkills} />
    </>
  );

  return (
    <ProfileCard title="Skills" actions={actions}>
      {skills.length === 0 && !editor.readOnly && <EmptyHint>Add the tools and technologies you work with.</EmptyHint>}
      <Stack divider={<Divider />}>
        {visible.map((skill) => (
          <Typography key={skill} sx={{ py: 1.5, fontWeight: FONT_WEIGHTS.semibold }}>
            {skill}
          </Typography>
        ))}
      </Stack>
      {skills.length > COLLAPSED_SKILL_COUNT && (
        <Button fullWidth color="inherit" endIcon={<ArrowForwardRoundedIcon />} onClick={() => setShowAll((current) => !current)} sx={{ mt: 1 }}>
          {showAll ? 'Show less' : 'Show all'}
        </Button>
      )}
    </ProfileCard>
  );
}
