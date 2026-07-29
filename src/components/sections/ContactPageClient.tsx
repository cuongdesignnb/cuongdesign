"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";

interface ContactPageClientProps {
  contact: {
    introduction: { title: string; content: string };
    cards: { email: string; phone: string; address: string };
    form: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      subjectLabel: string;
      subjectPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      submitLabel: string;
      loadingLabel: string;
      successTitle: string;
      successMessage: string;
      resetLabel: string;
      errorMessage: string;
    };
    faqHeading: string;
    faqIntro: string;
    faqs: { question: string; answer: string }[];
  };
  globalContact: { email: string; phone: string; address: string };
}

export default function ContactPageClient({
  contact,
  globalContact,
}: ContactPageClientProps) {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-12">
      {/* Contact Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Contact Info (5 cols) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          <GlassCard className="p-8 border-white/5 bg-[#0a0822]/60 space-y-6">
            <h3 className="text-xl font-bold text-white">{contact.introduction.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {contact.introduction.content}
            </p>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">{contact.cards.email}</span>
                  <a href={`mailto:${globalContact.email}`} className="text-sm text-white hover:text-pink-400 transition-colors">
                    {globalContact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">{contact.cards.phone}</span>
                  <a href={`tel:${globalContact.phone}`} className="text-sm text-white hover:text-pink-400 transition-colors">
                    {globalContact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">{contact.cards.address}</span>
                  <span className="text-sm text-white">{globalContact.address}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column Form (7 cols) */}
        <div className="lg:col-span-7">
          <GlassCard className="p-8 border-white/5 bg-[#0a0822]/60">
            {submitStatus === "success" ? (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
                <h4 className="text-xl font-bold text-white">{contact.form.successTitle}</h4>
                <p className="text-sm text-gray-400 max-w-md">
                  {contact.form.successMessage}
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitStatus("idle")}>
                  {contact.form.resetLabel}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">{contact.form.nameLabel}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder={contact.form.namePlaceholder}
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">{contact.form.emailLabel}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder={contact.form.emailPlaceholder}
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">{contact.form.phoneLabel}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={contact.form.phonePlaceholder}
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 block font-medium">{contact.form.subjectLabel}</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder={contact.form.subjectPlaceholder}
                      className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 block font-medium">{contact.form.messageLabel}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder={contact.form.messagePlaceholder}
                    className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none resize-none"
                  />
                </div>

                {submitStatus === "error" && (
                  <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{contact.form.errorMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 pt-3 bg-pink-600 hover:bg-pink-500 font-bold"
                >
                  {isSubmitting ? (
                    <span>{contact.form.loadingLabel}</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{contact.form.submitLabel}</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </GlassCard>
        </div>

      </div>

      {/* FAQs Accordion list */}
      <div className="pt-8 border-t border-white/5 space-y-6 text-left">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white">{contact.faqHeading}</h2>
          <p className="text-xs text-gray-500 mt-1">{contact.faqIntro}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {contact.faqs.map((faq, idx) => (
            <GlassCard 
              key={idx} 
              className="p-5 border-white/5 bg-[#0a0822]/60 cursor-pointer hover:border-white/10"
              onClick={() => toggleFaq(idx)}
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="text-sm font-bold text-white leading-snug">{faq.question}</h4>
                {openFaqIdx === idx ? (
                  <ChevronUp className="w-4 h-4 text-pink-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                )}
              </div>
              
              {openFaqIdx === idx && (
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-gray-400 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                  {faq.answer}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
