import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Tenant Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Connect your backend API / Form submission logic here
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D1F1A] flex flex-col justify-between">


      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-grow">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-block px-3 py-1 bg-[#EBE3D5] border border-[#D5C9B8] rounded-full text-[10px] font-bold text-[#6E5D53] uppercase tracking-wider mb-3">
            Get In Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-black font-serif text-[#2D1F1A]">
            We're here to help.
          </h1>
          <p className="text-xs sm:text-sm text-[#6E5D53] mt-3 font-medium leading-relaxed">
            Have questions about listing a property or finding a home? Drop us a
            line and our team will get back to you within 24 hours.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Contact Details Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Contact Card 1: Direct Support */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#EADBCE] shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 bg-[#2D1F1A] text-[#C5924E] rounded-xl shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1F1A]">Email Us</h3>
                <p className="text-xs text-[#6E5D53] mt-1 font-medium">
                  Direct support for tenants & owners.
                </p>
                <a
                  href="mailto:support@yourdomain.com"
                  className="text-xs font-bold text-[#8C5E47] hover:underline mt-2 inline-block"
                >
                  support@yourdomain.com
                </a>
              </div>
            </div>

            {/* Contact Card 2: Phone */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#EADBCE] shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 bg-[#2D1F1A] text-[#C5924E] rounded-xl shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1F1A]">
                  Call or WhatsApp
                </h3>
                <p className="text-xs text-[#6E5D53] mt-1 font-medium">
                  Mon - Sat, 9am to 7pm IST.
                </p>
                <a
                  href="tel:+919876543210"
                  className="text-xs font-bold text-[#8C5E47] hover:underline mt-2 inline-block"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>

            {/* Contact Card 3: Office Location */}
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#EADBCE] shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 bg-[#2D1F1A] text-[#C5924E] rounded-xl shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D1F1A]">
                  Main Office
                </h3>
                <p className="text-xs text-[#6E5D53] mt-1 font-medium leading-relaxed">
                  Whitefield Main Rd, Near ITPL, Bangalore, Karnataka 560066
                </p>
              </div>
            </div>

            {/* Availability Notice */}
            <div className="p-4 bg-[#EBE3D5]/60 rounded-2xl border border-[#D5C9B8] flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#8C5E47] shrink-0" />
              <p className="text-[11px] font-semibold text-[#57463D]">
                Typical response time:{" "}
                <span className="font-extrabold text-[#2D1F1A]">
                  Under 2 hours
                </span>
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBCE] shadow-xl relative">
            {submitted ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#2D1F1A]">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-[#6E5D53]">
                  Thank you for reaching out. We will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold font-serif text-[#2D1F1A] mb-2 flex items-center gap-2">
                  Send us a Message{" "}
                  <MessageSquare className="w-4 h-4 text-[#C5924E]" />
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full p-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all"
                    />
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full p-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Input */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full p-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all"
                    />
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                      I am a...
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full p-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all cursor-pointer"
                    >
                      <option>Tenant looking for a home</option>
                      <option>Owner wanting to list property</option>
                      <option>General Support / Inquiry</option>
                    </select>
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help..."
                    className="w-full p-3 text-xs bg-[#FAF7F2] border border-[#E3D7C8] rounded-xl focus:outline-none focus:border-[#C5924E] transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#2D1F1A] text-white font-bold text-xs rounded-xl hover:bg-[#3E2E27] shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  Send Message <Send className="w-4 h-4 text-[#C5924E]" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* 
        NOTE: Place your global <Footer /> component here! 
      */}
    </div>
  );
}
