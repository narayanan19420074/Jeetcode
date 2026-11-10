import { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { ENTRY_SECTIONS, SECTION_ORDER } from './jobProfileConfig';

// "Add section" opens the form for any part of the profile, as the LinkedIn button does.
export default function AddSectionMenu({ editor }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const close = () => setAnchorEl(null);
  const choose = (action) => () => {
    close();
    action();
  };

  return (
    <>
      <Button variant="outlined" fullWidth aria-haspopup="menu" onClick={(event) => setAnchorEl(event.currentTarget)}>
        Add section
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={choose(editor.editIntro)}>Add about</MenuItem>
        {SECTION_ORDER.map((key) => (
          <MenuItem key={key} onClick={choose(() => editor.addEntry(key))}>
            Add {ENTRY_SECTIONS[key].itemLabel}
          </MenuItem>
        ))}
        <MenuItem onClick={choose(editor.editSkills)}>Add skills</MenuItem>
      </Menu>
    </>
  );
}
