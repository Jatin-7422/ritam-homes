import React, { useState } from "react";
import { Zap, ShieldCheck, Calendar, Lock, Sparkles, X, ArrowUpRight } from "lucide-react";

export default function WhyChooseUs() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [attemptedFeature, setAttemptedFeature] = useState("");

  const features = [
    { 
      icon: Zap, 
      title: "No Brokerage", 
      desc: "Zero hidden fees & direct savings on every transaction.", 
      tag: "Save Money",
      action: "explore zero brokerage options" 
    },
    {
      icon: ShieldCheck,
      title: "Verified Owners",
      desc: "100% background-checked authentic property owners.",
      tag: "Trusted",
      action: "view verified owner profiles",
    },
    { 
      icon: Calendar, 
      title: "Instant Booking", 
      desc: "Schedule and confirm home visits in seconds.", 
      tag: "Fast",
      action: "schedule instant property visits" 
    },
    { 
      icon: Lock, 
      title: "Secure Agreements", 
      desc: "Legally compliant digital rental paperwork.", 
      tag: "Safe",
      action: "explore legally secure agreements" 
    },
    {
      icon: Sparkles,
      title: "AI Recommendations",
      desc: "Smart proprietary AI matching your exact taste.",
      tag: "Smart Tech",
      action: "access AI smart property matches",
    },
  ];

  const handleFeatureClick = (actionName) => {
    setAttemptedFeature(actionName);
    setShowAuthModal(true);
  };

  return (
    <section className="w-full min-h-0 py-0 font-sans relative flex items-center">
      {/* Full-width container with reduced padding to eliminate large vertical gaps */}
      <div className="w-full rounded-none px-4 py-6 sm:p-16 overflow-hidden bg-gradient-to-br from-[#2D1F1A] via-[#241713] to-[#1A100D] border-y border-[#C5924E]/30 shadow-2xl relative">
        
        {/* Abstract Glow Accents */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#C5924E]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-[#8C5E47]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-16 relative z-10 space-y-2 sm:space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#C5924E]/15 border border-[#C5924E]/30 text-[#C5924E] text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-3 h-3 animate-pulse" /> The Ritam Advantage
          </div>
          <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Why Modern Renters Choose <br className="hidden sm:inline" />
            <span className="text-[#C5924E] font-serif italic font-normal">
              Ritam Homes
            </span>
          </h2>
          <p className="text-xs sm:text-base text-[#D5C9B8] font-normal leading-relaxed px-2 sm:px-0">
            Find the right home with the right people & the right medium with us.
          </p>
        </div>

        {/* Grid Layout with Sharp-Edged Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 relative z-10">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            const isLastMobileFull = idx === 4 ? "col-span-2 sm:col-span-1" : "col-span-1";
            
            return (
              <div
                key={idx}
                onClick={() => handleFeatureClick(feat.action)}
                className={`group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-[#C5924E]/60 rounded-none p-3.5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between shadow-xl overflow-hidden backdrop-blur-xl ${isLastMobileFull}`}
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5924E] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-3 sm:mb-6">
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-none bg-[#C5924E]/15 text-[#C5924E] flex items-center justify-center border border-[#C5924E]/30 group-hover:scale-105 group-hover:bg-[#C5924E] group-hover:text-[#2D1F1A] transition-all duration-300 shadow-inner">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#C5924E]/90 bg-[#C5924E]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-none border border-[#C5924E]/20">
                      {feat.tag}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-base text-white mb-1 sm:mb-2 group-hover:text-[#C5924E] transition-colors">
                    {feat.title}
                  </h4>
                </div>

                <p className="text-[11px] sm:text-xs text-[#D5C9B8]/70 font-medium leading-relaxed mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-white/5 group-hover:text-[#D5C9B8] transition-colors line-clamp-2 sm:line-clamp-none">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Action Button */}
        <div className="flex justify-center mt-6 sm:mt-12 relative z-10">
          <button 
            onClick={() => handleFeatureClick("explore all platform features")}
            className="group flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#C5924E] text-[#2D1F1A] rounded-none text-xs font-black hover:bg-white transition-all cursor-pointer shadow-xl active:scale-95"
          >
            Explore All Benefits 
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#2D1F1A] border border-[#C5924E]/40 text-white w-full max-w-md p-6 sm:p-8 rounded-none shadow-2xl relative space-y-5 sm:space-y-6">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-none bg-white/10 hover:bg-white/20 text-[#D5C9B8] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-none bg-[#C5924E]/20 border border-[#C5924E]/40 flex items-center justify-center text-[#C5924E] mx-auto shadow-inner">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">Authentication Required</h3>
              <p className="text-xs sm:text-sm text-[#D5C9B8] leading-relaxed">
                Please log in or create an account to continue and <span className="text-white font-semibold">{attemptedFeature}</span>.
              </p>
            </div>

            <div className="pt-2 space-y-2.5 sm:space-y-3">
              <button
                onClick={() => {
                  alert("Redirecting to login / signup...");
                  setShowAuthModal(false);
                }}
                className="w-full py-3 sm:py-3.5 rounded-none bg-[#C5924E] text-[#2D1F1A] text-xs sm:text-sm font-black hover:opacity-90 transition-all cursor-pointer shadow-lg"
              >
                Log In / Sign Up Now
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2.5 sm:py-3 rounded-none bg-white/5 border border-white/10 hover:bg-white/10 text-[#D5C9B8] text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}