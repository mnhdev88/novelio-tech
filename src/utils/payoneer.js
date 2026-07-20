// Payoneer Checkout (hosted redirect) — front-end helpers.
//
// Unlike PayPal there is NO browser SDK and NO public key: the server creates the
// LIST session and hands back a hosted-page URL to redirect to. So the front-end
// only needs a build flag to decide whether to offer the option. Enable by setting
// VITE_PAYONEER_ENABLED=1 at build time (once the server credentials are in place).

export const PAYONEER_ENV = import.meta.env.VITE_PAYONEER_ENV || 'sandbox';
export const payoneerEnabled = import.meta.env.VITE_PAYONEER_ENABLED === '1';

async function startList(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.redirectUrl) {
    throw new Error(data.error || 'Could not start the Payoneer payment. Please try again.');
  }
  return data; // { redirectUrl, ref }
}

// Plan checkout. `selection` = { planId, billing, addonIds, customer:{id,name,email} }.
export function startPayoneerPlan(selection) {
  return startList('/api/payoneer/create-list.php', selection);
}

// Custom /pay checkout. `fields` = { amount, reference, description, customer:{name,email} }.
export function startPayoneerCustom(fields) {
  return startList('/api/payoneer/create-custom-list.php', fields);
}

// Verify a payment after the buyer returns from the hosted page.
// Returns { status: 'COMPLETED' | 'PENDING' | 'FAILED', ... }.
export async function confirmPayoneer(ref) {
  const res = await fetch('/api/payoneer/confirm.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok && !data.status) {
    return { status: 'FAILED', error: data.error || 'Payment could not be confirmed.' };
  }
  return data;
}
