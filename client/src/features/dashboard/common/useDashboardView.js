import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// `stats` (My stats) and `billing` (Plans) open in the main area like the other sidebar entries. `friends` is no longer a
// sidebar entry; the view stays only so that old links keep working (they are forwarded by LegacyFriendsRedirect).
const VIEWS = ['library', 'contest', 'quests', 'explore', 'plans', 'leaderboard', 'friends', 'list', 'stats', 'billing'];
// These views need the full width, so the streak rail slides away.
const VIEWS_WITHOUT_RAIL = ['plans', 'leaderboard', 'friends', 'explore', 'contest', 'quests', 'stats', 'billing'];
// These views scroll their own list, so the middle column itself must not scroll.
const VIEWS_WITH_OWN_SCROLL = ['leaderboard', 'quests'];

// The open view lives in the URL, so Back and refresh behave. A list view without a valid list falls back to the library.
export default function useDashboardView(listsApi) {
  const [params, setParams] = useSearchParams();
  const requestedView = params.get('view');
  const view = VIEWS.includes(requestedView) ? requestedView : 'library';
  const activeList = listsApi.lists.find((list) => list.id === (params.get('list') || 'favorite'));
  const currentView = view === 'list' && !activeList ? 'library' : view;
  const goView = useCallback((next) => setParams(next === 'library' ? {} : { view: next }), [setParams]);
  const selectList = useCallback((id) => setParams({ view: 'list', list: id }), [setParams]);
  return {
    currentView,
    activeList,
    goView,
    selectList,
    showRail: !VIEWS_WITHOUT_RAIL.includes(currentView),
    ownScroll: VIEWS_WITH_OWN_SCROLL.includes(currentView),
  };
}
