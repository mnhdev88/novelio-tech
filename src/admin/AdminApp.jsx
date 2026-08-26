// Everything under /admin. Mounted as a single lazy route from App.jsx so the
// panel's code (editor, toolbars) is never downloaded by a normal site visitor.

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, RequireAdmin } from './AdminContext';
import AdminLayout from './AdminLayout';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';

// Split again inside the panel: the rich-text editor is the heaviest thing here
// and only matters once someone actually opens a post.
const BlogListPage   = lazy(() => import('./pages/BlogListPage'));
const BlogEditorPage = lazy(() => import('./pages/BlogEditorPage'));
const HomePageEditor = lazy(() => import('./pages/HomePageEditor'));
const PagesSeoPage   = lazy(() => import('./pages/PagesSeoPage'));
const SitePage       = lazy(() => import('./pages/SitePage'));
const PricingPage    = lazy(() => import('./pages/PricingPage'));
const LeadsPage      = lazy(() => import('./pages/LeadsPage'));
const TeamPage       = lazy(() => import('./pages/TeamPage'));
const ActivityPage   = lazy(() => import('./pages/ActivityPage'));

const Spinner = (
  <div className="grid place-items-center py-20">
    <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#1B3172] animate-spin" />
  </div>
);

export default function AdminApp() {
  return (
    <AdminProvider>
      <Suspense fallback={Spinner}>
        <Routes>
          <Route path="login" element={<LoginPage />} />

          <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<OverviewPage />} />

            <Route path="blog" element={<BlogListPage />} />
            <Route path="blog/new" element={<BlogEditorPage />} />
            <Route path="blog/:slug" element={<BlogEditorPage />} />

            <Route path="home" element={<HomePageEditor />} />
            <Route path="pages" element={<PagesSeoPage />} />
            <Route path="site" element={<SitePage />} />

            <Route path="pricing"  element={<RequireAdmin cap="pricing.write"><PricingPage /></RequireAdmin>} />
            <Route path="leads"    element={<RequireAdmin cap="leads.read"><LeadsPage /></RequireAdmin>} />
            <Route path="team"     element={<RequireAdmin cap="users.manage"><TeamPage /></RequireAdmin>} />
            <Route path="activity" element={<RequireAdmin cap="audit.read"><ActivityPage /></RequireAdmin>} />

            {/* An unknown /admin/* path belongs back at the overview, not on the
                site's 404 page — the person is signed in and clearly meant to be here. */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AdminProvider>
  );
}
