// Member search text is typed by users, so every regular-expression character in it is escaped before it is used in a query.
export const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
