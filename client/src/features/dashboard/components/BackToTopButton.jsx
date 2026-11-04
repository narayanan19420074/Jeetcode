import { useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { COLOR_PALETTE, withAlpha, MOTION, SHADOWS, SIZES } from '../../../app/design/designTokens';

const BACK_TO_TOP_AFTER = 600; // px scrolled before the button appears

// Tracks whether the reader has scrolled far enough down a long list to need a shortcut back to the top.
function useScrolledPastThreshold() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > BACK_TO_TOP_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return visible;
}

// Users who asked their device for reduced motion get an instant jump instead of a smooth scroll.
function scrollToTop() {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

const buttonSx = (pal, bottom, visible) => (t) => ({
  position: 'fixed',
  right: 16,
  bottom,
  zIndex: t.zIndex.appBar - 10,
  width: SIZES.touchTarget,
  height: SIZES.touchTarget,
  bgcolor: pal.player,
  color: pal.text,
  boxShadow: SHADOWS.drop('sm', withAlpha(COLOR_PALETTE.black, 0.18)),
  '&:hover': { bgcolor: pal.player },
  opacity: visible ? 1 : 0,
  transform: visible ? 'none' : 'translateY(8px)',
  pointerEvents: visible ? 'auto' : 'none',
  transition: `opacity ${MOTION.fast}ms, transform ${MOTION.fast}ms`,
});

// Floating "back to top" button. It stays hidden until the reader has scrolled down the list.
export default function BackToTopButton({ pal, bottom }) {
  const visible = useScrolledPastThreshold();
  return (
    <IconButton onClick={scrollToTop} aria-label="Back to top" tabIndex={visible ? 0 : -1} aria-hidden={!visible} sx={buttonSx(pal, bottom, visible)}>
      <KeyboardArrowUpRoundedIcon />
    </IconButton>
  );
}
