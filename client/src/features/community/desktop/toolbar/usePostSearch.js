import { communityApi } from '../../../../api/communityApi';
import useDebouncedSearch from '../../common/useDebouncedSearch';

const RESULT_LIMIT = 5;
const fetchPosts = (needle) => communityApi.listPosts({ q: needle, limit: RESULT_LIMIT }).then(({ data }) => data.data.items);

// Posts whose title or text match what the person types in the toolbar.
export default function usePostSearch(query) {
  return useDebouncedSearch(query, fetchPosts);
}
