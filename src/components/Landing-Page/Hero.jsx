import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Home,
  Tag,
  CalendarCheck,
  Users,
  Shield,
} from "lucide-react";

// Import your image asset
import heroImage from "../../assets/newbg.png"; // Adjust filename as needed

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center pt-24 pb-12 overflow-hidden font-sans">
      {/* 1. FULL BACKGROUND IMAGE & DARK OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Ritam Homes Exterior"
          className="w-full h-full object-cover object-center"
        />
        {/* Darkening overlays for high text contrast */}
        <div className="absolute inset-0 bg-[#2D1F1A]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D1F1A] via-transparent to-[#2D1F1A]/60" />
      </div>

      {/* 2. MAIN HERO CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col justify-between min-h-[80vh]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tag Badge */}
            <div className="inline-block px-3.5 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-bold text-[#C5924E] uppercase tracking-wider shadow-sm">
              Homes You Can Actually Trust
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.08] tracking-tight">
              Renting a home, <br />
              <span className="font-serif italic font-normal text-[#C5924E]">
                the smart way.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#D5C9B8] max-w-lg leading-relaxed font-medium">
              Verified owners. Real listings. Zero brokerage. <br />
              Book visits, connect & move in — hassle-free.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#properties"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs bg-[#C5924E] hover:bg-[#b08040] text-black shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                Explore Properties <ArrowRight className="w-4 h-4 text-black" />
              </a>

              <Link
                to="/signup"
                className="px-6 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md text-white font-bold text-xs hover:bg-white/20 transition-all active:scale-95 text-center cursor-pointer"
              >
                List Your Property
              </Link>
            </div>
          </div>

          {/* Right Floating Card Overlay */}
          <div className="lg:col-span-4 hidden lg:flex flex-col gap-4 items-end">
            {/* Top Badge */}
            <div className="bg-black/40 backdrop-blur-md p-3.5 px-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 animate-bounce [animation-duration:4s]">
              <div className="p-2 rounded-xl bg-[#C5924E]/20 text-[#C5924E]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Verified Owners</p>
                <p className="text-[10px] text-[#D5C9B8] font-medium">
                  100% verified properties
                </p>
              </div>
            </div>

            {/* Featured Property Card */}
            <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 min-w-[220px]">
              <div className="text-xl font-black text-white">
                ₹22,000{" "}
                <span className="text-xs font-normal text-[#D5C9B8]">
                  /month
                </span>
              </div>
              <div className="mt-2 text-xs space-y-1 text-[#D5C9B8] font-medium">
                <p>🏢 2 BHK Apartment</p>
                <p>📍 Whitefield, Bangalore</p>
                <p className="text-emerald-400 font-bold pt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Available Today
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. TRUST FEATURE BAR ACROSS THE BOTTOM */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-8 pb-4 border-t border-white/15 mt-12">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Verified Owners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 sm:border-l border-white/15 sm:pl-4">
            <Home className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Real Listings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 md:border-l border-white/15 md:pl-4">
            <Tag className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Zero Brokerage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 sm:border-l border-white/15 sm:pl-4">
            <CalendarCheck className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Book Visits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 md:border-l border-white/15 md:pl-4">
            <Users className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Direct Connect
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 sm:border-l border-white/15 sm:pl-4">
            <Shield className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Hassle-Free
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
