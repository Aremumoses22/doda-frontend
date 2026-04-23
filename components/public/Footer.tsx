import Link from "next/link"

const serviceLinks = [
  { label: "Business & Corporate Law",  href: "/services/corporate-law" },
  { label: "Contracts & Transactions",  href: "/services/contracts-transactions" },
  { label: "Regulatory Compliance",     href: "/services/regulatory-compliance" },
  { label: "Startup & SME Advisory",    href: "/services/startup-sme" },
  { label: "Intellectual Property",     href: "/services/intellectual-property" },
  { label: "Property Transactions",     href: "/services/property-transactions" },
  { label: "General Advisory",          href: "/services/general-advisory" },
]

const companyLinks = [
  { label: "About",        href: "/about" },
  { label: "How We Work",  href: "/how-we-work" },
  { label: "Client Types", href: "/clients" },
  { label: "Contact",      href: "/contact" },
]

export function Footer() {
  return (
    <footer className="bg-doda-navy text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — About */}
          <div>
            <div className="mb-4">
              <span className="text-2xl font-bold text-white tracking-tight">
                DODA<span className="text-doda-gold">.</span>
              </span>
              <p className="text-xs text-gray-400 mt-0.5 uppercase tracking-wider">Legal Practitioners</p>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Business-focused legal infrastructure for Nigerian founders, SMEs, and corporations.
            </p>
            <div className="mt-4 space-y-1">
              <a href="mailto:dodalegalpractitioners@gmail.com"
                className="block text-sm text-gray-400 hover:text-doda-gold transition-colors">
                dodalegalpractitioners@gmail.com
              </a>
              <a href="tel:09028629933"
                className="block text-sm text-gray-400 hover:text-doda-gold transition-colors">
                09028629933
              </a>
            </div>
          </div>

          {/* Col 2 — Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-sm text-gray-400 hover:text-doda-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}
                    className="text-sm text-gray-400 hover:text-doda-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Get Started */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Get Started</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/book"
                  className="text-sm text-doda-gold hover:text-doda-gold/80 font-medium transition-colors">
                  Book a Consultation →
                </Link>
              </li>
              <li>
                <Link href="/login"
                  className="text-sm text-gray-400 hover:text-doda-gold transition-colors">
                  Client Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Doda Legal Practitioners. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
