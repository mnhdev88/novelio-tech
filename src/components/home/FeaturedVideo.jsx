import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { HOMEPAGE } from '../../data/siteData';

const VIDEO = HOMEPAGE.featuredVideo;

// The embed is deliberately NOT rendered until the visitor clicks. A YouTube
// iframe pulls ~800KB of third-party JS and several extra connections on load,
// which is the fastest way to wreck LCP/INP on the homepage — the one page the
// whole site's Core Web Vitals are judged on. Until then this is just one
// static image, so the section costs almost nothing.
export default function FeaturedVideo() {
  const [playing, setPlaying] = useState(false);

  if (!VIDEO?.youtubeId) return null;

  const { youtubeId, label, heading, description, videoTitle, duration } = VIDEO;
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <section className="section-pad-sm bg-white">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {label && <div className="section-label mx-auto mb-4">{label}</div>}
          <h2 className="text-3xl lg:text-4xl font-heading font-700 text-[#1B3172] mb-4">
            {heading}
          </h2>
          {description && (
            <p className="text-[#475569] text-base sm:text-lg max-w-2xl mx-auto mb-10">
              {description}
            </p>
          )}

          <div
            className="relative rounded-2xl overflow-hidden aspect-video"
            style={{
              border: '1px solid rgba(107,63,160,0.18)',
              boxShadow: '0 20px 60px rgba(107,63,160,0.18), 0 4px 20px rgba(27,49,114,0.1)',
            }}
          >
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play video: ${videoTitle}`}
                className="group absolute inset-0 w-full h-full cursor-pointer"
              >
                <img
                  src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
                  alt={videoTitle}
                  width="1280"
                  height="720"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  // Not every upload has a maxres still; hqdefault always exists.
                  onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`; }}
                />
                <span
                  className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                  style={{ background: 'linear-gradient(180deg, rgba(27,49,114,0.15) 0%, rgba(27,49,114,0.55) 100%)' }}
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, #6B3FA0, #1D4ED8)',
                      boxShadow: '0 12px 40px rgba(107,63,160,0.45)',
                    }}
                  >
                    <Play className="w-7 h-7 text-white fill-white translate-x-0.5" />
                  </span>
                </span>
                {duration && (
                  <span className="absolute bottom-4 right-4 text-xs font-medium text-white bg-black/60 px-2.5 py-1 rounded-md">
                    {duration}
                  </span>
                )}
              </button>
            )}
          </div>

          <p className="text-[#64748b] text-sm mt-5">
            Prefer YouTube?{' '}
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B3FA0] font-medium hover:underline"
            >
              Watch it on our channel
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
