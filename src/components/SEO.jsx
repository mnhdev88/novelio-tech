import { Helmet } from 'react-helmet-async';
import SEO_OVERRIDES from '../../content/seo/pages.json';

const BASE_URL = 'https://www.noveliotech.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Novelio Technologies LLC';

export default function SEO({
  title,
  description,
  canonical,
  keywords,
  image = DEFAULT_IMAGE,
  type = 'website',
  schema,
  noindex = false,
}) {
  // Per-page overrides edited in the admin panel, keyed by canonical path.
  // Every page component still ships a sensible default; an override only
  // replaces the fields the client actually filled in. This is what makes all
  // ~40 routes editable without touching a single page component.
  const override = (canonical && SEO_OVERRIDES[canonical]) || {};
  if (override.title) title = override.title;
  if (override.description) description = override.description;
  if (override.keywords) keywords = override.keywords;
  if (override.image) image = override.image;
  if (override.noindex !== undefined) noindex = override.noindex;

  const fullTitle = title
    ? `${title} | Novelio Technologies`
    : 'Business Growth Partner for Small Businesses | Novelio Technologies';

  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : null;
  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;
  // Social crawlers need absolute image URLs; site-relative paths get the domain prepended.
  const fullImage = image.startsWith('/') ? `${BASE_URL}${image}` : image;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={fullImage} />
      <meta property="og:type" content={type} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@noveliotech" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={fullImage} />

      {/* JSON-LD schema */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
