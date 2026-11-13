import { sameSet } from '../../components/library/libraryConstants';

const ALL_TOPICS_LABEL = 'All Topics';
const matchesSearch = (searchText, label) => label.toLowerCase().includes(searchText.trim().toLowerCase());

// Entries of the topic list that match the sidebar search box; an empty box keeps everything.
export function filterTopicEntries({ groups, tags, searchText }) {
  return {
    showAll: matchesSearch(searchText, ALL_TOPICS_LABEL),
    groups: groups.filter((group) => matchesSearch(searchText, group.label)),
    tags: tags.filter(({ tag }) => matchesSearch(searchText, tag)),
  };
}

// A group counts as selected only when exactly its topics are selected, so its own topics are not highlighted as well.
export const findSelectedGroup = (groups, selectedTags) => groups.find((group) => sameSet(selectedTags, group.tags));
