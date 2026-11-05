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
    <section className="on-dark section-pad bg-[#081648] text-white">
      <div className="container-xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-[1fr_1.9fr] gap-10 lg:gap-14 items-center"
        >
          <div>
            {label && <div className="section-label">{label}</div>}
            <h2 className="text-4xl lg:text-5xl font-heading font-800 text-white mb-5 leading-[1.05]">
              {heading}
            </h2>
            {description && (
              <p className="text-white/85 text-base sm:text-lg leading-relaxed mb-6">
                {description}
              </p>
            )}
            <p className="text-white/80 text-sm">
              Prefer YouTube?{' '}
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F0D030] font-600 underline underline-offset-4"
              >
                Watch it on our channel
              </a>
            </p>
          </div>

          {/* The 3px of padding shows the spectrum as a frame around the video */}
          <div className="rounded-3xl p-[3px]" style={{ background: 'var(--spectrum)' }}>
            <div className="relative rounded-[21px] overflow-hidden aspect-video bg-[#081648]">
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
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(8,22,72,0.1) 0%, rgba(8,22,72,0.5) 100%)' }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-20 h-20 rounded-full bg-[#F0D030] flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                      <Play className="w-8 h-8 text-[#0D246A] fill-[#0D246A] translate-x-0.5" aria-hidden="true" />
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
