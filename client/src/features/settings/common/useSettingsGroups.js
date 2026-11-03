import { useMemo, useState } from 'react';
import { SETTINGS_GROUPS } from '../settingsNav';

const matches = (item, text) => `${item.label} ${item.keywords}`.toLowerCase().includes(text);

// "Find a setting" search: keeps only the groups and items whose label or keywords contain the text.
export default function useSettingsGroups() {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return SETTINGS_GROUPS;
    return SETTINGS_GROUPS.map((group) => ({ ...group, items: group.items.filter((item) => matches(item, text)) })).filter((group) => group.items.length);
  }, [query]);
  return { query, setQuery, groups };
}
