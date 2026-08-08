import React from "react";
import { Sparkles, Target, User } from "lucide-react";

import shyamImg from "../../assets/Members/Shyam.PNG";
import cofounderImg from "../../assets/Members/SriRam.jpeg";
import Ledsoftwaredeveloper from "../../assets/Members/Jatin.PNG";
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
      imagePosition: "object-[center_25%]", // Shifted a little higher in the frame
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
      imagePosition: "object-[center_20%]", // Shifted higher to fit better
    },
    {
      name: "Aditya",
      role: "Strategy Analyst",
      desc: "Shapes long-term growth and business positioning.",
      image: StrategyAnalyst,
      imagePosition: "object-[center_75%]", // Shifted a little lower in the frame
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 space-y-20" id="about">
      {/* ----------------- SECTION 1: ABOUT US ----------------- */}
      <div className="space-y-8">
        {/* Section Title Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-extrabold tracking-widest text-[#A27357] uppercase block">
            ABOUT US
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2D1F1A] font-serif">
            Why We Built Ritam Homes
          </h2>
          <p className="text-xs sm:text-sm text-[#6E5D53] font-medium leading-relaxed">
            A dedicated team working to make renting feel safe again — starting
            in our own city.
          </p>
        </div>

        {/* Vision & Mission Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Our Vision Card */}
          <div className="bg-[#EFEAE1]/70 border border-[#E2D9CC] rounded-2xl p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-10 h-10 rounded-xl bg-[#2D1F1A] text-[#FAF8F5] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-[#C5924E]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#2D1F1A] font-serif">
                Our Vision
              </h3>
              <p className="text-xs text-[#6E5D53] font-medium leading-relaxed">
                To eliminate the fear from finding a home — for every landlord,
                every tenant, across every city in India.
              </p>
            </div>
          </div>

          {/* Our Mission Card */}
          <div className="bg-[#EFEAE1]/70 border border-[#E2D9CC] rounded-2xl p-8 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-10 h-10 rounded-xl bg-[#2D1F1A] text-[#FAF8F5] flex items-center justify-center shadow-sm">
              <Target className="w-5 h-5 text-[#C5924E]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#2D1F1A] font-serif">
                Our Mission
              </h3>
              <p className="text-xs text-[#6E5D53] font-medium leading-relaxed">
                To make every listing verified, every visit scheduled, and every
                deal transparent — so tenants never fear a scam, and owners
                never fear a stranger.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- SECTION 2: THE TEAM ----------------- */}
      <div className="space-y-10 pt-4">
        {/* Section Subtitle */}
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold tracking-widest text-[#A27357] uppercase block">
            THE TEAM
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D1F1A] font-serif">
            Meet the People Behind It
          </h2>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center space-y-3 group"
            >
              {/* Profile Photo Container */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#2D1F1A] text-[#EFEAE1] flex flex-col items-center justify-center shadow-md border-4 border-white group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover ${member.imagePosition || "object-center"}`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <User className="w-6 h-6 mb-1 text-[#C5924E]" />
                    <span className="text-[9px] font-bold tracking-wider text-[#EFEAE1] uppercase">
                      ADD PHOTO
                    </span>
                  </div>
                )}
              </div>

              {/* Text Details */}
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-[#2D1F1A] font-serif">
                  {member.name}
                </h4>
                <p className="text-[10px] font-bold text-[#A27357]">
                  {member.role}
                </p>
                <p className="text-[10px] text-[#6E5D53] font-medium leading-normal max-w-[170px] mx-auto">
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
