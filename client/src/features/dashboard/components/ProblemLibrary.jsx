import { Stack } from '@mui/material';
import { SaveToListMenu } from './ListDialogs';
import CategoryPills from './library/CategoryPills';
import LibraryTable from './library/LibraryTable';
import LibraryToolbar from './library/LibraryToolbar';
import TopicRow from './library/TopicRow';
import useProblemLibrary from './library/useProblemLibrary';

// `height` (optional, lg+ only) overrides the default dashboard height, so other pages can host the library under a header.
// On wide screens the whole library fits the window once it is scrolled to the top, so only the problem list scrolls.
export default function ProblemLibrary({ isAuthenticated, progress, dailyId, preset, listsApi, height }) {
  const lib = useProblemLibrary({ preset, listsApi });
  return (
    <Stack ref={lib.cardRef} spacing={1.5} sx={{ height: { lg: height ?? 'calc(100vh - 120px)' }, scrollMarginTop: { xs: 72, lg: 0 }, minWidth: 0, maxWidth: '100%' }}>
      <CategoryPills groups={lib.groups} selectedTags={lib.query.tags} onSelect={(group) => lib.patch({ tags: group.tags })} onClear={() => lib.patch({ tags: [] })} />
      <TopicRow tags={lib.tags} selected={lib.query.tags} onToggle={lib.toggleTag} />
      <LibraryToolbar lib={lib} progress={progress} isAuthenticated={isAuthenticated} />
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
