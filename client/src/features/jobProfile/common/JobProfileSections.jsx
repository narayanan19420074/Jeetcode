import { Stack } from '@mui/material';
import EntrySection from './EntrySection';
import IdentityHeader from './IdentityHeader';
import { AboutSection, SkillsSection } from './TextSections';
import { SECTION_ORDER } from './jobProfileConfig';

// The two groups of cards. Phones stack them in one column; desktop puts each group in its own column.
export function OverviewSections({ editor }) {
  return (
    <Stack spacing={2}>
      <IdentityHeader editor={editor} />
      <AboutSection editor={editor} />
      <SkillsSection editor={editor} />
    </Stack>
  );
}

export function HistorySections({ editor }) {
  return (
    <Stack spacing={2}>
      {SECTION_ORDER.map((sectionKey) => (
        <EntrySection key={sectionKey} sectionKey={sectionKey} editor={editor} />
      ))}
    </Stack>
  );
}
