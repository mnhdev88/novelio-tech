import { Helmet } from 'react-helmet-async';

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
  const fullTitle = title
    ? `${title} | Novelio Technologies`
    : 'Business Growth Partner for Small Businesses | Novelio Technologies';

  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : null;
  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : keywords;

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
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@noveliotech" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />

      {/* JSON-LD schema */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
}
