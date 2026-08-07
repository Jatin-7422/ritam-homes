import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/newlogo.png";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent px-8 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - Home Link */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Ritam Homes"
            className="h-12 md:h-14 w-auto object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
          />
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-white/90">
          <Link
            to="/"
            className="text-white font-bold border-b-2 border-[#C5924E] pb-0.5"
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
            className="hover:text-[#C5924E] transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Login Button */}
          <Link
            to="/login"
            className="px-5 py-2.5 text-xs font-bold rounded-xl border border-white/40 bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-[#2D1F1A] transition-all text-center cursor-pointer"
          >
            Login
          </Link>

          {/* Get Started Button -> Routes to /signup */}
          <Link
            to="/signup"
            style={{ backgroundColor: "#C5924E", color: "#2D1F1A" }}
            className="px-5 py-2.5 text-xs font-bold rounded-xl hover:opacity-90 transition-all text-center shadow-lg cursor-pointer"
          >
            Get Started
          </Link>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#2D1F1A]/95 backdrop-blur-md border-b border-white/10 mt-4 pt-4 pb-6 space-y-4 px-4 rounded-2xl shadow-2xl">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-white/80">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-white font-bold border-b border-white/10 pb-2"
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
              onClick={() => setIsOpen(false)}
              className="hover:text-[#C5924E] pb-1 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Action Buttons (Mobile) */}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full px-5 py-2.5 text-xs font-bold rounded-xl border border-white/30 bg-white/10 text-white text-center"
            >
              Login
            </Link>
            {/* Get Started Button -> Routes to /signup */}
            <Link
              to="/signup"
              onClick={() => setIsOpen(false)}
              style={{ backgroundColor: "#C5924E", color: "#2D1F1A" }}
              className="w-full px-5 py-2.5 text-xs font-bold rounded-xl text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
