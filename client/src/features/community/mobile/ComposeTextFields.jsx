import { InputBase } from '@mui/material';
import { useLibraryPalette, LIB_TRACKING } from '../../dashboard/components/libraryStyle';
import { POST_BODY_MAX, POST_TITLE_MAX } from '../common/communityCategories';
import { FONT_SIZES, FONT_WEIGHTS } from '../../../app/design/designTokens';

const TITLE_PLACEHOLDER = "What's on your mind?";
const BODY_PLACEHOLDER = 'Share your solution, insights, questions, or interview experience…';
const titleSx = { fontSize: FONT_SIZES.displayLg, lineHeight: 1.3, fontWeight: FONT_WEIGHTS.bold };
const bodySx = { mt: 1.5, alignItems: 'flex-start', fontSize: FONT_SIZES.subheading, lineHeight: 1.6, letterSpacing: LIB_TRACKING };
const cleanTitle = (value) => value.replace(/\n/g, ' ').slice(0, POST_TITLE_MAX);
const cleanBody = (value) => value.slice(0, POST_BODY_MAX);
const withMutedPlaceholder = (sx, muted) => ({ ...sx, '& textarea::placeholder': { color: muted, opacity: 0.55 } });

function ComposeInput({ sx, label, placeholder, value, onChange, disabled, inputRef }) {
  return (
    <InputBase multiline fullWidth value={value} disabled={disabled} placeholder={placeholder} onChange={onChange} inputRef={inputRef} inputProps={{ 'aria-label': label }} sx={sx} />
  );
}

// Large title line followed by the free-form body. Typing clears any earlier error so it never lingers.
export default function ComposeTextFields({ draft, update, saving, clearError, bodyRef }) {
  const muted = useLibraryPalette().muted;
  const change = (field, clean) => (event) => {
    clearError();
    update(field)(clean(event.target.value));
  };
  return (
    <>
      <ComposeInput label="Title" placeholder={TITLE_PLACEHOLDER} value={draft.title} disabled={saving} onChange={change('title', cleanTitle)} sx={withMutedPlaceholder(titleSx, muted)} />
      <ComposeInput label="Post" placeholder={BODY_PLACEHOLDER} value={draft.body} disabled={saving} onChange={change('body', cleanBody)} inputRef={bodyRef} sx={withMutedPlaceholder(bodySx, muted)} />
    </>
  );
}
