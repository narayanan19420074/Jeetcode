import { Box, ButtonBase, Skeleton, Typography } from '@mui/material';
import CompanyAvatar from '../../../../components/CompanyAvatar';
import { LIB_TRACKING, useLibraryPalette } from '../../components/libraryStyle';
import { FONT_SIZES, RADII_PX } from '../../../../app/design/designTokens';

const COLUMNS = 'repeat(auto-fill, minmax(240px, 1fr))';
const AVATAR_SIZE = 48;

function CompanyButton({ company, count, onBrowse, palette }) {
  return (
    <ButtonBase
      onClick={() => onBrowse({ companies: [company] })}
      aria-label={`Browse ${company} questions`}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, p: 1.5, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', color: palette.text, '&:hover': { bgcolor: palette.player } }}
    >
      <CompanyAvatar name={company} size={AVATAR_SIZE} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{company}</Typography>
        <Typography noWrap sx={{ fontSize: FONT_SIZES.body, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: palette.muted }}>
          {count.toLocaleString('en-IN')} {count === 1 ? 'Question' : 'Questions'}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

// Companies that have questions, as a flowing grid. Tapping one opens the library filtered to that company.
export default function CompanyGrid({ companies, onBrowse }) {
  const palette = useLibraryPalette();
  if (companies === null) return <Skeleton variant="rounded" height={168} sx={{ borderRadius: RADII_PX.card }} />;
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: COLUMNS, gap: 0.5 }}>
      {companies.map(({ company, count }) => <CompanyButton key={company} company={company} count={count} onBrowse={onBrowse} palette={palette} />)}
    </Box>
  );
}
