import { useEffect, useRef } from 'react';

// How many posts before the end the next page is requested, so the next post is already there when the viewer swipes.
const LOAD_AHEAD = 2;

// Scrolling of the posts viewer: it opens on the post that was tapped, and asks for the next page of the feed while the
// viewer approaches the last loaded post. Each post is exactly one screen tall, so scroll position / screen height is
// the post number.
export default function useReelsScroll({ startIndex, count, hasMore, loading, loadMore }) {
  const scrollRef = useRef(null);
  const firstIndex = useRef(startIndex);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = firstIndex.current * scroller.clientHeight;
  }, []);

  const onScroll = (event) => {
    const { scrollTop, clientHeight } = event.currentTarget;
    const index = Math.round(scrollTop / clientHeight);
    if (hasMore && !loading && index >= count - LOAD_AHEAD) loadMore();
  };

  return { scrollRef, onScroll };
}
