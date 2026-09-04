import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "../../assets/newlogo.png";
import { ShieldCheck, X } from "lucide-react";

export default function Footer() {
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [attemptedAction, setAttemptedAction] = useState("");

  const isDashboard =
    location.pathname.includes("dashboard") ||
    location.pathname.includes("owner") ||
    location.pathname.includes("tenant");

  if (isDashboard) {
    return null;
  }

  const handleProtectedAction = (e, actionName) => {
    e.preventDefault();
    setAttemptedAction(actionName);
    setShowAuthModal(true);
  };

  return (
    <footer className="bg-stone-200/60 text-stone-900 pt-12 pb-6 border-t border-stone-300 px-6 font-sans relative">
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
              <a href="#find" onClick={(e) => handleProtectedAction(e, "find a home")} className="hover:text-stone-900 transition-colors">
                Find a Home
              </a>
            </li>
            <li>
              <a href="#how" onClick={(e) => handleProtectedAction(e, "view how it works")} className="hover:text-stone-900 transition-colors">
                How it Works
              </a>
            </li>
            <li>
              <a href="#safety" onClick={(e) => handleProtectedAction(e, "view safety standards")} className="hover:text-stone-900 transition-colors">
                Safety
              </a>
            </li>
            <li>
              <a href="#help" onClick={(e) => handleProtectedAction(e, "access help center")} className="hover:text-stone-900 transition-colors">
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
              <a href="#list" onClick={(e) => handleProtectedAction(e, "list your property")} className="hover:text-stone-900 transition-colors">
                List Property
              </a>
            </li>
            <li>
              <a href="#pricing" onClick={(e) => handleProtectedAction(e, "view pricing plans")} className="hover:text-stone-900 transition-colors">
                Pricing
              </a>
            </li>
            <li>
              <a href="#resources" onClick={(e) => handleProtectedAction(e, "access owner resources")} className="hover:text-stone-900 transition-colors">
                Resources
              </a>
            </li>
            <li>
              <a href="#support" onClick={(e) => handleProtectedAction(e, "access host support")} className="hover:text-stone-900 transition-colors">
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
              <a href='/contact' className="hover:text-stone-900">
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

      {/* AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 backdrop-blur-sm p-4">
          <div className="bg-stone-100 border border-stone-300 text-stone-900 w-full max-w-md p-6 rounded-2xl shadow-2xl relative space-y-4">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-stone-900/10 border border-stone-300 flex items-center justify-center text-stone-900 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-stone-900">Authentication Required</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Please log in or create an account to continue and <span className="text-stone-900 font-semibold">{attemptedAction}</span>.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  alert("Redirecting to login / signup...");
                  setShowAuthModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-all cursor-pointer shadow-md"
              >
                Log In / Sign Up Now
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}