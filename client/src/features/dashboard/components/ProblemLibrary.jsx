import { Stack } from '@mui/material';
import { SaveToListMenu } from './ListDialogs';
import CategoryPills from './library/CategoryPills';
import LibraryTable from './library/LibraryTable';
import LibraryToolbar from './library/LibraryToolbar';
import TopicRow from './library/TopicRow';
import useProblemLibrary from './library/useProblemLibrary';

// Topic groups and topics browsed above the toolbar (the Problems page). The dashboard puts them inside the filter panel instead.
function InlineTopicBrowser({ lib }) {
  return (
    <>
      <CategoryPills groups={lib.groups} selectedTags={lib.query.tags} onSelect={(group) => lib.patch({ tags: group.tags })} onClear={() => lib.patch({ tags: [] })} />
      <TopicRow tags={lib.tags} selected={lib.query.tags} onToggle={lib.toggleTag} />
    </>
  );
}

// `height` (optional, lg+ only) overrides the default dashboard height, so other pages can host the library under a header.
// On wide screens the whole library fits the window once it is scrolled to the top, so only the problem list scrolls.
// `topicsInFilter` moves every topic filter into the filter button's panel and drops the topic rows above the list.
// `topicsInSidebar` is for a page whose sidebar owns the topics and the filter button, so the library shows only the search, sort and list.
export function ProblemLibraryView({ lib, isAuthenticated, progress, dailyId, listsApi, height, topicsInFilter = false, topicsInSidebar = false }) {
  return (
    <Stack ref={lib.cardRef} spacing={1.5} sx={{ height: { lg: height ?? 'calc(100vh - 120px)' }, scrollMarginTop: { xs: 72, lg: 0 }, minWidth: 0, maxWidth: '100%' }}>
      {!topicsInFilter && !topicsInSidebar && <InlineTopicBrowser lib={lib} />}
      <LibraryToolbar lib={lib} progress={progress} isAuthenticated={isAuthenticated} topicsInFilter={topicsInFilter} filterInSidebar={topicsInSidebar} />
      <LibraryTable lib={lib} dailyId={dailyId} listsApi={listsApi} />
      <SaveToListMenu
        anchorEl={lib.saveAnchor}
        problem={lib.saveProblem}
        lists={listsApi.lists}
        onToggle={listsApi.toggleItem}
        onCreate={listsApi.createList}
        onClose={lib.closeSaveMenu}
      />
    </Stack>
  );
}

// The library with its own state, for pages that do not need to share the filters with a sidebar.
export default function ProblemLibrary({ preset, listsApi, ...viewProps }) {
  const lib = useProblemLibrary({ preset, listsApi });
  return <ProblemLibraryView lib={lib} listsApi={listsApi} {...viewProps} />;
}
