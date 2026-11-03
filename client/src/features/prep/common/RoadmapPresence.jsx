import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Slides a company's roadmap in over the list (no page change). `style` lets the phone add its safe-area padding.
export default function RoadmapPresence({ selected, style, children }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          key={selected.name}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.08 } }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          style={style}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
