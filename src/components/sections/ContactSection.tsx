"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AnimatedSectionHeading from "../motion/AnimatedSectionHeading";
import Reveal from "../motion/Reveal";
import Button from "../ui/Button";
import MagneticButton from "../motion/MagneticButton";
import { motionTokens, fadeUpVariants } from "@/lib/motion";
import { homeContentDefaults, type HomeContent } from "@/content/defaults/home";
import type { GlobalContent } from "@/content/defaults/global";

const formFieldVariants = {
  hidden: { opacity: 0, y: 20, filter: `blur(${motionTokens.blur.sm})` },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: motionTokens.duration.normal,
      ease: motionTokens.ease.out,
    },
  },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 12 },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const iconPopVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 12 },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

export default function ContactSection({
  content = homeContentDefaults.contact,
  contact,
}: {
  content?: HomeContent["contact"];
  contact: GlobalContent["contact"];
}) {
  const email = contact.email;
  const phone = contact.phone;
  const location = contact.address;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

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

  const contactInfoVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const infoItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: motionTokens.ease.out },
    },
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-[#030014]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSectionHeading
          title={content.title}
          subtitle={content.subtitle}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column Info */}
          <Reveal direction="left" className="lg:col-span-5 space-y-6">
            <GlassCard className="p-8 border-white/5 bg-[#0d0b21]/45 space-y-6">
              <h3 className="text-xl font-bold text-white">Thông tin liên hệ</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {content.intro}
              </p>

              <motion.div
                className="space-y-4 pt-4 border-t border-white/5"
                variants={contactInfoVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={infoItemVariants} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">Email</span>
                    <a href={`mailto:${email}`} className="text-sm text-white hover:text-pink-400 transition-colors">
                      {email}
                    </a>
                  </div>
                </motion.div>

                <motion.div variants={infoItemVariants} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">Zalo / SĐT</span>
                    <a href={`tel:${phone}`} className="text-sm text-white hover:text-pink-400 transition-colors">
                      {phone}
                    </a>
                  </div>
                </motion.div>

                <motion.div variants={infoItemVariants} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">Vị trí</span>
                    <span className="text-sm text-white">{location}</span>
                  </div>
                </motion.div>
              </motion.div>
            </GlassCard>
          </Reveal>

          {/* Right Column Form */}
          <Reveal direction="right" className="lg:col-span-7">
            <GlassCard className="p-8 border-white/5 bg-[#0d0b21]/45">
              <AnimatePresence mode="wait">
                {submitStatus === "success" ? (
                  <motion.div
                    key="success"
                    variants={successVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col items-center justify-center text-center py-10 space-y-4"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.1 }}
                    >
                      <CheckCircle2 className="w-16 h-16 text-green-400" />
                    </motion.div>
                    <h4 className="text-xl font-bold text-white">{content.successMessage}</h4>
                    <p className="text-sm text-gray-400 max-w-md">
                      Cảm ơn bạn đã liên hệ. Cường đã nhận được thông tin và sẽ sớm phản hồi lại bạn.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitStatus("idle")}>
                      Gửi tin nhắn khác
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-4 text-left"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      hidden: {},
                      visible: {
                        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
                      },
                    }}
                  >
                    <motion.div variants={formFieldVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 block font-medium">{content.labels.name} *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder={content.placeholders.name}
                          className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 block font-medium">{content.labels.email} *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder={content.placeholders.email}
                          className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={formFieldVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 block font-medium">{content.labels.phone}</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder={content.placeholders.phone}
                          className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-400 block font-medium">{content.labels.subject} *</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder={content.placeholders.subject}
                          className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={formFieldVariants} className="space-y-1">
                      <label className="text-xs text-gray-400 block font-medium">{content.labels.message} *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder={content.placeholders.message}
                        className="glass-input w-full px-4 py-2.5 text-sm focus:outline-none resize-none"
                      />
                    </motion.div>

                    {submitStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs font-semibold"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{content.errorMessage}</span>
                      </motion.div>
                    )}

                    <motion.div variants={formFieldVariants}>
                      <MagneticButton className="w-full">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 pt-3"
                        >
                          {isSubmitting ? (
                            <span>{content.loadingLabel}</span>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>{content.submitLabel}</span>
                            </>
                          )}
                        </Button>
                      </MagneticButton>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </GlassCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
