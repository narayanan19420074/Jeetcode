import { useCallback, useEffect, useState } from 'react';
import { communityApi } from '../../../api/communityApi';
import { extractErrorMessage } from '../../../api/apiClient';

const PAGE_SIZE = 15;

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
        const params = { page: pageToLoad, limit: PAGE_SIZE, ...(category ? { category } : {}) };
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
  return { items, loading, error, hasMore, loadMore, reload: () => load(1), prepend };
}
