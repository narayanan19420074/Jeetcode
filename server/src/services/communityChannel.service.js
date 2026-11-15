import { CommunityChannel } from '../models/CommunityChannel.js';
import { ChannelMembership } from '../models/ChannelMembership.js';
import { ApiError } from '../utils/ApiError.js';
import { AUTHOR_FIELDS, toObjectId } from './community.service.js';

// Stops one account from filling the directory with channels.
const MAX_OWNED_CHANNELS_PER_KIND = 10;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const joinedChannelIds = async (userId) => (await ChannelMembership.find({ user: userId }).select('channel').lean()).map((row) => row.channel);

async function buildChannelFilter({ kind, mine, q }, user) {
  const filter = { kind };
  if (q) filter.nameKey = new RegExp(escapeRegex(q.toLowerCase()));
  if (mine === 'true') filter._id = { $in: user ? await joinedChannelIds(user.id) : [] };
  return filter;
}

// Adds what only the viewer knows: whether they belong to each channel and whether they own it.
async function addViewerState(channels, user) {
  const joined = user ? new Set((await ChannelMembership.find({ user: user.id, channel: { $in: channels.map((c) => c._id) } }).select('channel').lean()).map((row) => String(row.channel))) : new Set();
  return channels.map((channel) => ({ ...channel, isMember: joined.has(String(channel._id)), isOwner: Boolean(user) && String(channel.owner?._id) === String(user.id) }));
}

export async function findChannelPage(query, user) {
  const filter = await buildChannelFilter(query, user);
  const { page, limit } = query;
  const [rows, total] = await Promise.all([
    CommunityChannel.find(filter).sort({ memberCount: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('owner', AUTHOR_FIELDS).lean(),
    CommunityChannel.countDocuments(filter),
  ]);
  return { items: await addViewerState(rows, user), total };
}

export async function findChannel(id, user) {
  const channel = await CommunityChannel.findById(toObjectId(id, 'Group or newsletter')).populate('owner', AUTHOR_FIELDS).lean();
  if (!channel) throw ApiError.notFound('Group or newsletter not found');
  const [presented] = await addViewerState([channel], user);
  return presented;
}

async function assertUnderOwnershipLimit(userId, kind) {
  if ((await CommunityChannel.countDocuments({ owner: userId, kind })) >= MAX_OWNED_CHANNELS_PER_KIND) {
    throw ApiError.badRequest(`You can create up to ${MAX_OWNED_CHANNELS_PER_KIND} ${kindLabel(kind, true)}.`);
  }
}

const isDuplicateKeyError = (error) => error?.code === 11000;
const kindLabel = (kind, plural = false) => (kind === 'group' ? 'group' : 'newsletter') + (plural ? 's' : '');

export async function createChannel(userId, { kind, name, description }) {
  await assertUnderOwnershipLimit(userId, kind);
  try {
    const channel = await CommunityChannel.create({ kind, name, nameKey: name.toLowerCase(), description, owner: userId });
    await setMembership(userId, channel._id, true);
    return findChannel(channel._id, { id: userId });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw ApiError.conflict(`A ${kindLabel(kind)} with this name already exists. Choose a different name.`);
    throw error;
  }
}

// The counter changes only when a membership row was really added or removed, so repeating a request is harmless.
export async function setMembership(userId, channelId, joined) {
  const pair = { channel: channelId, user: userId };
  const changed = joined
    ? (await ChannelMembership.updateOne(pair, { $setOnInsert: pair }, { upsert: true })).upsertedCount
    : (await ChannelMembership.deleteOne(pair)).deletedCount;
  if (changed) await CommunityChannel.updateOne({ _id: channelId }, { $inc: { memberCount: joined ? 1 : -1 } });
}

// The owner stays a member: a group or newsletter without its owner would have nobody who can run it.
export async function changeMembership(userId, channelId, joined) {
  const channel = await findChannel(channelId, { id: userId });
  if (!joined && channel.isOwner) throw ApiError.badRequest(`Owners cannot leave their own ${kindLabel(channel.kind)}.`);
  await setMembership(userId, channel._id, joined);
  return { isMember: joined };
}

// Groups: members discuss, so every member may post. Newsletters: only the owner publishes; subscribers read.
export async function assertCanPublish(userId, channelId) {
  const channel = await findChannel(channelId, { id: userId });
  const allowed = channel.kind === 'newsletter' ? channel.isOwner : channel.isMember;
  if (!allowed) throw ApiError.forbidden(channel.kind === 'newsletter' ? 'Only the newsletter owner can publish.' : 'Join this group to post.');
  return channel;
}
