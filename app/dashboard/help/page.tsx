"use client"

import { useState } from "react"
import {
  ChevronDown, ChevronRight, HelpCircle, MessageSquare, Plus, Loader2, CheckCircle2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"

const FAQS = [
  {
    q: "How do I check the status of my matter?",
    a: "Go to My Matters in the sidebar. Each matter card shows its current status and a progress indicator. Click on a matter to see a detailed progress timeline.",
  },
  {
    q: "How do I send a document to my lawyer?",
    a: "Navigate to the specific matter in My Matters, then scroll to the 'Upload a File' section at the bottom of the page. You can also use the Documents section to view all shared documents.",
  },
  {
    q: "How do I pay an invoice?",
    a: "Go to Billing & Payments in the sidebar. Any outstanding invoices will be shown with a 'Pay Now' button which redirects you to our secure payment portal. You can also upload bank transfer proof for manual payments.",
  },
  {
    q: "What does 'Awaiting Your Input' mean?",
    a: "This status means your lawyer requires information, a document, or a decision from you to proceed with your matter. Please check the matter's Progress Timeline for specific action items.",
  },
  {
    q: "How do I book a consultation?",
    a: "Use the 'Book a Session' option in the sidebar. Select your session type, preferred date and time, and provide a brief description. The team will confirm your booking within 24 hours.",
  },
  {
    q: "How do I update my contact details?",
    a: "Go to My Profile in the sidebar. You can update your name, phone number, email, company, and industry. Click 'Save Changes' to apply your updates.",
  },
  {
    q: "Is my information confidential?",
    a: "Yes. All information shared through this portal is protected by attorney-client privilege and our strict data privacy policies. We use industry-standard encryption for all data in transit and at rest.",
  },
  {
    q: "How do I request a new legal service?",
    a: "Use the 'Request New Service' form below, or send us a message via the Messages section. Our intake team will get back to you within 1–2 business days.",
  },
]

const SERVICE_TYPES = [
  "Corporate & Commercial Law",
  "Employment Law",
  "Real Estate & Property",
  "Dispute Resolution & Litigation",
  "Intellectual Property",
  "Immigration",
  "Family Law",
  "Criminal Law",
  "Other",
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Contact form
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [contactSending, setContactSending] = useState(false)
  const [contactSent, setContactSent] = useState(false)

  // New service request
  const [serviceType, setServiceType] = useState("")
  const [serviceDesc, setServiceDesc] = useState("")
  const [serviceSending, setServiceSending] = useState(false)
  const [serviceSent, setServiceSent] = useState(false)

  async function sendContact(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) { toast.error("Please enter a message"); return }
    setContactSending(true)
    try {
      await api.post("/api/messages", { subject: subject || "Help & Support Enquiry", body: message })
      setContactSent(true)
      setSubject(""); setMessage("")
    } catch { toast.error("Failed to send. Please try again.") }
    finally { setContactSending(false) }
  }

  async function sendServiceRequest(e: React.FormEvent) {
    e.preventDefault()
    if (!serviceType || !serviceDesc.trim()) { toast.error("Please fill in all fields"); return }
    setServiceSending(true)
    try {
      await api.post("/api/messages", {
        subject: `New Service Request: ${serviceType}`,
        body: `Service Requested: ${serviceType}\n\nDetails:\n${serviceDesc}`,
      })
      setServiceSent(true)
      setServiceType(""); setServiceDesc("")
    } catch { toast.error("Failed to send request.") }
    finally { setServiceSending(false) }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">Help &amp; Support</h1>
        <p className="text-gray-500 text-sm mt-1">Answers to common questions and ways to reach us</p>
      </div>

      {/* FAQs */}
      <section>
        <h2 className="text-lg font-semibold text-doda-navy mb-3 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-doda-gold" /> Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm font-semibold text-doda-navy">{faq.q}</p>
                {openFaq === i
                  ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact us */}
      <section>
        <h2 className="text-lg font-semibold text-doda-navy mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-doda-gold" /> Contact the Doda Legal Team
        </h2>
        <Card>
          <CardContent className="p-5">
            {contactSent ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
                <p className="font-semibold text-doda-navy">Message Sent!</p>
                <p className="text-sm text-gray-400 mt-1">We&apos;ll get back to you within 1 business day.</p>
                <Button variant="outline" className="mt-3" onClick={() => setContactSent(false)}>Send Another</Button>
              </div>
            ) : (
              <form onSubmit={sendContact} className="space-y-3">
                <div>
                  <Label>Subject <span className="text-gray-400">(optional)</span></Label>
                  <Input className="mt-1" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Question about my retainer" />
                </div>
                <div>
                  <Label>Message *</Label>
                  <Textarea
                    className="mt-1 resize-none"
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                  />
                </div>
                <Button type="submit" disabled={contactSending} className="bg-doda-navy text-white">
                  {contactSending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Request new service */}
      <section>
        <h2 className="text-lg font-semibold text-doda-navy mb-3 flex items-center gap-2">
          <Plus className="h-5 w-5 text-doda-gold" /> Request a New Service
        </h2>
        <Card>
          <CardContent className="p-5">
            {serviceSent ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-2" />
                <p className="font-semibold text-doda-navy">Request Received!</p>
                <p className="text-sm text-gray-400 mt-1">Our intake team will review your request and reach out soon.</p>
                <Button variant="outline" className="mt-3" onClick={() => setServiceSent(false)}>Submit Another</Button>
              </div>
            ) : (
              <form onSubmit={sendServiceRequest} className="space-y-3">
                <div>
                  <Label>Type of Service Needed *</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select service area…" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Describe Your Need *</Label>
                  <Textarea
                    className="mt-1 resize-none"
                    rows={4}
                    value={serviceDesc}
                    onChange={e => setServiceDesc(e.target.value)}
                    placeholder="Briefly describe what you need help with…"
                  />
                </div>
                <Button type="submit" disabled={serviceSending} className="bg-doda-navy text-white">
                  {serviceSending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Submit Request
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Contact details */}
      <section className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-doda-navy mb-2">Direct Contact</h3>
        <div className="text-sm text-gray-500 space-y-1">
          <p>📧 <a href="mailto:hello@dodalegal.com" className="text-doda-gold hover:underline">hello@dodalegal.com</a></p>
          <p>📞 <a href="tel:+2348000000000" className="text-doda-gold hover:underline">+234 800 000 0000</a></p>
          <p>🕐 Office hours: Monday–Friday, 9:00 AM – 5:00 PM WAT</p>
        </div>
      </section>
    </div>
  )
}
