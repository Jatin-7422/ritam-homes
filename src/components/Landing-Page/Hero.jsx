import React from "react";
import { ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

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

        {/* Social Proof */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex -space-x-2">
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-[#F6F2EA] object-cover"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="Avatar"
            />
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-[#F6F2EA] object-cover"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
              alt="Avatar"
            />
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-[#F6F2EA] object-cover"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
              alt="Avatar"
            />
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-[#F6F2EA] object-cover"
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
              alt="Avatar"
            />
          </div>
          <div>
            <div className="flex text-amber-600 text-xs">★★★★★</div>
            <p className="text-[11px] font-semibold text-[#57463D]">
              Trusted by{" "}
              <span className="font-extrabold text-[#2D1F1A]">25,000+</span>{" "}
              happy tenants
            </p>
          </div>
        </div>
      </div>

      {/* Right Image Container */}
      <div className="lg:col-span-6 relative">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            alt="Luxury Home"
            className="w-full h-[430px] object-cover"
          />
        </div>

        {/* Top Overlay Badge */}
        <div
          style={{ backgroundColor: "rgba(246, 242, 234, 0.85)" }}
          className="absolute top-5 left-5 backdrop-blur-md p-3 px-4 rounded-2xl shadow-sm border border-white/60 flex items-center gap-3"
        >
          <div className="p-2 rounded-xl bg-[#EFEAE1] text-[#2D1F1A]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2D1F1A]">Verified Owners</p>
            <p className="text-[10px] text-[#6E5D53] font-medium">
              All owners verified for your safety
            </p>
          </div>
        </div>

        {/* Bottom Left Badge */}
        <div
          style={{ backgroundColor: "rgba(246, 242, 234, 0.85)" }}
          className="absolute bottom-16 left-5 backdrop-blur-md p-3 px-4 rounded-2xl shadow-sm border border-white/60 flex items-center gap-3"
        >
          <div className="p-2 rounded-xl bg-[#EFEAE1] text-[#2D1F1A]">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#2D1F1A]">Happy Tenants</p>
            <p className="text-[10px] text-[#6E5D53] font-medium">
              10,000+ and growing
            </p>
          </div>
        </div>

        {/* Price Floating Card */}
        <div
          style={{ backgroundColor: "rgba(246, 242, 234, 0.9)" }}
          className="absolute bottom-5 right-5 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/60 min-w-[190px]"
        >
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
