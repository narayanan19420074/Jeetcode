export const norm = (text) => String(text || '').trim().toLowerCase();

// A prep track is named after its exam ("TCS NQT"); the Companies list shows the company ("TCS").
export const companyOfTrack = (name) => String(name || '').replace(/\s+NQT$/i, '').trim();

// Companies with a full exam-pattern roadmap come first (only once that company has coding questions), then every
// other company we have questions for. The exam roadmap of a track stays reachable from inside the company.
export function buildCompanyList(tracks, others, query) {
  const coding = new Map(others.map((item) => [norm(item.company), item]));
  const withRoadmap = tracks
    .map((track) => ({ track, hit: coding.get(norm(companyOfTrack(track.name))) }))
    .filter(({ hit }) => hit && hit.count > 0)
    .map(({ track, hit }) => ({
      key: `t-${track.slug}`, name: hit.company, logoUrl: track.logoUrl, roadmap: true, count: hit.count,
      minutes: track.examDurationMinutes, sections: track.sectionCount, readiness: track.readiness, examSlug: track.slug,
    }));
  const taken = new Set(withRoadmap.map((company) => norm(company.name)));
  const rest = others
    .filter((item) => !taken.has(norm(item.company)))
    .sort((a, b) => b.count - a.count || a.company.localeCompare(b.company))
    .map((item) => ({ key: `c-${item.company}`, name: item.company, count: item.count }));
  return [...withRoadmap, ...rest].filter((company) => !query || norm(company.name).includes(query));
}

// The company named in the URL, with its logo and exam slug when it is in the list (or is one of the prep tracks).
export function findSelectedCompany(selectedName, list, tracks) {
  if (!selectedName) return null;
  const inList = list.find((company) => norm(company.name) === norm(selectedName));
  const asTrack = tracks
    .map((track) => ({ name: companyOfTrack(track.name), logoUrl: track.logoUrl, examSlug: track.slug }))
    .find((company) => norm(company.name) === norm(companyOfTrack(selectedName)));
  return inList || asTrack || { name: selectedName };
}
