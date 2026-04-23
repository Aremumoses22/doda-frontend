"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const services = [
  { label: "Business & Corporate Law",   href: "/services/corporate-law" },
  { label: "Contracts & Transactions",   href: "/services/contracts-transactions" },
  { label: "Regulatory Compliance",      href: "/services/regulatory-compliance" },
  { label: "Startup & SME Advisory",     href: "/services/startup-sme" },
  { label: "Intellectual Property",      href: "/services/intellectual-property" },
  { label: "Property Transactions",      href: "/services/property-transactions" },
  { label: "General Advisory",           href: "/services/general-advisory" },
]

const navLinks = [
  { label: "Home",         href: "/" },
  { label: "About",        href: "/about" },
  { label: "How We Work",  href: "/how-we-work" },
  { label: "Clients",      href: "/clients" },
  { label: "Contact",      href: "/contact" },
]

export function Navbar() {
  const [menuOpen, setMenuOpen]         = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-doda-navy tracking-tight">
              DODA<span className="text-doda-gold">.</span>
            </span>
            <span className="hidden sm:block text-xs text-doda-muted font-medium uppercase tracking-wider">
              Legal Practitioners
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.slice(0, 1).map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-doda-navy transition-colors">
                {l.label}
              </Link>
            ))}
            <Link href="/about"
              className="text-sm font-medium text-gray-600 hover:text-doda-navy transition-colors">
              About
            </Link>

            {/* Services dropdown */}
            <div className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}>
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-doda-navy transition-colors">
                Services <ChevronDown className="w-4 h-4" />
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  {services.map((s) => (
                    <Link key={s.href} href={s.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-doda-light hover:text-doda-navy transition-colors">
                      {s.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <Link href="/services"
                      className="block px-4 py-2 text-sm font-medium text-doda-gold hover:bg-doda-light transition-colors">
                      View All Services →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {navLinks.slice(2).map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-doda-navy transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login"
              className="text-sm font-medium text-gray-600 hover:text-doda-navy transition-colors">
              Client Login
            </Link>
            <Button asChild size="sm">
              <Link href="/book">Book a Consultation</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-doda-navy"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pb-6 pt-4">
          <Button asChild className="w-full mb-4">
            <Link href="/book" onClick={() => setMenuOpen(false)}>
              Book a Consultation
            </Link>
          </Button>

          <div className="space-y-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="block py-2.5 text-sm font-medium text-gray-700 border-b border-gray-50"
                onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="pt-1">
              <p className="py-2 text-xs font-semibold text-doda-muted uppercase tracking-wider">Services</p>
              {services.map((s) => (
                <Link key={s.href} href={s.href}
                  className="block py-2 text-sm text-gray-600 pl-3 border-l-2 border-doda-gold/20 hover:border-doda-gold transition-colors"
                  onClick={() => setMenuOpen(false)}>
                  {s.label}
                </Link>
              ))}
            </div>
            <Link href="/login"
              className="block py-2.5 text-sm font-medium text-doda-gold"
              onClick={() => setMenuOpen(false)}>
              Client Login →
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
