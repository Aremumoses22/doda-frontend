import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

type ServiceData = {
  slug: string
  name: string
  shortDesc: string
  covers: string[]
  whoFor: string
  whyMatters: string
  delivery: string[]
  relatedDocs?: string[]
}

const serviceMap: Record<string, ServiceData> = {
  "corporate-law": {
    slug: "corporate-law",
    name: "Business & Corporate Law",
    shortDesc: "Helping businesses start right and stay governed.",
    covers: [
      "Company incorporation (CAC registration)",
      "Post-incorporation structuring",
      "Shareholding and equity design",
      "Corporate governance advisory",
      "Board setup and compliance advisory",
    ],
    whoFor: "Founders, pre-seed startups, growth-stage companies, and corporate entities who need proper legal foundations.",
    whyMatters: "Most Nigerian businesses launch without the right governance structures in place. Shareholder disputes, invalid contracts, and regulatory failures trace back to poor corporate setup. Getting this right from the start protects founders and enables the business to scale safely.",
    delivery: [
      "Initial discovery call to understand your structure",
      "Legal gap assessment and recommendations",
      "Document preparation and filing (CAC, FIRS, etc.)",
      "Ongoing governance advisory and updates",
    ],
    relatedDocs: ["Founders Agreement", "Shareholders Agreement", "Share Subscription Agreement"],
  },
  "contracts-transactions": {
    slug: "contracts-transactions",
    name: "Contracts & Transactions",
    shortDesc: "Protecting your deals before, during, and after they close.",
    covers: [
      "Commercial contract drafting",
      "NDAs and confidentiality agreements",
      "Service level agreements (SLAs)",
      "Contract review and risk analysis",
      "Negotiation support",
      "Transaction structuring",
      "Deal documentation (investments, partnerships)",
    ],
    whoFor: "All business types — especially deal-active startups and SMEs entering commercial agreements, investment rounds, or service arrangements.",
    whyMatters: "A poorly drafted or unreviewed contract is a liability waiting to happen. Every commercial relationship carries risk — Doda ensures your agreements are enforceable, balanced, and built to protect your interests.",
    delivery: [
      "Contract brief and scope review",
      "Drafting or reviewing the agreement",
      "Risk identification and recommended amendments",
      "Final execution and filing support",
    ],
    relatedDocs: ["NDA", "Service Agreement", "Investment Agreement", "Term Sheet"],
  },
  "regulatory-compliance": {
    slug: "regulatory-compliance",
    name: "Regulatory Compliance",
    shortDesc: "Keeping your business on the right side of the law — strategically.",
    covers: [
      "Industry-specific compliance advisory",
      "Licensing and permits acquisition",
      "Ongoing compliance monitoring",
      "Regulatory filings and reporting",
      "Risk audits and compliance checks",
    ],
    whoFor: "SMEs, fintech companies, regulated industries, and corporate organisations that operate in sectors with regulatory requirements.",
    whyMatters: "Regulatory failure is one of the most common and costly risks for Nigerian businesses. Non-compliance leads to fines, shutdowns, and reputational damage. Proactive compliance is an investment in continuity.",
    delivery: [
      "Compliance audit of current operations",
      "Gap analysis and priority actions",
      "Licensing and permit applications",
      "Ongoing monitoring and reporting calendar",
    ],
    relatedDocs: ["Compliance Framework"],
  },
  "startup-sme": {
    slug: "startup-sme",
    name: "Startup & SME Legal Advisory",
    shortDesc: "Built for founders who are moving fast and need legal to keep up.",
    covers: [
      "Founder agreements",
      "Equity and vesting structures",
      "Investor documentation (term sheets, subscription agreements)",
      "Shareholders agreements",
      "Investor rights agreements",
      "Legal due diligence",
      "Business restructuring advisory",
    ],
    whoFor: "Pre-seed and growth-stage startups, venture studios, and investment firms who need legal support that understands the startup ecosystem.",
    whyMatters: "Startups fail legally when they move fast without proper documentation. Founder disputes, investor rights issues, and equity disagreements destroy companies that had real potential. Legal infrastructure built for speed keeps you moving while keeping you protected.",
    delivery: [
      "Startup legal health check",
      "Founder agreement and equity structure design",
      "Investment documentation preparation",
      "Ongoing advisory retainer options",
    ],
    relatedDocs: ["Founders Agreement", "Investor Rights Agreement", "Term Sheet", "Share Subscription Agreement"],
  },
  "intellectual-property": {
    slug: "intellectual-property",
    name: "Intellectual Property",
    shortDesc: "Protecting what makes your business unique.",
    covers: [
      "Trademark registration",
      "Copyright advisory",
      "IP protection strategy",
      "IP licensing agreements",
      "IP commercialisation support",
    ],
    whoFor: "Startups, content creators, tech companies, and product businesses whose value is tied to brands, technology, or creative output.",
    whyMatters: "Your brand, product, and creative work are assets. Unprotected IP is an invitation to infringement. With the Nigerian digital economy growing, IP protection is now a business necessity — not a luxury.",
    delivery: [
      "IP audit and identification",
      "Trademark and copyright registration",
      "Licensing structure and agreements",
      "Ongoing IP monitoring and enforcement advisory",
    ],
  },
  "property-transactions": {
    slug: "property-transactions",
    name: "Property & Asset Transactions",
    shortDesc: "Securing your real estate interests with full legal backing.",
    covers: [
      "Title verification and due diligence",
      "Property acquisition documentation",
      "Lease agreements (commercial and residential)",
      "Real estate transaction advisory",
    ],
    whoFor: "Real estate investors, businesses seeking commercial property, and individuals purchasing assets who need full legal certainty.",
    whyMatters: "Property transactions in Nigeria carry significant legal risk — title defects, fraudulent documentation, and disputed ownership are common. Full legal due diligence before any acquisition is essential.",
    delivery: [
      "Title search and due diligence",
      "Purchase agreement review or drafting",
      "Regulatory compliance checks",
      "Transaction completion and documentation",
    ],
    relatedDocs: ["Lease Agreement"],
  },
  "general-advisory": {
    slug: "general-advisory",
    name: "General Legal Advisory",
    shortDesc: "Ongoing legal support for businesses that want to stay ahead of risk.",
    covers: [
      "Legal opinions",
      "Dispute avoidance strategy",
      "Legal risk advisory",
      "Monthly retainer services",
    ],
    whoFor: "All businesses — especially those wanting ongoing embedded legal counsel without the cost of in-house legal.",
    whyMatters: "Legal risk doesn't stop when you have a lawyer on call. It requires a proactive, ongoing relationship. A retainer with Doda means you always have expert legal intelligence at hand — before problems surface.",
    delivery: [
      "Monthly retainer scoping and agreement",
      "Regular legal health checks",
      "On-demand advisory and opinions",
      "Priority response and turnaround",
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(serviceMap).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = serviceMap[slug]
  if (!service) return {}
  return {
    title: `${service.name} — Doda Legal Practitioners`,
    description: service.shortDesc,
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = serviceMap[slug]
  if (!service) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="bg-doda-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/services"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Services
          </Link>
          <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-3">Practice Area</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">{service.name}</h1>
          <p className="text-gray-300 text-lg max-w-2xl">{service.shortDesc}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">

              {/* What This Covers */}
              <div>
                <h2 className="text-xl font-bold text-doda-navy mb-4">What This Covers</h2>
                <ul className="space-y-3">
                  {service.covers.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-doda-gold flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Who This Is For */}
              <div>
                <h2 className="text-xl font-bold text-doda-navy mb-3">Who This Is For</h2>
                <p className="text-gray-700 leading-relaxed">{service.whoFor}</p>
              </div>

              {/* Why This Matters */}
              <div>
                <h2 className="text-xl font-bold text-doda-navy mb-3">Why This Matters</h2>
                <p className="text-gray-700 leading-relaxed">{service.whyMatters}</p>
              </div>

              {/* How We Deliver */}
              <div>
                <h2 className="text-xl font-bold text-doda-navy mb-4">How We Deliver</h2>
                <div className="space-y-3">
                  {service.delivery.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-7 h-7 rounded-full bg-doda-gold/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-doda-gold">{i + 1}</span>
                      </div>
                      <p className="text-gray-700 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Documents */}
              {service.relatedDocs && (
                <div>
                  <h2 className="text-xl font-bold text-doda-navy mb-3">Related Documents We Handle</h2>
                  <div className="flex flex-wrap gap-2">
                    {service.relatedDocs.map((doc) => (
                      <span key={doc}
                        className="px-3 py-1.5 rounded-full bg-doda-gold/10 text-doda-gold text-sm font-medium">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-doda-navy rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Engage Us</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Ready to get support in {service.name}? Book a consultation and we'll discuss your specific needs.
                </p>
                <Button asChild className="w-full">
                  <Link href={`/book?service=${service.slug}`}>
                    Engage Us for {service.name.split("&")[0].trim()}
                  </Link>
                </Button>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-gray-400">Questions first?</p>
                  <a href="tel:09028629933"
                    className="text-sm text-doda-gold hover:text-doda-gold/80 font-medium">
                    Call 09028629933
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
