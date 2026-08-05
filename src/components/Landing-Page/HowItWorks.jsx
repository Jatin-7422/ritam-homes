import React from "react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      stepTag: "STEP 01",
      title: "Sign Up & Verify",
      desc: "Create your profile as a tenant or owner. Verify with Google or phone OTP in under a minute.",
      badgePos: "top",
      icon: "👤",
    },
    {
      num: "2",
      stepTag: "STEP 02",
      title: "Explore or List",
      desc: "Tenants browse verified homes. Owners list their property with real photos, pricing and slot availability.",
      badgePos: "left",
      icon: "🏠",
    },
    {
      num: "3",
      stepTag: "STEP 03",
      title: "Book a Slot",
      desc: "Request a visit time that works for you. The owner confirms — no random calls, no wasted trips.",
      badgePos: "right",
      icon: "📅",
    },
    {
      num: "4",
      stepTag: "STEP 04",
      title: "Connect Directly",
      desc: "Once the visit's confirmed, contact details unlock. Chat directly — no brokers, no commission.",
      badgePos: "left",
      icon: "💬",
    },
    {
      num: "5",
      stepTag: "STEP 05",
      title: "Move In",
      desc: "Finalise the rental and move in — fully hassle-free, with everything agreed on in writing.",
      badgePos: "right",
      icon: "🔑",
    },
  ];

  return (
    <section
      className="max-w-4xl mx-auto px-4 py-16 scroll-mt-20"
      id="how-it-works"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-[#2D1F1A] font-serif flex items-center justify-center gap-2">
          How It Works <span className="text-[#C5924E]">✦</span>
        </h2>
        <p className="text-xs text-[#6E5D53] mt-2 font-medium">
          Simple, transparent steps to land your perfect rental home.
        </p>
      </div>

      {/* Vertical Winding Road Container */}
      <div className="relative max-w-xl mx-auto py-6">
        {/* SVG Vertical Curved Road Line */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 400 1100"
            fill="none"
            preserveAspectRatio="none"
          >
            {/* Outer Road Border */}
            <path
              d="M 200,20 C 320,180 80,300 200,450 C 320,600 80,720 200,870 C 320,1000 200,1080 200,1080"
              stroke="#D8C8B4"
              strokeWidth="26"
              strokeLinecap="round"
            />
            {/* Main Cream Road Surface */}
            <path
              d="M 200,20 C 320,180 80,300 200,450 C 320,600 80,720 200,870 C 320,1000 200,1080 200,1080"
              stroke="#E8DAC8"
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Dashed Center Road Line */}
            <path
              d="M 200,20 C 320,180 80,300 200,450 C 320,600 80,720 200,870 C 320,1000 200,1080 200,1080"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeDasharray="8 8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Timeline Items */}
        <div className="space-y-16 relative z-10">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`flex items-center w-full ${
                step.badgePos === "top"
                  ? "flex-col justify-center"
                  : step.badgePos === "left"
                    ? "flex-row justify-center pl-4"
                    : "flex-row-reverse justify-center pr-4"
              }`}
            >
              {/* Number Badge */}
              <div
                className={`z-20 flex-shrink-0 w-11 h-11 rounded-full bg-[#2B1E19] text-[#F3EFE6] font-serif text-lg font-bold flex items-center justify-center shadow-lg ring-4 ring-[#FAF7F2] border border-[#3E2E27] ${
                  step.badgePos === "top"
                    ? "-mb-5"
                    : step.badgePos === "left"
                      ? "-mr-5"
                      : "-ml-5"
                }`}
              >
                {step.num}
              </div>

              {/* Content Card */}
              <div className="w-full max-w-xs bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-[#EADBCE] shadow-[0_10px_30px_-5px_rgba(45,31,26,0.08)] hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold tracking-widest text-[#C5924E] uppercase">
                    {step.stepTag}
                  </span>
                  <span className="text-xl">{step.icon}</span>
                </div>
                <h3 className="text-base font-bold text-[#2D1F1A] mb-2 font-serif">
                  {step.title}
                </h3>
                <p className="text-xs text-[#6E5D53] leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
