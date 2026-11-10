import { canvasToJpeg } from './imageUpload';
import { COLOR_PALETTE, FEED_IMAGE_FRAME } from '../../../app/design/designTokens';

export const MAX_ZOOM = 3;
// The crop frame is shown inside a square stage and fills this share of its height, leaving a margin where the part of
// the photo that will not appear in the feed stays visible but dimmed.
const FRAME_HEIGHT_SHARE = 0.9;

const clampBetween = (value, min, max) => Math.min(Math.max(value, min), max);

export function frameInStage(stageSize) {
  const height = stageSize * FRAME_HEIGHT_SHARE;
  return { width: height * FEED_IMAGE_FRAME.widthPerHeight, height };
}

// At zoom 1 the photo just covers the frame (no empty edge); zooming in only makes it larger.
export function imageLayout({ naturalWidth, naturalHeight, stageSize, zoom }) {
  const frame = frameInStage(stageSize);
  const scale = Math.max(frame.width / naturalWidth, frame.height / naturalHeight) * zoom;
  return { frame, scale, width: naturalWidth * scale, height: naturalHeight * scale };
}

// The photo may be moved only as far as it still covers the whole frame.
export function clampOffset(offset, layout) {
  const maxX = (layout.width - layout.frame.width) / 2;
  const maxY = (layout.height - layout.frame.height) / 2;
  return { x: clampBetween(offset.x, -maxX, maxX), y: clampBetween(offset.y, -maxY, maxY) };
}

// Part of the photo (in its own pixels) that lies inside the frame.
function visibleRegion(layout, offset) {
  return {
    x: (layout.width / 2 - layout.frame.width / 2 - offset.x) / layout.scale,
    y: (layout.height / 2 - layout.frame.height / 2 - offset.y) / layout.scale,
    width: layout.frame.width / layout.scale,
    height: layout.frame.height / layout.scale,
  };
}

// Draws exactly what the frame shows into a JPEG of the feed frame's shape.
export async function renderCrop(image, layout, offset) {
  const region = visibleRegion(layout, offset);
  const canvas = document.createElement('canvas');
  canvas.width = FEED_IMAGE_FRAME.outputWidth;
  canvas.height = Math.round(FEED_IMAGE_FRAME.outputWidth / FEED_IMAGE_FRAME.widthPerHeight);
  const context = canvas.getContext('2d');
  context.fillStyle = COLOR_PALETTE.white;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, region.x, region.y, region.width, region.height, 0, 0, canvas.width, canvas.height);
  return canvasToJpeg(canvas);
}
