import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { WsButton } from './wsUi';

// Tapping Run must not drop the phone keyboard mid-tap.
export const keepFocus = (e) => e.preventDefault();

// Shared by the toolbar (desktop) and the console bar (phone).
//   size        'md' | 'lg'
//   isMobile    phone: keep the keyboard open, no shortcut hint
//   iconActions / showKbd   from usePaneModes
export function RunButton({ size, isMobile, iconActions, showKbd, loading, disabled, onClick }) {
  return (
    <WsButton
      size={size}
      variant="secondary"
      startIcon={<PlayArrowRoundedIcon />}
      loading={loading}
      disabled={disabled}
      onPointerDown={isMobile ? keepFocus : undefined}
      onMouseDown={isMobile ? keepFocus : undefined}
      onClick={onClick}
      iconOnly={iconActions}
      title="Run (Ctrl + ')"
      kbd={isMobile || !showKbd ? undefined : "Ctrl '"}
    >
      Run
    </WsButton>
  );
}

export function SubmitButton({ size, isMobile, iconActions, showKbd, loading, disabled, onClick }) {
  return (
    <WsButton
      size={size}
      variant="primary"
      startIcon={<CloudUploadRoundedIcon />}
      loading={loading}
      disabled={disabled}
      onPointerDown={isMobile ? keepFocus : undefined}
      onMouseDown={isMobile ? keepFocus : undefined}
      onClick={onClick}
      iconOnly={iconActions}
      title="Submit (Ctrl + Enter)"
      kbd={isMobile || !showKbd ? undefined : 'Ctrl ↵'}
    >
      Submit
    </WsButton>
  );
}
