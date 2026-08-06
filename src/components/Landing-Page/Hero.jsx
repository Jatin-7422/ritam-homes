import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

// 1. Import your image from the assets folder
import heroImage from "../../assets/bg.jpg"; // Adjust filename and extension (.png/.webp) as needed

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-8 pt-8 pb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Left Content */}
      <div className="lg:col-span-6 space-y-5">
        <div className="inline-block px-3 py-1 bg-[#EBE3D5] border border-[#D5C9B8] rounded-full text-[10px] font-bold text-[#6E5D53] uppercase tracking-wider">
          Homes You Can Actually Trust
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#2D1F1A] leading-[1.1] tracking-tight">
          Renting a home, <br />
          <span className="font-serif italic font-normal text-[#8C5E47]">
            the smart way.
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-[#6E5D53] max-w-md leading-relaxed font-medium">
          Verified owners. Real listings. Zero brokerage. <br />
          Book visits, connect & move in — hassle-free.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            style={{ backgroundColor: "#2D1F1A", color: "#FFFFFF" }}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs hover:opacity-90 shadow-md transition-all"
          >
            Explore Properties <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-6 py-3.5 rounded-xl border border-[#D5C9B8] bg-[#EFEAE1] text-[#2D1F1A] font-bold text-xs hover:bg-white transition-all">
            List Your Property
          </button>
        </div>
      </div>

      {/* Right Image Container */}
      <div className="lg:col-span-6 relative">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          {/* 2. Use the imported image variable here */}
          <img
            src={heroImage}
            alt="Property Exterior"
            className="w-full h-[430px] object-cover"
          />
        </div>

        {/* Top Overlay Badge (Floating Glassmorphism) */}
        <div className="absolute top-5 left-5 bg-white/30 backdrop-blur-md p-3 px-4 rounded-2xl shadow-xl border border-white/40 flex items-center gap-3 animate-bounce [animation-duration:4s]">
          <div className="p-2 rounded-xl bg-[#2D1F1A]/10 text-[#2D1F1A]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2D1F1A]">Verified Owners</p>
            <p className="text-[10px] text-[#57463D] font-medium">
              All owners verified for your safety
            </p>
          </div>
        </div>

        {/* Price Floating Card (Floating Glassmorphism) */}
        <div className="absolute bottom-5 right-5 bg-white/35 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 min-w-[190px] animate-bounce [animation-duration:5s]">
          <div className="text-lg font-black text-[#2D1F1A]">
            ₹22,000{" "}
            <span className="text-xs font-normal text-[#6E5D53]">/month</span>
          </div>
          <div className="mt-1 text-xs space-y-1 text-[#57463D] font-medium">
            <p>🏢 2 BHK</p>
            <p>📍 Whitefield, Bangalore</p>
            <p className="text-emerald-700 font-bold pt-0.5">
              🟢 Available Today
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
