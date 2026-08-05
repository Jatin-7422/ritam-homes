// 1. Put the import at the VERY TOP of the file (outside the function)
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../../assets/newlogo.png"; // Make sure your downloaded PNG is saved in src/assets/

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F6F2EA]/95 backdrop-blur-md border-b border-[#E3D9CC] px-8 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* 2. Put the <img> tag inside your JSX where the logo belongs */}
        <a href="#home" className="flex items-center">
          <img
            src={logo}
            alt="Ritam Homes"
            className="h-12 md:h-14 w-auto object-contain transition-all"
          />
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#57463D]">
          <a
            href="#home"
            className="text-[#2D1F1A] font-bold border-b-2 border-[#2D1F1A] pb-0.5"
          >
            Home
          </a>
          <a href="#properties" className="hover:text-[#2D1F1A]">
            Properties
          </a>
          <a href="#how-it-works" className="hover:text-[#2D1F1A]">
            How it works
          </a>
          <a href="#for-tenants" className="hover:text-[#2D1F1A]">
            For Tenants
          </a>
          <a href="#for-owners" className="hover:text-[#2D1F1A]">
            For Owners
          </a>
          <a href="#about" className="hover:text-[#2D1F1A]">
            About Us
          </a>
          <a href="#contact" className="hover:text-[#2D1F1A]">
            Contact
          </a>
        </nav>

        {/* Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <button className="px-5 py-2.5 text-xs font-bold rounded-xl border border-[#D5C9B8] bg-[#EFEAE1] text-[#2D1F1A]">
            Login
          </button>
          <button
            style={{ backgroundColor: "#2D1F1A", color: "#FFFFFF" }}
            className="px-5 py-2.5 text-xs font-bold rounded-xl"
          >
            Get Started
          </button>
        </div>

        {/* Hamburger Menu Button (Mobile View Only) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[#2D1F1A] hover:bg-[#EFEAE1] rounded-lg transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#F6F2EA] border-t border-[#E3D9CC] mt-4 pt-4 pb-6 space-y-4 px-2">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-[#57463D]">
            <a
              href="#home"
              onClick={() => setIsOpen(false)}
              className="text-[#2D1F1A] font-bold border-b border-[#E3D9CC] pb-2"
            >
              Home
            </a>
            <a
              href="#properties"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#2D1F1A] border-b border-[#E3D9CC] pb-2"
            >
              Properties
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#2D1F1A] border-b border-[#E3D9CC] pb-2"
            >
              How it works
            </a>
            <a
              href="#for-tenants"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#2D1F1A] border-b border-[#E3D9CC] pb-2"
            >
              For Tenants
            </a>
            <a
              href="#for-owners"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#2D1F1A] border-b border-[#E3D9CC] pb-2"
            >
              For Owners
            </a>
            <a
              href="#about"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#2D1F1A] border-b border-[#E3D9CC] pb-2"
            >
              About Us
            </a>
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#2D1F1A] pb-1"
            >
              Contact
            </a>
          </nav>

          {/* Action Buttons (Mobile View) */}
          <div className="flex flex-col gap-2 pt-2">
            <button className="w-full px-5 py-2.5 text-xs font-bold rounded-xl border border-[#D5C9B8] bg-[#EFEAE1] text-[#2D1F1A]">
              Login
            </button>
            <button
              style={{ backgroundColor: "#2D1F1A", color: "#FFFFFF" }}
              className="w-full px-5 py-2.5 text-xs font-bold rounded-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
