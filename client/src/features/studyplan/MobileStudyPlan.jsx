// Phone layout of the Study Plan screens (plans list and open plan) in the Library look
// (same as the phone Home, Problems, Store and Friends pages): Roboto type, warm surface,
// 16px page gutter, centred header tile, cream panels and divider-separated rows.
// The page itself scrolls and there is no top navigation bar on phones.
// The plan builder keeps its own layout inside the same page padding.
// The pieces live in ./mobile; this file keeps the original import path stable.
export { MobileShell } from './mobile/MobileShell';
export { MobilePlans } from './mobile/MobilePlans';
export { MobilePlanWorkspace } from './mobile/MobilePlanWorkspace';
