import { useCallback, useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

const CARD_W = 288;
const GAP = 14;

function PromoCard({ card }) {
  const { title, text, cta, to, icon: Icon, gradient } = card;
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        position: 'relative',
        flex: '0 0 auto',
        width: { xs: '82%', sm: CARD_W },
        height: 150,
        scrollSnapAlign: 'start',
        overflow: 'hidden',
        borderRadius: '14px',
        p: 2.25,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#fff',
        textDecoration: 'none',
        background: gradient,
        boxShadow: '0 14px 28px -18px rgba(2,6,23,0.8), inset 0 1px 0 rgba(255,255,255,0.18)',
        // Faint engineering-paper grid, masked so it fades toward the text.
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(120deg, transparent 25%, #000 95%)',
          WebkitMaskImage: 'linear-gradient(120deg, transparent 25%, #000 95%)',
          pointerEvents: 'none',
        },
        '&:hover': { filter: 'brightness(1.08)' },
        '&:focus-visible': { outline: '3px solid #fff', outlineOffset: -4 },
      }}
    >
      <Icon sx={{ position: 'absolute', right: -14, bottom: -18, fontSize: 118, opacity: 0.16, transform: 'rotate(-12deg)' }} />
      <Box sx={{ position: 'relative', maxWidth: '88%' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.12rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{title}</Typography>
        <Typography
          sx={{
            mt: 0.75,
            fontSize: '0.8rem',
            lineHeight: 1.4,
            color: 'rgba(255,255,255,0.86)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {text}
        </Typography>
      </Box>
      <Box
        sx={{
          position: 'relative',
          alignSelf: 'flex-start',
          px: 1.5,
          py: 0.5,
          borderRadius: 999,
          bgcolor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(6px)',
          fontSize: '0.78rem',
          fontWeight: 700,
        }}
      >
        {cta}
      </Box>
    </Box>
  );
}

export default function PromoCarousel({ cards }) {
  const trackRef = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 2, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2 });
  }, []);

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, cards.length]);

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * (CARD_W + GAP) * 2, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (!cards.length) return null;

  const arrow = (dir, hidden) => (
    <IconButton
      onClick={() => scrollByCards(dir)}
      aria-label={dir < 0 ? 'Previous banners' : 'Next banners'}
      size="small"
      sx={(t) => ({
        position: 'absolute',
        top: '50%',
        [dir < 0 ? 'left' : 'right']: -10,
        transform: 'translateY(-50%)',
        zIndex: 2,
        display: { xs: 'none', sm: hidden ? 'none' : 'inline-flex' },
        bgcolor: t.palette.background.paper,
        border: `1px solid ${t.palette.divider}`,
        boxShadow: '0 6px 16px -6px rgba(2,6,23,0.5)',
        '&:hover': { bgcolor: t.palette.background.paper, borderColor: t.palette.primary.main },
      })}
    >
      {dir < 0 ? <ChevronLeftRoundedIcon fontSize="small" /> : <ChevronRightRoundedIcon fontSize="small" />}
    </IconButton>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {arrow(-1, edge.start)}
      {arrow(1, edge.end)}
      <Box
        ref={trackRef}
        onScroll={measure}
        sx={{
          display: 'flex',
          gap: `${GAP}px`,
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          pb: 0.5,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {cards.map((c) => (
          <PromoCard key={c.key} card={c} />
        ))}
      </Box>
    </Box>
  );
}
