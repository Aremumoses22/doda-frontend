import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { HeroSlider } from "@/components/public/HeroSlider"
import { Button } from "@/components/ui/button"
import {
  Scale, FileText, ShieldCheck, Lightbulb, Award,
  Building2, MessageSquare, ArrowRight, CheckCircle2
} from "lucide-react"

const services = [
  { icon: Building2,    slug: "corporate-law",           name: "Business & Corporate Law",    desc: "Start and govern your company the right way" },
  { icon: FileText,     slug: "contracts-transactions",  name: "Contracts & Transactions",    desc: "Protect your deals from start to finish" },
  { icon: ShieldCheck,  slug: "regulatory-compliance",   name: "Regulatory Compliance",       desc: "Stay on the right side of every regulation" },
  { icon: Lightbulb,    slug: "startup-sme",             name: "Startup & SME Advisory",      desc: "Legal support built for founders moving fast" },
  { icon: Award,    slug: "intellectual-property",   name: "Intellectual Property",        desc: "Protect what makes your business unique" },
  { icon: Scale,        slug: "property-transactions",   name: "Property Transactions",       desc: "Secure your real estate with full legal backing" },
  { icon: MessageSquare, slug: "general-advisory",       name: "General Legal Advisory",      desc: "Ongoing legal intelligence for growing businesses" },
]

const clientTypes = [
  "Pre-seed Startups", "Growth-stage Startups", "SMEs", "Investment Firms",
  "Venture Studios", "Real Estate Investors", "Corporate Organisations", "Individual Founders",
]

const comparison = [
  { them: "Reactive to problems",              us: "Proactively prevents problems" },
  { them: "Document-focused",                  us: "Business-growth oriented" },
  { them: "Engaged after problems arise",       us: "Embedded before issues occur" },
  { them: "Generic legal output",              us: "Legal + commercial thinking combined" },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── Problem Statement ─────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-doda-navy text-center mb-4">
            Why most Nigerian businesses fail legally
          </h2>
          <p className="text-center text-doda-muted mb-12 text-lg">
            Three blind spots that leave companies exposed:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "⚠️", text: "Contracts go unsigned or unenforceable" },
              { icon: "⚠️", text: "Founders operate without governance structures" },
              { icon: "⚠️", text: "Compliance is reactive — not strategic" },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-doda-light border border-gray-100">
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <p className="text-doda-navy font-medium text-lg">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-10 text-lg font-semibold text-doda-navy italic">
            Doda exists to change that.
          </p>
        </div>
      </section>

      {/* ── Services Snapshot ─────────────────────────────────────────── */}
      <section className="py-20 bg-doda-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-doda-navy mb-3">What We Do</h2>
            <p className="text-doda-muted text-lg">
              Seven practice areas built around the full business lifecycle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map(({ icon: Icon, slug, name, desc }) => (
              <Link key={slug} href={`/services/${slug}`}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-doda-gold hover:shadow-md transition-all">
                <Icon className="w-8 h-8 text-doda-gold mb-3" />
                <h3 className="font-semibold text-doda-navy mb-1.5 group-hover:text-doda-gold transition-colors">
                  {name}
                </h3>
                <p className="text-sm text-doda-muted leading-relaxed">{desc}</p>
                <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-doda-gold">
                  Learn More <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-doda-navy mb-3">How working with Doda works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { step: "01", title: "Book a Consultation", desc: "Tell us about your business and legal needs" },
              { step: "02", title: "Get a Legal Assessment", desc: "We identify your risks, gaps, and opportunities" },
              { step: "03", title: "We Get to Work", desc: "Ongoing or project-based — your legal infrastructure is covered" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-doda-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-doda-gold font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-bold text-doda-navy text-lg mb-2">{item.title}</h3>
                <p className="text-doda-muted">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button asChild>
              <Link href="/book">Book your first session</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Client Types ──────────────────────────────────────────────── */}
      <section className="py-20 bg-doda-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-doda-navy mb-4">
            Built for businesses at every stage
          </h2>
          <p className="text-doda-muted text-lg mb-10">
            From founding a startup to running a corporate — we have the legal coverage for your stage.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {clientTypes.map((type) => (
              <span key={type}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-doda-navy hover:border-doda-gold hover:text-doda-gold transition-colors cursor-default">
                {type}
              </span>
            ))}
          </div>
          <Button asChild variant="outline">
            <Link href="/clients">Find out how we serve your type of business</Link>
          </Button>
        </div>
      </section>

      {/* ── Team / Trust Section ──────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-3">The Principal</p>
              <h2 className="text-3xl font-bold text-doda-navy mb-4">Business law, done right</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Led by Oladoyin Odetunde, Doda Legal Practitioners combines sharp legal expertise
                with a deep understanding of Nigerian business realities — so your legal counsel
                is always commercially intelligent.
              </p>
              <Button asChild variant="outline">
                <Link href="/about">Meet the team</Link>
              </Button>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80"
                alt="Legal professionals in a modern office"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Doda ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-doda-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-doda-navy text-center mb-12">The Doda difference</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Header */}
            <div className="bg-gray-100 rounded-xl p-5 font-bold text-doda-muted text-sm uppercase tracking-wider">
              Most Law Firms
            </div>
            <div className="bg-doda-navy rounded-xl p-5 font-bold text-doda-gold text-sm uppercase tracking-wider">
              Doda
            </div>
            {comparison.map(({ them, us }, i) => (
              <div key={i} className="contents">
                <div className="bg-gray-50 rounded-xl p-5 text-gray-600 flex items-center gap-3">
                  <span className="text-red-400 text-lg">✗</span> {them}
                </div>
                <div className="bg-white rounded-xl p-5 text-doda-navy font-medium flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-doda-gold flex-shrink-0" /> {us}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA Banner ─────────────────────────────────────────── */}
      <section className="py-16 bg-doda-gold">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            "Your business deserves legal infrastructure — not legal afterthoughts."
          </h2>
          <Button asChild size="lg" variant="navy">
            <Link href="/book">Start with a Legal Audit</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
