import { useCallback } from 'react';
import { communityApi } from '../../../api/communityApi';
import { SAVED_FEED } from './communityCategories';
import usePagedList from './usePagedList';

const PAGE_SIZE = 15;

const feedFilterFor = (category, channelId) => {
  if (channelId) return { channel: channelId };
  if (category === SAVED_FEED) return { saved: true };
  return category ? { category } : {};
};

// Loads the post feed for one category, or for one group or newsletter when `channelId` is given, and appends further
// pages. Switching category or channel restarts from page 1.
export default function useCommunityFeed(category, channelId) {
  const fetchPage = useCallback(
    async (page) => {
      const { data } = await communityApi.listPosts({ page, limit: PAGE_SIZE, ...feedFilterFor(category, channelId) });
      return { rows: data.data.items, totalPages: data.data.pagination.totalPages };
    },
    [category, channelId]
  );
  const { setItems, ...list } = usePagedList(fetchPage);

  const prepend = (post) => setItems((previous) => [post, ...previous]);
  // `removal` is { postId } for one post or { authorId } for every named post of that author.
  const removePosts = ({ postId, authorId }) =>
    setItems((previous) => previous.filter((post) => post._id !== postId && (!authorId || post.author?._id !== authorId)));
  return { ...list, prepend, removePosts };
}
