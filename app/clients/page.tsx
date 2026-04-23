import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Client Types We Serve — Doda Legal Practitioners",
  description: "Doda serves pre-seed startups, SMEs, investment firms, real estate investors, and more.",
}

const clients = [
  {
    type: "Pre-seed Startups",
    desc: "You're building something new and moving fast. Legal structures aren't your priority — but they should be. Without proper founder agreements, equity design, and IP protection from day one, you're creating liabilities that will surface exactly when you can't afford them.",
    services: ["Founder agreements", "Company incorporation", "IP protection", "Equity design"],
  },
  {
    type: "Growth-stage Startups",
    desc: "You're raising, hiring, and scaling. Investor documentation, shareholder agreements, and compliance all become mission-critical when growth accelerates. One poorly structured round or undocumented employee agreement can unravel years of work.",
    services: ["Investor docs", "Term sheets", "Shareholder agreements", "Compliance"],
  },
  {
    type: "SMEs",
    desc: "Your business has traction, but legal infrastructure may have lagged behind growth. Contracts, regulatory compliance, employment agreements, and ongoing advisory are the bedrock of a sustainable SME.",
    services: ["Contracts", "Regulatory compliance", "Employment agreements", "Retainer"],
  },
  {
    type: "Investment Firms",
    desc: "Every investment decision carries legal risk. Due diligence, investment agreement structuring, and fund governance require legal expertise that understands both commercial and regulatory realities.",
    services: ["Due diligence", "Investment agreements", "Fund structuring", "Governance"],
  },
  {
    type: "Venture Studios",
    desc: "You're building multiple companies simultaneously. Portfolio structuring, IP frameworks, and governance documentation need to scale with your portfolio — not slow you down.",
    services: ["Portfolio company structuring", "IP frameworks", "Governance"],
  },
  {
    type: "Real Estate Investors",
    desc: "Property transactions in Nigeria are high-risk without proper legal backing. Title defects and fraudulent documentation are common. Full due diligence on every acquisition is non-negotiable.",
    services: ["Title verification", "Acquisition docs", "Lease agreements"],
  },
  {
    type: "Corporate Organisations",
    desc: "Large organisations need consistent governance, proactive compliance monitoring, and deal documentation that protects the company's interests at scale. Doda provides embedded legal support that works at corporate pace.",
    services: ["Governance", "Compliance monitoring", "Deal documentation"],
  },
  {
    type: "Individual Founders",
    desc: "Personal liability structuring, business setup, and IP protection are critical for individuals building businesses. Doda helps founders separate personal and business risk from day one.",
    services: ["Personal liability structuring", "Business setup", "IP protection"],
  },
]

export default function ClientsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="bg-doda-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-3">Who We Serve</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">Built for businesses at every stage</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Identify your business type and see exactly how Doda serves your legal needs.
          </p>
        </div>
      </section>

      <section className="py-16 bg-doda-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clients.map((c) => (
              <div key={c.type} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-doda-gold hover:shadow-sm transition-all">
                <h2 className="text-lg font-bold text-doda-navy mb-3">{c.type}</h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{c.desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {c.services.map((s) => (
                    <span key={s} className="text-xs px-3 py-1 rounded-full bg-doda-gold/10 text-doda-gold font-medium">
                      {s}
                    </span>
                  ))}
                </div>
                <Link href="/book"
                  className="text-sm font-medium text-doda-navy hover:text-doda-gold transition-colors">
                  Get Started →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-doda-navy text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Not sure which profile fits you?</h2>
          <p className="text-gray-300 mb-6">Book a consultation and we'll identify the right approach for your business.</p>
          <Button asChild size="lg">
            <Link href="/book">Book a Consultation</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
