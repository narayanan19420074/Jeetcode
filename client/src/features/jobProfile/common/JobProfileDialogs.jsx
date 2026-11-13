import ConfirmRemoveDialog from './ConfirmRemoveDialog';
import EntryFormDialog from './EntryFormDialog';
import SkillsDialog from './SkillsDialog';
import { ENTRY_SECTIONS, INTRO_FIELDS } from './jobProfileConfig';

const introValues = (profile) => ({ headline: profile.headline, about: profile.about, openToWork: profile.openToWork, hiring: Boolean(profile.hiring) });

function EntryDialog({ editor, dialog }) {
  const section = ENTRY_SECTIONS[dialog.section];
  const isNew = dialog.index === null;
  return (
    <EntryFormDialog
      title={`${isNew ? 'Add' : 'Edit'} ${section.itemLabel}`}
      fields={section.fields}
      initialValues={isNew ? section.blank : editor.profile[dialog.section][dialog.index]}
      onSubmit={(entry) => editor.saveEntry(dialog.section, dialog.index, entry)}
      onClose={editor.closeDialog}
    />
  );
}

// Renders whichever dialog the editor has open. Only one can be open at a time.
export default function JobProfileDialogs({ editor }) {
  const { dialog, profile } = editor;
  if (!dialog || !profile) return null;

  if (dialog.kind === 'intro') {
    return <EntryFormDialog title="Edit intro" fields={INTRO_FIELDS} initialValues={introValues(profile)} onSubmit={editor.saveIntro} onClose={editor.closeDialog} />;
  }
  if (dialog.kind === 'skills') return <SkillsDialog skills={profile.skills} onSubmit={editor.saveSkills} onClose={editor.closeDialog} />;
  if (dialog.kind === 'entry') return <EntryDialog editor={editor} dialog={dialog} />;
  return <ConfirmRemoveDialog itemLabel={ENTRY_SECTIONS[dialog.section].itemLabel} onConfirm={() => editor.removeEntry(dialog.section, dialog.index)} onClose={editor.closeDialog} />;
}
