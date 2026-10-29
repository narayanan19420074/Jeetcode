import { MenuItem, Tooltip } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { WsSelect } from './wsUi';
import { WS } from './wsTokens';
import { LIB_TRACKING, useLibraryPalette } from '../dashboard/components/libraryStyle';
import { LANGUAGES, LANG_SHORT, languageLabel } from './languages';

// Language picker. langMode comes from usePaneModes: 'full' | 'short' | 'icon'
// (the narrower the pane, the less text it shows).
// pill: the phone workspace look (Library style: 40px cream pill, no icon).
export default function LanguageSelect({ value, onChange, problem, langMode, isMobile, pill = false }) {
  const pal = useLibraryPalette();
  const select = (
    <WsSelect
      value={value}
      onChange={(e) => onChange(e.target.value)}
      renderValue={(v) => (langMode === 'icon' ? '' : langMode === 'short' ? LANG_SHORT[v] : languageLabel(v))}
      startAdornment={pill ? undefined : <CodeRoundedIcon sx={{ fontSize: 17, mr: langMode === 'icon' ? 0 : 0.75, color: 'primary.main' }} />}
      {...(pill && {
        MenuProps: { slotProps: { paper: { sx: { mt: 0.5, borderRadius: '20px', bgcolor: pal.bg, backgroundImage: 'none', color: pal.text } } } },
      })}
      sx={
        pill
          ? {
              height: 40,
              minWidth: 112,
              borderRadius: 999,
              fontSize: 16,
              fontWeight: 500,
              letterSpacing: LIB_TRACKING,
              color: pal.text,
              bgcolor: pal.chip,
              '&:hover': { bgcolor: pal.chip, filter: 'brightness(0.97)' },
              '& .MuiSelect-select': { height: '40px', pl: 2 },
              '& .MuiSelect-icon': { right: 12 },
            }
          : isMobile
            ? { height: WS.ctrlLg, minWidth: 124, '& .MuiSelect-select': { height: `${WS.ctrlLg}px` } }
          : langMode === 'short'
            ? { minWidth: 0, '& .MuiSelect-select': { pr: '26px !important' } }
            : langMode === 'icon'
              ? { minWidth: 0, '& .MuiSelect-select': { pl: 1, pr: '22px !important' }, '& .MuiSelect-icon': { right: 2 } }
              : undefined
      }
    >
      {LANGUAGES.map((l) => (
        <MenuItem key={l.id} value={l.id} disabled={l.id === 'java' && Boolean(problem) && !problem?.starterCode?.java}>
          {l.label}
        </MenuItem>
      ))}
    </WsSelect>
  );
  return langMode === 'icon' ? (
    <Tooltip title={languageLabel(value)}>
      <span style={{ display: 'inline-flex' }}>{select}</span>
    </Tooltip>
  ) : (
    select
  );
}
