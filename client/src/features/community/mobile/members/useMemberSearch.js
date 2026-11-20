import { communityApi } from '../../../../api/communityApi';
import useDebouncedSearch from '../../common/useDebouncedSearch';

export { MIN_QUERY_LENGTH } from '../../common/useDebouncedSearch';

const fetchMembers = (needle) => communityApi.searchMembers(needle).then(({ data }) => data.data);

// Searches every member account while the person types (see useDebouncedSearch for the typing pause).
export default function useMemberSearch(query) {
  return useDebouncedSearch(query, fetchMembers);
}
