import { sameSet } from '../../components/library/libraryConstants';

// A group counts as selected only when exactly its topics are selected, so its own topics are not highlighted as well.
export const findSelectedGroup = (groups, selectedTags) => groups.find((group) => sameSet(selectedTags, group.tags));
