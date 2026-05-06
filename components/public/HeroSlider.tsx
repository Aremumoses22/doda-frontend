"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    src:     "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&auto=format&fit=crop&q=80",
    alt:     "Legal documents and gavel in a modern office",
    caption: "Legal infrastructure built for business growth",
  },
  {
    src:     "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&auto=format&fit=crop&q=80",
    alt:     "Business professionals in a boardroom discussion",
    caption: "Proactive counsel before problems arise",
  },
  {
    src:     "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&auto=format&fit=crop&q=80",
    alt:     "Scales of justice and legal contract documents",
    caption: "Seven practice areas for every stage of business",
  },
  {
    src:     "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&auto=format&fit=crop&q=80",
    alt:     "Nigerian entrepreneur reviewing legal documents",
    caption: "Trusted by founders, SMEs and corporate organisations",
  },
  {
    src:     "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=1600&auto=format&fit=crop&q=80",
    alt:     "Modern law firm office with city skyline",
    caption: "Commercially intelligent legal advice — in plain language",
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [fading, setFading]   = useState(false)

  const go = useCallback((next: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(next)
      setFading(false)
    }, 300)
  }, [])

  const prev = () => go((current - 1 + slides.length) % slides.length)
  const next = () => go((current + 1) % slides.length)

  useEffect(() => {
    const id = setTimeout(() => go((current + 1) % slides.length), 5000)
    return () => clearTimeout(id)
  }, [current, go])

  return (
    <section className="relative bg-doda-navy text-white py-24 lg:py-32 overflow-hidden">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 z-0 transition-opacity duration-500 ${
            i === current ? (fading ? "opacity-0" : "opacity-100") : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover opacity-20"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-4">
          Doda Legal Practitioners
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
          Start right.{" "}
          <span className="text-doda-gold">Operate securely.</span>{" "}
          Scale sustainably.
        </h1>
        <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-3 leading-relaxed">
          Doda Legal Practitioners provides legal structure, compliance, and transaction support
          that enables businesses to launch, operate, and grow — without legal blind spots.
        </p>

        {/* Slide caption */}
        <p
          key={current}
          className="text-sm text-doda-gold/80 italic mb-8 h-5 transition-all duration-300"
        >
          {slides[current].caption}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/book">Book a Consultation</Link>
          </Button>
          <Button asChild size="lg" variant="outline"
            className="border-white text-white hover:bg-white hover:text-doda-navy">
            <Link href="/services">Explore Our Services</Link>
          </Button>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={next}
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-doda-gold w-6" : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
