"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
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
import { CheckCircle2 } from "lucide-react"

const serviceOptions = [
  "Business & Corporate Law",
  "Contracts & Transactions",
  "Regulatory Compliance",
  "Startup & SME Advisory",
  "Intellectual Property",
  "Property Transactions",
  "General Advisory",
  "General Enquiry",
]

const bookSchema = z.object({
  fullName:        z.string().min(2, "Name must be at least 2 characters"),
  email:           z.string().email("Please enter a valid email address"),
  phone:           z.string().min(10, "Please enter a valid phone number"),
  companyName:     z.string().optional(),
  businessType:    z.string().min(1, "Please select your business type"),
  serviceInterest: z.array(z.string()).min(1, "Please select at least one service area"),
  engagementType:  z.string().min(1, "Please select an engagement type"),
  description:     z.string().min(20, "Please describe your need in at least 20 characters"),
  preferredTime:   z.string().optional(),
  referralSource:  z.string().optional(),
})

type BookFormData = z.infer<typeof bookSchema>

export default function BookPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: { serviceInterest: [] },
  })

  const selectedServices = watch("serviceInterest") || []

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setValue("serviceInterest", selectedServices.filter((s: string) => s !== service))
    } else {
      setValue("serviceInterest", [...selectedServices, service])
    }
  }

  const onSubmit = async (data: BookFormData) => {
    try {
      await api.post("/api/leads", data)
      setSubmitted(true)
    } catch {
      toast.error("Something went wrong. Please try again or call us directly on 09028629933.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <section className="bg-doda-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-doda-gold text-sm font-semibold uppercase tracking-widest mb-3">Get Started</p>
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">Book a Consultation</h1>
          <p className="text-gray-300 text-lg max-w-xl">
            Tell us about your business and legal needs. We'll review your submission and reach out
            within one business day.
          </p>
        </div>
      </section>

      <section className="py-16 bg-doda-light flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <CheckCircle2 className="w-16 h-16 text-doda-gold mx-auto mb-5" />
              <h2 className="text-2xl font-bold text-doda-navy mb-3">Consultation request received</h2>
              <p className="text-doda-muted max-w-md mx-auto">
                Thank you for reaching out. You'll receive a confirmation email shortly, and our team
                will contact you within one business day to schedule your session.
              </p>
              <p className="text-sm text-doda-muted mt-4">
                Questions? Call us at{" "}
                <a href="tel:09028629933" className="text-doda-gold font-medium">09028629933</a>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Personal details */}
                <div>
                  <h2 className="text-base font-bold text-doda-navy mb-4 pb-2 border-b border-gray-100">
                    Your Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" {...register("companyName")} placeholder="Optional" />
                    </div>
                  </div>
                </div>

                {/* Business context */}
                <div>
                  <h2 className="text-base font-bold text-doda-navy mb-4 pb-2 border-b border-gray-100">
                    About Your Business
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="businessType">Type of Business *</Label>
                      <select
                        id="businessType"
                        {...register("businessType")}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-doda-gold">
                        <option value="">Select your business type</option>
                        <option value="startup">Startup</option>
                        <option value="sme">SME</option>
                        <option value="corporate">Corporate Organisation</option>
                        <option value="individual">Individual</option>
                        <option value="investment_firm">Investment Firm</option>
                        <option value="venture_studio">Venture Studio</option>
                        <option value="real_estate">Real Estate</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.businessType && <p className="text-xs text-red-500">{errors.businessType.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Service Area of Interest *</Label>
                      <p className="text-xs text-doda-muted">Select all that apply</p>
                      <div className="grid grid-cols-2 gap-2">
                        {serviceOptions.map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`px-3 py-2 rounded-lg text-sm text-left font-medium transition-colors border ${
                              selectedServices.includes(service)
                                ? "bg-doda-gold border-doda-gold text-white"
                                : "bg-white border-gray-200 text-gray-700 hover:border-doda-gold"
                            }`}>
                            {service}
                          </button>
                        ))}
                      </div>
                      {errors.serviceInterest && (
                        <p className="text-xs text-red-500">{errors.serviceInterest.message as string}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Engagement Type *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "advisory",  label: "One-Off Advisory" },
                          { value: "transactional", label: "Transactional" },
                          { value: "retainer",  label: "Retainer" },
                          { value: "embedded",  label: "Embedded Partner" },
                        ].map(({ value, label }) => (
                          <label key={value}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-doda-gold transition-colors">
                            <input
                              type="radio"
                              value={value}
                              {...register("engagementType")}
                              className="accent-doda-gold"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.engagementType && <p className="text-xs text-red-500">{errors.engagementType.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-base font-bold text-doda-navy mb-4 pb-2 border-b border-gray-100">
                    Your Legal Need
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="description">Brief Description of Need *</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Describe your legal situation, challenge, or what you want to achieve... (min 20 characters)"
                        rows={4}
                      />
                      {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Contact Time</Label>
                      <div className="flex gap-3">
                        {["Morning", "Afternoon", "Evening"].map((time) => (
                          <label key={time}
                            className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value={time.toLowerCase()}
                              {...register("preferredTime")}
                              className="accent-doda-gold"
                            />
                            <span className="text-sm text-gray-700">{time}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="referralSource">How did you find us?</Label>
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
                  </div>
                </div>

                {/* Honeypot */}
                <input type="text" name="_gotcha" style={{ display: "none" }} aria-hidden="true" />

                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                  {isSubmitting ? "Submitting..." : "Submit Consultation Request"}
                </Button>
                <p className="text-xs text-center text-doda-muted">
                  We'll respond within one business day. Questions? Call{" "}
                  <a href="tel:09028629933" className="text-doda-gold">09028629933</a>
                </p>
              </form>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
