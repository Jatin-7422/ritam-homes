import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoWhite from "../../assets/whitelogo.png";

export default function LoginNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile menu when screen size expands to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 sm:px-8 py-4 ${
          isScrolled || mobileMenuOpen
            ? "bg-[#2D1F1A]/95 backdrop-blur-md shadow-xl border-b border-white/10 py-3"
            : "bg-transparent"
        }`}
      >
        {/* Grid layout guarantees items never overlap across fixed columns */}
        <div className="max-w-7xl mx-auto flex md:grid md:grid-cols-3 items-center justify-between">
          {/* Column 1: Logo (Scaled up) */}
          <div className="flex items-center justify-start">
            <Link to="/" className="group" onClick={() => setMobileMenuOpen(false)}>
              <img
                src={logoWhite}
                alt="Ritam Homes"
                className="h-12 sm:h-16 md:h-20 w-auto object-contain transition-all duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Column 2: Centered Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8 text-xs font-semibold text-white/90 whitespace-nowrap">
            
            <Link to="/" className="transition-all hover:text-[#C5924E]">
              Explore
            </Link>
            <Link to="/" className="transition-all hover:text-[#C5924E]">
              Properties
            </Link>
            <Link to="/" className="transition-all hover:text-[#C5924E]">
              How it works
            </Link>

            <Link to="/contact" className="transition-all hover:text-[#C5924E]">
              Contact Us
            </Link>
          </nav>

          {/* Column 3: Empty right column on desktop / Hamburger Button on mobile */}
          <div className="flex items-center justify-end md:block">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#C5924E]" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="hidden md:block" />
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-[64px] sm:top-[76px] bg-[#2D1F1A]/98 backdrop-blur-xl border-b border-white/10 shadow-2xl z-40 md:hidden animate-fade-in">
          <nav className="flex flex-col px-6 py-6 space-y-4 text-sm font-semibold text-white/90">
        
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-4 rounded-xl hover:bg-white/5 hover:text-[#C5924E] transition-all border-b border-white/5"
            >
              Explore
            </Link>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-4 rounded-xl hover:bg-white/5 hover:text-[#C5924E] transition-all border-b border-white/5"
            >
              Properties
            </Link>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-4 rounded-xl hover:bg-white/5 hover:text-[#C5924E] transition-all border-b border-white/5"
            >
              How it works
            </Link>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-4 rounded-xl hover:bg-white/5 hover:text-[#C5924E] transition-all border-b border-white/5"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-4 rounded-xl hover:bg-white/5 hover:text-[#C5924E] transition-all"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}