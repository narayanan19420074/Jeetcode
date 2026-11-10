import { Stack } from '@mui/material';
import EntrySection from './EntrySection';
import IdentityHeader from './IdentityHeader';
import StatsSection from './StatsSection';
import { AboutSection, SkillsSection } from './TextSections';

// The blocks in the same order as the LinkedIn profile: top card, analytics, about, experience, education,
// licenses & certifications, skills. `spacing` is the gap (the grey band on phones).
export default function JobProfileSections({ editor, spacing }) {
  return (
    <Stack spacing={spacing}>
      <IdentityHeader editor={editor} />
      <StatsSection />
      <AboutSection editor={editor} />
      <EntrySection sectionKey="experience" editor={editor} />
      <EntrySection sectionKey="education" editor={editor} />
      <EntrySection sectionKey="certifications" editor={editor} />
      <SkillsSection editor={editor} />
    </Stack>
  );
}
