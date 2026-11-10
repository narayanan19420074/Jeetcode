// Feed tabs. `value` matches the server's post categories; the empty value is the unfiltered "For You" feed.
export const FEED_TABS = [
  { value: '', label: 'For You' },
  { value: 'career', label: 'Career' },
  { value: 'interview', label: 'Interview' },
  { value: 'contest', label: 'Contest' },
  { value: 'compensation', label: 'Compensation' },
  { value: 'general', label: 'General' },
];

// The Career tab shows its posts in a LinkedIn-style feed (see CareerPostCard).
export const CAREER_CATEGORY = 'career';

// Categories a post can be filed under (every tab except the unfiltered feed).
export const POST_CATEGORY_OPTIONS = FEED_TABS.filter((tab) => tab.value);

export const POST_TITLE_MAX = 150;
export const POST_BODY_MAX = 10000;
