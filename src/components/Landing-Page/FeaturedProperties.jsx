import React, { useState, useRef, useEffect } from "react";
import { Heart, ChevronRight, PlusCircle, LayoutDashboard, X, AlertCircle, ChevronLeft } from "lucide-react";

export default function FeaturedProperties({ isHostMode, isLoggedIn }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const scrollContainerRef = useRef(null);
  const isAutoScrolling = useRef(true);
  const requestRef = useRef(null);

  const baseProperties = [
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
    {
      title: "Modern Studio",
      loc: "JP Nagar, Bangalore",
      price: "₹18,000",
      specs: "1 RK • 500 sq.ft",
      rating: "4.7",
      img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Executive Villa",
      loc: "Hebbal, Bangalore",
      price: "₹65,000",
      specs: "4 BHK • 3200 sq.ft",
      rating: "5.0",
      img: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Cozy Penthouse",
      loc: "MG Road, Bangalore",
      price: "₹55,000",
      specs: "3 BHK • 2200 sq.ft",
      rating: "4.9",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    },
    {
      title: "Urban Loft",
      loc: "Bannerghatta Road, Bangalore",
      price: "₹25,000",
      specs: "2 BHK • 1100 sq.ft",
      rating: "4.5",
      img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const properties = [
    ...baseProperties,
    ...baseProperties,
    ...baseProperties,
    ...baseProperties,
    ...baseProperties,
  ];

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const singleSetWidth = container.scrollWidth / 5;
    container.scrollLeft = singleSetWidth * 2;

    const animateScroll = () => {
      if (isAutoScrolling.current && container) {
        container.scrollLeft += 0.8;

        const currentSetWidth = container.scrollWidth / 5;
        if (container.scrollLeft >= currentSetWidth * 4) {
          container.scrollLeft -= currentSetWidth * 2;
        } else if (container.scrollLeft <= currentSetWidth) {
          container.scrollLeft += currentSetWidth * 2;
        }
      }
      requestRef.current = requestAnimationFrame(animateScroll);
    };

    requestRef.current = requestAnimationFrame(animateScroll);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const singleSetWidth = container.scrollWidth / 5;

    if (container.scrollLeft >= singleSetWidth * 4) {
      container.scrollLeft -= singleSetWidth * 2;
    } else if (container.scrollLeft <= singleSetWidth * 0.5) {
      container.scrollLeft += singleSetWidth * 2;
    }
  };

  const handleManualScroll = (offset) => {
    isAutoScrolling.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
    setTimeout(() => {
      isAutoScrolling.current = true;
    }, 2000);
  };

  const handleCardClick = (itemTitle) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    if (isHostMode) {
      alert(`Managing inquiries for your property: ${itemTitle}`);
    } else {
      alert(`Opening details for ${itemTitle}`);
    }
  };

  const handleViewAllClick = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowAuthModal(true);
      return;
    }
  };

  const handleAddListingClick = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    alert("Open New Listing Modal");
  };

  return (
    <section className="w-full py-4 sm:py-8 bg-[#2D1F1A]/5 relative overflow-hidden" id="properties">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 mb-3 sm:mb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#2D1F1A] flex items-center gap-2">
              {isHostMode ? "Your Active Listings" : "Featured Properties"} <span className="text-[#8C5E47]">✦</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6E5D53] mt-0.5">
              {isHostMode
                ? "Manage, update or check booking requests for your properties from your unified owner hub."
                : "Handpicked verified properties with zero brokerage and direct owner connections."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isHostMode ? (
              <>
                <button
                  onClick={handleAddListingClick}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold bg-[#2D1F1A] text-[#C5924E] border border-[#C5924E]/40 hover:bg-[#C5924E] hover:text-[#2D1F1A] transition-all cursor-pointer shadow-md"
                >
                  <PlusCircle className="w-4 h-4" /> Add Listing
                </button>
                <a
                  href="#owner-dashboard"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#2D1F1A] hover:underline"
                >
                  Owner Dashboard <LayoutDashboard className="w-4 h-4 text-[#8C5E47]" />
                </a>
              </>
            ) : (
              <a
                href="#all"
                onClick={handleViewAllClick}
                className="flex items-center gap-1 text-xs font-bold text-[#2D1F1A] hover:underline"
              >
                View All Properties <ChevronRight className="w-4 h-4" />
              </a>
            )}

            <div className="hidden sm:flex items-center gap-1.5 ml-4">
              <button
                onClick={() => handleManualScroll(-340)}
                className="p-2 rounded-xl bg-[#2D1F1A] text-[#C5924E] hover:bg-[#C5924E] hover:text-[#2D1F1A] transition-all shadow-md cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleManualScroll(340)}
                className="p-2 rounded-xl bg-[#2D1F1A] text-[#C5924E] hover:bg-[#C5924E] hover:text-[#2D1F1A] transition-all shadow-md cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="w-full relative px-4 sm:px-8 md:px-12 select-none"
        onMouseEnter={() => (isAutoScrolling.current = false)}
        onMouseLeave={() => (isAutoScrolling.current = true)}
        onTouchStart={() => (isAutoScrolling.current = false)}
        onTouchEnd={() => setTimeout(() => (isAutoScrolling.current = true), 2000)}
      >
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar pb-2 pt-1 px-1"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            willChange: "scroll-position" 
          }}
        >
          {properties.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleCardClick(item.title)}
              className="w-[210px] sm:w-[320px] flex-shrink-0 bg-[#EFEAE1]/95 backdrop-blur-md rounded-xl sm:rounded-2xl overflow-hidden border border-[#E3D9CC] shadow-md hover:shadow-xl transition-all group relative cursor-pointer"
            >
              {isHostMode && (
                <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 px-2 sm:px-2.5 py-0.5 rounded-md sm:rounded-lg bg-[#2D1F1A]/95 backdrop-blur-md text-[8px] sm:text-[9px] font-bold text-[#C5924E] border border-[#C5924E]/30 shadow-md">
                  ● Live Listing
                </div>
              )}

              <div className="relative h-32 sm:h-52 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLoggedIn) {
                      setShowAuthModal(true);
                      return;
                    }
                    alert("Added to favorites!");
                  }}
                  className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 p-1.5 sm:p-2 rounded-full bg-white/90 text-[#2D1F1A] shadow-md hover:bg-white cursor-pointer transition-transform active:scale-95"
                >
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="p-3 sm:p-5 space-y-1 sm:space-y-2">
                <h3 className="font-bold text-xs sm:text-base text-[#2D1F1A] truncate">{item.title}</h3>
                <p className="text-[10px] sm:text-xs text-[#6E5D53] font-medium truncate">{item.loc}</p>
                <div className="text-sm sm:text-lg font-black text-[#2D1F1A] pt-0.5 flex items-center justify-between">
                  <div>
                    {item.price} <span className="text-[9px] sm:text-xs font-normal text-[#6E5D53]">/mo</span>
                  </div>
                  {isHostMode && (
                    <span className="text-[8px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                      2 Inquiries
                    </span>
                  )}
                </div>

                <div className="pt-2 mt-1 sm:pt-2.5 sm:mt-1.5 border-t border-[#E3D9CC] flex items-center justify-between text-[10px] sm:text-xs font-semibold text-[#57463D]">
                  <span className="truncate pr-1">{item.specs}</span>
                  <span className="flex items-center gap-0.5 text-amber-700 font-bold shrink-0">★ {item.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#2D1F1A] border border-[#C5924E]/40 text-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative space-y-6">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#D5C9B8] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#C5924E]/20 border border-[#C5924E]/40 flex items-center justify-center text-[#C5924E] mx-auto shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-extrabold text-white">Authentication Required</h3>
              <p className="text-sm text-[#D5C9B8] leading-relaxed">
                Please log in or create an account to view the featured properties.
              </p>
            </div>

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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}