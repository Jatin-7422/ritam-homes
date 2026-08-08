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
  ShieldCheck,
  UserCheck,
  Tag,
  Headphones,
  CheckCircle2,
  AlertCircle,
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
      // 🔑 Replace these with your actual EmailJS credentials
      const serviceID = "service_mjzfobu";
      const templateID = "template_oss25wf";
      const publicKey = "0wrRljuwKzAP6sMcf";

      // 🎯 Parameters mapping to your EmailJS template variables
      const templateParams = {
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

  return (
    <div className="relative min-h-screen pt-28 pb-16 font-sans overflow-hidden bg-[#2D1F1A]">
      {/* 1. COVER BACKGROUND */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        {/* Mobile Background Image (Visible as-is without cropping) */}
        <img
          src={contactBgMobile}
          alt="Ritam Homes Mobile Exterior"
          className="block md:hidden w-full h-full object-contain object-top"
        />

        {/* Desktop Background Image */}
        <img
          src={contactBg}
          alt="Ritam Homes Exterior"
          className="hidden md:block w-full h-full object-cover object-center"
        />

        {/* Backdrop overlay for enhanced content contrast */}
        <div className="absolute inset-0 bg-[#F9F6F0]/60 backdrop-blur-[3px]" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* HEADER SECTION */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#EFEAE1]/90 backdrop-blur-md border border-[#2D1F1A]/10 text-xs font-bold text-[#8C5E47] uppercase tracking-wider shadow-sm">
            Get In Touch
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#2D1F1A] tracking-tight drop-shadow-sm">
            We’re here to{" "}
            <span className="font-serif italic text-[#C5924E]">help.</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#3E2B24] font-semibold leading-relaxed px-2">
            Have questions about listing a property or finding a home?{" "}
            <br className="hidden sm:inline" />
            Drop us a line and our team will get back to you within 24 hours.
          </p>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start mb-12 lg:mb-16">
          {/* LEFT CARDS: CONTACT OPTIONS */}
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
            {/* Email Us */}
            <a
              href="mailto:support@ritamhomes.com"
              className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#2D1F1A]/10 hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="p-3 rounded-xl bg-[#2D1F1A] text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D1F1A]">Email Us</h3>
                  <p className="text-xs text-[#5A4A42]">
                    Direct support for tenants & owners
                  </p>
                  <p className="text-xs font-bold text-[#8C5E47] mt-0.5">
                    support@ritamhomes.com
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2D1F1A]/40 group-hover:translate-x-1 group-hover:text-[#8C5E47] transition-all" />
            </a>

            {/* Call or WhatsApp */}
            <a
              href="tel:+919876543210"
              className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#2D1F1A]/10 hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="p-3 rounded-xl bg-[#2D1F1A] text-white shadow-sm group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D1F1A]">
                    Call or WhatsApp
                  </h3>
                  <p className="text-xs text-[#5A4A42]">
                    Mon - Sat, 9am to 7pm IST
                  </p>
                  <p className="text-xs font-bold text-[#8C5E47] mt-0.5">
                    +91 98765 43210
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#2D1F1A]/40 group-hover:translate-x-1 group-hover:text-[#8C5E47] transition-all" />
            </a>

            {/* Visit Our Office */}
            <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-[#2D1F1A]/10 shadow-sm">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <div className="p-3 rounded-xl bg-[#2D1F1A] text-white shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D1F1A]">
                    Visit Our Office
                  </h3>
                  <p className="text-xs text-[#5A4A42] leading-relaxed">
                    Ritam Homes, Whitefield Main Rd, <br />
                    Near ITPL, Bangalore, Karnataka 560066
                  </p>
                </div>
              </div>
            </div>

            {/* Response Time Badge */}
            <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-md border border-[#2D1F1A]/10 flex items-center gap-3.5 shadow-sm">
              <div className="p-2.5 rounded-xl bg-[#2D1F1A] text-[#C5924E]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D1F1A]">
                  Response Time
                </p>
                <p className="text-xs text-[#5A4A42]">
                  We typically respond within{" "}
                  <span className="font-bold text-[#8C5E47]">
                    Under 2 hours
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: MESSAGE FORM */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl p-5 sm:p-8 rounded-3xl border border-[#2D1F1A]/10 shadow-2xl">
            <h2 className="text-lg font-bold text-[#2D1F1A] flex items-center gap-2 mb-5">
              Send us a Message{" "}
              <MessageSquare className="w-4 h-4 text-[#8C5E47]" />
            </h2>

            {isSubmitted && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Thank you! Your message has been sent successfully.
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] placeholder-[#5A4A42]/50 focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
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
                    className="w-full px-4 py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] placeholder-[#5A4A42]/50 focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    className="w-full px-4 py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] placeholder-[#5A4A42]/50 focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
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
                    className="w-full px-4 py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all"
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
                  className="w-full px-4 py-3 rounded-xl bg-[#F9F6F0] border border-[#2D1F1A]/10 text-xs text-[#2D1F1A] placeholder-[#5A4A42]/50 focus:outline-none focus:border-[#C5924E] focus:ring-1 focus:ring-[#C5924E] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#2D1F1A] hover:bg-[#422e27] active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <Send className="w-3.5 h-3.5 text-[#C5924E]" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-[#5A4A42] font-semibold">
                <Lock className="w-3 h-3 text-[#5A4A42]" /> Your information is
                safe with us. We never share your details.
              </div>
            </form>
          </div>
        </div>

        {/* BOTTOM TRUST FEATURES BAR */}
        <div className="bg-white/85 backdrop-blur-xl rounded-2xl border border-[#2D1F1A]/10 p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5 text-left shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#8C5E47] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#2D1F1A]">
                Trusted by Thousands
              </p>
              <p className="text-[10px] text-[#5A4A42] font-medium">
                25,000+ happy tenants across India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-[#2D1F1A]/10 pt-3 sm:pt-0 sm:pl-4">
            <UserCheck className="w-5 h-5 text-[#8C5E47] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#2D1F1A]">
                Verified Owners
              </p>
              <p className="text-[10px] text-[#5A4A42] font-medium">
                Every listing verified for your safety
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-[#2D1F1A]/10 pt-3 md:pt-0 md:pl-4">
            <Tag className="w-5 h-5 text-[#8C5E47] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#2D1F1A]">
                No Hidden Charges
              </p>
              <p className="text-[10px] text-[#5A4A42] font-medium">
                Zero brokerage. What you see is what you pay.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-[#2D1F1A]/10 pt-3 md:pt-0 md:pl-4">
            <Headphones className="w-5 h-5 text-[#8C5E47] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#2D1F1A]">
                Dedicated Support
              </p>
              <p className="text-[10px] text-[#5A4A42] font-medium">
                Real people. Real support. Always here to help.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-[#2D1F1A]/10 pt-3 md:pt-0 md:pl-4 sm:col-span-2 md:col-span-1">
            <Lock className="w-5 h-5 text-[#8C5E47] shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#2D1F1A]">
                Secure & Private
              </p>
              <p className="text-[10px] text-[#5A4A42] font-medium">
                We respect your privacy and protect your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
