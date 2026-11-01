// Shared sizes and query helpers for the desktop problem library.

export const TOPIC_ROW_H = 34;
export const PAD_X = { xs: '12px', sm: '18px' };
export const STAR_W = 44;
export const ACC_W = 64;
export const DIFF_W = 72;

export const INITIAL_QUERY = {
  search: '',
  difficulty: 'All',
  status: 'All',
  sort: 'newest',
  tags: [],
  companies: [],
  page: 1,
  pageSize: 50,
};

export const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

const unlessAll = (value) => (value === 'All' ? undefined : value);
const unlessEmpty = (list) => (list.length ? list : undefined);

// Filters shared by the list request and the "pick a random problem" request.
const toFilterParams = (q) => ({
  difficulty: unlessAll(q.difficulty),
  status: unlessAll(q.status),
  tag: unlessEmpty(q.tags),
  company: unlessEmpty(q.companies),
});

// While a search term is set the results are ranked by relevance, so the sort order is not sent.
export const toListParams = (q) => ({
  page: q.page,
  limit: q.pageSize,
  sort: q.search ? undefined : q.sort,
  search: q.search || undefined,
  ...toFilterParams(q),
});

export const toRandomParams = toFilterParams;

export const countActiveFilters = (q) => (q.difficulty !== 'All' ? 1 : 0) + (q.status !== 'All' ? 1 : 0) + q.companies.length;

export const EMPTY_LIST = { items: [], pagination: { page: 1, totalPages: 1, total: 0 } };
