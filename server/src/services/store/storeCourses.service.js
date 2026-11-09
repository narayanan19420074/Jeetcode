import { User } from '../../models/User.js';
import { courseLessonKeys } from '../../config/store.js';
import { ApiError } from '../../utils/ApiError.js';
import { loadCatalog, publicItem } from './storeCatalog.service.js';

export function courseProgress(item, owned) {
  const keys = courseLessonKeys(item);
  const done = new Set((owned?.done || []).filter((k) => keys.includes(k)));
  return { done: [...done], doneCount: done.size, lessonCount: keys.length, percent: keys.length ? Math.round((done.size / keys.length) * 100) : 0 };
}

export async function myCourses(userId) {
  const [catalog, user] = await Promise.all([loadCatalog(), User.findById(userId).select('ownedCourses').lean()]);
  return (user?.ownedCourses || [])
    .map((o) => {
      const item = catalog.get(o.slug);
      if (!item) return null;
      return { ...publicItem(item, { owned: new Set([o.slug]) }), purchasedAt: o.at, progress: courseProgress(item, o) };
    })
    .filter(Boolean);
}

// Syllabus is public; lesson links and progress are only for owners.
export async function courseDetail(userId, slug) {
  const catalog = await loadCatalog();
  const item = catalog.get(slug);
  if (!item || item.kind !== 'course') throw ApiError.notFound('Course not found');
  if (!item.active && !userId) throw ApiError.notFound('Course not found');

  let owned = null;
  if (userId) {
    const user = await User.findById(userId).select('ownedCourses').lean();
    owned = (user?.ownedCourses || []).find((c) => c.slug === slug) || null;
  }
  if (!item.active && !owned) throw ApiError.notFound('Course not found');

  const modules = item.modules.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map((l) => ({
      key: `${m.id}.${l.id}`,
      title: l.title,
      minutes: l.minutes,
      kind: l.kind,
      ...(owned ? { href: l.href } : {}),
    })),
  }));

  return {
    course: { ...publicItem(item, { owned: new Set(owned ? [slug] : []) }), modules },
    owned: Boolean(owned),
    progress: owned ? courseProgress(item, owned) : null,
  };
}

export async function setLessonDone(userId, slug, key, done) {
  const catalog = await loadCatalog();
  const item = catalog.get(slug);
  if (!item || item.kind !== 'course') throw ApiError.notFound('Course not found');
  if (!courseLessonKeys(item).includes(key)) throw ApiError.badRequest('Unknown lesson');

  const op = done ? { $addToSet: { 'ownedCourses.$.done': key } } : { $pull: { 'ownedCourses.$.done': key } };
  const user = await User.findOneAndUpdate({ _id: userId, 'ownedCourses.slug': slug }, op, { new: true }).select('ownedCourses').lean();
  if (!user) throw ApiError.forbidden('Buy this course to track your progress');
  const owned = user.ownedCourses.find((c) => c.slug === slug);
  return courseProgress(item, owned);
}
