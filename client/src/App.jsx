import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProblemsPage from './features/problems/ProblemsPage';
import HomePage from './features/home/HomePage';
import GithubCallbackPage from './features/auth/GithubCallbackPage';
import LinkedinCallbackPage from './features/auth/LinkedinCallbackPage';
import AdminLoginPage from './features/auth/AdminLoginPage';

// Monaco editor and the admin console are heavy — code-split so the
// dashboard (the page most of ~10L users land on) loads fast.
const WorkspacePage = lazy(() => import('./features/workspace/WorkspacePage'));

// Admin console — AdminLayout is now a STANDALONE shell (its own
// AdminNavbar + sidebar), not nested inside the client's MainLayout. See
// the <Route path="/admin"> block below — it sits OUTSIDE the
// <Route element={<MainLayout />}> block on purpose, so admin pages never
// render the client Navbar and can never reach a client route through it.
const AdminLayout = lazy(() => import('./features/admin/AdminLayout'));
const AdminOverviewPage = lazy(() => import('./features/admin/pages/AdminOverviewPage'));
const AdminUsersPage = lazy(() => import('./features/admin/pages/AdminUsersPage'));
const AdminLicensesPage = lazy(() => import('./features/admin/pages/AdminLicensesPage'));
const AdminProblemsPage = lazy(() => import('./features/admin/pages/AdminProblemsPage'));
const AdminAptitudePage = lazy(() => import('./features/admin/pages/AdminAptitudePage'));
const AdminAuditLogPage = lazy(() => import('./features/admin/pages/AdminAuditLogPage'));

const AptitudePatternsPage = lazy(() => import('./features/aptitude/AptitudePatternsPage'));
const AptitudePatternDetailPage = lazy(() => import('./features/aptitude/AptitudePatternDetailPage'));
const AptitudeTestPage = lazy(() => import('./features/aptitude/AptitudeTestPage'));
const AptitudePracticePage = lazy(() => import('./features/aptitude/AptitudePracticePage'));
const AptitudeResultsPage = lazy(() => import('./features/aptitude/AptitudeResultsPage'));
const VisualizerPage = lazy(() => import('./features/visualizer/VisualizerPage'));
const PricingPage = lazy(() => import('./features/billing/PricingPage'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const LearnHomePage = lazy(() => import('./features/learn/LearnHomePage'));
const LearnTopicPage = lazy(() => import('./features/learn/LearnTopicPage'));
const PracticePage = lazy(() => import('./features/learn/PracticePage'));
const PrepCompaniesPage = lazy(() => import('./features/prep/PrepCompaniesPage'));
const PrepRoadmapPage = lazy(() => import('./features/prep/PrepRoadmapPage'));

const RouteFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
    <CircularProgress />
  </Box>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin's own login page — no navbar, not linked anywhere in the
          client UI. Reached only by direct URL. */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route path="/auth/github/callback" element={<GithubCallbackPage />} />
      <Route path="/auth/linkedin/callback" element={<LinkedinCallbackPage />} />

      {/* Admin console — a SEPARATE PANEL. Deliberately its own top-level
          route tree, sibling to the <MainLayout> block below, not nested
          inside it. This means:
          - AdminLayout (AdminNavbar + sidebar) is the only chrome ever
            rendered here — the client Navbar never mounts on any /admin/*
            page.
          - There is no shared layout route linking /admin/* to /dashboard,
            /problems, etc. — nothing in this subtree can navigate to a
            client route except via a manual URL change.
          redirectTo="/admin/login" sends an unauthenticated visitor to the
          admin-specific login instead of the general /login. */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireRole="admin" redirectTo="/admin/login">
            <Suspense fallback={<RouteFallback />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route index element={<Suspense fallback={<RouteFallback />}><AdminOverviewPage /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<RouteFallback />}><AdminUsersPage /></Suspense>} />
        <Route path="licenses" element={<Suspense fallback={<RouteFallback />}><AdminLicensesPage /></Suspense>} />
        <Route path="problems" element={<Suspense fallback={<RouteFallback />}><AdminProblemsPage /></Suspense>} />
        <Route path="aptitude" element={<Suspense fallback={<RouteFallback />}><AdminAptitudePage /></Suspense>} />
        <Route path="audit-log" element={<Suspense fallback={<RouteFallback />}><AdminAuditLogPage /></Suspense>} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route
          path="/visualizer"
          element={<Suspense fallback={<RouteFallback />}><VisualizerPage /></Suspense>}
        />
        <Route
          path="/workspace/:slug"
          element={
            <Suspense fallback={<RouteFallback />}>
              <WorkspacePage />
            </Suspense>
          }
        />
        <Route
          path="/aptitude"
          element={<Suspense fallback={<RouteFallback />}><AptitudePatternsPage /></Suspense>}
        />
        <Route
          path="/aptitude/:slug"
          element={<Suspense fallback={<RouteFallback />}><AptitudePatternDetailPage /></Suspense>}
        />
        <Route
          path="/aptitude/:slug/test"
          element={<Suspense fallback={<RouteFallback />}><AptitudeTestPage /></Suspense>}
        />
        <Route
          path="/aptitude/:slug/practice"
          element={<Suspense fallback={<RouteFallback />}><AptitudePracticePage /></Suspense>}
        />
        <Route path="/prep" element={<Suspense fallback={<RouteFallback />}><PrepCompaniesPage /></Suspense>} />
        <Route path="/prep/:companySlug" element={<Suspense fallback={<RouteFallback />}><PrepRoadmapPage /></Suspense>} />

        <Route
          path="/aptitude/:slug/results"
          element={<Suspense fallback={<RouteFallback />}><AptitudeResultsPage /></Suspense>}
        />
        <Route path="/pricing" element={<Suspense fallback={<RouteFallback />}><PricingPage /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<RouteFallback />}><SettingsPage /></Suspense>} />
        <Route path="/learn" element={<Suspense fallback={<RouteFallback />}><LearnHomePage /></Suspense>} />
        <Route path="/learn/:topicSlug" element={<Suspense fallback={<RouteFallback />}><LearnTopicPage /></Suspense>} />
        <Route path="/learn/:topicSlug/practice" element={<Suspense fallback={<RouteFallback />}><PracticePage /></Suspense>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
