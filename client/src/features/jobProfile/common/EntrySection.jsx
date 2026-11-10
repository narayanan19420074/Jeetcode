import { Box, Divider, Link, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';
import ProfileCard, { IconAction } from './ProfileCard';
import { ENTRY_SECTIONS } from './jobProfileConfig';
import { describeEntry } from './jobProfileFormat';

function EntryItem({ sectionKey, entry, onEdit, onRemove }) {
  const { title, subtitle, meta = [], body, link } = describeEntry(sectionKey, entry);
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', py: 1.5 }}>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.semibold, wordBreak: 'break-word' }}>{title}</Typography>
        {subtitle && <Typography variant="body2">{subtitle}</Typography>}
        {meta.filter(Boolean).map((line) => (
          <Typography key={line} variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {line}
          </Typography>
        ))}
        {body && <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{body}</Typography>}
        {link && (
          <Link href={link} target="_blank" rel="noopener noreferrer" variant="body2">
            Show credential
          </Link>
        )}
      </Box>
      <IconAction label={`Edit ${title}`} icon={EditRoundedIcon} onClick={onEdit} />
      <IconAction label={`Delete ${title}`} icon={DeleteOutlineRoundedIcon} onClick={onRemove} />
    </Stack>
  );
}

// One list section (experience, education or certifications), fully described by ENTRY_SECTIONS[sectionKey].
export default function EntrySection({ sectionKey, editor }) {
  const section = ENTRY_SECTIONS[sectionKey];
  const entries = editor.profile[sectionKey];

  return (
    <ProfileCard title={section.title} actions={<IconAction label={`Add ${section.itemLabel}`} icon={AddRoundedIcon} onClick={() => editor.addEntry(sectionKey)} />}>
      {entries.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {section.emptyText}
        </Typography>
      )}
      {entries.map((entry, index) => (
        <Box key={`${sectionKey}-${index}`}>
          {index > 0 && <Divider />}
          <EntryItem sectionKey={sectionKey} entry={entry} onEdit={() => editor.editEntry(sectionKey, index)} onRemove={() => editor.askRemoveEntry(sectionKey, index)} />
        </Box>
      ))}
    </ProfileCard>
  );
}
