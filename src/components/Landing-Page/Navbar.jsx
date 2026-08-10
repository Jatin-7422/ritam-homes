import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

// Import both white and dark/black logos
import logoWhite from "../../assets/whitelogo.png";
import logoDark from "../../assets/newlogo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle backdrop transition on page scroll
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

  // Automatically close mobile menu when changing routes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // 1. HIDE NAVBAR ON DASHBOARD ROUTES (Moved below all hooks)
  const isDashboard =
    location.pathname.includes("dashboard") ||
    location.pathname.includes("owner") ||
    location.pathname.includes("tenant");

  if (isDashboard) {
    return null; // Returns nothing on dashboard pages, removing it completely
  }

  // Pages that have a light background
  const lightBgRoutes = ["/contact", "/signup", "/login"];
  const isLightPage = lightBgRoutes.includes(location.pathname);

  // Check if a given route is currently active
  const isActive = (path) => location.pathname === path;

  // Logo Logic:
  // Show dark logo ONLY on light pages before scrolling down.
  // Switch to white logo when scrolled or on dark pages.
  const currentLogo = isLightPage && !isScrolled ? logoDark : logoWhite;

  // Text color helper: Dark text for light page header before scrolling
  const isDarkText = isLightPage && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-4 sm:px-8 py-4 ${
        isScrolled
          ? "bg-[#2D1F1A]/90 backdrop-blur-md shadow-xl border-b border-white/10 py-3"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - Home Link */}
        <Link to="/" className="flex items-center group">
          <img
            src={currentLogo}
            alt="Ritam Homes"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav
          className={`hidden md:flex items-center gap-8 text-xs font-semibold ${
            isDarkText ? "text-[#2D1F1A]" : "text-white/90"
          }`}
        >
          <Link
            to="/"
            className={`transition-colors pb-0.5 ${
              isActive("/")
                ? "font-bold border-b-2 border-[#C5924E]"
                : "hover:text-[#C5924E]"
            }`}
          >
            Explore
          </Link>
          <a
            href="#properties"
            className="hover:text-[#C5924E] transition-colors"
          >
            Properties
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#C5924E] transition-colors"
          >
            How it works
          </a>
          <a href="#about" className="hover:text-[#C5924E] transition-colors">
            About Us
          </a>
          <Link
            to="/contact"
            className={`transition-colors pb-0.5 ${
              isActive("/contact")
                ? "font-bold border-b-2 border-[#C5924E]"
                : "hover:text-[#C5924E]"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Login Button */}
          <Link
            to="/login"
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all text-center cursor-pointer ${
              isActive("/login")
                ? "bg-[#2D1F1A] text-white shadow-md"
                : isDarkText
                  ? "border border-[#2D1F1A]/30 text-[#2D1F1A] hover:bg-[#2D1F1A] hover:text-white"
                  : "border border-white/40 bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-[#2D1F1A]"
            }`}
          >
            Login
          </Link>

          {/* Get Started Button */}
          <Link
            to="/signup"
            style={{ backgroundColor: "#C5924E", color: "#2D1F1A" }}
            className="px-5 py-2.5 text-xs font-bold rounded-xl hover:opacity-90 transition-all text-center shadow-lg active:scale-95 cursor-pointer"
          >
            Get Started
          </Link>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 rounded-xl transition-colors focus:outline-none cursor-pointer ${
            isDarkText
              ? "text-[#2D1F1A] hover:bg-black/5"
              : "text-white hover:bg-white/10"
          }`}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#2D1F1A]/95 backdrop-blur-xl border border-white/10 mt-3 p-5 space-y-4 rounded-2xl shadow-2xl">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-white/80">
            <Link
              to="/"
              className={`pb-2 border-b border-white/10 transition-colors ${
                isActive("/") ? "text-[#C5924E] font-bold" : "hover:text-white"
              }`}
            >
              Home
            </Link>
            <a
              href="#properties"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#C5924E] border-b border-white/10 pb-2 transition-colors"
            >
              Properties
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#C5924E] border-b border-white/10 pb-2 transition-colors"
            >
              How it works
            </a>
            <a
              href="#about"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#C5924E] border-b border-white/10 pb-2 transition-colors"
            >
              About Us
            </a>
            <Link
              to="/contact"
              className={`pb-1 transition-colors ${
                isActive("/contact")
                  ? "text-[#C5924E] font-bold"
                  : "hover:text-white"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Action Buttons (Mobile) */}
          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              to="/login"
              className={`w-full px-5 py-2.5 text-xs font-bold rounded-xl text-center transition-all ${
                isActive("/login")
                  ? "bg-white text-[#2D1F1A]"
                  : "border border-white/30 bg-white/10 text-white"
              }`}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{ backgroundColor: "#C5924E", color: "#2D1F1A" }}
              className="w-full px-5 py-2.5 text-xs font-bold rounded-xl text-center shadow-md active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
