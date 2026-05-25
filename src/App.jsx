import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import StickyMobileCTA from './components/layout/StickyMobileCTA';
import ScrollProgress from './components/layout/ScrollProgress';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/services/ServiceDetailPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import IndustryPage from './pages/IndustryPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import CareersPage from './pages/CareersPage';
import LocationHubPage from './pages/LocationHubPage';
import LocationPage from './pages/LocationPage';
import NotFoundPage from './pages/NotFoundPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <ScrollProgress />
      <Navbar />
      {/* md:pt-9 offsets the 36px topbar that only shows on md+ screens */}
      <div className="md:pt-9">
      <Routes>
        <Route path="/"                          element={<HomePage />} />
        <Route path="/about"                     element={<AboutPage />} />
        <Route path="/services"                  element={<ServicesPage />} />
        <Route path="/services/:serviceId"       element={<ServiceDetailPage />} />
        <Route path="/blog"                      element={<BlogPage />} />
        <Route path="/blog/:slug"                element={<BlogPostPage />} />
        <Route path="/contact"                   element={<ContactPage />} />
        <Route path="/industries/:sector"        element={<IndustryPage />} />
        <Route path="/privacy"                   element={<PrivacyPage />} />
        <Route path="/terms"                     element={<TermsPage />} />
        <Route path="/refund-policy"             element={<RefundPolicyPage />} />
        <Route path="/disclaimer"                element={<DisclaimerPage />} />
        <Route path="/careers"                   element={<CareersPage />} />
        <Route path="/locations"                         element={<LocationHubPage />} />
        <Route path="/locations/:state"                  element={<LocationPage type="state" />} />
        <Route path="/locations/:state/:city"            element={<LocationPage type="city" />} />
<Route path="*"                          element={<NotFoundPage />} />
      </Routes>
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
        <ScrollToTop />
        <Layout />
      </BrowserRouter>
    </MotionConfig>
  );
}
