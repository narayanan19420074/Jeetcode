// Feed tabs. `value` matches the server's post categories; the empty value is the unfiltered "For You" feed.
export const FEED_TABS = [
  { value: '', label: 'For You' },
  { value: 'career', label: 'Career' },
  { value: 'interview', label: 'Interview' },
  { value: 'contest', label: 'Contest' },
  { value: 'compensation', label: 'Compensation' },
  { value: 'general', label: 'General' },
];

// The Saved tab is not a category: it lists the posts the signed-in user saved, and is shown only to signed-in users.
export const SAVED_FEED = 'saved';
export const SAVED_TAB = { value: SAVED_FEED, label: 'Saved' };

// Categories a post can be filed under (every tab except the unfiltered feed).
export const POST_CATEGORY_OPTIONS = FEED_TABS.filter((tab) => tab.value);

export const POST_TITLE_MAX = 150;
export const POST_BODY_MAX = 10000;
