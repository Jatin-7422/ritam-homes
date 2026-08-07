import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate hook
import {
  Search,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  X,
  Sparkles,
} from "lucide-react";

export default function PropertySearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // 2. Initialize navigation hook

  // Handle Search Submission
  const handleSearch = (e) => {
    e.preventDefault();
    navigate("/login"); // 3. Redirect user to /login page
  };

  // Multilingual marquee items
  const phrases = [
    { lang: "English", text: "Find your perfect home" },
    { lang: "Hindi", text: "अपना सही घर खोजें" },
    { lang: "Kannada", text: "ನಿಮ್ಮ ಪರಿಪೂರ್ಣ ಮನೆಯನ್ನು ಹುಡುಕಿ" },
    { lang: "Telugu", text: "మీ పరిపూర్ణ ఇల్లుని కనుగొనండి" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 my-6">
      {/* Inline styles for the smooth marquee scrolling effect */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          display: flex;
          width: 200%;
          animation: marquee 22s linear infinite;
        }
        .animate-marquee-slow:hover {
          animation-play-state: paused;
        }
      `}</style>

      {!isOpen ? (
        /* MARQUEE BUTTON (Initial State) */
        <button
          onClick={() => setIsOpen(true)}
          className="w-full relative overflow-hidden bg-[#2D1F1A] text-[#F3EFE6] rounded-2xl py-4 border-2 border-[#3E2E27] shadow-xl hover:border-[#C5924E] transition-all group flex items-center justify-between cursor-pointer"
        >
          {/* Left Decorative Search Icon Badge */}
          <div className="z-10 pl-5 pr-3 flex items-center gap-2 bg-[#2D1F1A] border-r border-[#3E2E27]">
            <div className="p-2 rounded-xl bg-[#C5924E] text-[#2D1F1A]">
              <Search className="w-5 h-5 font-bold" />
            </div>
            <span className="text-xs font-bold text-[#D8C8B4] uppercase tracking-wider hidden sm:inline">
              Search
            </span>
          </div>

          {/* Continuous Scrolling Text */}
          <div className="overflow-hidden whitespace-nowrap w-full relative">
            <div className="animate-marquee-slow flex items-center justify-around">
              {/* Duplicate the array twice for infinite seamless loop */}
              {[...phrases, ...phrases, ...phrases, ...phrases].map(
                (item, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-4 text-sm sm:text-base font-serif italic mx-6 text-[#EFEAE1] group-hover:text-[#F3EFE6]"
                  >
                    <span>{item.text}</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#C5924E] inline-block" />
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Right Action Hint */}
          <div className="z-10 pr-5 pl-3 bg-[#2D1F1A] border-l border-[#3E2E27] shrink-0">
            <span className="text-xs font-bold bg-[#3E2E27] text-[#C5924E] px-3 py-1.5 rounded-lg group-hover:bg-[#C5924E] group-hover:text-[#2D1F1A] transition-all">
              Click to Filter ✦
            </span>
          </div>
        </button>
      ) : (
        /* EXPANDED SEARCH BAR */
        <div className="bg-[#FAF7F2] p-3 sm:p-4 rounded-2xl border border-[#EADBCE] shadow-2xl relative transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Close / Collapse Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -right-3 bg-[#2D1F1A] text-white p-1.5 rounded-full shadow-md hover:bg-[#C5924E] transition-colors"
            title="Close Search"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Form wrapper triggers handleSearch on submit */}
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center"
          >
            {/* Location Input */}
            <div className="bg-white p-3 rounded-xl border border-[#E3D7C8] flex flex-col justify-center">
              <label className="text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                Location
              </label>
              <div className="flex items-center gap-2 text-[#2D1F1A]">
                <MapPin className="w-4 h-4 text-[#C5924E] shrink-0" />
                <input
                  type="text"
                  placeholder="Search location"
                  className="w-full text-xs font-semibold focus:outline-none bg-transparent placeholder-[#9E8E84]"
                />
              </div>
            </div>

            {/* Property Type Dropdown */}
            <div className="bg-white p-3 rounded-xl border border-[#E3D7C8] flex flex-col justify-center">
              <label className="text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                Property Type
              </label>
              <div className="flex items-center gap-2 text-[#2D1F1A]">
                <Home className="w-4 h-4 text-[#C5924E] shrink-0" />
                <select className="w-full text-xs font-semibold focus:outline-none bg-transparent cursor-pointer text-[#2D1F1A]">
                  <option>Any Type</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK+</option>
                  <option>Villa / House</option>
                </select>
              </div>
            </div>

            {/* Budget Dropdown */}
            <div className="bg-white p-3 rounded-xl border border-[#E3D7C8] flex flex-col justify-center">
              <label className="text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                Budget
              </label>
              <div className="flex items-center gap-2 text-[#2D1F1A]">
                <DollarSign className="w-4 h-4 text-[#C5924E] shrink-0" />
                <select className="w-full text-xs font-semibold focus:outline-none bg-transparent cursor-pointer text-[#2D1F1A]">
                  <option>Any Budget</option>
                  <option>Under ₹15,000</option>
                  <option>₹15,000 - ₹30,000</option>
                  <option>₹30,000 - ₹50,000</option>
                  <option>₹50,000+</option>
                </select>
              </div>
            </div>

            {/* Move-In Date */}
            <div className="bg-white p-3 rounded-xl border border-[#E3D7C8] flex flex-col justify-center">
              <label className="text-[10px] font-extrabold text-[#6E5D53] uppercase tracking-wider mb-1">
                Move-In Date
              </label>
              <div className="flex items-center gap-2 text-[#2D1F1A]">
                <Calendar className="w-4 h-4 text-[#C5924E] shrink-0" />
                <input
                  type="date"
                  className="w-full text-xs font-semibold focus:outline-none bg-transparent text-[#6E5D53]"
                />
              </div>
            </div>

            {/* Search Properties Submit Button */}
            <button
              type="submit"
              className="h-full py-3.5 px-6 bg-[#2D1F1A] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#3E2E27] transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#C5924E]" />
              Search Properties
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
