import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import logoWhite from "../../assets/whitelogo.png";

export default function LoginNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 sm:px-8 py-4 ${
        isScrolled
          ? "bg-[#2D1F1A]/95 backdrop-blur-md shadow-xl border-b border-[#d4af37]/20 py-3"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo with a soft glow */}
        <div className="flex items-center justify-start">
          <Link to="/" className="group">
            <img
              src={logoWhite}
              alt="Ritam Homes"
              className="h-12 sm:h-16 md:h-20 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
            />
          </Link>
        </div>

        {/* Right: Back to Home Link with a subtle hover glow */}
        <div className="flex items-center justify-end">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90 hover:text-[#d4af37] transition-all bg-white/5 hover:bg-[#d4af37]/10 px-4 py-2.5 rounded-xl border border-white/10 hover:border-[#d4af37]/40 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </header>
  );
}