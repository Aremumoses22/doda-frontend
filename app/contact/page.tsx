"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Mail, Phone, CheckCircle2 } from "lucide-react"

const contactSchema = z.object({
  fullName:      z.string().min(2, "Name must be at least 2 characters"),
  email:         z.string().email("Please enter a valid email address"),
  phone:         z.string().min(10, "Please enter a valid phone number"),
  companyName:   z.string().optional(),
  description:   z.string().min(20, "Please provide at least 20 characters"),
  referralSource: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (data: ContactFormData) => {
    try {
      await api.post("/api/leads", data)
      setSubmitted(true)
    } catch {
      toast.error("Something went wrong. Please try again or call us directly.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="relative bg-doda-navy text-white py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80"
            alt="Office communication"
            fill
            priority
            className="object-cover opacity-15"
            sizes="100vw"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-3">Contact</p>
          <h1 className="text-4xl lg:text-5xl font-bold">Get in touch</h1>
          <p className="text-gray-300 text-lg mt-3 max-w-xl">
            Whether you have a question, want to explore a retainer, or need immediate legal support — we're here.
          </p>
        </div>
      </section>

      <section className="py-16 bg-doda-light flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-doda-navy mb-4">Contact Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-doda-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-doda-muted uppercase tracking-wider mb-0.5">Email</p>
                      <a href="mailto:dodalegalpractitioners@gmail.com"
                        className="text-doda-navy hover:text-doda-gold transition-colors text-sm">
                        dodalegalpractitioners@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-doda-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-doda-muted uppercase tracking-wider mb-0.5">Phone</p>
                      <a href="tel:09028629933"
                        className="text-doda-navy hover:text-doda-gold transition-colors text-sm">
                        09028629933
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <p className="text-sm font-semibold text-doda-navy mb-1">Principal</p>
                <p className="text-sm text-doda-muted">Oladoyin Odetunde</p>
                <p className="text-xs text-doda-muted mt-1">Doda Legal Practitioners</p>
              </div>
              <div className="bg-doda-navy rounded-2xl p-5 text-white">
                <p className="font-medium mb-2">Prefer to jump straight in?</p>
                <p className="text-gray-300 text-sm mb-3">
                  Book a consultation directly and we'll get you started.
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href="/book">Book a Consultation</Link>
                </Button>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100">
              {submitted ? (
                <div className="flex flex-col items-center text-center py-10">
                  <CheckCircle2 className="w-14 h-14 text-doda-gold mb-4" />
                  <h2 className="text-2xl font-bold text-doda-navy mb-2">Message received</h2>
                  <p className="text-doda-muted max-w-sm">
                    Thank you for reaching out. We'll review your enquiry and get back to you within
                    one business day.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input id="fullName" {...register("fullName")} placeholder="Jane Okafor" />
                      {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" {...register("email")} placeholder="jane@company.com" />
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" {...register("phone")} placeholder="08012345678" />
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="companyName">Company / Organisation</Label>
                      <Input id="companyName" {...register("companyName")} placeholder="Optional" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Message / Enquiry *</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Tell us about your legal need or question..."
                      rows={5}
                    />
                    {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="referralSource">How did you hear about us?</Label>
                    <select
                      id="referralSource"
                      {...register("referralSource")}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-doda-gold">
                      <option value="">Select an option</option>
                      <option value="google">Google</option>
                      <option value="referral">Referral</option>
                      <option value="social_media">Social Media</option>
                      <option value="event">Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Honeypot */}
                  <input type="text" name="_gotcha" style={{ display: "none" }} aria-hidden="true" />

                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
