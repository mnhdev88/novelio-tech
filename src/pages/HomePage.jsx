import SEO from '../components/SEO';
import HeroSection from '../components/home/HeroSection';
import GrowthSystem from '../components/home/GrowthSystem';
import FreeWebsiteCTA from '../components/home/FreeWebsiteCTA';
import GrowthCycle from '../components/home/GrowthCycle';
import GrowthFramework from '../components/home/GrowthFramework';
import WhyChooseUs from '../components/home/WhyChooseUs';
import CTABanner from '../components/home/CTABanner';
import FeaturedVideo from '../components/home/FeaturedVideo';
import TestimonialsSection from '../components/home/TestimonialsSection';
import IndustriesSection from '../components/home/IndustriesSection';
import FAQSection from '../components/home/FAQSection';
import BlogPreview from '../components/home/BlogPreview';
import { HOMEPAGE } from '../data/siteData';

// Marks the intro video up for search + AI answers. Google needs uploadDate
// and a thumbnail on a VideoObject before it will consider a video result.
const VIDEO_SCHEMA = HOMEPAGE.featuredVideo?.youtubeId && {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: HOMEPAGE.featuredVideo.videoTitle,
  description: HOMEPAGE.featuredVideo.description,
  thumbnailUrl: `https://i.ytimg.com/vi/${HOMEPAGE.featuredVideo.youtubeId}/maxresdefault.jpg`,
  uploadDate: HOMEPAGE.featuredVideo.uploadDate,
  duration: HOMEPAGE.featuredVideo.isoDuration,
  embedUrl: `https://www.youtube.com/embed/${HOMEPAGE.featuredVideo.youtubeId}`,
  contentUrl: `https://www.youtube.com/watch?v=${HOMEPAGE.featuredVideo.youtubeId}`,
  publisher: {
    '@type': 'Organization',
    name: 'Novelio Technologies LLC',
    url: 'https://www.noveliotech.com',
  },
};

export default function HomePage() {
  return (
    <main>
      <SEO
        title="Business Growth Partner for Small Businesses"
        description="Novelio is your dedicated business growth partner. We analyze your website, Google listing, leads, and branding — then build a tailored growth plan."
        canonical="/"
        schema={VIDEO_SCHEMA || undefined}
      />
      <HeroSection />
      <GrowthSystem />
      <GrowthCycle />
      <GrowthFramework />
      <FreeWebsiteCTA />
      <WhyChooseUs />
      <CTABanner />
      <IndustriesSection />
      <FeaturedVideo />
      <TestimonialsSection />
      <FAQSection />
      <BlogPreview />
    </main>
  );
}
