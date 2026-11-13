// The Accounts tab lists members instead of posts, so it is not a post category and exists on phones only. It sits
// next to Career, like the other topic tabs, and only signed-in members see it.
export const ACCOUNTS_VALUE = 'accounts';
const ACCOUNTS_TAB = { value: ACCOUNTS_VALUE, label: 'Accounts' };

export function withAccountsTab(tabs) {
  const careerIndex = tabs.findIndex((tab) => tab.value === 'career');
  return [...tabs.slice(0, careerIndex + 1), ACCOUNTS_TAB, ...tabs.slice(careerIndex + 1)];
}
