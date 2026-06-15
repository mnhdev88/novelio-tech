import { Mail, Phone, Clock } from 'lucide-react';
import { FaLinkedinIn, FaXTwitter, FaFacebookF, FaInstagram } from 'react-icons/fa6';
import { COMPANY } from '../../data/siteData';

export default function TopBar() {
  return (
    <div className="bg-[#0d1f5c] border-b border-white/10 hidden md:block">
      <div className="container-xl">
        <div className="flex items-center justify-between h-9 text-xs">

          {/* Left — contact details */}
          <div className="flex items-center gap-5 text-white/65">
            <a
              href={`mailto:${COMPANY.email}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3 h-3" />
              {COMPANY.email}
            </a>
            <a
              href={`tel:${COMPANY.phone}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3" />
              {COMPANY.phone}
            </a>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Mon – Fri, 9 AM – 6 PM EST
            </span>
          </div>

          {/* Right — social icons */}
          <div className="flex items-center gap-3">
            {[
              { Icon: FaLinkedinIn, href: COMPANY.social.linkedin, label: 'LinkedIn' },
              { Icon: FaXTwitter,   href: COMPANY.social.twitter,  label: 'Twitter'  },
              { Icon: FaFacebookF,  href: COMPANY.social.facebook, label: 'Facebook' },
              { Icon: FaInstagram,  href: COMPANY.social.instagram,label: 'Instagram'},
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-white/50 hover:text-white transition-colors"
              >
                <Icon className="w-3 h-3" />
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
