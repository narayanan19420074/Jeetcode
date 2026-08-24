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


// Monaco editor and the admin console are heavy — code-split so the
// dashboard (the page most of ~10L users land on) loads fast.
const WorkspacePage = lazy(() => import('./features/workspace/WorkspacePage'));
const AdminPage = lazy(() => import('./features/admin/AdminPage'));
const AptitudePatternsPage = lazy(() => import('./features/aptitude/AptitudePatternsPage'));
const AptitudePatternDetailPage = lazy(() => import('./features/aptitude/AptitudePatternDetailPage'));
const AptitudeTestPage = lazy(() => import('./features/aptitude/AptitudeTestPage'));
const AptitudePracticePage = lazy(() => import('./features/aptitude/AptitudePracticePage'));
const AptitudeResultsPage = lazy(() => import('./features/aptitude/AptitudeResultsPage'));
const VisualizerPage = lazy(() => import('./features/visualizer/VisualizerPage'));
const PricingPage = lazy(() => import('./features/billing/PricingPage'));

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

         <Route path="/auth/github/callback" element={<GithubCallbackPage />} />
            <Route path="/auth/linkedin/callback" element={<LinkedinCallbackPage />} />

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
          path="/admin"
          element={
            <ProtectedRoute requireRole="admin">
              <Suspense fallback={<RouteFallback />}>
                <AdminPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Moved inside MainLayout — these were previously declared after
            the closing </Route> (and even after the "*" catch-all), so
            they rendered without the navbar/dashboard shell wrapping them.
            React Router still matched the right page (path specificity
            wins over the wildcard) but with no MainLayout, no navbar. */}
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
        <Route
        path="/aptitude/:slug/results"
        element={<Suspense fallback={<RouteFallback />}><AptitudeResultsPage /></Suspense>}
      />
      <Route path="/pricing" element={<Suspense fallback={<RouteFallback />}><PricingPage /></Suspense>} />
      </Route>
      

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
     

    </Routes>
  );
}
