// Razorpay Standard Checkout — front-end helpers.
//
// checkout.js opens an overlay on OUR page (cards, UPI, net banking, wallets),
// so there is no redirect and no return route to maintain. The Key ID is public
// and safe in the browser; the key secret and webhook secret are server-side only
// (novelio-razorpay-credentials.php) — see RAZORPAY-SETUP.md.
//
// The browser never sends an amount. It posts the SELECTION, the server prices it
// from the shared table and opens the order, and the success callback is verified
// server-side against Razorpay's own record before anything counts as paid.

const SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let sdkPromise = null;

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
export const RAZORPAY_ENV = import.meta.env.VITE_RAZORPAY_ENV || 'test';
export const razorpayEnabled = Boolean(RAZORPAY_KEY_ID);
// USD on Razorpay requires "International Payments" approved on the account.
export const razorpayUsdEnabled =
  razorpayEnabled && import.meta.env.VITE_RAZORPAY_USD_ENABLED === '1';

/** Currencies Razorpay can take here, in the order they should be offered. */
export const razorpayCurrencies = razorpayUsdEnabled ? ['INR', 'USD'] : ['INR'];

export function loadRazorpaySdk() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(window.Razorpay);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    if (!RAZORPAY_KEY_ID) {
      reject(new Error('Missing VITE_RAZORPAY_KEY_ID'));
      return;
    }
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Failed to load the Razorpay SDK'));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

async function postJson(endpoint, payload, idKey = 'orderId') {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data[idKey]) {
    throw new Error(data.error || 'Could not start the payment. Please try again.');
  }
  return data;
}

/** Plan checkout. `selection` = { planId, billing, addonIds, currency, customer }. */
export const createRazorpayPlanOrder = (selection) =>
  postJson('/api/razorpay/create-order.php', selection);

/** Custom /pay checkout. `fields` = { amount, currency, reference, description, gstMode, customer }. */
export const createRazorpayCustomOrder = (fields) =>
  postJson('/api/razorpay/create-custom-order.php', fields);

/**
 * /pay subscription link. `fields` = { amount (monthly), currency, gstMode, months,
 * upfront, reference, description, customer }. Resolves with { subscriptionId, … }.
 */
export const createRazorpaySubscription = (fields) =>
  postJson('/api/razorpay/create-subscription.php', fields, 'subscriptionId');

async function verify(endpoint, body) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.status) {
    return { status: 'FAILED', error: data.error || 'Payment could not be confirmed.' };
  }
  return data;
}

/**
 * Verify a completed payment. Returns { status: 'COMPLETED' | 'PENDING' | 'FAILED', … }.
 * Only the three Razorpay identifiers are sent — the server re-reads everything
 * else from the API, so nothing here can influence what gets recorded.
 */
export const verifyRazorpayPayment = (response) =>
  verify('/api/razorpay/verify-payment.php', {
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  });

/** Subscription twin of verifyRazorpayPayment — the overlay returns a subscription id instead of an order id. */
export const verifyRazorpaySubscription = (response) =>
  verify('/api/razorpay/verify-subscription.php', {
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_subscription_id: response.razorpay_subscription_id,
    razorpay_signature: response.razorpay_signature,
  });

/**
 * Open the Razorpay overlay for an order or subscription created by one of the
 * helpers above. `onSuccess` receives the raw Razorpay response — pass it to
 * verifyRazorpayPayment / verifyRazorpaySubscription.
 */
export async function openRazorpayCheckout(order, { customer = {}, onSuccess, onDismiss, onError }) {
  const Razorpay = await loadRazorpaySdk();

  // A subscription's amount lives on its plan and add-ons, so Razorpay takes
  // only the id — passing an amount alongside it is rejected.
  const target = order.subscriptionId
    ? { subscription_id: order.subscriptionId }
    : {
        order_id: order.orderId,
        amount: order.amount,    // minor units — display only; the order is authoritative
        currency: order.currency,
      };

  const rzp = new Razorpay({
    key: order.keyId || RAZORPAY_KEY_ID,
    ...target,
    name: 'Novelio Technologies',
    description: order.description,
    prefill: {
      name: customer.name || order.name || '',
      email: customer.email || order.email || '',
    },
    notes: { source: 'noveliotech.com' },
    theme: { color: '#1B3172' },
    modal: {
      ondismiss: () => onDismiss?.(),
      // Razorpay's own confirm-before-closing prompt; without it a stray click on
      // the backdrop silently abandons a payment the buyer meant to make.
      confirm_close: true,
      escape: false,
    },
    handler: (response) => onSuccess?.(response),
  });

  // Card declines and the like surface here rather than through handler().
  rzp.on('payment.failed', (e) => {
    onError?.(e?.error?.description || 'The payment was declined. Please try another method.');
  });

  rzp.open();
  return rzp;
}
