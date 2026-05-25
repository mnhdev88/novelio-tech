import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import ServicesMarquee from '../components/home/ServicesMarquee';
import ProblemStatement from '../components/home/ProblemStatement';
import WhyChooseUs from '../components/home/WhyChooseUs';
import ServicesGrid from '../components/home/ServicesGrid';
import ProcessSection from '../components/home/ProcessSection';
import CTABanner from '../components/home/CTABanner';
import TestimonialsSection from '../components/home/TestimonialsSection';
import WhoWeServe from '../components/home/WhoWeServe';
import IndustriesSection from '../components/home/IndustriesSection';
import FAQSection from '../components/home/FAQSection';
import BlogPreview from '../components/home/BlogPreview';

export default function HomePage() {
  return (
    <main>
      <SEO
        title="Business Growth Partner for Small Businesses"
        description="Novelio is your dedicated business growth partner. We analyze your website, Google listing, leads, automation, and branding — then build and execute a tailored growth plan. Free audit for small businesses."
        canonical="/"
      />
      <HeroSection />
      <ServicesMarquee />
      <ProblemStatement />
      <WhyChooseUs />
      <ServicesGrid />
      <ProcessSection />
      <CTABanner />
      <TestimonialsSection />
      <WhoWeServe />
      <IndustriesSection />
      <FAQSection />
      <BlogPreview />
    </main>
  );
}
