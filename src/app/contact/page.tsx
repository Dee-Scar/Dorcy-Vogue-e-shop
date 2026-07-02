"use client";

import React, { useState, Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { CartDrawer } from "@/components/CartDrawer";
import { MessageSquare, Mail, Phone, MapPin, Send, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ContactPageContent() {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setStatus("sending");

    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setStatus("idle");
  };

  return (
    <div className="flex-grow flex flex-col pt-[80px] bg-[#FAF7F2] min-h-screen">
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow space-y-10">
        
        {/* Title Details */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1512] tracking-wide">
            Get in Touch
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#8C8682] max-w-md mx-auto">
            Have a question or need help? Send us a message and we'll get back to you shortly.
          </p>
        </div>

        {/* Contact Layout Grid (Form on left, details on right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
          
          {/* Left Column: Form Panel (7 cols on desktop) */}
          <div className="lg:col-span-7 bg-white border border-[#1C1512]/5 rounded-2xl p-6 sm:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {status !== "success" ? (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Name field */}
                  <div className="space-y-1.5 text-left">
                    <label className="font-sans text-[10px] font-bold text-[#1C1512] uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans font-semibold"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5 text-left">
                    <label className="font-sans text-[10px] font-bold text-[#1C1512] uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans font-semibold"
                    />
                  </div>

                  {/* Subject field */}
                  <div className="space-y-1.5 text-left">
                    <label className="font-sans text-[10px] font-bold text-[#1C1512] uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="What's this about?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans font-semibold"
                    />
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5 text-left">
                    <label className="font-sans text-[10px] font-bold text-[#1C1512] uppercase tracking-wider">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#1C1512]/10 rounded-lg text-sm focus:outline-none focus:border-[#B78A62] font-sans font-semibold resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="px-6 py-3 bg-[#B78A62] hover:bg-[#9E734D] text-white font-sans text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all duration-300 cursor-pointer flex items-center space-x-1.5 w-full sm:w-auto"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="contact-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 text-center space-y-6 max-w-sm mx-auto"
                >
                  <div className="flex justify-center">
                    <div className="p-3.5 bg-green-50 rounded-full text-green-600 border border-green-100 shadow-sm animate-bounce">
                      <CheckCircle className="h-12 w-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-[#1C1512]">
                      Message Sent!
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#8C8682] leading-relaxed font-semibold">
                      Thank you for getting in touch. We have received your message and will respond shortly.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-[#B78A62] text-white font-sans text-xs font-semibold rounded-lg hover:bg-[#9E734D] transition-colors cursor-pointer shadow-sm w-full"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Cards (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Info Cards Panel */}
            <div className="space-y-3.5">
              
              {/* WhatsApp Card */}
              <div className="bg-white border border-[#1C1512]/5 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full shadow-sm border border-emerald-100/50">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="font-sans text-left space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#1C1512]">WhatsApp</p>
                  <p className="text-xs font-bold text-[#B78A62]">+234 801 234 5678</p>
                  <p className="text-[10px] text-[#8C8682] font-semibold">Chat with us directly</p>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white border border-[#1C1512]/5 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-full shadow-sm border border-rose-100/50">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="font-sans text-left space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#1C1512]">Email</p>
                  <p className="text-xs font-bold text-[#B78A62]">hello@dorcyvogue.com</p>
                  <p className="text-[10px] text-[#8C8682] font-semibold">Send us an email</p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white border border-[#1C1512]/5 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-full shadow-sm border border-amber-100/50">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="font-sans text-left space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#1C1512]">Phone</p>
                  <p className="text-xs font-bold text-[#B78A62]">08012345678</p>
                  <p className="text-[10px] text-[#8C8682] font-semibold">Call us directly</p>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white border border-[#1C1512]/5 rounded-xl p-4 flex items-center space-x-4 shadow-sm">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-full shadow-sm border border-sky-100/50">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="font-sans text-left space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#1C1512]">Visit Us</p>
                  <p className="text-xs font-bold text-[#B78A62]">12 Lekki Phase 1, Lagos</p>
                  <p className="text-[10px] text-[#8C8682] font-semibold">Our location</p>
                </div>
              </div>

            </div>

            {/* Business Hours Card */}
            <div className="bg-white border border-[#1C1512]/5 rounded-xl p-6 shadow-sm space-y-4">
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#1C1512] border-b border-[#1C1512]/5 pb-3 text-left">
                Business Hours
              </h4>
              <div className="font-sans text-xs sm:text-sm space-y-2.5">
                <div className="flex justify-between py-1 border-b border-[#1C1512]/5 pb-2">
                  <span className="text-[#8C8682] font-semibold">Monday — Friday</span>
                  <span className="font-bold text-[#1C1512]">9:00 AM — 6:00 PM</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1C1512]/5 pb-2">
                  <span className="text-[#8C8682] font-semibold">Saturday</span>
                  <span className="font-bold text-[#1C1512]">10:00 AM — 4:00 PM</span>
                </div>
                <div className="flex justify-between py-1 last:border-b-0 pb-0">
                  <span className="text-[#8C8682] font-semibold">Sunday</span>
                  <span className="font-bold text-[#B78A62] uppercase tracking-wider text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-100">Closed</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      <CartDrawer onCheckout={() => {}} />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col pt-[80px] bg-[#FAF7F2] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B78A62]" />
        </div>
      }
    >
      <Navbar />
      <ContactPageContent />
      <CartDrawer onCheckout={() => {}} />
    </Suspense>
  );
}
