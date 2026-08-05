import React from "react";
import { ShieldCheck, Zap, Calendar, Lock, Sparkles } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    { icon: Zap, title: "No Brokerage", desc: "Zero hidden fees" },
    {
      icon: ShieldCheck,
      title: "Verified Owners",
      desc: "100% verified owners",
    },
    { icon: Calendar, title: "Instant Booking", desc: "Book visits instantly" },
    { icon: Lock, title: "Secure Agreements", desc: "Legally secure" },
    {
      icon: Sparkles,
      title: "AI Recommendations",
      desc: "Smart property matches",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-10">
      <div className="bg-[#EFEAE1] rounded-3xl p-8 sm:p-10 border border-[#E3D9CC] shadow-sm">
        <div className="max-w-xs mb-8">
          <h2 className="text-2xl font-extrabold text-[#2D1F1A]">
            Why Choose <br />
            <span className="text-[#8C5E47] font-serif italic font-normal">
              Ritam Homes?
            </span>
          </h2>
          <p className="text-xs text-[#6E5D53] mt-1 font-medium">
            Built for renters. Trusted by owners.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#F6F2EA] border border-[#E3D9CC] flex flex-col items-center shadow-2xs"
            >
              <div className="p-2.5 rounded-xl bg-[#EFEAE1] text-[#2D1F1A] mb-3 border border-[#E3D9CC]">
                <feat.icon className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-xs text-[#2D1F1A]">{feat.title}</h4>
              <p className="text-[10px] text-[#6E5D53] mt-1 font-medium">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
