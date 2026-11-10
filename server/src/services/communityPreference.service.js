import { CommunityPreference } from '../models/CommunityPreference.js';
import { ApiError } from '../utils/ApiError.js';

// Each list keeps only the most recent entries, so the oldest save or hide is dropped instead of refusing the new one.
const MAX_ITEMS_PER_LIST = 500;

const findPreferences = (userId) => CommunityPreference.findOne({ user: userId }).lean();

async function addToList(userId, field, id) {
  await CommunityPreference.updateOne({ user: userId }, { $setOnInsert: { user: userId } }, { upsert: true });
  await CommunityPreference.updateOne({ user: userId, [field]: { $ne: id } }, { $push: { [field]: { $each: [id], $slice: -MAX_ITEMS_PER_LIST } } });
}

const removeFromList = (userId, field, id) => CommunityPreference.updateOne({ user: userId }, { $pull: { [field]: id } });

export async function setPostSaved(userId, post, saved) {
  if (saved) await addToList(userId, 'savedPosts', post._id);
  else await removeFromList(userId, 'savedPosts', post._id);
  return { isSaved: saved };
}

export async function hidePostForUser(userId, post) {
  await addToList(userId, 'hiddenPosts', post._id);
  return { hidden: true };
}

// The client never learns who wrote an anonymous post, so hiding "that author" is refused for those posts.
export async function hideAuthorOfPost(userId, post) {
  if (post.isAnonymous) throw ApiError.badRequest('Authors of anonymous posts cannot be hidden');
  if (String(post.author) === String(userId)) throw ApiError.badRequest("You can't hide your own posts");
  await addToList(userId, 'mutedAuthors', post.author);
  return { hidden: true };
}

// Narrows a post query to what this viewer wants to see. Muted authors are removed only from their named posts: removing
// their anonymous posts as well would reveal which anonymous posts belong to the same person.
export async function applyViewerPreferences(filter, user, savedOnly) {
  const preferences = user ? await findPreferences(user.id) : null;
  if (savedOnly) return { ...filter, _id: { $in: preferences?.savedPosts ?? [] } };
  if (!preferences) return filter;
  return {
    ...filter,
    _id: { $nin: preferences.hiddenPosts },
    $nor: [{ isAnonymous: false, author: { $in: preferences.mutedAuthors } }],
  };
}

export async function findSavedPostIds(userId, postIds) {
  const preferences = await CommunityPreference.findOne({ user: userId, savedPosts: { $in: postIds } }).select('savedPosts').lean();
  const wanted = new Set(postIds.map(String));
  return new Set((preferences?.savedPosts ?? []).map(String).filter((id) => wanted.has(id)));
}
