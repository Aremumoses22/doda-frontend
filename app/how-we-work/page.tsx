import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export const metadata: Metadata = {
  title: "How We Work — Doda Legal Practitioners",
  description: "Four engagement models: Advisory, Transactional, Retainer, and Embedded Legal Partner.",
}

const models = [
  {
    name: "Advisory",
    tag: "One-Off",
    highlight: false,
    what: "Single consultations, legal opinions, and strategy sessions.",
    bestFor: "Targeted guidance on a specific legal question or risk.",
    steps: ["Book a session", "Receive legal opinion or strategy memo", "Implement recommendations"],
  },
  {
    name: "Transactional",
    tag: "Per Deal",
    highlight: false,
    what: "Fee-based support for contracts, business structuring, and deal documentation.",
    bestFor: "Founders closing a round, businesses entering new contracts, transactions.",
    steps: ["Submit deal details", "Scoping call", "Engagement letter", "Execution and completion"],
  },
  {
    name: "Retainer",
    tag: "Monthly Recurring",
    highlight: true,
    what: "Monthly legal support covering contract review, compliance monitoring, and ongoing advisory.",
    bestFor: "Businesses that need regular legal coverage without hiring in-house counsel.",
    includes: [
      "Defined monthly contract reviews",
      "Regulatory compliance check-ins",
      "Access to legal counsel on demand",
      "Priority turnaround on requests",
    ],
    steps: ["Select a retainer tier", "Onboarding call", "Portal access and setup", "Ongoing support begins"],
  },
  {
    name: "Embedded Legal Partner",
    tag: "Deep Partnership",
    highlight: false,
    what: "Acting as an external legal department for businesses that need consistent on-demand coverage.",
    bestFor: "Startups scaling fast, investment firms, companies in regulated spaces.",
    steps: ["Discovery call", "Legal audit", "Terms agreed", "Embedding begins", "Continuous coverage"],
  },
]

const process = [
  "Book Consultation",
  "Legal Assessment / Audit",
  "Engagement Proposal",
  "Onboarding + Portal Access",
  "Active Legal Support",
  "Regular Check-ins + Reports",
]

export default function HowWeWorkPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="bg-doda-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-3">Engagement Models</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">How We Work</h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            We work differently depending on what you need — from a single focused session to acting
            as your fully embedded legal team.
          </p>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="py-16 bg-doda-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((m) => (
              <div key={m.name}
                className={`rounded-2xl p-8 border-2 transition-all ${
                  m.highlight
                    ? "bg-doda-navy border-doda-gold text-white"
                    : "bg-white border-gray-100"
                }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className={`text-xl font-bold ${m.highlight ? "text-white" : "text-doda-navy"}`}>
                      {m.name}
                    </h2>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                      m.highlight ? "bg-doda-gold text-white" : "bg-doda-gold/10 text-doda-gold"
                    }`}>
                      {m.highlight && <Star className="w-3 h-3" />}
                      {m.tag}
                    </span>
                  </div>
                </div>
                <p className={`text-sm mb-3 ${m.highlight ? "text-gray-300" : "text-gray-600"}`}>{m.what}</p>
                <p className={`text-sm font-medium mb-4 ${m.highlight ? "text-doda-gold" : "text-doda-navy"}`}>
                  Best for: {m.bestFor}
                </p>
                {m.includes && (
                  <div className="mb-4">
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                      m.highlight ? "text-gray-400" : "text-doda-muted"
                    }`}>What's Included</p>
                    <ul className="space-y-1.5">
                      {m.includes.map((item) => (
                        <li key={item} className={`flex items-center gap-2 text-sm ${
                          m.highlight ? "text-gray-300" : "text-gray-600"
                        }`}>
                          <span className="text-doda-gold">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                    m.highlight ? "text-gray-400" : "text-doda-muted"
                  }`}>How to Start</p>
                  <div className="flex flex-wrap gap-2">
                    {m.steps.map((step, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded-md ${
                        m.highlight ? "bg-white/10 text-gray-300" : "bg-doda-light text-gray-600"
                      }`}>
                        {i + 1}. {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-doda-navy text-center mb-10">The Process</h2>
          <div className="relative">
            {process.map((step, i) => (
              <div key={i} className="flex items-start gap-4 mb-6 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-doda-gold flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < process.length - 1 && (
                    <div className="w-0.5 h-8 bg-doda-gold/20 mt-1" />
                  )}
                </div>
                <p className="text-doda-navy font-medium pt-2">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-doda-navy text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Choose Your Engagement Model</h2>
          <Button asChild size="lg">
            <Link href="/book">Get Started</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
