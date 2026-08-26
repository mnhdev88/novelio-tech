// Build a post's JSON-LD from the fields the client already filled in.
//
// The existing posts carry a hand-written Article + FAQPage @graph. Asking a
// non-technical client to maintain that by hand is how structured data silently
// rots, so the panel regenerates it from the post: Article from the metadata,
// FAQPage from the FAQ blocks in the body.

const BASE = 'https://www.noveliotech.com';
const PUBLISHER = {
  '@type': 'Organization',
  name: 'Novelio Technologies LLC',
  logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` },
};

const stripTags = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/** "May 5, 2026" (what the post displays) -> "2026-05-05" (what schema needs). */
export function toIsoDate(display) {
  const d = new Date(display);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

/**
 * @param post   the post's metadata fields
 * @param blocks the body blocks — FAQ entries are read from these
 * @param previous the post's existing schema, so datePublished survives an edit
 */
export function buildSchema(post, blocks, previous) {
  const prevGraph = previous?.['@graph'] || [];
  const prevArticle = prevGraph.find((n) => n['@type'] === 'Article') || {};

  const url = `${BASE}/blog/${post.slug}`;
  const image = post.image?.startsWith('http') ? post.image : `${BASE}${post.image || ''}`;

  const article = {
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image,
    author: {
      '@type': 'Person',
      name: post.author || 'Novelio Technologies Editorial Team',
      url: `${BASE}/about`,
    },
    publisher: PUBLISHER,
    // First publication is a fact about the past — never overwrite it on an edit,
    // or Google sees a brand-new article every time a typo is fixed.
    datePublished: prevArticle.datePublished || toIsoDate(post.date),
    dateModified: toIsoDate(new Date().toDateString()),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.keywords?.length ? post.keywords : prevArticle.keywords,
  };

  const faqs = (blocks || [])
    .filter((b) => b.type === 'faqItem')
    .map((b) => ({
      '@type': 'Question',
      name: stripTags(b.question),
      acceptedAnswer: { '@type': 'Answer', text: stripTags(b.answer) },
    }))
    .filter((q) => q.name && q.acceptedAnswer.text);

  const graph = [clean(article)];
  // An empty FAQPage is an invalid rich result, so only emit it when there are
  // real questions to describe.
  if (faqs.length) graph.push({ '@type': 'FAQPage', mainEntity: faqs });

  return { '@context': 'https://schema.org', '@graph': graph };
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));
}
