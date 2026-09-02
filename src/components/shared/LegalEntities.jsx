// Shared legal-entity blocks.
//
// Novelio contracts through two entities (Delaware LLC for USD work, the India
// entity for INR work). Razorpay and Twilio reviewers check that both appear on
// the sitewide footer and on every legal page, so all of /terms, /privacy,
// /refund-policy, /disclaimer and /contact render these components rather than
// repeating the addresses. The values come from content/settings.json, which
// means a change to the registered legal name is a single edit (and stays
// editable from the admin panel).

import { COMPANY } from '../../data/siteData';

// The US entity deliberately has no phone of its own: the number is edited from
// the admin panel as COMPANY.phone, and a second copy here would let the footer
// show two different US numbers. India keeps its own, since it isn't in the panel yet.
const US = { ...COMPANY.entities.us, phone: COMPANY.phone, phoneHref: COMPANY.phone.replace(/[^\d+]/g, '') };
const IN = COMPANY.entities.india;

const linkClass = 'text-[#1D4ED8] hover:underline';

/** US + India address blocks, side by side on desktop. Used in every "Contact Us" section. */
export function EntityContactBlock({ showTaxIds = false }) {
  return (
    <div className="mt-3 grid sm:grid-cols-2 gap-4">
      <div className="p-5 rounded-2xl space-y-1 text-sm"
        style={{ background: '#F8FAFF', border: '1px solid rgba(29,78,216,0.1)' }}>
        <p><strong>{US.legalName}</strong></p>
        <p>{US.address}</p>
        <p>Email: <a href={`mailto:${US.email}`} className={linkClass}>{US.email}</a></p>
        <p>Phone: <a href={`tel:${US.phoneHref}`} className={linkClass}>{US.phone}</a></p>
      </div>
      <div className="p-5 rounded-2xl space-y-1 text-sm"
        style={{ background: '#F8FAFF', border: '1px solid rgba(29,78,216,0.1)' }}>
        <p><strong>{IN.legalName}</strong></p>
        <p>{IN.address}</p>
        {showTaxIds && <p>GSTIN: {IN.gstin} | PAN: {IN.pan}</p>}
        {!showTaxIds && <p>GSTIN: {IN.gstin}</p>}
        <p>Email: <a href={`mailto:${IN.email}`} className={linkClass}>{IN.email}</a></p>
        <p>Phone: <a href={`tel:${IN.phoneHref}`} className={linkClass}>{IN.phone}</a></p>
      </div>
    </div>
  );
}

/** Grievance Officer callout — required by the IT Act rules and the DPDP Act. */
export function GrievanceBlock() {
  const g = IN.grievanceOfficer;
  return (
    <div className="mt-3 p-5 rounded-2xl space-y-1 text-sm"
      style={{ background: '#F8FAFF', border: '1px solid rgba(29,78,216,0.1)' }}>
      <p><strong>{g.name}</strong>, {g.title}</p>
      <p>Email: <a href={`mailto:${g.email}`} className={linkClass}>{g.email}</a></p>
      <p>Phone: <a href={`tel:${g.phoneHref}`} className={linkClass}>{g.phone}</a></p>
      <p>Address: {g.address}</p>
    </div>
  );
}

export { US as US_ENTITY, IN as INDIA_ENTITY };
