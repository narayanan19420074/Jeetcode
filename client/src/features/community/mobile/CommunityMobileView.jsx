import { Box, Fab } from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CategoryTabs from '../common/CategoryTabs';
import { LibraryFont } from '../../dashboard/components/libraryStyle';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import PostList from '../common/PostList';
import CommunityTopBar from './CommunityTopBar';
import PhonePostCard from './PhonePostCard';
import ComposePostDialog from '../common/ComposePostDialog';
import MemberList from './members/MemberList';
import MemberSearchResults from './members/MemberSearchResults';
import SuggestedMembersStrip from './members/SuggestedMembersStrip';
import useMobileCommunity from './useMobileCommunity';
import { SIZES } from '../../../app/design/designTokens';

function ComposeButton({ onClick }) {
  return (
    <Fab
      aria-label="Create post"
      onClick={onClick}
      sx={(theme) => ({ bgcolor: navActiveColor(theme), color: theme.palette.common.white, '&:hover': { bgcolor: navActiveColor(theme) }, position: 'fixed', right: theme.spacing(2), bottom: `calc(${SIZES.bottomNavHeight}px + ${theme.spacing(3)} + env(safe-area-inset-bottom))` })}
    >
      <EditNoteRoundedIcon />
    </Fab>
  );
}

// Below the top bar: search results while searching, otherwise the tabs with either the Accounts list or the post feed.
function CommunityMobileBody({ page, mobile }) {
  if (mobile.isSearching) return <MemberSearchResults query={mobile.query} />;
  const renderInterlude = mobile.showsSuggestionsInFeed ? (slot) => <SuggestedMembersStrip members={mobile.suggestions.items} slot={slot} /> : undefined;
  return (
    <>
      <Box sx={{ mt: 1 }}>
        <CategoryTabs value={mobile.activeTab} onChange={mobile.selectTab} options={mobile.tabs} />
      </Box>
      {mobile.isAccountsTabOpen ? (
        <MemberList state={mobile.suggestions} heading="People you may know" emptyText="No suggestions right now. Check back later." />
      ) : (
        <PostList feed={page.feed} category={page.category} PostCard={PhonePostCard} renderInterlude={renderInterlude} />
      )}
    </>
  );
}

// Phone layout: top bar with member search, scrolling category tabs (including Accounts), full-width feed with suggested
// members between posts, and a floating compose button above the bottom bar.
export default function CommunityMobileView({ page }) {
  const mobile = useMobileCommunity(page);
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))' }}>
        <CommunityTopBar query={mobile.query} onQueryChange={mobile.setQuery} />
        <CommunityMobileBody page={page} mobile={mobile} />
        <ComposeButton onClick={page.openCompose} />
        <ComposePostDialog open={page.composeOpen} onClose={page.closeCompose} onPublished={page.feed.prepend} />
      </Box>
    </LibraryFont>
  );
}
