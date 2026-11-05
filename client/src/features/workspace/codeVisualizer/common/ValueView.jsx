import { createContext, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { FONT_SIZES, FONTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';
import { JS_LITERALS } from './valueLiterals';

// Python writes None / True / False, JavaScript null / true / false; one provider per dialog sets the right words.
export const LiteralsContext = createContext(JS_LITERALS);

const boxSx = {
  fontFamily: FONTS.mono,
  fontSize: FONT_SIZES.caption,
  minWidth: SIZES.codeVisualizer.valueBox,
  px: 0.75,
  py: 0.25,
  border: 1,
  borderColor: 'divider',
  borderRadius: RADII_PX.badge,
  textAlign: 'center',
  bgcolor: 'background.paper',
};

function PrimitiveBox({ value }) {
  const literals = useContext(LiteralsContext);
  let text = String(value);
  if (value === null) text = literals.nothing;
  else if (typeof value === 'boolean') text = value ? literals.yes : literals.no;
  else if (typeof value === 'string') text = JSON.stringify(value);
  return <Box sx={boxSx}>{text}</Box>;
}

function MoreNote({ count }) {
  if (!count) return null;
  return (
    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
      +{count} more
    </Typography>
  );
}

// Arrays and sets: one cell per item with its index above it.
function ListView({ value }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'flex-start' }}>
      {value.v.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: FONTS.mono, fontSize: FONT_SIZES.micro }}>
            {index}
          </Typography>
          <ValueView value={item} />
        </Box>
      ))}
      <MoreNote count={value.more} />
    </Box>
  );
}

// Dictionaries, maps and objects: one row per key.
function FieldsView({ rows, title, more, plainKeys = false }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {title && (
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
      )}
      {rows.map(([key, item], index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          {plainKeys ? <Typography sx={{ fontFamily: FONTS.mono, fontSize: FONT_SIZES.caption }}>{key}</Typography> : <ValueView value={key} />}
          <Typography color="text.secondary" component="span">
            →
          </Typography>
          <ValueView value={item} />
        </Box>
      ))}
      <MoreNote count={more} />
    </Box>
  );
}

export default function ValueView({ value }) {
  if (value === null || typeof value !== 'object') return <PrimitiveBox value={value} />;
  if (value.t === 'list') return <ListView value={value} />;
  if (value.t === 'dict') return <FieldsView rows={value.v} more={value.more} />;
  if (value.t === 'obj') return <FieldsView rows={value.v} title={value.k} plainKeys />;
  return <Box sx={boxSx}>{String(value.v)}</Box>;
}
