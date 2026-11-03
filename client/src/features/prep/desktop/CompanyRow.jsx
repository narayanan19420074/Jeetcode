import { Box, ButtonBase, Typography } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CompanyAvatar from '../../../components/CompanyAvatar';
import { LIB_TRACKING, useLibraryPalette } from '../../dashboard/components/libraryStyle';

const AVATAR_SIZE = 48;
const readinessColor = (percent) => (percent < 40 ? '#EF4444' : percent < 70 ? '#F59E0B' : '#10B981');
const plural = (count, word) => `${count.toLocaleString('en-IN')} ${count === 1 ? word : `${word}s`}`;

function companyDetails(company) {
  if (!company.roadmap) return plural(company.count || 0, 'question');
  const minutes = company.minutes ? `${company.minutes} min` : null;
  return [plural(company.count || 0, 'question'), minutes, plural(company.sections || 0, 'section')].filter(Boolean).join(' · ');
}

export default function CompanyRow({ company, onOpen }) {
  const palette = useLibraryPalette();
  const showReadiness = company.readiness > 0;
  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Open ${company.name}`}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, width: '100%', px: 2, py: 1.25, textAlign: 'left', fontFamily: 'inherit', color: 'inherit', borderBottom: `1px solid ${palette.divider}`, '&:hover': { bgcolor: palette.player } }}
    >
      <CompanyAvatar name={company.name} logoUrl={company.logoUrl} size={AVATAR_SIZE} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>{company.name}</Typography>
        <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: palette.muted, fontVariantNumeric: 'tabular-nums' }}>{companyDetails(company)}</Typography>
      </Box>
      {showReadiness && <Typography sx={{ fontWeight: 700, fontSize: 14, color: readinessColor(company.readiness), fontVariantNumeric: 'tabular-nums' }}>{company.readiness}%</Typography>}
      <ChevronRightRoundedIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
    </ButtonBase>
  );
}
