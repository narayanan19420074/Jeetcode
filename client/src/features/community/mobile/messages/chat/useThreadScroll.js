import { useLayoutEffect, useRef } from 'react';

const PINNED_DISTANCE_PX = 80;

// Keeps the thread on the newest message, unless the reader scrolled up to read older ones. Loading older messages
// keeps the reader on the message they were looking at instead of jumping to the top.
export default function useThreadScroll(messages, isFriendTyping, isLoading) {
  const scrollerRef = useRef(null);
  const isPinned = useRef(true);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller && isPinned.current) scroller.scrollTop = scroller.scrollHeight;
  }, [messages, isFriendTyping, isLoading]);

  const onScroll = () => {
    const scroller = scrollerRef.current;
    if (scroller) isPinned.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < PINNED_DISTANCE_PX;
  };

  const keepPositionWhile = async (loadMore) => {
    const scroller = scrollerRef.current;
    const heightBefore = scroller?.scrollHeight ?? 0;
    isPinned.current = false;
    await loadMore();
    requestAnimationFrame(() => {
      if (scroller) scroller.scrollTop = scroller.scrollHeight - heightBefore;
    });
  };

  return { scrollerRef, onScroll, keepPositionWhile, pinToLatest: () => { isPinned.current = true; } };
}
