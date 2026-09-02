import { Phone, MessageCircle } from 'lucide-react';
import { COMPANY, PHONE_TEL } from '../../data/siteData';
import { useEffect, useState } from 'react';

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9999] lg:hidden transition-transform duration-500 ease-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex">
        <a
          href={PHONE_TEL}
          className="flex-1 flex items-center justify-center gap-2.5 h-14 bg-gradient-to-r from-brand-blue to-brand-cyan text-white font-heading font-600 text-[15px] active:scale-95 transition-transform"
        >
          <Phone className="w-5 h-5" />
          Call Us
        </a>
        <div className="w-px bg-white/20" />
        <a
          href={`https://wa.me/${COMPANY.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2.5 h-14 bg-gradient-to-r from-[#128C7E] to-[#25D366] text-white font-heading font-600 text-[15px] active:scale-95 transition-transform"
        >
          <MessageCircle className="w-5 h-5" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
