import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import StickyMobileCTA from './components/layout/StickyMobileCTA';
import ScrollProgress from './components/layout/ScrollProgress';

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/services/ServiceDetailPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import IndustryPage from './pages/IndustryPage';
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
      <Routes>
        <Route path="/"                          element={<HomePage />} />
        <Route path="/about"                     element={<AboutPage />} />
        <Route path="/services"                  element={<ServicesPage />} />
        <Route path="/services/:serviceId"       element={<ServiceDetailPage />} />
        <Route path="/blog"                      element={<BlogPage />} />
        <Route path="/contact"                   element={<ContactPage />} />
        <Route path="/industries/:sector"        element={<IndustryPage />} />
        <Route path="*"                          element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout />
    </BrowserRouter>
  );
}
