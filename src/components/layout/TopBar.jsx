import { Mail, Phone, Clock, LayoutDashboard } from 'lucide-react';
import { FaLinkedinIn } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { COMPANY, PHONE_TEL } from '../../data/siteData';
import { useAuth } from '../../portal/AuthContext';

export default function TopBar() {
  const { user } = useAuth();

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
              href={PHONE_TEL}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3" />
              {COMPANY.phone}
            </a>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {COMPANY.hours}
            </span>
          </div>

          {/* Right — social icons + account actions */}
          <div className="flex items-center gap-3">
            {[
              { Icon: FaLinkedinIn, href: COMPANY.social.linkedin, label: 'LinkedIn' },
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

            <span className="w-px h-3.5 bg-white/20" aria-hidden="true" />

            {/* Account actions — auth aware */}
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && (
                  <Link
                    to="/portal/admin"
                    className="text-white/65 hover:text-white transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1 font-semibold transition-colors"
                >
                  <LayoutDashboard className="w-3 h-3" />
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-white/65 hover:text-white transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-full bg-white/10 hover:bg-white/20 text-white px-3 py-1 font-semibold transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
