// Keyboard shortcuts of the problem library.
//  "/"            jumps to the search box.
//  ArrowDown      the first press jumps to the problem card; after that the arrows scroll inside the card.
//  ArrowUp        at the top of the card it goes back up the page.

const NATIVE_KEY_OWNERS = '[role="menu"],[role="dialog"],[role="listbox"],[role="slider"]';

const isEditable = (el) => el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || Boolean(el?.isContentEditable);

export function focusSearchOnSlash(event, searchInput) {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
  if (isEditable(document.activeElement)) return;
  event.preventDefault();
  searchInput?.focus();
}

const isPlainArrowKey = (e) =>
  (e.key === 'ArrowDown' || e.key === 'ArrowUp') && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.defaultPrevented;

// Form fields, menus and dialogs keep their own arrow-key behaviour.
const arrowKeysBelongToOtherControl = (active, list) =>
  Boolean(active) &&
  active !== list &&
  active !== document.body &&
  (/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName) || active.isContentEditable || Boolean(active.closest?.(NATIVE_KEY_OWNERS)));

function scrollParentOf(node) {
  for (let n = node.parentElement; n; n = n.parentElement) {
    const overflowY = getComputedStyle(n).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && n.scrollHeight > n.clientHeight) return n;
  }
  return null;
}

const scrollBehavior = () => (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');

function onArrowDown(event, { card, list, inside, behavior }) {
  if (inside) return; // native scroll inside the card
  event.preventDefault();
  card.scrollIntoView({ block: 'start', behavior });
  list.focus({ preventScroll: true });
}

function onArrowUp(event, { card, list, inside, behavior }) {
  if (!inside) {
    event.preventDefault();
    (scrollParentOf(card) || window).scrollBy({ top: -120, behavior });
    return;
  }
  if (list.scrollTop > 0) return; // native scroll inside the card
  event.preventDefault();
  list.blur();
  (scrollParentOf(card) || window).scrollTo({ top: 0, behavior });
}

export function handleArrowKey(event, card, list) {
  if (!isPlainArrowKey(event) || !card || !list || card.offsetParent === null) return; // hidden library view
  const active = document.activeElement;
  if (arrowKeysBelongToOtherControl(active, list) || document.querySelector('.MuiModal-root')) return;
  const context = { card, list, behavior: scrollBehavior(), inside: active === list || list.contains(active) };
  if (event.key === 'ArrowDown') onArrowDown(event, context);
  else onArrowUp(event, context);
}
