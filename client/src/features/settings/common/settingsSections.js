import { lazy } from 'react';

// Each section is its own chunk, so opening Settings stays light.
export const SECTIONS = {
  profile: lazy(() => import('../sections/ProfileSection')),
  account: lazy(() => import('../sections/AccountSection')),
  billing: lazy(() => import('../sections/BillingSection')),
  appearance: lazy(() => import('../sections/AppearanceSection')),
  accessibility: lazy(() => import('../sections/AccessibilitySection')),
  editor: lazy(() => import('../sections/EditorSection')),
  notifications: lazy(() => import('../sections/NotificationsSection')),
  password: lazy(() => import('../sections/PasswordSection')),
  sessions: lazy(() => import('../sections/SessionsSection')),
  'security-log': lazy(() => import('../sections/SecurityLogSection')),
};
