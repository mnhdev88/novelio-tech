// Thin wrapper around Google Analytics (gtag) so components never touch the
// global directly. `window.gtag` is bootstrapped in index.html — it queues
// events into dataLayer even before the GA tag finishes loading, so calls made
// here are never lost. Guards on `window` keep this safe during prerender/SSR.
export function trackEvent(name, params = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

// Collapse whitespace and cap length so button text makes a clean event label.
function cleanLabel(el) {
  const text = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 100);
}

// One delegated listener on the document captures every phone/email click and
// every primary CTA click — no per-component wiring, and it covers links/buttons
// added in the future automatically. Call once at app startup (see main.jsx).
let _clickTrackingStarted = false;
export function initClickTracking() {
  if (typeof document === 'undefined' || _clickTrackingStarted) return;
  _clickTrackingStarted = true;

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;

      // 1. Phone / email links — match anywhere up the tree.
      const contactLink = target.closest('a[href^="tel:"], a[href^="mailto:"]');
      if (contactLink) {
        const href = contactLink.getAttribute('href') || '';
        const isPhone = href.startsWith('tel:');
        trackEvent('contact_click', {
          method: isPhone ? 'phone' : 'email',
          contact: href.replace(/^(tel:|mailto:)/, ''),
          label: cleanLabel(contactLink),
          location: window.location.pathname,
        });
        return; // a tel/mailto link is not also counted as a generic CTA
      }

      // 2. Primary CTAs — anything styled .btn-primary or explicitly tagged
      //    data-cta. data-cta's value (when present) overrides the auto label.
      const cta = target.closest('.btn-primary, [data-cta]');
      if (cta) {
        trackEvent('cta_click', {
          label: cta.getAttribute('data-cta') || cleanLabel(cta),
          href: cta.getAttribute('href') || undefined,
          location: window.location.pathname,
        });
      }
    },
    // Capture phase so we still log clicks even if a handler calls stopPropagation.
    true,
  );
}
