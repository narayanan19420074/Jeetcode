import { Box, IconButton, Stack } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { CategoryPicker, IdentityPicker } from './ComposePickers';
import { RADII_PX, SIZES } from '../../../app/design/designTokens';

const toolPillSx = { height: SIZES.controlHeight.mobile, px: 1.5, borderRadius: RADII_PX.pill, bgcolor: 'var(--lib-player)', alignItems: 'center' };

// Who is posting, the category on the left, and the code-block tool on the right.
export default function ComposeBottomBar({ draft, update, user, saving, onInsertCode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1.5 }}>
      <IdentityPicker user={user} isAnonymous={draft.isAnonymous} onChange={update('isAnonymous')} />
      <CategoryPicker category={draft.category} onChange={update('category')} />
      <Box sx={{ flex: 1 }} />
      <Stack direction="row" sx={toolPillSx}>
        <IconButton aria-label="Insert code block" onClick={onInsertCode} disabled={saving} sx={{ color: 'var(--lib-text)' }}>
          <CodeRoundedIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}
