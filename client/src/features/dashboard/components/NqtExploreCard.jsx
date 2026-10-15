import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { prepApi } from '../../../api/prepApi';
import CompanyAvatar from '../../../components/CompanyAvatar';
import { TCS_NQT_FALLBACK_DATE, examCountdown, formatExamDate } from '../../prep/examDate';

// Featured card at the top of Explore: the TCS NQT hub (exam pattern + learn + practice).
export default function NqtExploreCard() {
  const [track, setTrack] = useState(null);

  useEffect(() => {
    prepApi
      .listCompanies()
      .then(({ data }) => setTrack((data.data.items || []).find((c) => c.slug === 'tcs-nqt') || null))
      .catch(() => {});
  }, []);

  const examDate = track?.examDate || TCS_NQT_FALLBACK_DATE;
  const countdown = examCountdown(examDate);

  return (
    <Box
      component={RouterLink}
      to="/prep/tcs-nqt"
      aria-label="TCS NQT: exam pattern, learn and practice"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 1.5,
        p: 2.25,
        borderRadius: '14px',
        color: '#fff',
        textDecoration: 'none',
        background: 'linear-gradient(135deg,#312E81 0%,#9D174D 100%)',
        boxShadow: '0 14px 28px -18px rgba(2,6,23,0.8), inset 0 1px 0 rgba(255,255,255,0.18)',
        '&:hover': { filter: 'brightness(1.08)' },
        '&:focus-visible': { outline: '3px solid #fff', outlineOffset: -4 },
      }}
    >
      <CompanyAvatar name="TCS NQT" logoUrl={track?.logoUrl} size={56} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>TCS NQT</Typography>
        <Typography sx={{ mt: 0.5, fontSize: '0.82rem', lineHeight: 1.45, color: 'rgba(255,255,255,0.88)' }}>
          Foundation and Advanced, exactly as the exam runs. Aptitude, reasoning, verbal and Striver-sheet coding: learn, then practise.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 0.75, borderRadius: 99, bgcolor: 'rgba(255,255,255,0.16)' }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 18 }} />
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.1 }}>{formatExamDate(examDate)}</Typography>
            <Typography sx={{ fontSize: '0.7rem', lineHeight: 1.2, color: 'rgba(255,255,255,0.85)' }}>{countdown.text}</Typography>
          </Box>
        </Box>
        <ArrowForwardRoundedIcon sx={{ display: { xs: 'none', sm: 'block' } }} />
      </Box>
    </Box>
  );
}
