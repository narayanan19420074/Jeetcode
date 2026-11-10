import { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import { COMMENT_SORTS } from './commentTree';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';

// "Most relevant ▾" above the comments.
export default function CommentSortMenu({ value, onChange }) {
  const [anchor, setAnchor] = useState(null);
  const current = COMMENT_SORTS.find((sort) => sort.value === value);
  const choose = (sort) => {
    setAnchor(null);
    onChange(sort);
  };
  return (
    <>
      <Button onClick={(event) => setAnchor(event.currentTarget)} endIcon={<ArrowDropDownRoundedIcon />} aria-haspopup="true" sx={{ color: 'text.primary', textTransform: 'none', fontSize: FONT_SIZES.title, fontWeight: FONT_WEIGHTS.regular }}>
        {current.label}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {COMMENT_SORTS.map((sort) => (
          <MenuItem key={sort.value} selected={sort.value === value} onClick={() => choose(sort.value)} sx={{ minHeight: SIZES.touchTarget }}>
            {sort.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
