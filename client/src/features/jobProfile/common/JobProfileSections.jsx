import { Stack, Typography } from '@mui/material';
import ProfileCard from './ProfileCard';
import { SECTION_ORDER } from './jobProfileConfig';
import EntrySection from './EntrySection';
import IdentityHeader from './IdentityHeader';
import StatsSection from './StatsSection';
import { AboutSection, SkillsSection } from './TextSections';

// The blocks in the same order as the LinkedIn profile: top card, analytics, about, experience, education,
// licenses & certifications, skills. `spacing` is the gap (the grey band on phones).
// The owner sees every block, including empty ones, so they can fill them. Another member sees only blocks
// that have content, and never the private analytics.
const isShown = (editor, hasContent) => !editor.readOnly || hasContent;

const hasAnyContent = ({ about, skills, ...entries }) => Boolean(about) || skills.length > 0 || SECTION_ORDER.some((key) => entries[key].length > 0);

function EmptyMemberNote() {
  return (
    <ProfileCard title="Job profile">
      <Typography variant="body2" color="text.secondary">
        This member has not added any Job profile details yet.
      </Typography>
    </ProfileCard>
  );
}

export default function JobProfileSections({ editor, spacing }) {
  const { profile } = editor;
  return (
    <Stack spacing={spacing}>
      <IdentityHeader editor={editor} />
      {!editor.readOnly && <StatsSection />}
      {editor.readOnly && !hasAnyContent(profile) && <EmptyMemberNote />}
      {isShown(editor, Boolean(profile.about)) && <AboutSection editor={editor} />}
      {SECTION_ORDER.filter((key) => isShown(editor, profile[key].length > 0)).map((key) => (
        <EntrySection key={key} sectionKey={key} editor={editor} />
      ))}
      {isShown(editor, profile.skills.length > 0) && <SkillsSection editor={editor} />}
    </Stack>
  );
}
