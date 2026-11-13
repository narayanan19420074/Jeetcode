import { useState } from 'react';
import { useSelector } from 'react-redux';
import { ACCOUNTS_VALUE, withAccountsTab } from './mobileTabs';
import { MIN_QUERY_LENGTH } from './members/useMemberSearch';
import useSuggestedMembers from './members/useSuggestedMembers';

// What only the phone Community page needs on top of the shared page state: the member search text, the Accounts tab
// and the suggested members. A search replaces the tabs and the feed until it is cleared.
export default function useMobileCommunity(page) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [query, setQuery] = useState('');
  const [isAccountsTabOpen, setAccountsTabOpen] = useState(false);
  const suggestions = useSuggestedMembers(isAuthenticated);

  const selectTab = (value) => {
    setAccountsTabOpen(value === ACCOUNTS_VALUE);
    if (value !== ACCOUNTS_VALUE) page.setCategory(value);
  };

  return {
    query,
    setQuery,
    isSearching: query.trim().length >= MIN_QUERY_LENGTH,
    isAccountsTabOpen,
    tabs: isAuthenticated ? withAccountsTab(page.tabs) : page.tabs,
    activeTab: isAccountsTabOpen ? ACCOUNTS_VALUE : page.category,
    selectTab,
    suggestions,
    // Suggested members appear between posts of the main feed only.
    showsSuggestionsInFeed: isAuthenticated && page.category === '',
  };
}
