import useRemoteToggle from './useRemoteToggle';
import { communityApi } from '../../../api/communityApi';

export const useSavePost = (post) =>
  useRemoteToggle({ initial: Boolean(post.isSaved), enable: () => communityApi.savePost(post._id), disable: () => communityApi.unsavePost(post._id) });

// Follows the post's author. Anonymous posts have no author, so there is nothing to follow.
export const useFollowAuthor = (post) =>
  useRemoteToggle({
    initial: Boolean(post.isFollowingAuthor),
    enable: () => communityApi.followUser(post.author?._id),
    disable: () => communityApi.unfollowUser(post.author?._id),
  });

// The repost count shown to the viewer includes their own repost the moment they tap, before the server answers.
export function useRepostPost(post) {
  const repost = useRemoteToggle({ initial: Boolean(post.isReposted), enable: () => communityApi.repostPost(post._id), disable: () => communityApi.unrepostPost(post._id) });
  const count = (post.repostCount ?? 0) + Number(repost.on) - Number(Boolean(post.isReposted));
  return { ...repost, count };
}
