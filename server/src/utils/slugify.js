// Turns "Two Sum II - Input Array Is Sorted" into "two-sum-ii-input-array-is-sorted".
export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
