import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { Button } from "@/components/ui/button"
import {
  Scale, FileText, ShieldCheck, Lightbulb, Award,
  Building2, MessageSquare, ArrowRight
} from "lucide-react"

export const metadata: Metadata = {
  title: "Legal Services for Businesses — Doda Legal Practitioners",
  description: "Seven practice areas covering corporate law, contracts, IP, compliance, and more.",
}

const services = [
  {
    icon: Building2,
    slug: "corporate-law",
    name: "Business & Corporate Law",
    desc: "Helping businesses start right and stay governed.",
    bullets: ["Company incorporation (CAC)", "Shareholding & equity design", "Corporate governance advisory", "Board setup and compliance"],
  },
  {
    icon: FileText,
    slug: "contracts-transactions",
    name: "Contracts & Transactions",
    desc: "Protecting your deals before, during, and after they close.",
    bullets: ["Commercial contract drafting", "NDA and confidentiality agreements", "Transaction structuring", "Contract review and risk analysis"],
  },
  {
    icon: ShieldCheck,
    slug: "regulatory-compliance",
    name: "Regulatory Compliance",
    desc: "Keeping your business on the right side of the law — strategically.",
    bullets: ["Industry-specific compliance advisory", "Licensing and permits", "Ongoing compliance monitoring", "Regulatory filings and reporting"],
  },
  {
    icon: Lightbulb,
    slug: "startup-sme",
    name: "Startup & SME Advisory",
    desc: "Built for founders who are moving fast and need legal to keep up.",
    bullets: ["Founder agreements", "Equity and vesting structures", "Investor documentation", "Legal due diligence"],
  },
  {
    icon: Award,
    slug: "intellectual-property",
    name: "Intellectual Property",
    desc: "Protecting what makes your business unique.",
    bullets: ["Trademark registration", "Copyright advisory", "IP licensing agreements", "IP commercialisation support"],
  },
  {
    icon: Scale,
    slug: "property-transactions",
    name: "Property & Asset Transactions",
    desc: "Securing your real estate interests with full legal backing.",
    bullets: ["Title verification and due diligence", "Property acquisition documentation", "Lease agreements", "Real estate transaction advisory"],
  },
  {
    icon: MessageSquare,
    slug: "general-advisory",
    name: "General Legal Advisory",
    desc: "Ongoing legal support for businesses that want to stay ahead of risk.",
    bullets: ["Legal opinions", "Dispute avoidance strategy", "Legal risk advisory", "Monthly retainer services"],
  },
]

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="bg-doda-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-3">Our Practice Areas</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">What We Do</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Doda operates across seven core practice areas — each designed to serve businesses at a
            specific stage of their lifecycle.
          </p>
        </div>
      </section>

      <section className="py-16 bg-doda-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, slug, name, desc, bullets }) => (
              <div key={slug} className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-doda-gold hover:shadow-md transition-all flex flex-col">
                <Icon className="w-9 h-9 text-doda-gold mb-4" />
                <h2 className="text-lg font-bold text-doda-navy mb-2">{name}</h2>
                <p className="text-doda-muted text-sm mb-4">{desc}</p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-doda-gold mt-0.5 flex-shrink-0">✓</span> {b}
                    </li>
                  ))}
                </ul>
                <Link href={`/services/${slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-doda-gold hover:gap-2 transition-all">
                  Get Support in This Area <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 bg-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-doda-navy mb-3">Not sure which service you need?</h2>
          <p className="text-doda-muted mb-6">
            Book a legal audit and we'll map your business risks for you.
          </p>
          <Button asChild size="lg">
            <Link href="/book">Book a Legal Audit</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
