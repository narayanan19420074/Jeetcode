import { useEffect, useRef, useState } from 'react';
import { clampOffset, imageLayout, renderCrop } from './imageCrop';

const NO_OFFSET = { x: 0, y: 0 };

// Loads the chosen file into an <img> so its real size is known for the crop maths.
function useLoadedImage(file) {
  const [source, setSource] = useState(null);
  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setSource({ url, image });
    image.src = url;
    return () => {
      URL.revokeObjectURL(url);
      setSource(null);
    };
  }, [file]);
  return source;
}

// The stage only exists while the dialog is open, so it is tracked through a callback ref instead of an effect on mount.
function useStageSize() {
  const [stage, setStage] = useState(null);
  const [stageSize, setStageSize] = useState(0);
  useEffect(() => {
    if (!stage) return undefined;
    const observer = new ResizeObserver(([entry]) => setStageSize(entry.contentRect.width));
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stage]);
  return { stageRef: setStage, stageSize };
}

// Drag moves the photo under the frame, the zoom slider scales it. Both are limited so the frame is always filled.
export default function useImageCrop(file) {
  const source = useLoadedImage(file);
  const { stageRef, stageSize } = useStageSize();
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState(NO_OFFSET);
  const dragStart = useRef(null);
  const layoutFor = (zoomValue) => source && stageSize ? imageLayout({ naturalWidth: source.image.naturalWidth, naturalHeight: source.image.naturalHeight, stageSize, zoom: zoomValue }) : null;
  const layout = layoutFor(zoom);

  useEffect(() => {
    setZoom(1);
    setOffset(NO_OFFSET);
  }, [file]);

  const changeZoom = (value) => {
    setZoom(value);
    setOffset((current) => clampOffset(current, layoutFor(value)));
  };
  const dragHandlers = {
    onPointerDown: (event) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStart.current = { pointer: { x: event.clientX, y: event.clientY }, offset };
    },
    onPointerMove: (event) => {
      if (!dragStart.current || !layout) return;
      const { pointer, offset: origin } = dragStart.current;
      setOffset(clampOffset({ x: origin.x + event.clientX - pointer.x, y: origin.y + event.clientY - pointer.y }, layout));
    },
    onPointerUp: () => {
      dragStart.current = null;
    },
  };
  return { stageRef, stageSize, source, layout, zoom, offset, changeZoom, dragHandlers, renderBlob: () => renderCrop(source.image, layout, offset) };
}
