import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Mail,
  PhoneCall,
  MapPin,
  Clock,
  ChevronRight,
  MessageSquare,
  Send,
  Lock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";

// Background Images
import contactBg from "../../assets/bg2.jpg"; // Desktop background
import contactBgMobile from "../../assets/mobileview.jpg"; // Mobile background

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Tenant looking for a home",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const COMPANY_EMAIL = "ritamhomes2026@gmail.com";
  const COMPANY_WHATSAPP = "919876543210"; // Replace with your complete WhatsApp phone number with country code

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const serviceID = "service_mjzfobu";
      const templateID = "template_oss25wf";
      const publicKey = "0wrRljuwKzAP6sMcf";

      const templateParams = {
        to_email: COMPANY_EMAIL,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "Not provided",
        role: formData.role,
        message: formData.message,
        time: new Date().toLocaleString(),
      };

      await emailjs.send(serviceID, templateID, templateParams, publicKey);

      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Tenant looking for a home",
        message: "",
      });

      // Reset success banner after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      console.error("EmailJS Error:", err);
      setIsSubmitting(false);
      setErrorMessage(
        `Failed to send: ${err.text || "Check console for details."}`,
      );
    }
  };

  // Function to open Gmail Web Compose directly in a new browser tab
  const handleEmailClick = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("Enquiry from Ritam Homes Website");
    const body = encodeURIComponent(
      "Hi Ritam Homes Team,\n\nI would like to get in touch regarding:\n"
    );
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${COMPANY_EMAIL}&su=${subject}&body=${body}`,
      "_blank"
    );
  };

  // Function to open WhatsApp chat directly with a pre-filled message
  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    const text = encodeURIComponent(
      "Hello Ritam Homes, I have an inquiry regarding your properties."
    );
    window.open(`https://wa.me/${COMPANY_WHATSAPP}?text=${text}`, "_blank");
  };

  return (
    <div className="relative min-h-screen pt-20 sm:pt-28 pb-12 sm:pb-16 font-sans overflow-hidden bg-[#2D1F1A]">
      {/* 1. COVER BACKGROUND */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        {/* Mobile Background Image */}
        <img
          src={contactBgMobile}
          alt="Ritam Homes Mobile Exterior"
          className="block md:hidden w-full h-full object-cover object-center"
        />

        {/* Desktop Background Image */}
        <img
          src={contactBg}
          alt="Ritam Homes Exterior"
          className="hidden md:block w-full h-full object-cover object-center"
        />

        {/* Backdrop overlay for enhanced content contrast */}
        <div className="absolute inset-0 bg-[#F9F6F0]/75 md:bg-[#F9F6F0]/60 backdrop-blur-[3px]" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 md:px-12">
        {/* HEADER SECTION */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2.5 sm:space-y-3">
          <div className="inline-block px-3.5 py-1 rounded-full bg-[#EFEAE1]/90 backdrop-blur-md border border-[#2D1F1A]/10 text-[10px] sm:text-xs font-bold text-[#8C5E47] uppercase tracking-wider shadow-sm">
            Get In Touch
          </div>

          <h1 className="text-2xl sm:text-5xl font-black text-[#2D1F1A] tracking-tight drop-shadow-sm">
            We’re here to{" "}
            <span className="font-serif italic text-[#C5924E]">help.</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#3E2B24] font-semibold leading-relaxed px-1 sm:px-2">
            Have questions about listing a property or finding a home?{" "}
            <br className="hidden sm:inline" />
            Drop us a line and our team will get back to you within 24 hours.
          </p>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start mb-8 lg:mb-16">
          {/* LEFT CARDS: CONTACT OPTIONS */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            {/* Email Us */}
            <button
              onClick={handleEmailClick}
              className="w-full text-left group flex items-center justify-between p-3.5 sm:p-5 rounded-2xl bg-white/85 sm:bg-white/80 backdrop-blur-md border border-[#2D1F1A]/10 hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#2D1F1A] text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-[#2D1F1A]">
                    Email Us
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5A4A42] truncate">
                    Direct support for tenants & owners
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold text-[#8C5E47] mt-0.5 truncate">
                    {COMPANY_EMAIL}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D1F1A]/40 group-hover:translate-x-1 group-hover:text-[#8C5E47] transition-all shrink-0 ml-2" />
            </button>

            {/* Call or WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <a
                href="tel:+919876543210"
                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/85 sm:bg-white/80 backdrop-blur-md border border-[#2D1F1A]/10 hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#2D1F1A] text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#2D1F1A]">Call Us</h3>
                    <p className="text-[11px] font-bold text-[#8C5E47] mt-0.5">
                      +91 98765 43210
                    </p>
                  </div>
                </div>
              </a>

              <button
                onClick={handleWhatsAppClick}
                className="group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/85 sm:bg-white/80 backdrop-blur-md border border-[#2D1F1A]/10 hover:bg-white hover:shadow-lg transition-all duration-200 cursor-pointer text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#2D1F1A]">WhatsApp</h3>
                    <p className="text-[11px] font-bold text-emerald-700 mt-0.5">
                      Chat Now
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Visit Our Office */}
            <div className="flex items-center justify-between p-3.5 sm:p-5 rounded-2xl bg-white/85 sm:bg-white/80 backdrop-blur-md border border-[#2D1F1A]/10 shadow-sm">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#2D1F1A] text-white shadow-sm shrink-0 mt-0.5 sm:mt-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#2D1F1A]">
                    Visit Our Office
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#5A4A42] leading-relaxed">
                    Ritam Homes, Whitefield Main Rd, <br />
                    Near ITPL, Bangalore, Karnataka 560066
                  </p>
                </div>
              </div>
            </div>

            {/* Response Time Badge */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/90 sm:bg-white/85 backdrop-blur-md border border-[#2D1F1A]/10 flex items-center gap-3 sm:gap-3.5 shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#2D1F1A] text-[#C5924E] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D1F1A]">
                  Response Time
                </p>
                <p className="text-[11px] sm:text-xs text-[#5A4A42]">
                  We typically respond within{" "}
                  <span className="font-bold text-[#8C5E47]">
                    Under 2 hours
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: MESSAGE FORM */}
          <div className="lg:col-span-7 bg-white/95 sm:bg-white/90 backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#2D1F1A]/10 shadow-2xl">
            <h2 className="text-base sm:text-lg font-bold text-[#2D1F1A] flex items-center gap-2 mb-4 sm:mb-5">
              Send us a Message{" "}
              <MessageSquare className="w-4 h-4 text-[#8C5E47]" />
            </h2>

            {isSubmitted && (
              <div className="mb-4 p-3 sm:p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Thank you! Your message has been sent successfully to {COMPANY_EMAIL}.
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3 sm:p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1F1A] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] placeholder-[#5A4A42]/50 focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1F1A] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] placeholder-[#5A4A42]/50 focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1F1A] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] placeholder-[#5A4A42]/50 focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1F1A] mb-1">
                    I Am A... *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
                  >
                    <option value="Tenant looking for a home">
                      Tenant looking for a home
                    </option>
                    <option value="Owner listing a property">
                      Owner listing a property
                    </option>
                    <option value="General Enquiry">General Enquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#2D1F1A] mb-1">
                  Your Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us how we can help..."
                  required
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] placeholder-[#5A4A42]/50 focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-[#2D1F1A] hover:bg-[#422e27] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <Send className="w-3.5 h-3.5 text-[#C5924E]" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-1 sm:pt-2 text-[10px] text-[#5A4A42] font-semibold text-center">
                <Lock className="w-3 h-3 text-[#5A4A42] shrink-0" /> Your information is
                safe with us. We never share your details.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}