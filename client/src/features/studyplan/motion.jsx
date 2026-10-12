import { useEffect, useRef, useState } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';

// Number that eases up to its value (instant when the user prefers reduced motion).
export function CountUp({ value, duration = 0.9, format }) {
  const reduce = useReducedMotion();
  const from = useRef(0);
  const [n, setN] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return undefined;
    }
    const controls = animate(from.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        from.current = v;
        setN(v);
      },
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <>{format ? format(n) : Math.round(n).toLocaleString()}</>;
}

// Fade-and-rise wrapper; `index` staggers siblings.
export function Rise({ index = 0, children, sx, ...rest }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduce ? 0 : index * 0.06, ease: 'easeOut' }}
      style={sx}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
