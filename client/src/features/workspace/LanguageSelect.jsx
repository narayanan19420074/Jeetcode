import { MenuItem, Tooltip } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { WsSelect } from './wsUi';
import { WS } from './wsTokens';
import { LANGUAGES, LANG_SHORT, languageLabel } from './languages';

// Language picker. langMode comes from usePaneModes: 'full' | 'short' | 'icon'
// (the narrower the pane, the less text it shows).
export default function LanguageSelect({ value, onChange, problem, langMode, isMobile }) {
  const select = (
    <WsSelect
      value={value}
      onChange={(e) => onChange(e.target.value)}
      renderValue={(v) => (langMode === 'icon' ? '' : langMode === 'short' ? LANG_SHORT[v] : languageLabel(v))}
      startAdornment={<CodeRoundedIcon sx={{ fontSize: 17, mr: langMode === 'icon' ? 0 : 0.75, color: 'primary.main' }} />}
      sx={
        isMobile
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
