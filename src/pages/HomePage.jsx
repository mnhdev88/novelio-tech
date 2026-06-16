import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import GrowthSystem from '../components/home/GrowthSystem';
import FreeWebsiteCTA from '../components/home/FreeWebsiteCTA';
import GrowthCycle from '../components/home/GrowthCycle';
import GrowthFramework from '../components/home/GrowthFramework';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CTABanner from '../components/home/CTABanner';
import TestimonialsSection from '../components/home/TestimonialsSection';
import IndustriesSection from '../components/home/IndustriesSection';
import FAQSection from '../components/home/FAQSection';
import BlogPreview from '../components/home/BlogPreview';

export default function HomePage() {
  return (
    <main>
      <SEO
        title="Business Growth Partner for Small Businesses"
        description="Novelio is your dedicated business growth partner. We analyze your website, Google listing, leads, and branding — then build a tailored growth plan."
        canonical="/"
      />
      <HeroSection />
      <GrowthSystem />
      <TestimonialsSection />
      <FreeWebsiteCTA />
      <GrowthFramework />
      <GrowthCycle />
      <WhyChooseUs />
      <CTABanner />
      <IndustriesSection />
      <FAQSection />
      <BlogPreview />
    </main>
  );
}
