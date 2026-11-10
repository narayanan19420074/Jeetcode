import { Avatar, Box, Button, Divider, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import ProfileCard, { IconAction } from './ProfileCard';
import { ENTRY_SECTIONS } from './jobProfileConfig';
import { describeEntry } from './jobProfileFormat';

// Stand-in for the company, school or issuer logo that LinkedIn shows at the left of each entry.
const LOGO_ICONS = { experience: BusinessRoundedIcon, education: SchoolRoundedIcon, certifications: WorkspacePremiumRoundedIcon };

function EntryLogo({ sectionKey }) {
  const Icon = LOGO_ICONS[sectionKey];
  return (
    <Avatar variant="rounded" sx={{ width: SIZES.avatar.lg, height: SIZES.avatar.lg, borderRadius: RADII_PX.control, bgcolor: 'action.hover', color: 'text.secondary' }}>
      <Icon />
    </Avatar>
  );
}

function CredentialLink({ href }) {
  return (
    <Button component="a" href={href} target="_blank" rel="noopener noreferrer" variant="outlined" color="inherit" endIcon={<OpenInNewRoundedIcon />} sx={{ mt: 1.5, borderRadius: RADII_PX.pill }}>
      Show credential
    </Button>
  );
}

function EntryItem({ sectionKey, entry, onEdit, onRemove }) {
  const { title, subtitle, meta = [], body, link } = describeEntry(sectionKey, entry);
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', py: 2 }}>
      <EntryLogo sectionKey={sectionKey} />
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, wordBreak: 'break-word' }}>{title}</Typography>
        {subtitle && <Typography>{subtitle}</Typography>}
        {meta.filter(Boolean).map((line) => (
          <Typography key={line} variant="body2" color="text.secondary">
            {line}
          </Typography>
        ))}
        {body && <Typography sx={{ mt: 1, whiteSpace: 'pre-line' }}>{body}</Typography>}
        {link && <CredentialLink href={link} />}
      </Box>
      <Stack>
        <IconAction label={`Edit ${title}`} icon={EditRoundedIcon} onClick={onEdit} />
        <IconAction label={`Delete ${title}`} icon={DeleteOutlineRoundedIcon} onClick={onRemove} />
      </Stack>
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
