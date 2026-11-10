import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

const stageSx = { position: 'relative', width: '100%', aspectRatio: '1', overflow: 'hidden', bgcolor: 'action.hover', touchAction: 'none', userSelect: 'none', cursor: 'grab' };
const photoSx = { position: 'absolute', left: '50%', top: '50%', maxWidth: 'none', pointerEvents: 'none' };
const dimSx = (theme) => ({ position: 'absolute', inset: 0, pointerEvents: 'none', bgcolor: alpha(theme.palette.common.black, 0.55) });
const frameSx = { position: 'absolute', pointerEvents: 'none', border: 2, borderColor: 'common.white' };

// Everything outside the frame is dimmed: that part of the photo does not appear in the feed.
const cutoutPolygon = (stageSize, frame) => {
  const left = (stageSize - frame.width) / 2;
  const top = (stageSize - frame.height) / 2;
  const [right, bottom] = [left + frame.width, top + frame.height];
  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${left}px ${top}px, ${left}px ${bottom}px, ${right}px ${bottom}px, ${right}px ${top}px, ${left}px ${top}px)`;
};

export default function CropStage({ crop }) {
  const { stageRef, stageSize, source, layout, offset, dragHandlers } = crop;
  return (
    <Box ref={stageRef} sx={stageSx} {...dragHandlers}>
      {layout && (
        <>
          <Box
            component="img"
            src={source.url}
            alt="Image to crop"
            draggable={false}
            sx={photoSx}
            style={{ width: layout.width, height: layout.height, transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)` }}
          />
          <Box sx={dimSx} style={{ clipPath: cutoutPolygon(stageSize, layout.frame) }} />
          <Box sx={frameSx} style={{ width: layout.frame.width, height: layout.frame.height, left: (stageSize - layout.frame.width) / 2, top: (stageSize - layout.frame.height) / 2 }} />
        </>
      )}
    </Box>
  );
}
