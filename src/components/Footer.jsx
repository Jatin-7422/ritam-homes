import React from "react";
import logo from "../assets/newlogo.png";

export default function Footer() {
  return (
    <footer className="bg-stone-200/60 text-stone-900 pt-12 pb-6 border-t border-stone-300 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 pb-8 border-b border-stone-300 text-xs">
        <div className="space-y-3">
          <a href="#home" className="flex items-center">
            <img
              src={logo}
              alt="Ritam Homes"
              className="h-10 w-auto object-contain"
            />
          </a>
          <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
            Homes You Can Actually Trust. India's verified rental platform
            connecting tenants & owners.
          </p>
        </div>

        <div>
          <h5 className="font-bold text-stone-900 uppercase tracking-wider mb-3 text-[10px]">
            For Tenants
          </h5>
          <ul className="space-y-1.5 text-stone-600 font-medium">
            <li>
              <a href="#find" className="hover:text-stone-900">
                Find a Home
              </a>
            </li>
            <li>
              <a href="#how" className="hover:text-stone-900">
                How it Works
              </a>
            </li>
            <li>
              <a href="#safety" className="hover:text-stone-900">
                Safety
              </a>
            </li>
            <li>
              <a href="#help" className="hover:text-stone-900">
                Help Center
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-stone-900 uppercase tracking-wider mb-3 text-[10px]">
            For Owners
          </h5>
          <ul className="space-y-1.5 text-stone-600 font-medium">
            <li>
              <a href="#list" className="hover:text-stone-900">
                List Property
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-stone-900">
                Pricing
              </a>
            </li>
            <li>
              <a href="#resources" className="hover:text-stone-900">
                Resources
              </a>
            </li>
            <li>
              <a href="#support" className="hover:text-stone-900">
                Support
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-stone-900 uppercase tracking-wider mb-3 text-[10px]">
            Company
          </h5>
          <ul className="space-y-1.5 text-stone-600 font-medium">
            <li>
              <a href="#about" className="hover:text-stone-900">
                About Us
              </a>
            </li>
            <li>
              <a href="#careers" className="hover:text-stone-900">
                Careers
              </a>
            </li>
            <li>
              <a href="#blog" className="hover:text-stone-900">
                Blog
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-stone-900">
                Contact Us
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-stone-900 uppercase tracking-wider mb-3 text-[10px]">
            Legal
          </h5>
          <ul className="space-y-1.5 text-stone-600 font-medium">
            <li>
              <a href="#privacy" className="hover:text-stone-900">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#terms" className="hover:text-stone-900">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#refund" className="hover:text-stone-900">
                Refund Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4 text-center text-[10px] text-stone-500 font-medium">
        © 2026 Ritam Homes. All rights reserved.
      </div>
    </footer>
  );
}
