import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { Button } from "@/components/ui/button"
import { Mail, Phone } from "lucide-react"

export const metadata: Metadata = {
  title: "About Doda Legal Practitioners",
  description: "Meet the team behind Nigeria's business-first law practice.",
}

const values = [
  { name: "Proactivity",  desc: "We identify risks before they become problems" },
  { name: "Clarity",      desc: "Legal advice you can act on — in plain language" },
  { name: "Precision",    desc: "Every document, structure, and opinion is built to hold" },
  { name: "Partnership",  desc: "We grow when our clients grow" },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Page header */}
      <section className="relative bg-doda-navy text-white py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=1600&auto=format&fit=crop&q=80"
            alt="Modern legal office"
            fill
            priority
            className="object-cover opacity-15"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-4xl lg:text-5xl font-bold">Who We Are</h1>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            Doda Legal Practitioners is a business-focused Nigerian law practice dedicated to providing
            legal infrastructure for companies that want to build sustainably. We work with founders,
            SMEs, investors, and corporates to ensure every stage of business — from incorporation to
            scale — is backed by solid legal structure.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 bg-doda-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-doda-navy mb-6">Our Philosophy</h2>
          <blockquote className="text-xl font-semibold text-doda-gold italic border-l-4 border-doda-gold pl-6 mb-6">
            "Law as infrastructure for business growth and compliance."
          </blockquote>
          <p className="text-gray-700 leading-relaxed text-lg">
            Too many businesses in Nigeria treat legal as an afterthought — a cost centre, engaged only
            when things go wrong. We believe legal counsel should be embedded, proactive, and commercially
            intelligent. Doda exists to deliver that.
          </p>
        </div>
      </section>

      {/* The Principal */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-doda-navy mb-8">The Principal</h2>
          <div className="flex flex-col sm:flex-row gap-8">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 bg-doda-gold/10 relative">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80"
                alt="Oladoyin Odetunde, Principal"
                fill
                className="object-cover"
                sizes="128px"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-doda-navy">Oladoyin Odetunde</h3>
              <p className="text-doda-gold font-medium mb-4">Principal, Doda Legal Practitioners</p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Oladoyin Odetunde is a business-focused legal practitioner with deep expertise in corporate
                law, commercial contracts, startup advisory, and regulatory compliance. With years of
                experience advising founders, SMEs, and growing companies across Nigeria, Oladoyin combines
                sharp legal thinking with a strong understanding of business realities.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Her practice areas span company incorporation and governance, investment documentation,
                intellectual property, and embedded legal partnerships — serving clients across fintech,
                real estate, venture, and consumer sectors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <a href="mailto:dodalegalpractitioners@gmail.com"
                  className="flex items-center gap-2 text-sm text-doda-muted hover:text-doda-gold transition-colors">
                  <Mail className="w-4 h-4" />
                  dodalegalpractitioners@gmail.com
                </a>
                <a href="tel:09028629933"
                  className="flex items-center gap-2 text-sm text-doda-muted hover:text-doda-gold transition-colors">
                  <Phone className="w-4 h-4" />
                  09028629933
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-doda-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-doda-navy text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.name} className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-doda-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-doda-gold font-bold text-lg">{v.name[0]}</span>
                </div>
                <h3 className="font-bold text-doda-navy mb-2">{v.name}</h3>
                <p className="text-sm text-doda-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-doda-navy text-white text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Ready to work with Doda?</h2>
          <Button asChild size="lg">
            <Link href="/book">Work with Doda</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
