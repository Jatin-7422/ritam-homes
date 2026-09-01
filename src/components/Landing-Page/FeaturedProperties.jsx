import React, { useState } from "react";
import { Heart, ChevronRight, PlusCircle, LayoutDashboard, X, AlertCircle } from "lucide-react";

export default function FeaturedProperties({ isHostMode, isLoggedIn }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState("");

  const properties = [
    {
      title: "Luxury Apartment",
      loc: "Koramangala, Bangalore",
      price: "₹22,000",
      specs: "2 BHK • 1200 sq.ft",
      rating: "4.8",
      img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Cozy 1BHK Flat",
      loc: "Indiranagar, Bangalore",
      price: "₹15,000",
      specs: "1 BHK • 650 sq.ft",
      rating: "4.6",
      img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Spacious Home",
      loc: "Whitefield, Bangalore",
      price: "₹28,000",
      specs: "3 BHK • 1600 sq.ft",
      rating: "4.9",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Premium House",
      loc: "HSR Layout, Bangalore",
      price: "₹45,000",
      specs: "4 BHK • 2500 sq.ft",
      rating: "4.9",
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const handleCardClick = (itemTitle) => {
    if (!isLoggedIn) {
      setAttemptedAction(`View details and connect with owner for ${itemTitle}`);
      setShowAuthModal(true);
      return;
    }
    
    if (isHostMode) {
      alert(`Managing inquiries for your property: ${itemTitle}`);
    } else {
      alert(`Opening details for ${itemTitle}`);
    }
  };

  const handleAddListingClick = () => {
    if (!isLoggedIn) {
      setAttemptedAction("List your property on Ritam Homes");
      setShowAuthModal(true);
      return;
    }
    alert("Open New Listing Modal");
  };

  return (
    <section className="w-full py-10 bg-[#2D1F1A]/5 relative overflow-hidden" id="properties">
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll 18s linear infinite;
        }
        .animate-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D1F1A] flex items-center gap-2">
              {isHostMode ? "Your Active Listings" : "Featured Properties"} <span className="text-[#8C5E47]">✦</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5D53] mt-1">
              {isHostMode
                ? "Manage, update or check booking requests for your properties from your unified owner hub."
                : "Handpicked verified properties with zero brokerage and direct owner connections."}
            </p>
          </div>

          {isHostMode ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddListingClick}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#2D1F1A] text-[#C5924E] border border-[#C5924E]/40 hover:bg-[#C5924E] hover:text-[#2D1F1A] transition-all cursor-pointer shadow-md"
              >
                <PlusCircle className="w-4 h-4" /> Add Listing
              </button>
              <a
                href="#owner-dashboard"
                className="flex items-center gap-1.5 text-xs font-bold text-[#2D1F1A] hover:underline"
              >
                Owner Dashboard <LayoutDashboard className="w-4 h-4 text-[#8C5E47]" />
              </a>
            </div>
          ) : (
            <a
              href="#all"
              className="flex items-center gap-1 text-xs font-bold text-[#2D1F1A] hover:underline"
            >
              View All Properties <ChevronRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Infinite Auto-Scrolling Marquee Track */}
      <div className="w-full overflow-hidden relative pb-2">
        <div className="animate-marquee-track flex gap-4 px-2">
          {[...properties, ...properties].map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleCardClick(item.title)}
              className="w-[230px] sm:w-[280px] md:w-[320px] flex-shrink-0 bg-[#EFEAE1]/95 backdrop-blur-md rounded-2xl overflow-hidden border border-[#E3D9CC] shadow-md hover:shadow-xl transition-all group relative cursor-pointer"
            >
              {isHostMode && (
                <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-lg bg-[#2D1F1A]/95 backdrop-blur-md text-[9px] font-bold text-[#C5924E] border border-[#C5924E]/30 shadow-md">
                  ● Live Listing
                </div>
              )}

              <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLoggedIn) {
                      setAttemptedAction("Save properties to your favorites");
                      setShowAuthModal(true);
                      return;
                    }
                    alert("Added to favorites!");
                  }}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-[#2D1F1A] shadow-md hover:bg-white cursor-pointer transition-transform active:scale-95"
                >
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-1.5 sm:space-y-2">
                <h3 className="font-bold text-sm sm:text-base text-[#2D1F1A] truncate">{item.title}</h3>
                <p className="text-[11px] sm:text-xs text-[#6E5D53] font-medium truncate">{item.loc}</p>
                <div className="text-base sm:text-lg font-black text-[#2D1F1A] pt-0.5 flex items-center justify-between">
                  <div>
                    {item.price} <span className="text-[10px] sm:text-xs font-normal text-[#6E5D53]">/month</span>
                  </div>
                  {isHostMode && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      2 Inquiries
                    </span>
                  )}
                </div>

                <div className="pt-2.5 mt-1.5 border-t border-[#E3D9CC] flex items-center justify-between text-[11px] sm:text-xs font-semibold text-[#57463D]">
                  <span>{item.specs}</span>
                  <span className="flex items-center gap-1 text-amber-700 font-bold">★ {item.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Center Overlay for Login Prompt */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#2D1F1A] border border-[#C5924E]/40 text-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative space-y-6">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#D5C9B8] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Banner */}
            <div className="w-14 h-14 rounded-2xl bg-[#C5924E]/20 border border-[#C5924E]/40 flex items-center justify-center text-[#C5924E] mx-auto shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-white">Authentication Required</h3>
              <p className="text-sm text-[#D5C9B8] leading-relaxed">
                Please log in or create an account to view the featured properties.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-3">
              <a
                href="/login"
                className="w-full py-3.5 rounded-xl bg-[#C5924E] text-[#2D1F1A] text-sm font-extrabold flex items-center justify-center shadow-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Log In to Continue
              </a>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[#D5C9B8] text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}