import useRemoteToggle from './useRemoteToggle';
import { communityApi } from '../../../api/communityApi';

export const useSavePost = (post) =>
  useRemoteToggle({ initial: Boolean(post.isSaved), enable: () => communityApi.savePost(post._id), disable: () => communityApi.unsavePost(post._id) });

// Follows a user (the author of a post or of a comment). `userId` is undefined when the author is anonymous.
export const useFollowUser = (userId, isFollowing) =>
  useRemoteToggle({ initial: Boolean(isFollowing), enable: () => communityApi.followUser(userId), disable: () => communityApi.unfollowUser(userId) });

// The repost count shown to the viewer includes their own repost the moment they tap, before the server answers.
export function useRepostPost(post) {
  const repost = useRemoteToggle({ initial: Boolean(post.isReposted), enable: () => communityApi.repostPost(post._id), disable: () => communityApi.unrepostPost(post._id) });
  const count = (post.repostCount ?? 0) + Number(repost.on) - Number(Boolean(post.isReposted));
  return { ...repost, count };
}
