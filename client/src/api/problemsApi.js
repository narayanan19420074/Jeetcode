import { apiClient } from './apiClient';

// Express 5 parses query strings with Node's "simple" parser, which does NOT
// understand axios's default "tag[]=A&tag[]=B" array format: the key arrives
// as "tag[]", the validator never sees "tag", and the filter is silently
// dropped. `indexes: null` sends repeated keys ("tag=A&tag=B") instead, which
// the validator's toArray() already handles for both one and many values.
const repeatedKeys = { indexes: null };

export const problemsApi = {
  list: (params) => apiClient.get('/problems', { params, paramsSerializer: repeatedKeys }),
  getBySlug: (slug) => apiClient.get(`/problems/${slug}`),
  getTags: () => apiClient.get('/problems/tags'),
  getCompanies: () => apiClient.get('/problems/companies'),
  getProgress: () => apiClient.get('/problems/progress'),
  getRandom: (params) => apiClient.get('/problems/random', { params, paramsSerializer: repeatedKeys }),
};
