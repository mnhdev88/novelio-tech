import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import StickyMobileCTA from './components/layout/StickyMobileCTA';
import ScrollProgress from './components/layout/ScrollProgress';
import { AuthProvider, ProtectedRoute } from './portal/AuthContext';

// HomePage is eager — it's the LCP route, no delay wanted
import HomePage from './pages/HomePage';

// All other pages lazy-loaded — only downloaded when the route is visited
const AboutPage          = lazy(() => import('./pages/AboutPage'));
const ServicesPage       = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage              = lazy(() => import('./pages/services/ServiceDetailPage'));
const WebsiteDevelopmentPage         = lazy(() => import('./pages/services/WebsiteDevelopmentPage'));
const MobileAppDevelopmentPage       = lazy(() => import('./pages/services/MobileAppDevelopmentPage'));
const SearchEngineOptimizationPage   = lazy(() => import('./pages/services/SearchEngineOptimizationPage'));
const PricingPage        = lazy(() => import('./pages/PricingPage'));
const AuthPage           = lazy(() => import('./pages/portal/AuthPage'));
const CheckoutPage       = lazy(() => import('./pages/portal/CheckoutPage'));
const CustomPaymentPage  = lazy(() => import('./pages/portal/CustomPaymentPage'));
const PayoneerReturnPage = lazy(() => import('./pages/portal/PayoneerReturnPage'));
const DashboardPage      = lazy(() => import('./pages/portal/DashboardPage'));
const AdminPage          = lazy(() => import('./pages/portal/AdminPage'));
const BlogPage           = lazy(() => import('./pages/BlogPage'));
const BlogPostPage       = lazy(() => import('./pages/BlogPostPage'));
const ContactPage        = lazy(() => import('./pages/ContactPage'));
const IndustryPage       = lazy(() => import('./pages/IndustryPage'));
const ComparePage        = lazy(() => import('./pages/ComparePage'));
const PrivacyPage        = lazy(() => import('./pages/PrivacyPage'));
const TermsPage          = lazy(() => import('./pages/TermsPage'));
const RefundPolicyPage   = lazy(() => import('./pages/RefundPolicyPage'));
const DisclaimerPage     = lazy(() => import('./pages/DisclaimerPage'));
const CareersPage        = lazy(() => import('./pages/CareersPage'));
const PartnerPage        = lazy(() => import('./pages/PartnerPage'));
const LocationHubPage    = lazy(() => import('./pages/LocationHubPage'));
const LocationPage       = lazy(() => import('./pages/LocationPage'));
const BestWebDevNewarkPage = lazy(() => import('./pages/BestWebDevNewarkPage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Minimal fallback — navbar/footer stay visible, only content area shows spinner
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-brand-purple/30 border-t-brand-purple animate-spin" />
    </div>
  );
}

function Layout() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      <div className="md:pt-9">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                        element={<HomePage />} />
            <Route path="/about"                   element={<AboutPage />} />
            <Route path="/services"                element={<ServicesPage />} />
            <Route path="/services/website-development"          element={<WebsiteDevelopmentPage />} />
            <Route path="/services/mobile-app-development"        element={<MobileAppDevelopmentPage />} />
            <Route path="/services/search-engine-optimization"  element={<SearchEngineOptimizationPage />} />
            <Route path="/services/:serviceId"                   element={<ServiceDetailPage />} />
            <Route path="/pricing"                 element={<PricingPage />} />

            {/* Subscription portal (demo — payment bypassed) */}
            <Route path="/login"                   element={<AuthPage mode="login" />} />
            <Route path="/signup"                  element={<AuthPage mode="signup" />} />
            <Route path="/checkout"                element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/pay"                     element={<CustomPaymentPage />} />
            <Route path="/payoneer/return"         element={<PayoneerReturnPage />} />
            <Route path="/dashboard"               element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/admin"                   element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

            <Route path="/blog"                    element={<BlogPage />} />
            <Route path="/blog/:slug"              element={<BlogPostPage />} />
            <Route path="/contact"                 element={<ContactPage />} />
            <Route path="/industries/:sector"      element={<IndustryPage />} />
            <Route path="/compare/:slug"           element={<ComparePage />} />
            <Route path="/privacy"                 element={<PrivacyPage />} />
            <Route path="/terms"                   element={<TermsPage />} />
            <Route path="/refund-policy"           element={<RefundPolicyPage />} />
            <Route path="/disclaimer"              element={<DisclaimerPage />} />
            <Route path="/careers"                 element={<CareersPage />} />
            <Route path="/partners"                element={<PartnerPage />} />
            <Route path="/locations"               element={<LocationHubPage />} />
            <Route path="/locations/:state"        element={<LocationPage type="state" />} />
            <Route path="/locations/:state/:city"  element={<LocationPage type="city" />} />
            <Route path="/best-website-developer-in-newark" element={<BestWebDevNewarkPage />} />
            <Route path="*"                        element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Layout />
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
