import React from "react";
import { Sparkles, Target, User, ShieldCheck, ArrowUpRight } from "lucide-react";

import shyamImg from "../../assets/Members/Shyam.PNG";
import cofounderImg from "../../assets/Members/SriRam.jpeg";
import Ledsoftwaredeveloper from "../../assets/Members/Jatin.png";
import BuisnessAnalyst from "../../assets/Members/Manoj.jpeg";
import StrategyAnalyst from "../../assets/Members/Aditya.PNG";

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Shyam Raj",
      role: "Founder & CEO",
      desc: "Leads product, strategy, and overall vision.",
      image: shyamImg,
    },
    {
      name: "Sri Ram",
      role: "Co-Founder & Developer",
      desc: "Builds and scales the platform architecture end-to-end.",
      image: cofounderImg,
      imagePosition: "object-[center_25%]",
    },
    {
      name: "Jatin",
      role: "Lead Software Developer",
      desc: "Drives core engineering and technical implementations.",
      image: Ledsoftwaredeveloper,
    },
    {
      name: "Manoj",
      role: "Business Analyst",
      desc: "Analyzes market trends and optimizes operational metrics.",
      image: BuisnessAnalyst,
      imagePosition: "object-[center_20%]",
    },
    {
      name: "Aditya",
      role: "Strategy Analyst",
      desc: "Shapes long-term growth and business positioning.",
      image: StrategyAnalyst,
      imagePosition: "object-[center_75%]",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-16 scale-95 sm:scale-100 origin-center transition-transform" id="about">
      
      {/* ----------------- SECTION 1: ABOUT US ----------------- */}
      <div className="space-y-8">
        {/* Section Title Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D1F1A]/5 border border-[#2D1F1A]/10 text-[#A27357] text-[10px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-3 h-3 text-[#C5924E]" /> Our Philosophy
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2D1F1A] font-serif tracking-tight">
            Why We Built Ritam Homes
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5D53] font-medium leading-relaxed">
            A dedicated team working to make renting feel safe again — starting in our own city.
          </p>
        </div>

        {/* Vision & Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Our Vision Card */}
          <div className="group relative bg-[#FAF7F2] hover:bg-[#F5F0E6] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5924E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#2D1F1A] text-[#FAF8F5] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4 text-[#C5924E]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-[#2D1F1A] font-serif tracking-tight">
                  Our Vision
                </h3>
                <p className="text-xs text-[#6E5D53] font-medium leading-relaxed">
                  To eliminate the fear from finding a home — for every landlord, every tenant, across every city in India.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#EADBCE]/50 flex items-center gap-1.5 text-[11px] font-bold text-[#A27357]">
              <ShieldCheck className="w-3.5 h-3.5" /> Zero Brokerage Standard
            </div>
          </div>

          {/* Our Mission Card */}
          <div className="group relative bg-[#FAF7F2] hover:bg-[#F5F0E6] border border-[#EADBCE] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5924E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-[#2D1F1A] text-[#FAF8F5] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4 text-[#C5924E]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-[#2D1F1A] font-serif tracking-tight">
                  Our Mission
                </h3>
                <p className="text-xs text-[#6E5D53] font-medium leading-relaxed">
                  To make every listing verified, every visit scheduled, and every deal transparent — so tenants never fear a scam, and owners never fear a stranger.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-[#EADBCE]/50 flex items-center gap-1.5 text-[11px] font-bold text-[#A27357]">
              <Sparkles className="w-3.5 h-3.5" /> 100% Authenticated Deals
            </div>
          </div>

        </div>
      </div>

      {/* ----------------- SECTION 2: THE TEAM ----------------- */}
      <div className="space-y-8 pt-4">
        {/* Section Subtitle */}
        <div className="text-center sm:text-left space-y-1">
          <span className="text-[10px] font-black tracking-widest text-[#A27357] uppercase block">
            THE TEAM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D1F1A] font-serif tracking-tight">
            Meet the People Behind It
          </h2>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="group relative bg-[#FAF7F2] hover:bg-[#F5F0E6] border border-[#EADBCE] rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Profile Photo Container */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#2D1F1A] text-[#EFEAE1] flex flex-col items-center justify-center shadow-md border-2 border-[#C5924E]/40 group-hover:border-[#C5924E] group-hover:scale-105 transition-all duration-300 overflow-hidden">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${member.imagePosition || "object-center"}`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <User className="w-5 h-5 mb-1 text-[#C5924E]" />
                    <span className="text-[8px] font-bold tracking-wider text-[#EFEAE1] uppercase">
                      ADD PHOTO
                    </span>
                  </div>
                )}
              </div>

              {/* Text Details */}
              <div className="space-y-1 w-full">
                <h4 className="text-xs sm:text-sm font-extrabold text-[#2D1F1A] font-serif group-hover:text-[#C5924E] transition-colors">
                  {member.name}
                </h4>
                <p className="text-[10px] font-bold tracking-wider text-[#A27357] uppercase">
                  {member.role}
                </p>
                <p className="text-[10px] text-[#6E5D53] font-medium leading-relaxed pt-1.5 border-t border-[#EADBCE]/50">
                  {member.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}