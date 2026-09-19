import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Home as HomeIcon,
  Tag,
  CalendarCheck,
  Users,
  Shield,
  PlusCircle,
  Compass,
} from "lucide-react";

// Import your image asset
import heroImage from "../../assets/newbg.png"; // Adjust filename as needed

export default function Hero({ isHostMode, setIsHostMode, isLoggedIn }) {
  const navigate = useNavigate();

  // Typing & Shining Effect States
  const hostWords = ["Effortlessly.", "Seamlessly.", "Profitably."];
  const explorerWords = ["Actually Trust.", "Absolute Comfort.", "Zero Brokerage."];
  
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);
  const [isShining, setIsShining] = useState(false);

  // Reset typing state when mode changes
  useEffect(() => {
    setCurrentWordIndex(0);
    setCurrentText("");
    setIsDeleting(false);
    setIsShining(false);
  }, [isHostMode]);

  useEffect(() => {
    const words = isHostMode ? hostWords : explorerWords;
    const fullWord = words[currentWordIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        setCurrentText(fullWord.substring(0, currentText.length + 1));
        if (currentText + 1 === fullWord) {
          setIsShining(true);
          setTypingSpeed(2200);
          setIsDeleting(true);
        }
      } else {
        setIsShining(false);
        setCurrentText(fullWord.substring(0, currentText.length - 1));
        setTypingSpeed(100);

        if (currentText === "") {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          setTypingSpeed(150);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed, isHostMode]);

  const handleSwitchHosting = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setIsHostMode(true);
  };

  return (
    <section className="relative w-full max-w-full overflow-hidden min-h-screen flex items-center pt-24 pb-12 font-sans bg-[#2D1F1A]">
      {/* 1. FULL BACKGROUND IMAGE & DARK OVERLAY */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={heroImage}
          alt="Ritam Homes Exterior"
          className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom"
        />
        {/* Darkening overlays for high text contrast */}
        <div className="absolute inset-0 bg-[#2D1F1A]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D1F1A] via-[#2D1F1A]/40 to-[#2D1F1A]/60" />
      </div>

      {/* NEW: Floating Ambient Glow Orbs to fill empty space */}
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#C5924E]/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#C5924E]/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-1000" />

      {/* 2. MAIN HERO CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full flex flex-col justify-between min-h-[80vh] box-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
          
          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Mode Status Pill with subtle shimmer border */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/55 border border-[#C5924E]/40 text-xs font-semibold text-[#C5924E] backdrop-blur-xl shadow-lg shadow-black/20">
              {isHostMode ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#C5924E] animate-ping" />
                  Host Studio Mode • Unified Account Hub
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Explorer Mode • Discover & Rent
                </>
              )}
            </div>

            {/* Main Headline with Typing and Shining Text Effect */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-[1.08] tracking-tight">
              {isHostMode ? (
                <>
                  Manage Properties, <br />
                  <span
                    className={`font-serif italic font-normal transition-all duration-300 inline-block ${
                      isShining ? "text-shine-effect scale-105" : "text-[#C5924E]"
                    }`}
                  >
                    {currentText}
                  </span>
                  <span className="animate-blink text-[#C5924E] font-light">|</span>
                </>
              ) : (
                <>
                  Home you can, <br />
                  <span
                    className={`font-serif italic font-normal transition-all duration-300 inline-block ${
                      isShining ? "text-shine-effect scale-105" : "text-[#C5924E]"
                    }`}
                  >
                    {currentText}
                  </span>
                  <span className="animate-blink text-[#C5924E] font-light">|</span>
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-[#D5C9B8] max-w-lg leading-relaxed font-medium">
              {isHostMode
                ? "List properties, track active tenant agreements, and manage your rentals directly from your single account — no siloed dashboards."
                : "Verified owners. Real listings. Zero brokerage. Book visits, connect & move in — hassle-free."}
            </p>

            {/* Quick Action Buttons with Glow Shadow */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isHostMode ? (
                <>
                  <button
                    onClick={() => alert("Open Property Listing Modal")}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs bg-[#C5924E] hover:bg-[#b08040] text-[#2D1F1A] shadow-lg shadow-[#C5924E]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Create New Property Listing
                  </button>
                  <button
                    onClick={() => setIsHostMode(false)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md text-white font-bold text-xs hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-[#C5924E]" /> Switch to Explorer View
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="#properties"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs bg-[#C5924E] hover:bg-[#b08040] text-[#2D1F1A] shadow-lg shadow-[#C5924E]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    Explore Properties <ArrowRight className="w-4 h-4 text-[#2D1F1A]" />
                  </a>

                  <button
                    onClick={handleSwitchHosting}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md text-white font-bold text-xs hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 text-[#C5924E]" /> Switch to Hosting
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. TRUST FEATURE BAR ACROSS THE BOTTOM (Glassmorphic Container) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 p-5 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl pt-6 pb-6 mt-12 shadow-2xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Verified Owners
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 sm:border-l border-white/15 sm:pl-4">
            <HomeIcon className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Real Listings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 md:border-l border-white/15 md:pl-4">
            <Tag className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Zero Brokerage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 sm:border-l border-white/15 sm:pl-4">
            <CalendarCheck className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Book Visits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 md:border-l border-white/15 md:pl-4">
            <Users className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Direct Connect
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-l-0 sm:border-l border-white/15 sm:pl-4">
            <Shield className="w-5 h-5 text-[#C5924E] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Hassle-Free
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Glossy Shimmer, Background Zoom, & Cursor Blinking */}
      <style>{`
        @keyframes shine {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .text-shine-effect {
          background: linear-gradient(
            90deg,
            #C5924E 0%,
            #ffffff 50%,
            #C5924E 100%
          );
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: shine 2s linear infinite;
          text-shadow: 0 0 30px rgba(197, 146, 78, 0.6);
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.8s infinite;
        }
        @keyframes subtleZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        .animate-subtle-zoom {
          animation: subtleZoom 20s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}