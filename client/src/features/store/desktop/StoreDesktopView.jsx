import { LibraryFont } from '../../dashboard/components/libraryStyle';
import DesktopFrame from '../../dashboard/desktop/DesktopFrame';
import StoreContentColumn from './StoreContentColumn';
import StoreRail from './StoreRail';
import StoreSidebar from './StoreSidebar';

// Desktop Store in the same three-column frame as the Dashboard and Problems pages: your coins on the left, the filters on the
// right and the items in the middle. Orders and the coin wallet open as dialogs from the left card, so nobody leaves the page.
export default function StoreDesktopView({ store }) {
  return (
    <LibraryFont>
      <DesktopFrame
        sidebar={<StoreSidebar store={store} />}
        rail={<StoreRail store={store} />}
        renderContent={(isPageOneWindowTall) => <StoreContentColumn store={store} isPageOneWindowTall={isPageOneWindowTall} />}
      />
    </LibraryFont>
  );
}
