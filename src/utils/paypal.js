// Loads the PayPal JS SDK once and resolves with window.paypal.
// The client id is public (safe in the browser); the secret stays server-side.
// Env is chosen by WHICH client id you use (a sandbox client id => sandbox).

let sdkPromise = null;

export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
export const PAYPAL_ENV = import.meta.env.VITE_PAYPAL_ENV || 'sandbox';
export const paypalEnabled = Boolean(PAYPAL_CLIENT_ID);

export function loadPayPalSdk({ currency = 'USD' } = {}) {
  if (typeof window !== 'undefined' && window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    if (!PAYPAL_CLIENT_ID) {
      reject(new Error('Missing VITE_PAYPAL_CLIENT_ID'));
      return;
    }
    const params = new URLSearchParams({
      'client-id': PAYPAL_CLIENT_ID,
      currency,
      intent: 'capture',
      components: 'buttons',
    });
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Failed to load the PayPal SDK'));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}
