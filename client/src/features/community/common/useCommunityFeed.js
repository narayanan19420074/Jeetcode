import { useCallback, useEffect, useState } from 'react';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';
import { SAVED_FEED } from './communityCategories';

const PAGE_SIZE = 15;

const feedFilterFor = (category) => {
  if (category === SAVED_FEED) return { saved: true };
  return category ? { category } : {};
};

// Loads the post feed for one category and appends further pages. Switching category restarts from page 1.
export default function useCommunityFeed(category) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(
    async (pageToLoad) => {
      setLoading(true);
      setError('');
      try {
        const params = { page: pageToLoad, limit: PAGE_SIZE, ...feedFilterFor(category) };
        const { data } = await communityApi.listPosts(params);
        const { items: rows, pagination } = data.data;
        setItems((previous) => (pageToLoad === 1 ? rows : [...previous, ...rows]));
        setPage(pageToLoad);
        setHasMore(pageToLoad < pagination.totalPages);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [category]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const loadMore = () => load(page + 1);
  const prepend = (post) => setItems((previous) => [post, ...previous]);
  // `removal` is { postId } for one post or { authorId } for every named post of that author.
  const removePosts = ({ postId, authorId }) =>
    setItems((previous) => previous.filter((post) => post._id !== postId && (!authorId || post.author?._id !== authorId)));
  return { items, loading, error, hasMore, loadMore, reload: () => load(1), prepend, removePosts };
}
