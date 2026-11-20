// Thin entry: the shared community building blocks live in ./communityBits, grouped by responsibility.
// Importers keep using this path so nothing else needs to change.
export { LANG_LABEL, LANG_COLOR } from './Markdown';
export { timeAgo, clamp } from './communityBits/bitsUtils';
export { UserAvatar, AuthorHeader } from './communityBits/Identity';
export { LangChip, MetricChip, AcceptedBadge, YouTag } from './communityBits/Chips';
export { VoteBar } from './communityBits/VoteBar';
export { ItemMenu, ConfirmDialog, ReportDialog } from './communityBits/CommunityDialogs';
export { ActionButton, SegmentedTabs, FilterChips, ComposerPrompt, EmptyBlock, FeedSkeleton, PostCard, PostActions } from './communityBits/FeedFurniture';
export { FlatLookProvider, useFlatLook } from './communityBits/flatLook';
